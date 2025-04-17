import { updateTaskDTO, type TaskDTO } from "@dto/task";
import { logger } from "@libs/pino";
import { prisma } from "@libs/prisma";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { Prisma } from "@prisma/client";

type UserRole = "lead" | "team";

interface User {
  id: string;
  name: string;
  role: UserRole;
  created_at: string;
}

type AuditAction = "create" | "update";

interface AuditLog {
  id: string;
  user: User;
  action: AuditAction;
  changes: string;
  created_at: string;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    (TaskDTO & { audit_logs: AuditLog[] }) | TaskDTO | string
  >
) {
  const childLogger = logger.child({
    request_id: uuidv4(),
    method: req.method,
    path: req.url,
  });

  // TODO: verify access token

  const taskId = (req.query.taskId ?? "") as string;
  const result = z.string().uuid().safeParse(taskId);
  if (!result.success) {
    childLogger.error(
      { status_code: StatusCodes.NOT_FOUND, err: result.error },
      "invalid task Id"
    );

    res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
    return;
  }

  if (req.method === "GET") {
    try {
      const task = await prisma.task.findUnique({
        where: {
          id: taskId,
        },
        include: {
          audit_logs: {
            include: { user: true },
          },
        },
      });

      if (task === null) {
        childLogger.error(
          { status_code: StatusCodes.NOT_FOUND },
          "task not found"
        );

        res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
        return;
      }

      res.status(StatusCodes.OK).json({
        id: task.id,
        name: task.name,
        description: task.description,
        status: task.status,
        created_at: task.created_at.toISOString(),
        updated_at: task.updated_at.toISOString(),
        audit_logs: task.audit_logs.map((audit_log) => ({
          id: audit_log.id,
          user: {
            id: audit_log.user.id,
            name: audit_log.user.name,
            role: audit_log.user.role,
            created_at: audit_log.user.created_at.toISOString(),
          },
          action: audit_log.action,
          changes: audit_log.changes,
          created_at: audit_log.created_at.toISOString(),
        })),
      });
    } catch (error) {
      childLogger.error(
        { status_code: StatusCodes.INTERNAL_SERVER_ERROR, err: error },
        "failed to select task"
      );

      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    }
  } else if (req.method === "PUT") {
    const result = updateTaskDTO.safeParse(req.body);
    if (!result.success) {
      childLogger.error(
        { status_code: StatusCodes.BAD_REQUEST, err: result.error },
        "invalid request body"
      );

      res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
      return;
    }

    if (
      !result.data.team_id &&
      !result.data.name &&
      !result.data.description &&
      !result.data.status
    ) {
      childLogger.error(
        { status_code: StatusCodes.NO_CONTENT },
        "no task update"
      );

      res.status(StatusCodes.NO_CONTENT).send(ReasonPhrases.NO_CONTENT);
      return;
    }

    try {
      const task = await prisma.task.update({
        where: {
          id: taskId,
        },
        data: {
          team_id: result.data.team_id ?? Prisma.skip,
          name: result.data.name ?? Prisma.skip,
          description: result.data.description ?? Prisma.skip,
          status: result.data.status ?? Prisma.skip,
          updated_at: new Date(),
        },
      });

      res.status(StatusCodes.OK).json({
        id: task.id,
        name: task.name,
        description: task.description,
        status: task.status,
        created_at: task.created_at.toISOString(),
        updated_at: task.updated_at.toISOString(),
      });
    } catch (error) {
      childLogger.error(
        { status_code: StatusCodes.INTERNAL_SERVER_ERROR, err: error },
        "failed to update task"
      );

      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    }
  }
}

export default handler;

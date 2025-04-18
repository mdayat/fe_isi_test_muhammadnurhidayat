import { createTaskDTO, type TaskDTO } from "@dto/task";
import { logger } from "@libs/pino";
import { prisma } from "@libs/prisma";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";
import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma } from "@prisma/client";
import { verifyAccessToken, type AccessTokenPayload } from "@utils/token";
import type { UserDTO } from "@dto/user";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    Array<TaskDTO & { team: UserDTO | null }> | TaskDTO | string
  >
) {
  const childLogger = logger.child({
    request_id: uuidv4(),
    method: req.method,
    path: req.url,
  });

  let payload: AccessTokenPayload;
  try {
    payload = verifyAccessToken(req);
  } catch (error) {
    childLogger.error(
      { status_code: StatusCodes.UNAUTHORIZED, err: error },
      "invalid access token"
    );

    res.setHeader(
      "Set-Cookie",
      "access_token=; Max-Age=0; Path=/api; SameSite=Strict; HttpOnly; Secure;"
    );
    res.status(StatusCodes.UNAUTHORIZED).send(ReasonPhrases.UNAUTHORIZED);
    return;
  }

  if (req.method === "GET") {
    try {
      const tasks = await prisma.task.findMany({
        where: {
          lead_id: payload.role === "lead" ? payload.sub : Prisma.skip,
          team_id: payload.role === "team" ? payload.sub : Prisma.skip,
        },
        include: {
          team: true,
        },
      });

      res.status(StatusCodes.OK).json(
        tasks.map((task) => ({
          id: task.id,
          name: task.name,
          description: task.description,
          status: task.status,
          created_at: task.created_at.toISOString(),
          updated_at: task.updated_at.toISOString(),
          team: task.team
            ? {
                id: task.team.id,
                name: task.team.name,
                role: task.team.role,
                created_at: task.team.created_at.toISOString(),
              }
            : null,
        }))
      );
    } catch (error) {
      childLogger.error(
        { status_code: StatusCodes.INTERNAL_SERVER_ERROR, err: error },
        "failed to select tasks"
      );

      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    }
  } else if (req.method === "POST") {
    if (payload.role !== "lead") {
      childLogger.error(
        { status_code: StatusCodes.FORBIDDEN },
        "unauthorized role"
      );

      res.status(StatusCodes.FORBIDDEN).send(ReasonPhrases.FORBIDDEN);
      return;
    }

    const result = createTaskDTO.safeParse(req.body);
    if (!result.success) {
      childLogger.error(
        { status_code: StatusCodes.BAD_REQUEST, err: result.error },
        "invalid request body"
      );

      res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
      return;
    }

    try {
      let taskJSON: string;
      try {
        taskJSON = JSON.stringify(result.data);
      } catch (error) {
        childLogger.error(
          { status_code: StatusCodes.INTERNAL_SERVER_ERROR, err: error },
          "failed to stringify task"
        );

        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
        return;
      }

      const task = await prisma.task.create({
        data: {
          lead_id: payload.sub,
          name: result.data.name,
          description: result.data.description ?? Prisma.skip,
          status: result.data.status,
          audit_logs: {
            create: {
              user_id: payload.sub,
              action: "create",
              changes: taskJSON,
            },
          },
        },
      });

      res.status(StatusCodes.CREATED).json({
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
        "failed to insert task"
      );

      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    }
  }
}

export default handler;

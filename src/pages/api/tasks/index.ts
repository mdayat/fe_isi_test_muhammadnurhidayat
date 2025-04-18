import { createTaskDTO, type TaskDTO } from "@dto/task";
import { logger } from "@libs/pino";
import { prisma } from "@libs/prisma";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";
import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma } from "@prisma/client";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TaskDTO[] | TaskDTO | string>
) {
  const childLogger = logger.child({
    request_id: uuidv4(),
    method: req.method,
    path: req.url,
  });

  // TODO: verify access token

  if (req.method === "GET") {
    try {
      // TODO: dynamic where clause (lead_id or team_id)
      const tasks = await prisma.task.findMany({
        where: {},
      });

      res.status(StatusCodes.OK).json(
        tasks.map((task) => ({
          id: task.id,
          name: task.name,
          description: task.description,
          status: task.status,
          created_at: task.created_at.toISOString(),
          updated_at: task.updated_at.toISOString(),
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
    // TODO: check user role. return forbidden if it's other than lead

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
      // TODO: create task with audit log within transaction
      const task = await prisma.task.create({
        data: {
          lead_id: "", // TODO: replace with a real lead_id
          name: result.data.name,
          description: result.data.description ?? Prisma.skip,
          status: result.data.status,
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

import { logger } from "@libs/pino";
import { prisma } from "@libs/prisma";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";
import type { NextApiRequest, NextApiResponse } from "next";
import type { UserDTO } from "@dto/user";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserDTO | string>
) {
  const childLogger = logger.child({
    request_id: uuidv4(),
    method: req.method,
    path: req.url,
  });

  // TODO: verify access token

  if (req.method === "GET") {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: "", // TODO: replace with a real user Id
        },
      });

      if (user === null) {
        childLogger.error(
          { status_code: StatusCodes.NOT_FOUND },
          "user not found"
        );

        res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
        return;
      }

      res.status(StatusCodes.OK).json({
        id: user.id,
        name: user.name,
        role: user.role,
        created_at: user.created_at.toISOString(),
      });
    } catch (error) {
      childLogger.error(
        { status_code: StatusCodes.INTERNAL_SERVER_ERROR, err: error },
        "failed to select user"
      );

      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    }
  }
}

export default handler;

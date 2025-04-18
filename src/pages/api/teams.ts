import { logger } from "@libs/pino";
import { prisma } from "@libs/prisma";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAccessToken, type AccessTokenPayload } from "@utils/token";
import type { UserDTO } from "@dto/user";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserDTO[] | string>
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

  if (payload.role !== "lead") {
    childLogger.error(
      { status_code: StatusCodes.FORBIDDEN },
      "unauthorized role"
    );

    res.status(StatusCodes.FORBIDDEN).send(ReasonPhrases.FORBIDDEN);
    return;
  }

  if (req.method === "GET") {
    try {
      const teams = await prisma.user.findMany({
        where: {
          role: "team",
        },
      });

      res.status(StatusCodes.OK).json(
        teams.map((team) => ({
          id: team.id,
          name: team.name,
          role: team.role,
          created_at: team.created_at.toISOString(),
        }))
      );
    } catch (error) {
      childLogger.error(
        { status_code: StatusCodes.INTERNAL_SERVER_ERROR, err: error },
        "failed to select teams"
      );

      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    }
  }
}

export default handler;

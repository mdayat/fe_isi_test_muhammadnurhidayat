import { logger } from "@libs/pino";
import { prisma } from "@libs/prisma";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";
import type { NextApiRequest, NextApiResponse } from "next";
import { loginUserDTO, type UserDTO } from "@dto/user";
import type { user } from "@prisma/client";
import { createAccessToken, type AccessTokenPayload } from "@utils/token";
import type { SignOptions } from "jsonwebtoken";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserDTO | string>
) {
  const childLogger = logger.child({
    request_id: uuidv4(),
    method: req.method,
    path: req.url,
  });

  if (req.method === "POST") {
    const result = loginUserDTO.safeParse(req.body);
    if (!result.success) {
      childLogger.error(
        { status_code: StatusCodes.BAD_REQUEST, err: result.error },
        "invalid request body"
      );

      res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
      return;
    }

    let user: user | null = null;
    try {
      user = await prisma.user.findUnique({
        where: {
          id: result.data.id,
        },
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

    if (user === null) {
      childLogger.error(
        { status_code: StatusCodes.NOT_FOUND },
        "user not found"
      );

      res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
      return;
    }

    const oneMonthInSec = 60 * 60 * 24 * 30;
    const payload: AccessTokenPayload = {
      role: user.role,
    };
    const options: SignOptions = {
      jwtid: uuidv4(),
      subject: user.id,
      issuer: req.headers.host,
      expiresIn: oneMonthInSec,
    };

    let token: string;
    try {
      token = createAccessToken(payload, options);
    } catch (error) {
      childLogger.error(
        { status_code: StatusCodes.INTERNAL_SERVER_ERROR, err: error },
        "failed to create access token"
      );

      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
      return;
    }

    res.setHeader(
      "Set-Cookie",
      `access_token=${token}; Max-Age=${oneMonthInSec}; Path=/api; SameSite=Strict; HttpOnly; Secure;`
    );

    res.status(StatusCodes.OK).json({
      id: user.id,
      name: user.name,
      role: user.role,
      created_at: user.created_at.toISOString(),
    });
  }
}

export default handler;

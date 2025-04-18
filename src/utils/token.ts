import { userRole } from "@dto/user";
import jwt from "jsonwebtoken";
import type { NextApiRequest } from "next";
import { z } from "zod";

const accessTokenPayload = z.object({
  role: userRole,
  jti: z.string().uuid(),
  sub: z.string().uuid(),
  iss: z.string(),
  exp: z.number(),
});

type AccessTokenPayload = z.infer<typeof accessTokenPayload>;

function createAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign({ role: payload.role }, process.env.JWT_SECRET, {
    jwtid: payload.jti,
    subject: payload.sub,
    issuer: payload.iss,
    expiresIn: payload.exp,
  });
}

function verifyAccessToken(req: NextApiRequest): AccessTokenPayload {
  const access_token = req.cookies.access_token ?? "";
  if (access_token === "") {
    throw new Error("access token doesn't exist");
  }

  const payload = jwt.verify(access_token, process.env.JWT_SECRET, {
    issuer: req.headers.host,
  });

  const result = accessTokenPayload.safeParse(payload);
  if (!result.success) {
    throw new Error("invalid access token payload", { cause: result.error });
  }

  return result.data;
}

export { createAccessToken, verifyAccessToken };
export type { AccessTokenPayload };

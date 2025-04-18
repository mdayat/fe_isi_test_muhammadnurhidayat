import type { UserRole } from "@dto/user";
import jwt, { type SignOptions } from "jsonwebtoken";

interface AccessTokenPayload {
  role: UserRole;
}

function createAccessToken(
  payload: AccessTokenPayload,
  options: SignOptions
): string {
  return jwt.sign(payload, process.env.JWT_SECRET, options);
}

function verifyAccessToken(token: string, issuer: string) {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer,
  });
}

export { createAccessToken, verifyAccessToken };
export type { AccessTokenPayload };

import { ReasonPhrases, StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse<string>) {
  if (req.method === "POST") {
    res.setHeader(
      "Set-Cookie",
      "access_token=; Max-Age=0; Path=/api; SameSite=Strict; HttpOnly; Secure;"
    );

    res.status(StatusCodes.OK).send(ReasonPhrases.OK);
  }
}

export default handler;

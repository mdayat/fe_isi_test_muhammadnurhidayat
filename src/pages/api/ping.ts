import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

export default function handler(
  _: NextApiRequest,
  res: NextApiResponse<string>
) {
  res.status(StatusCodes.OK).send(ReasonPhrases.OK);
}

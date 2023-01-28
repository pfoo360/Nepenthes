// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

type Data = {
  name: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const MAX_AGE = 60 * 60 * 24 * 7 * 52; //52 weeks
  const expires = new Date();
  expires.setSeconds(expires.getSeconds() + MAX_AGE);

  res.setHeader(
    "Set-Cookie",
    serialize("nepenthes-hello", "sessionToken", {
      expires,
      httpOnly: true,
      sameSite: true,
      secure: true,
    })
  );
  res.status(200).json({ name: "John Doe" });
}

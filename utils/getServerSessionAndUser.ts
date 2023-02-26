import { serialize } from "cookie";
import { IncomingMessage, ServerResponse } from "http";
import prisma from "../lib/prisma";
import NEPENTHES_SESSION from "./nepenthesSession";

const getServerSessionAndUser = async (
  req: IncomingMessage & {
    cookies: Partial<{
      [key: string]: string;
    }>;
  },
  res: ServerResponse<IncomingMessage>
): Promise<{
  user: {
    id: string;
    username: string;
    email: string;
  };
  sessionToken: string;
} | null> => {
  try {
    if (!req?.cookies) return null;
    if (!req.cookies[NEPENTHES_SESSION]) return null;

    const sessionAndUser = await prisma.session.findUnique({
      where: { sessionToken: req.cookies[NEPENTHES_SESSION] },
      select: {
        expires: true,
        sessionToken: true,
        user: { select: { id: true, username: true, email: true } },
      },
    });

    if (!sessionAndUser) {
      delete req.cookies[NEPENTHES_SESSION];
      return null;
    }

    if (sessionAndUser.expires <= new Date()) {
      await prisma.session.delete({
        where: { sessionToken: sessionAndUser.sessionToken },
      });

      const cookie = serialize(NEPENTHES_SESSION, sessionAndUser.sessionToken, {
        maxAge: -1,
        path: "/",
        httpOnly: true,
        sameSite: true,
        secure: true,
      });
      res.setHeader("Set-Cookie", cookie);

      delete req.cookies[NEPENTHES_SESSION];

      return null;
    }

    return {
      sessionToken: sessionAndUser.sessionToken,
      user: sessionAndUser.user,
    };
  } catch (err) {
    console.log(err);
    return null;
  }
};

export default getServerSessionAndUser;

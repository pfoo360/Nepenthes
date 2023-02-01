import { serialize } from "cookie";
import { IncomingMessage, ServerResponse } from "http";
import prisma from "../lib/prisma";

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
  //expires: Date;
} | null> => {
  try {
    if (!req?.cookies) return null;
    if (!req.cookies["nepenthes-session"]) return null;

    const sessionAndUser = await prisma.session.findUnique({
      where: { sessionToken: req.cookies["nepenthes-session"] },
      select: {
        expires: true,
        sessionToken: true,
        user: { select: { id: true, username: true, email: true } },
      },
    });

    if (!sessionAndUser) {
      delete req.cookies["nepenthes-session"];
      return null;
    }

    console.log(sessionAndUser);

    if (sessionAndUser.expires <= new Date()) {
      console.log("expired");
      await prisma.session.delete({
        where: { sessionToken: sessionAndUser.sessionToken },
      });

      const cookie = serialize(
        "nepenthes-session",
        sessionAndUser.sessionToken,
        {
          maxAge: -1,
          path: "/",
          httpOnly: true,
          sameSite: true,
          secure: true,
        }
      );
      res.setHeader("Set-Cookie", cookie);

      delete req.cookies["nepenthes-session"];

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

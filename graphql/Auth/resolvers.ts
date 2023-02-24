import { GraphQLError } from "graphql";
import { GraphQLContext, SignInResponse } from "../../types/types";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { serialize } from "cookie";
import NEPENTHES_SESSION from "../../utils/nepenthesSession";

const resolvers = {
  Mutation: {
    signIn: async (
      _parent: any,
      { username, password }: { username: string; password: string },
      { req, res, prisma, session: s, user: u }: GraphQLContext
    ): Promise<SignInResponse> => {
      if (s)
        throw new GraphQLError("Already signed in.", {
          extensions: { code: "SESSION_EXIST" },
        });

      console.log("auth", req.cookies);
      //check if username and password were sent
      if (!username || !password)
        throw new GraphQLError("Username and password are required.", {
          extensions: { code: "INVALID INPUT(S)" },
        });

      //query db to find username
      const user = await prisma.user.findUnique({ where: { username } });

      //if no user found, throw error
      if (user === null)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      /*---user found in db below this point---*/

      //check if user-sent pw is correct, throw error if incorrect
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        throw new GraphQLError("Incorrect password.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //pw is correct; create session token, save session to db, send session token as cookie
      const sessionToken = crypto.randomUUID();

      const MAX_AGE = 60 * 60 * 24 * 7 * 52; //52 weeks
      const expires = new Date();
      expires.setSeconds(expires.getSeconds() + MAX_AGE);

      const cookie = serialize(NEPENTHES_SESSION, sessionToken, {
        expires,
        path: "/",
        httpOnly: true,
        sameSite: true,
        secure: true,
      });

      const session = await prisma.session.create({
        data: { sessionToken, expires, userId: user.id },
      });

      res.setHeader("Set-Cookie", cookie);

      return {
        successStatus: true,
        message: "Sign in successful.",
        user: { id: user.id, username: user.username, email: user.email },
      };
    },
    signOut: async (
      _parent: any,
      _args: any,
      { req, res, user, session, prisma }: GraphQLContext
    ) => {
      //if no session string, there is nothing to delete
      if (!session)
        throw new GraphQLError("Already signed out.", {
          extensions: { code: "SESSION_DOES_NOT_EXIST" },
        });

      //rm session from db
      const deletedSession = await prisma.session.delete({
        where: { sessionToken: session },
      });
      console.log(deletedSession);

      //expire cookie
      const cookie = serialize(NEPENTHES_SESSION, session, {
        expires: new Date(+0), //"The exact moment of midnight at the beginning of 01 January, 1970 UTC is represented by the value +0"
        path: "/",
        httpOnly: true,
        sameSite: true,
        secure: true,
      });
      res.setHeader("Set-Cookie", cookie);

      //delete key-value from req cookie obj
      delete req.cookies[NEPENTHES_SESSION];

      return { successStatus: true, message: "Sign out successful." };
    },
  },
};

export default resolvers;

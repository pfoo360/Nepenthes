import { GraphQLError } from "graphql";
import { GraphQLContext } from "../../types/types";
import bcrypt from "bcrypt";
import { SignInResponse } from "../../types/types";
import crypto from "crypto";
import { serialize } from "cookie";

const resolvers = {
  Mutation: {
    signIn: async (
      _parent: any,
      { username, password }: { username: string; password: string },
      { req, res, prisma }: GraphQLContext
    ): Promise<SignInResponse> => {
      //todo: xsf header check, check to make sure no session exists(canot create new act if alrdy logged in)

      console.log(req.cookies);
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

      const cookie = serialize("nepenthes-session", sessionToken, {
        expires,
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
  },
};

export default resolvers;

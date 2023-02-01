import { GraphQLError } from "graphql";
import { GraphQLContext, CreateUserResponse, User } from "../../types/types";
import bcrypt from "bcrypt";

const resolvers = {
  Query: {
    me: (
      parent: undefined,
      args: {},
      { prisma, session, user }: GraphQLContext
    ) => {
      // const s = "sdfsdfsdf";
      // const u = { id: "sdafsdfsd", username: "test", email: "test@test.com" };

      if (!session || !user)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      console.log(session, user);
      console.log("me", parent, args);
      return user;
    },
  },
  Me: {
    myAccount: (parent: User, args: {}, context: GraphQLContext) => {
      console.log("parent", parent);
      return parent;
    },
    myWorkspace: async (parent: User, args: {}, { prisma }: GraphQLContext) => {
      console.log("workspace", parent.id, args);
      const myWorkspace = await prisma.workspaceUser.findMany({
        where: { userId: parent.id },
        select: { workspace: { select: { id: true, name: true } }, role: true },
      });
      //console.log(myWorkspace);

      return myWorkspace;
    },
  },
  Mutation: {
    createUser: async (
      _parent: any,
      {
        username,
        email,
        password,
      }: { username: string; email: string; password: string },
      { req, res, prisma }: GraphQLContext
    ): Promise<CreateUserResponse> => {
      //todo: try/catch, xsf header check, check to make sure no session exists(canot create new act if alrdy logged in)
      console.log(username, email, password);
      //check username, email, password are valid
      if (
        !/^[a-zA-Z0-9_-]{6,12}$/i.test(username) ||
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email) ||
        !/^[a-zA-Z0-9]{6,24}$/i.test(password)
      ) {
        throw new GraphQLError("Invalid username, email or password format.", {
          extensions: { code: "INVALID_INPUT(S)" },
        });
      }

      //query db to check if username or email is taken alrdy
      const [usernameCheck, emailCheck] = await Promise.allSettled([
        prisma.user.findFirst({ where: { username } }),
        prisma.user.findFirst({ where: { email } }),
      ]);

      console.log(usernameCheck, emailCheck);
      //if taken, throw error
      if (
        usernameCheck.status === "rejected" ||
        emailCheck.status === "rejected"
      ) {
        throw new GraphQLError("Looks like something went wrong.", {
          extensions: { code: "INTERNAL_ERROR" },
        });
      }
      //"value" key is only present when status is 'fulfilled', so status needs to be checked first
      //prisma will return "null" if cannot find value in db OR return an object if it can find value in db
      if (
        usernameCheck.status === "fulfilled" &&
        emailCheck.status === "fulfilled" &&
        (usernameCheck.value !== null || emailCheck.value !== null)
      ) {
        throw new GraphQLError("Username and/or email already in use.", {
          extensions: { code: "INVALID_INPUT(S)" },
        });
      }

      //if not taken, hash pw and save details to db
      const hashedPwd = await bcrypt.hash(password, 10);
      console.log(hashedPwd);
      const user = await prisma.user.create({
        data: { username, email, password: hashedPwd },
      });
      console.log(user);

      return {
        successStatus: true,
        message: "Hello, world!",
        user: { id: user.id, username: user.username, email: user.email },
      };
    },
  },
};

export default resolvers;

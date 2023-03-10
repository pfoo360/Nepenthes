import { GraphQLError } from "graphql";
import { GraphQLContext, CreateUserResponse, User } from "../../types/types";
import bcrypt from "bcrypt";
import ROLES from "../../utils/role";

const resolvers = {
  Query: {
    me: (
      parent: undefined,
      args: {},
      { prisma, session, user }: GraphQLContext
    ) => {
      if (!session || !user)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      return user;
    },
  },
  Me: {
    myAccount: (parent: User, args: {}, context: GraphQLContext) => {
      return parent;
    },
    myWorkspaces: async (
      parent: User,
      args: {},
      { prisma }: GraphQLContext
    ) => {
      const myWorkspace = await prisma.workspaceUser.findMany({
        where: { userId: parent.id },
        select: {
          workspace: {
            select: {
              id: true,
              name: true,
              workspaceUser: {
                select: {
                  id: true,
                  user: { select: { id: true, username: true, email: true } },
                  role: true,
                },
              },
            },
          },
          role: true,
        },
      });

      return myWorkspace;
    },
    myProjects: async (
      parent: User,
      { workspaceId }: { workspaceId: string },
      { req, res, session, user, prisma }: GraphQLContext
    ) => {
      //check if the user is apart of the workspace
      const workspaceUser = await prisma.workspaceUser.findUnique({
        where: { workspaceId_userId: { userId: parent.id, workspaceId } },
      });
      if (!workspaceUser)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //if user is an ADMIN in the workspace, return all projects that exists in the workspace
      if (workspaceUser.role === ROLES.ADMIN) {
        const projects = await prisma.project.findMany({
          where: { workspaceId },
        });
        return projects;
      }
      //if user is a MANAGER or DEVELOPER in the workspace, return the projects they are apart of
      if (
        workspaceUser.role === ROLES.MANAGER ||
        workspaceUser.role === ROLES.DEVELOPER
      ) {
        const projects = await prisma.project.findMany({
          where: {
            projectWorkspaceUser: {
              some: { workspaceUserId: workspaceUser.id },
            },
          },
        });
        return projects;
      }
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
      { req, res, session: s, user: u, prisma }: GraphQLContext
    ): Promise<CreateUserResponse> => {
      //check auth: if session or user exists, cannot create account
      if (s || u)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

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
      const user = await prisma.user.create({
        data: { username, email, password: hashedPwd },
      });

      return {
        successStatus: true,
        message: "Hello, world!",
        user: { id: user.id, username: user.username, email: user.email },
      };
    },
  },
};

export default resolvers;

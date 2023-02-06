import { GraphQLError } from "graphql";
import { GraphQLContext, CreateUserResponse, User } from "../../types/types";
import ROLES from "../../utils/role";

const resolvers = {
  Mutation: {
    createProject: async (
      _parent: any,
      {
        projectName,
        projectDescription,
        workspaceId,
      }: {
        projectName: string;
        projectDescription: string | undefined;
        workspaceId: string;
      },
      { req, res, prisma, session, user }: GraphQLContext
    ) => {
      //check auth
      if (!session || !user)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //check if args exist
      if (
        !projectName ||
        !workspaceId ||
        projectName.length > 25 ||
        (projectDescription && projectDescription.length > 120)
      )
        throw new GraphQLError("Invalid argument(s).", {
          extensions: { code: "INVALID INPUT(S)" },
        });

      //check if user making request is an ADMIN or MANAGER in the workspace
      const workspaceUser = await prisma.workspaceUser.findUnique({
        where: {
          workspaceId_userId: { userId: user.id, workspaceId: workspaceId },
        },
      });
      if (
        !workspaceUser ||
        (workspaceUser.role !== ROLES.ADMIN &&
          workspaceUser.role !== ROLES.MANAGER)
      )
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      console.log(
        !projectName,
        !workspaceId,
        projectName.length > 25,
        projectDescription && projectDescription.length > 120
      );

      console.log(
        "CREATEPROJECT",
        projectName,
        typeof projectDescription,
        projectDescription,
        workspaceId
      );
      return { a: true };
    },
  },
};

export default resolvers;

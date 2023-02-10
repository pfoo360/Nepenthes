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
        selectedWorkspaceUserIds,
      }: {
        projectName: string;
        projectDescription: string | undefined;
        workspaceId: string;
        selectedWorkspaceUserIds: string[];
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
        "CREATEPROJECT",
        projectName,
        typeof projectDescription,
        projectDescription,
        workspaceUser,
        workspaceId,
        selectedWorkspaceUserIds
      );

      //projectsWorkspaceUsers are the users that are apart of the project
      const projectsWorkspaceUsers = [
        ...Array.from(selectedWorkspaceUserIds, (workspaceUserId) => ({
          workspaceUserId,
        })),
        { workspaceUserId: workspaceUser.id },
      ];
      console.log(projectsWorkspaceUsers);
      const project = await prisma.project.create({
        data: {
          name: projectName,
          description: projectDescription,
          workspaceId: workspaceUser.workspaceId,
          projectWorkspaceUser: {
            create: projectsWorkspaceUsers,
          },
        },
      });

      console.log(project);
      return project;
    },
  },
};

export default resolvers;

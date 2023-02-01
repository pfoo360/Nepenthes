import { GraphQLError } from "graphql";
import { GraphQLContext, CreateWorkspaceResponse } from "./../../types/types";

const resolvers = {
  Mutation: {
    createWorkspace: async (
      _parent: any,
      { workspaceName }: { workspaceName: string },
      { req, res, prisma, session, user }: GraphQLContext
    ): Promise<CreateWorkspaceResponse> => {
      if (!session || !user)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });
      console.log(workspaceName, session, user, req.cookies);

      if (!workspaceName)
        throw new GraphQLError("Name is required.", {
          extensions: { code: "INVALID INPUT(S)" },
        });
      if (workspaceName.length > 25)
        throw new GraphQLError("Name length exceeds limit.", {
          extensions: { code: "INVALID INPUT(S)" },
        });

      //add to Workspace table, connect Workspace with user via WorkspaceUser table
      //the user that creates a workspace is automatically assigned as ADMIN
      const workspace = await prisma.workspace.create({
        data: {
          name: workspaceName,
          workspaceUser: { create: { userId: user.id, role: "ADMIN" } },
        },
        select: {
          id: true,
          name: true,
          workspaceUser: {
            select: {
              user: { select: { id: true, email: true, username: true } },
              role: true,
            },
          },
        },
      });

      console.log(workspace);
      //check to see if workspace has been created, throw error if not

      return workspace;
    },
  },
};

export default resolvers;

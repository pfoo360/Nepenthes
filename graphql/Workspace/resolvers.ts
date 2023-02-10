import { GraphQLError } from "graphql";
import {
  GraphQLContext,
  CreateWorkspaceResponse,
  WorkspaceUser,
  Role,
  UpdateWorkspaceNameResponse,
  DeleteWorkspaceResponse,
} from "./../../types/types";
import ROLES from "../../utils/role";

const resolvers = {
  Query: {
    getWorkspacesUsers: async (
      _parent: any,
      { workspaceId }: { workspaceId: string },
      { req, res, prisma, session, user }: GraphQLContext
    ): Promise<WorkspaceUser[]> => {
      console.log("GETWORKSPACEUSERS", workspaceId);
      if (!workspaceId)
        throw new GraphQLError("Workspace ID is required.", {
          extensions: { code: "INVALID INPUT(S)" },
        });

      if (!session || !user)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //check if user making request is an ADMIN in the workspace
      const workspaceUser = await prisma.workspaceUser.findUnique({
        where: {
          workspaceId_userId: { userId: user.id, workspaceId: workspaceId },
        },
      });
      if (!workspaceUser || workspaceUser.role !== ROLES.ADMIN)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //since user making request is an ADMIN, return all users belonging to the workspace
      const workspaceUsers = await prisma.workspaceUser.findMany({
        where: { workspaceId },
        select: {
          id: true,
          user: { select: { id: true, username: true, email: true } },
          role: true,
        },
      });

      return workspaceUsers;
    },
  },
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
          workspaceUser: {
            create: { userId: user.id, role: ROLES.ADMIN as Role },
          },
        },
        select: {
          id: true,
          name: true,
          workspaceUser: {
            select: {
              id: true,
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
    addUserToWorkspace: async (
      _parent: any,
      {
        username,
        role,
        workspaceId,
      }: { username: string; role: Role; workspaceId: string },
      { req, res, prisma, session, user }: GraphQLContext
    ): Promise<WorkspaceUser> => {
      //check auth
      if (!session || !user)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //check if user args all exist
      if (
        !workspaceId ||
        !username ||
        (role !== ROLES.ADMIN &&
          role !== ROLES.MANAGER &&
          role !== ROLES.DEVELOPER)
      )
        throw new GraphQLError("Missing arguments.", {
          extensions: { code: "INVALID INPUT(S)" },
        });

      //check if user making request is an ADMIN in the workspace
      const workspaceUser = await prisma.workspaceUser.findUnique({
        where: {
          workspaceId_userId: { userId: user.id, workspaceId: workspaceId },
        },
      });
      if (!workspaceUser || workspaceUser.role !== ROLES.ADMIN)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //--workspace exists, user is apart of the workspace, user is an ADMIN in the workspace--

      //verify requested user exists
      const foundUser = await prisma.user.findUnique({
        where: { username },
        select: { id: true, username: true },
      });

      if (!foundUser || !foundUser.id)
        throw new GraphQLError("User does not exist.", {
          extensions: { code: "INVALID INPUT(S)" },
        });

      const newlyCreatedWorkspaceUser = await prisma.workspaceUser.create({
        data: { workspaceId, userId: foundUser.id, role },
        select: {
          id: true,
          user: { select: { id: true, username: true, email: true } },
          role: true,
        },
      });

      return newlyCreatedWorkspaceUser;
      return {
        id: "12323",
        user: { id: "123", username: "test", email: "fdsafd" },
        role: "ADMIN",
      };
    },
    updateUserRole: async (
      _parent: any,
      {
        userId,
        workspaceId,
        role,
      }: { userId: string; workspaceId: string; role: Role },
      { req, res, user, session, prisma }: GraphQLContext
    ): Promise<WorkspaceUser> => {
      //check auth
      if (!session || !user)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //check if user args all exist
      if (
        !userId ||
        !workspaceId ||
        (role !== ROLES.ADMIN &&
          role !== ROLES.MANAGER &&
          role !== ROLES.DEVELOPER)
      )
        throw new GraphQLError("Missing arguments.", {
          extensions: { code: "INVALID INPUT(S)" },
        });

      //check if user making request is an ADMIN in the workspace
      const workspaceUser = await prisma.workspaceUser.findUnique({
        where: {
          workspaceId_userId: { userId: user.id, workspaceId: workspaceId },
        },
      });
      if (!workspaceUser || workspaceUser.role !== ROLES.ADMIN)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //---user making request is an ADMIN in the workspace, can now update another user's role

      //make sure that the workspace has at least ONE(1) ADMIN user
      const userToBeUpdated = await prisma.workspaceUser.findUnique({
        where: { workspaceId_userId: { userId, workspaceId } },
      });
      if (!userToBeUpdated)
        throw new GraphQLError("User to be updated does not exist.", {
          extensions: { code: "INVALID INPUT(S)" },
        });
      //if the user to be updated is an ADMIN
      //AND if there is ONE(1) or less ADMINS in a workspace we cannot continue
      if (userToBeUpdated.role === ROLES.ADMIN) {
        const numberOfAdmins = await prisma.workspaceUser.count({
          where: { AND: { workspaceId, role: ROLES.ADMIN } },
        });
        console.log(`NUMBEROFADMINS FOR ${workspaceId}`, numberOfAdmins);
        if (numberOfAdmins <= 1)
          throw new GraphQLError("Workspace requires at least ONE(1) ADMIN", {
            extensions: { code: "UNAUTHORIZED" },
          });
      }

      const updatedUser = await prisma.workspaceUser.update({
        where: { workspaceId_userId: { userId, workspaceId } },
        data: { role },
        select: {
          id: true,
          user: { select: { id: true, username: true, email: true } },
          role: true,
        },
      });

      return updatedUser;
    },
    deleteUserFromWorkspace: async (
      _parent: any,
      { userId, workspaceId }: { userId: string; workspaceId: string },
      { req, res, session, user, prisma }: GraphQLContext
    ): Promise<WorkspaceUser> => {
      //check auth
      if (!session || !user)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //check if user args all exist
      if (!userId || !workspaceId)
        throw new GraphQLError("Missing arguments.", {
          extensions: { code: "INVALID INPUT(S)" },
        });

      //check if user making request is an ADMIN in the workspace
      const workspaceUser = await prisma.workspaceUser.findUnique({
        where: {
          workspaceId_userId: { userId: user.id, workspaceId: workspaceId },
        },
      });
      if (!workspaceUser || workspaceUser.role !== ROLES.ADMIN)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //---user making request is an ADMIN in the workspace, can delete user from the workspace

      //make sure that the workspace has at least ONE(1) ADMIN user
      const userToBeDeleted = await prisma.workspaceUser.findUnique({
        where: { workspaceId_userId: { userId, workspaceId } },
      });
      if (!userToBeDeleted)
        throw new GraphQLError("User to be deleted does not exist.", {
          extensions: { code: "INVALID INPUT(S)" },
        });
      //if the user to be deleted is an ADMIN AND if there is ONE(1) or less ADMINS in a workspace we cannot continue
      if (userToBeDeleted.role === ROLES.ADMIN) {
        const numberOfAdmins = await prisma.workspaceUser.count({
          where: { AND: { workspaceId, role: ROLES.ADMIN } },
        });
        console.log(`NUMBEROFADMINS FOR ${workspaceId}`, numberOfAdmins);
        if (numberOfAdmins <= 1)
          throw new GraphQLError("Workspace requires at least ONE(1) ADMIN", {
            extensions: { code: "UNAUTHORIZED" },
          });
      }

      const deletedUser = await prisma.workspaceUser.delete({
        where: { workspaceId_userId: { userId, workspaceId } },
        select: {
          id: true,
          user: { select: { id: true, username: true, email: true } },
          role: true,
        },
      });

      return deletedUser;
    },
    updateWorkspaceName: async (
      _parent: any,
      { workspaceId, newName }: { workspaceId: string; newName: string },
      { req, res, user, session, prisma }: GraphQLContext
    ): Promise<UpdateWorkspaceNameResponse> => {
      //check auth
      if (!session || !user)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //check if user args all exist and are valid
      if (!workspaceId || !newName)
        throw new GraphQLError("Missing arguments.", {
          extensions: { code: "INVALID INPUT(S)" },
        });
      if (newName.length > 25)
        throw new GraphQLError("Invalid arguments.", {
          extensions: { code: "INVALID INPUT(S)" },
        });

      //check if user making request is an ADMIN in the workspace
      const workspaceUser = await prisma.workspaceUser.findUnique({
        where: {
          workspaceId_userId: { userId: user.id, workspaceId: workspaceId },
        },
      });
      if (!workspaceUser || workspaceUser.role !== ROLES.ADMIN)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //user making request is an ADMIN in workspace and can update workspace name
      const updatedWorkspace = await prisma.workspace.update({
        where: { id: workspaceId },
        data: { name: newName },
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
      });

      console.log("UPDATENAME", updatedWorkspace, newName, workspaceUser);
      return updatedWorkspace;
    },
    deleteWorkspace: async (
      _parent: any,
      { workspaceId }: { workspaceId: string },
      { req, res, session, user, prisma }: GraphQLContext
    ): Promise<DeleteWorkspaceResponse> => {
      //check auth
      if (!session || !user)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //check if user args all exist and are valid
      if (!workspaceId)
        throw new GraphQLError("Missing arguments.", {
          extensions: { code: "INVALID INPUT(S)" },
        });

      //check if user making request is an ADMIN in the workspace
      const workspaceUser = await prisma.workspaceUser.findUnique({
        where: {
          workspaceId_userId: { userId: user.id, workspaceId: workspaceId },
        },
      });
      if (!workspaceUser || workspaceUser.role !== ROLES.ADMIN)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      const deletedWorkspace = await prisma.workspace.delete({
        where: { id: workspaceId },
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
      });
      console.log("DELETED WKSPC", deletedWorkspace);
      return deletedWorkspace;
    },
  },
};

export default resolvers;

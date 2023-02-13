import { GraphQLError } from "graphql";
import { GraphQLContext, CreateUserResponse, User } from "../../types/types";
import ROLES from "../../utils/role";
import USERS_PER_PAGE from "../../utils/usersPerPage";

const resolvers = {
  Query: {
    getProjectsWorkspaceUsers: async (
      _parent: any,
      {
        projectId,
        workspaceId,
        page,
      }: { projectId: string; workspaceId: string; page: number },
      { req, res, prisma, session, user }: GraphQLContext
    ) => {
      //check auth
      if (!session || !user)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //make sure args exist
      if (!projectId)
        throw new GraphQLError("Invalid argument(s).", {
          extensions: { code: "INVALID INPUT(S)" },
        });

      //check if user making request is apart of the workspace
      const workspaceUser = await prisma.workspaceUser.findUnique({
        where: {
          workspaceId_userId: { userId: user.id, workspaceId },
        },
      });
      if (!workspaceUser)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      console.log("PAGE", page);
      //if the user making the request is an ADMIN in the workspace, just make sure the project the user is requesting is a project that belongs to the workspace. If project belongs to the workspace, return all the users apart of the project
      //ADMINs in a workspace do not need to be apart of the project to view the users that are apart of the project
      if (workspaceUser.role === ROLES.ADMIN) {
        const project = await prisma.project.findUnique({
          where: {
            id_workspaceId: {
              id: projectId,
              workspaceId: workspaceUser.workspaceId,
            },
          },
        });
        if (!project)
          throw new GraphQLError("Unauthorized.", {
            extensions: { code: "UNAUTHORIZED" },
          });
        console.log(project);

        const projectsWorkspaceUsers =
          await prisma.projectWorkspaceUser.findMany({
            where: { projectId: project.id },
            skip: (page - 1) * USERS_PER_PAGE,
            take: USERS_PER_PAGE,
            select: {
              id: true,
              workspaceUser: {
                select: {
                  id: true,
                  user: { select: { id: true, username: true, email: true } },
                  role: true,
                },
              },
            },
          });
        console.log(project.id, workspaceId);
        console.log("PROMISE", projectsWorkspaceUsers);

        return projectsWorkspaceUsers;
      }

      //if the user making the request is NOT an ADMIN in the workspace, make sure the project the user is requesting is a project that belongs to the workspace AND that the user is assigned to the project. If project belongs to the workspace AND the user is assigned to the project, return all the users apart of the project
      //ADMINs in a workspace do not need to be apart of the project to view the users that are apart of the project
      if (workspaceUser.role !== ROLES.ADMIN) {
        const projectExistsAndUserAssignedToProject = await Promise.all([
          prisma.project.findUnique({
            where: {
              id_workspaceId: {
                id: projectId,
                workspaceId: workspaceUser.workspaceId,
              },
            },
          }),
          prisma.projectWorkspaceUser.findUnique({
            where: {
              projectId_workspaceUserId: {
                projectId,
                workspaceUserId: workspaceUser.id,
              },
            },
          }),
        ]);

        //projectExistsAndUserAssignedToProject[0] checks if project exists AND is apart of the workspace
        //projectExistsAndUserAssignedToProject[1] checks if the user is apart of the project
        if (
          !projectExistsAndUserAssignedToProject[0] ||
          !projectExistsAndUserAssignedToProject[1]
        )
          throw new GraphQLError("Unauthorized.", {
            extensions: { code: "UNAUTHORIZED" },
          });

        console.log(projectExistsAndUserAssignedToProject[0]);
        console.log(projectExistsAndUserAssignedToProject[1]);

        const projectsWorkspaceUsers =
          await prisma.projectWorkspaceUser.findMany({
            where: { projectId },
            skip: (page - 1) * USERS_PER_PAGE,
            take: USERS_PER_PAGE,
            select: {
              id: true,
              workspaceUser: {
                select: {
                  id: true,
                  user: { select: { id: true, username: true, email: true } },
                  role: true,
                },
              },
            },
          });

        console.log(workspaceUser.role, workspaceId);
        console.log("PROMISE", projectsWorkspaceUsers);

        return projectsWorkspaceUsers;
      }
    },
  },
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
    addWorkspaceUserToProject: async (
      _parent: any,
      {
        selectedWorkspaceUserIds,
        workspaceId,
        projectId,
      }: {
        selectedWorkspaceUserIds: string[];
        workspaceId: string;
        projectId: string;
      },
      { req, res, prisma, session, user }: GraphQLContext
    ) => {
      //check auth
      if (!session || !user)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //check if args exist
      if (!selectedWorkspaceUserIds || !workspaceId || !projectId)
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

      console.log("%%%%%%%%%%", workspaceUser);

      //see if project belongs to the workspace the user is apart of
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project || project.workspaceId !== workspaceUser.workspaceId)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //below this point, the project is apart of the workspace and the user is apart of the workspace
      console.log(project);

      //ADMINs of a workspace can assign a workspaceUser to any project, even projects the ADMIN is NOT apart of
      //MANAGERS can only assign users to a project that the MANAGER is also apart of
      if (workspaceUser.role === ROLES.MANAGER) {
        //check to see if user is apart of the project if their role is MANAGER
        const isWorkspaceUserAssignedToProject =
          await prisma.projectWorkspaceUser.findUnique({
            where: {
              projectId_workspaceUserId: {
                projectId: project.id,
                workspaceUserId: workspaceUser.id,
              },
            },
          });
        if (!isWorkspaceUserAssignedToProject)
          throw new GraphQLError("Unauthorized.", {
            extensions: { code: "UNAUTHORIZED" },
          });
      }

      //array of {projectId: 'abc', workspaceUserId: 'xyz'} is expected shape when using createMany on the projectWorkspaceUser table
      const array = Array.from(selectedWorkspaceUserIds, (workspaceUserId) => ({
        projectId,
        workspaceUserId,
      }));
      console.log(array);

      //NOTE: prisma does NOT return newly created entries when createMany
      const count = await prisma.projectWorkspaceUser.createMany({
        data: array,
        skipDuplicates: true,
      });

      console.log(count);

      return count;
    },
    deleteWorkspaceUserFromProject: async (
      _parent: any,
      {
        projectId,
        workspaceId,
        projectWorkspaceUserId,
      }: {
        projectId: string;
        workspaceId: string;
        projectWorkspaceUserId: string;
      },
      { req, res, prisma, session, user }: GraphQLContext
    ) => {
      //check auth
      if (!session || !user)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //check if args exist
      if (!projectId || !workspaceId || !projectWorkspaceUserId)
        throw new GraphQLError("Invalid argument(s).", {
          extensions: { code: "INVALID INPUT(S)" },
        });

      //check if user making request is an ADMIN or MANAGER in the workspace
      const workspaceUser = await prisma.workspaceUser.findUnique({
        where: {
          workspaceId_userId: { userId: user.id, workspaceId },
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

      //find project and see if project belongs to the workspace
      const project = await prisma.project.findUnique({
        where: { id_workspaceId: { id: projectId, workspaceId } },
      });
      if (!project)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //if user making the delete request is a MANAGER in the workspace, then make sure they are assigned to the project first; MANAGERS can only delete project's team members if the MANAGER is apart of the project too
      //if user making the delete request is a ADMIN in the workspace, they are allowed to delete project's team members even if ADMIN is NOT assigned to it
      if (workspaceUser.role === ROLES.MANAGER) {
        const isManagerApartOfTheProject =
          await prisma.projectWorkspaceUser.findUnique({
            where: {
              projectId_workspaceUserId: {
                projectId: project.id,
                workspaceUserId: workspaceUser.id,
              },
            },
          });
        //if cannot find MANAGER in project then they are unauthorized to continue with deletion
        if (!isManagerApartOfTheProject)
          throw new GraphQLError("Unauthorized.", {
            extensions: { code: "UNAUTHORIZED" },
          });
      }

      //below this point we know there is a user is apart of a workspace, the project belongs to the same workspace, user is an ADMIN or a (MANAGER that is assigned to the project)
      console.log(project);

      const deletedProjectWorkspaceUser =
        await prisma.projectWorkspaceUser.delete({
          where: { id: projectWorkspaceUserId },
          select: {
            id: true,
            workspaceUser: {
              select: {
                id: true,
                user: { select: { id: true, email: true, username: true } },
                role: true,
              },
            },
          },
        });

      console.log(projectId, workspaceId, projectWorkspaceUserId);
      console.log(deletedProjectWorkspaceUser);

      return deletedProjectWorkspaceUser;
    },
    deleteProject: async (
      _parent: any,
      { workspaceId, projectId }: { workspaceId: string; projectId: string },
      { req, res, prisma, user, session }: GraphQLContext
    ) => {
      //check auth
      if (!session || !user)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //check if args exist
      if (!workspaceId || !projectId)
        throw new GraphQLError("Invalid argument(s).", {
          extensions: { code: "INVALID INPUT(S)" },
        });

      //check if user making request is an ADMIN or MANAGER in the workspace
      const workspaceUser = await prisma.workspaceUser.findUnique({
        where: {
          workspaceId_userId: { userId: user.id, workspaceId },
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

      console.log("DELETEPROJECT", workspaceUser);
      //MANAGERS are only allowed to delete projects that have been assigned to them or projects they created
      //ADMINS are allowed to delete any project as long as the project is apart of the workspace
      if (workspaceUser.role === ROLES.MANAGER) {
        const isManagerApartOfTheProject =
          await prisma.projectWorkspaceUser.findUnique({
            where: {
              projectId_workspaceUserId: {
                projectId,
                workspaceUserId: workspaceUser.id,
              },
            },
          });
        console.log("isManagerApartOfTheProject", isManagerApartOfTheProject);
        //if cannot find MANAGER in project then they are unauthorized to continue with deletion
        if (!isManagerApartOfTheProject)
          throw new GraphQLError("Unauthorized.", {
            extensions: { code: "UNAUTHORIZED" },
          });
      }

      //is project apart of the workspace
      const project = await prisma.project.findUnique({
        where: {
          id_workspaceId: {
            id: projectId,
            workspaceId: workspaceUser.workspaceId,
          },
        },
      });
      if (!project)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      const deletedProject = await prisma.project.delete({
        where: { id: projectId },
      });
      console.log("DELETEPROJECT", deletedProject);
      console.log("DELETEPROJECT", project);
      return deletedProject;
    },
  },
};

export default resolvers;

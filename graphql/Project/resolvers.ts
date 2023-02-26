import { GraphQLError } from "graphql";
import { GraphQLContext, Project, WorkspaceUser } from "../../types/types";
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
      if (!projectId || !workspaceId || page < 1)
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

        return projectsWorkspaceUsers;
      }

      //if the user making the request is NOT an ADMIN in the workspace, make sure the project the user is requesting is a project that belongs to the workspace AND that the user is assigned to the project. If project belongs to the workspace AND the user is assigned to the project, return all the users apart of the project
      if (workspaceUser.role !== ROLES.ADMIN) {
        //[0] checks if project exists AND is apart of the workspace
        //[1] checks if the user is apart of the project
        const [isProjectExistsAndApartOfWorkspace, isUserAssignedToProject] =
          await Promise.all([
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

        if (!isProjectExistsAndApartOfWorkspace || !isUserAssignedToProject)
          throw new GraphQLError("Unauthorized.", {
            extensions: { code: "UNAUTHORIZED" },
          });

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
    ): Promise<Project> => {
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

      //projectsWorkspaceUsers are the users that are apart of the project
      const projectsWorkspaceUsers = [
        ...Array.from(selectedWorkspaceUserIds, (workspaceUserId) => ({
          workspaceUserId,
        })),
        { workspaceUserId: workspaceUser.id },
      ];

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
    ): Promise<{ count: number }> => {
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

      //see if project belongs to the workspace the user is apart of
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project || project.workspaceId !== workspaceUser.workspaceId)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //below this point, the project is apart of the workspace and the user is apart of the workspace

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

      //NOTE: prisma does NOT return newly created entries when createMany
      const count = await prisma.projectWorkspaceUser.createMany({
        data: array,
        skipDuplicates: true,
      });

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
    ): Promise<{ id: string; workspaceUser: WorkspaceUser }> => {
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

      const deletedTicketDevelopers = await prisma.ticketDeveloper.deleteMany({
        where: {
          AND: {
            ticket: { projectId: project.id },
            developer: { id: deletedProjectWorkspaceUser.workspaceUser.id },
          },
        },
      });

      // const a = await prisma.ticketDeveloper.findMany({
      //   where: {
      //     AND: {
      //       ticket: { projectId: project.id },
      //       developer: { id: workspaceUser.id },
      //     },
      //   },
      //   select: {
      //     id: true,
      //     ticketId: true,
      //     developerId: true,
      //     ticket: {
      //       select: {
      //         projectId: true,
      //         title: true,
      //         description: true,
      //         project: { select: { id: true, name: true, description: true } },
      //       },
      //     },
      //     developer: {
      //       select: {
      //         id: true,
      //         role: true,
      //         user: { select: { id: true, username: true, email: true } },
      //       },
      //     },
      //   },
      // });
      // console.log(a);

      return deletedProjectWorkspaceUser;
    },
    deleteProject: async (
      _parent: any,
      { workspaceId, projectId }: { workspaceId: string; projectId: string },
      { req, res, prisma, user, session }: GraphQLContext
    ): Promise<Project> => {
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

      const deletedTicketSubmitter = await prisma.ticketSubmitter.deleteMany({
        where: { ticket: { projectId: project.id } },
      });
      const deletedProject = await prisma.project.delete({
        where: { id: projectId },
      });

      return deletedProject;
    },
  },
};

export default resolvers;

import { GraphQLContext, Priority, Type } from "../../types/types";
import { GraphQLError } from "graphql";
import TYPES from "../../utils/type";
import PRIORITIES from "../../utils/priority";
import ROLES from "../../utils/role";
import TICKETS_PER_PAGE from "../../utils/ticketsPerPage";

const resolvers = {
  Query: {
    getProjectsTickets: async (
      _parent: any,
      {
        projectId,
        workspaceId,
        page,
      }: { projectId: string; workspaceId: string; page: number },
      { req, res, user, session, prisma }: GraphQLContext
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

      //if the user making the request is an ADMIN in the workspace, just make sure the project the user is requesting is a project that belongs to the workspace. If project belongs to the workspace, return all the tickets apart of the project
      //ADMINs in a workspace do not need to be assigned to the project to view the tickets that are apart of the project
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

        const projectsTickets = await prisma.ticket.findMany({
          where: { projectId: project.id },
          skip: (page - 1) * TICKETS_PER_PAGE,
          take: TICKETS_PER_PAGE,
          select: {
            id: true,
            title: true,
            description: true,
            ticketSubmitter: {
              select: {
                id: true,
                submitterId: true,
                submitter: {
                  select: {
                    id: true,
                    user: { select: { id: true, username: true, email: true } },
                    role: true,
                  },
                },
              },
            },
            ticketDeveloper: {
              select: {
                id: true,
                developerId: true,
                developer: {
                  select: {
                    id: true,
                    user: { select: { id: true, username: true, email: true } },
                    role: true,
                  },
                },
              },
            },
            project: {
              select: {
                id: true,
                name: true,
                description: true,
                workspaceId: true,
              },
            },
            priority: true,
            status: true,
            type: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        console.log(project, workspaceUser, projectsTickets);

        return projectsTickets;
      }

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

        //projectExistsAndUserAssignedToProject[0] checks if project exists AND project is apart of the workspace
        //projectExistsAndUserAssignedToProject[1] checks if the user is assigned to the project
        if (
          !projectExistsAndUserAssignedToProject[0] ||
          !projectExistsAndUserAssignedToProject[1]
        )
          throw new GraphQLError("Unauthorized.", {
            extensions: { code: "UNAUTHORIZED" },
          });

        const projectsTickets = await prisma.ticket.findMany({
          where: { projectId },
          skip: (page - 1) * TICKETS_PER_PAGE,
          take: TICKETS_PER_PAGE,
          select: {
            id: true,
            title: true,
            description: true,
            ticketSubmitter: {
              select: {
                id: true,
                submitterId: true,
                submitter: {
                  select: {
                    id: true,
                    user: { select: { id: true, username: true, email: true } },
                    role: true,
                  },
                },
              },
            },
            ticketDeveloper: {
              select: {
                id: true,
                developerId: true,
                developer: {
                  select: {
                    id: true,
                    user: { select: { id: true, username: true, email: true } },
                    role: true,
                  },
                },
              },
            },
            project: {
              select: {
                id: true,
                name: true,
                description: true,
                workspaceId: true,
              },
            },
            priority: true,
            status: true,
            type: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        console.log(
          projectExistsAndUserAssignedToProject[0],
          projectExistsAndUserAssignedToProject[1],
          workspaceUser,
          projectsTickets
        );

        return projectsTickets;
      }
    },
  },
  Mutation: {
    createTicket: async (
      _parent: any,
      {
        title,
        description,
        workspaceUserIds,
        projectId,
        workspaceId,
        priority,
        type,
      }: {
        title: string;
        description: string;
        workspaceUserIds: string[];
        projectId: string;
        workspaceId: string;
        priority: Priority;
        type: Type;
      },
      { req, res, session, user, prisma }: GraphQLContext
    ) => {
      //if user is a ADMIN in the workspace, user can create tickets even if NOT apart of the project
      //if user is a MANAGER in the workspace, user can only create tickets if user is apart of the project
      //if user is a DEVELOPER in the workspace, user canNOT create tickets

      //check auth
      if (!session || !user)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //check if args exist
      if (
        !title ||
        title.length > 20 ||
        description.length > 120 ||
        !projectId ||
        !workspaceId ||
        workspaceUserIds.length <= 0 ||
        !PRIORITIES[priority] ||
        !TYPES[type]
      )
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

      //check if project is owned by the workspace
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

      //if user is a MANAGER of the workspace, check is user is assigned to the project
      if (workspaceUser.role === ROLES.MANAGER) {
        const isManagerAssignedToProject =
          await prisma.projectWorkspaceUser.findUnique({
            where: {
              projectId_workspaceUserId: {
                projectId: project.id,
                workspaceUserId: workspaceUser.id,
              },
            },
          });

        console.log(isManagerAssignedToProject);
        if (!isManagerAssignedToProject)
          throw new GraphQLError("Unauthorized.", {
            extensions: { code: "UNAUTHORIZED" },
          });
      }

      const developerIds = Array.from(workspaceUserIds, (workspaceUserId) => ({
        developerId: workspaceUserId,
      }));
      const ticket = await prisma.ticket.create({
        data: {
          title,
          description,
          ticketSubmitter: { create: { submitterId: workspaceUser.id } },
          ticketDeveloper: { createMany: { data: developerIds } },
          project: { connect: { id: project.id } },
          priority,
          status: "OPEN",
          type,
        },
        select: {
          id: true,
          title: true,
          description: true,
          ticketSubmitter: {
            select: {
              id: true,
              submitterId: true,
              submitter: {
                select: {
                  id: true,
                  user: { select: { id: true, username: true, email: true } },
                  role: true,
                },
              },
            },
          },
          ticketDeveloper: {
            select: {
              id: true,
              developerId: true,
              developer: {
                select: {
                  id: true,
                  user: { select: { id: true, username: true, email: true } },
                  role: true,
                },
              },
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              description: true,
              workspaceId: true,
            },
          },
          priority: true,
          status: true,
          type: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      console.log(
        !title,
        title.length > 20,
        description.length > 120,
        !projectId,
        !workspaceId,
        workspaceUserIds.length <= 0,
        !PRIORITIES[priority],
        !TYPES[type]
      );
      console.log(workspaceUser);
      console.log(project);
      console.log(ticket);
      return ticket;
    },
  },
};

export default resolvers;

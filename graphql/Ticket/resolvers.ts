import { GraphQLContext, Priority, Type, Status } from "../../types/types";
import { GraphQLError } from "graphql";
import TYPES from "../../utils/type";
import PRIORITIES from "../../utils/priority";
import STATUS from "../../utils/status";
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
          orderBy: { createdAt: "desc" },
        });

        console.log(project, workspaceUser, projectsTickets);

        return projectsTickets;
      }

      if (workspaceUser.role !== ROLES.ADMIN) {
        //[0] checks if project exists AND project is apart of the workspace
        //[1] checks if the user is assigned to the project
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
          orderBy: { createdAt: "desc" },
        });

        console.log(
          isProjectExistsAndApartOfWorkspace,
          isUserAssignedToProject,
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
    updateTicket: async (
      _parent: any,
      {
        title,
        description,
        workspaceUserIds,
        priority,
        type,
        status,
        projectId,
        workspaceId,
        ticketId,
      }: {
        title: string;
        description: string;
        workspaceUserIds: [string];
        priority: Priority;
        type: Type;
        status: Status;
        workspaceId: string;
        projectId: string;
        ticketId: string;
      },
      { req, res, user, session, prisma }: GraphQLContext
    ) => {
      //ADMINs in a workspace can make changes to any ticket in the workspace unconditionally
      //MANAGERs in a workspace can make changes to tickets IFF ticket is apart of project + MANAGER is assigned to project
      //DEVELOPERs in a workspace can make changes to (certain parts of) tickets if they are listed as a dev

      //check auth
      if (!session || !user)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });
      console.log(
        "ARGS",
        title,
        description,
        workspaceUserIds,
        priority,
        type,
        status,
        projectId,
        workspaceId,
        ticketId
      );
      //check if args exist
      if (
        !title ||
        title.length > 20 ||
        description.length > 120 ||
        workspaceUserIds.length <= 0 ||
        !PRIORITIES[priority] ||
        !TYPES[type] ||
        !STATUS[status] ||
        !projectId ||
        !workspaceId
      )
        throw new GraphQLError("Invalid argument(s).", {
          extensions: { code: "INVALID INPUT(S)" },
        });

      //check if user making request is apart of workspace
      const workspaceUser = await prisma.workspaceUser.findUnique({
        where: {
          workspaceId_userId: { userId: user.id, workspaceId },
        },
      });
      if (!workspaceUser)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //workspaceUser.role = "MANAGER";
      console.log("WORKSPACEUSER", workspaceUser);

      //check if project is apart of the same workspace the user is apart of
      const project = await prisma.project.findUnique({
        where: {
          id_workspaceId: {
            id: projectId,
            workspaceId: workspaceUser.workspaceId,
          },
        },
      });
      console.log("PROJECT", project);
      if (!project)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //find ticket and make sure it is apart of the project
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
      });
      if (!ticket || ticket.projectId !== project.id)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });
      console.log("TICKET", ticket);

      //if user is MANAGER or DEVELOPER in the workspace, check if user is assigned to project
      if (workspaceUser.role !== ROLES.ADMIN) {
        const isAssignedToProject =
          await prisma.projectWorkspaceUser.findUnique({
            where: {
              projectId_workspaceUserId: {
                projectId: project.id,
                workspaceUserId: workspaceUser.id,
              },
            },
          });

        console.log("ASSIGNED_TO_PROJECT", isAssignedToProject);
        if (!isAssignedToProject)
          throw new GraphQLError("Unauthorized.", {
            extensions: { code: "UNAUTHORIZED" },
          });
      }

      //below this point we know:
      //user is assigned to the workspace, project is owned by the same workspace, ticket is apart of project
      //user is: (an ADMIN in the workspace) OR (user is a MANAGER/DEVELOPER in the workspace + assigned to project)

      //workspaceUser.role = "DEVELOPER";
      if (workspaceUser.role === ROLES.DEVELOPER) {
        const isDeveloperAssignedToTicket =
          await prisma.ticketDeveloper.findUnique({
            where: {
              ticketId_developerId: {
                ticketId: ticket.id,
                developerId: workspaceUser.id,
              },
            },
          });
        console.log("IS_DEV_ASS_TO_PROJ", isDeveloperAssignedToTicket);
        if (!isDeveloperAssignedToTicket)
          throw new GraphQLError("Unauthorized.", {
            extensions: { code: "UNAUTHORIZED" },
          });

        const updatedTicket = await prisma.ticket.update({
          where: { id: ticket.id },
          data: { status, updatedAt: new Date() },
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
        console.log(updatedTicket);

        return updatedTicket;
      }

      const developerIds = Array.from(workspaceUserIds, (workspaceUserId) => ({
        developerId: workspaceUserId,
      }));
      const updatedTicket = await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          title,
          description,
          priority,
          type,
          status,
          ticketDeveloper: {
            deleteMany: {},
            createMany: { data: developerIds },
          },
          updatedAt: new Date(),
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

      return updatedTicket;
    },
    createComment: async (
      _parent: any,
      {
        comment,
        workspaceId,
        projectId,
        ticketId,
      }: {
        comment: string;
        workspaceId: string;
        projectId: string;
        ticketId: string;
      },
      { req, res, user, session, prisma }: GraphQLContext
    ) => {
      //ADMINs in a workspace can make comments on any ticket in the workspace unconditionally
      //MANAGERs in a workspace can make comments on any ticket IFF ticket is apart of project + MANAGER is assigned to project
      //DEVELOPERs in a workspace can make comments on any tickets if they are listed as a dev

      //check auth
      if (!session || !user)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //check if args exist
      if (
        !comment ||
        comment.length > 120 ||
        !workspaceId ||
        !projectId ||
        !ticketId
      )
        throw new GraphQLError("Invalid argument(s).", {
          extensions: { code: "INVALID INPUT(S)" },
        });

      //check if user making request is apart of workspace
      const workspaceUser = await prisma.workspaceUser.findUnique({
        where: {
          workspaceId_userId: { userId: user.id, workspaceId },
        },
      });
      if (!workspaceUser)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //check if project is apart of the same workspace the user is apart of
      const project = await prisma.project.findUnique({
        where: {
          id_workspaceId: {
            id: projectId,
            workspaceId: workspaceUser.workspaceId,
          },
        },
      });
      console.log("PROJECT", project);
      if (!project)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });

      //find ticket and make sure it is apart of the project
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
      });
      if (!ticket || ticket.projectId !== project.id)
        throw new GraphQLError("Unauthorized.", {
          extensions: { code: "UNAUTHORIZED" },
        });
      console.log("TICKET", ticket);

      //if user is MANAGER or DEVELOPER in the workspace, check if user is assigned to project
      //if user is a DEVELOPER in the workspace, check if user is listed on the ticket
      //workspaceUser.role = "DEVELOPER";
      if (workspaceUser.role !== ROLES.ADMIN) {
        const isAssignedToProject =
          await prisma.projectWorkspaceUser.findUnique({
            where: {
              projectId_workspaceUserId: {
                projectId: project.id,
                workspaceUserId: workspaceUser.id,
              },
            },
          });

        console.log("ASSIGNED_TO_PROJECT", isAssignedToProject);
        if (!isAssignedToProject)
          throw new GraphQLError("Unauthorized.", {
            extensions: { code: "UNAUTHORIZED" },
          });

        //workspaceUser.role = "DEVELOPER";
        if (workspaceUser.role === ROLES.DEVELOPER) {
          const isDeveloperAssignedToTicket =
            await prisma.ticketDeveloper.findUnique({
              where: {
                ticketId_developerId: {
                  ticketId: ticket.id,
                  developerId: workspaceUser.id,
                },
              },
            });
          console.log("IS_DEV_ASS_TO_PROJ", isDeveloperAssignedToTicket);
          if (!isDeveloperAssignedToTicket)
            throw new GraphQLError("Unauthorized.", {
              extensions: { code: "UNAUTHORIZED" },
            });
        }
      }

      //below this point we know:
      //user is assigned to the workspace, project is owned by the same workspace, ticket is apart of project
      //user is: (an ADMIN in the workspace) OR (user is a MANAGER in the workspace + assigned to project) OR (user is a DEVELOPER in the workspace + assigned to project + listed on the ticket as a dev)

      // const createdComment = await prisma.comment.create({
      //   data: {
      //     comment,
      //     authorId: workspaceUser.id,
      //     ticketComment: { create: { ticketId: ticket.id } },
      //   },
      //   select: {
      //     id: true,
      //     comment: true,
      //     authorId: true,
      //     author: {
      //       select: {
      //         id: true,
      //         user: { select: { id: true, username: true, email: true } },
      //         role: true,
      //       },
      //     },
      //     createdAt: true,
      //   },
      // });
      const createdComment = await prisma.ticketComment.create({
        data: {
          ticketId: ticket.id,
          comment: { create: { comment, authorId: workspaceUser.id } },
        },
        select: {
          id: true,
          ticketId: true,
          comment: {
            select: {
              id: true,
              comment: true,
              author: {
                select: {
                  id: true,
                  user: { select: { id: true, username: true, email: true } },
                  role: true,
                },
              },
              createdAt: true,
            },
          },
        },
      });

      return createdComment;
    },
  },
};

export default resolvers;

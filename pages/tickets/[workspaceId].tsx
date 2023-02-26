import { useState } from "react";
import type { GetServerSideProps, NextPage } from "next";
import getServerSessionAndUser from "../../utils/getServerSessionAndUser";
import NavBar from "../../components/NavBar/NavBar";
import prisma from "../../lib/prisma";
import ROLES from "../../utils/role";
import useUserContext from "../../hooks/useUserContext";
import useWorkspaceContext from "../../hooks/useWorkspaceContext";
import useWorkspaceUserContext from "../../hooks/useWorkspaceUserContext";
import Link from "next/link";
import { Ticket } from "../../types/types";
import moment from "moment";
import Head from "next/head";

interface AllWorkspaceUsersTicketsProps {
  tickets_stringify: string;
}
const AllWorkspaceUsersTickets: NextPage<AllWorkspaceUsersTicketsProps> = ({
  tickets_stringify,
}) => {
  const userCtx = useUserContext();
  const workspaceCtx = useWorkspaceContext();
  const workspaceUserCtx = useWorkspaceUserContext();

  const [tickets, setTickets] = useState<Array<Ticket>>(
    JSON.parse(tickets_stringify)
  );

  if (!userCtx || !workspaceCtx || !workspaceUserCtx) return null;
  if (workspaceUserCtx.userId !== userCtx.id) return null;
  if (workspaceUserCtx.workspaceId !== workspaceCtx.id) return null;

  return (
    <>
      <Head>
        <title>Tickets</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className="flex flex-col items-center bg-gray-50">
        <div className="mx-4 my-4 w-11/12 border border-indigo-500 rounded-sm bg-gray-50">
          <div className="bg-indigo-500 px-4 py-2">
            <h1 className="text-gray-50 font-bold">Your tickets</h1>
          </div>
          <div className="flex flex-col bg-gray-50">
            <div className="max-h-[700px] h-auto overflow-y-auto bg-gray-50">
              <div className="overflow-x-auto sm:-mx-6 bg-gray-50">
                <div className="py-2 inline-block min-w-full sm:pl-6 lg:pl-8 bg-gray-50">
                  <div className="overflow-hidden bg-gray-50">
                    <table className="min-w-full h-4/12 bg-gray-50">
                      <thead className="border-b">
                        <tr>
                          <th
                            scope="col"
                            className="text-sm font-medium text-gray-900 px-4 py-2 text-left tracking-wide w-4/12"
                          >
                            Title
                          </th>
                          <th
                            scope="col"
                            className="text-sm font-medium text-gray-900 px-4 py-2 text-left tracking-wide w-4/12"
                          >
                            Submitter
                          </th>
                          <th
                            scope="col"
                            className="text-sm font-medium text-gray-900 px-4 py-2 text-left tracking-wide w-4/12"
                          >
                            {`Developer(s)`}
                          </th>
                          <th
                            scope="col"
                            className="text-sm font-medium text-gray-900 px-4 py-2 text-left tracking-wide w-4/12"
                          >
                            Project
                          </th>
                          <th
                            scope="col"
                            className="text-sm font-medium text-gray-900 px-4 py-2 text-left tracking-wide w-3/12"
                          >
                            Priority
                          </th>
                          <th
                            scope="col"
                            className="text-sm font-medium text-gray-900 px-4 py-2 text-left tracking-wide w-3/12"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="text-sm font-medium text-gray-900 px-4 py-2 text-left tracking-wide w-3/12"
                          >
                            Type
                          </th>
                          <th
                            scope="col"
                            className="text-sm font-medium text-gray-900 px-4 py-2 text-left tracking-wide w-4/12"
                          >
                            Created at
                          </th>

                          <th
                            scope="col"
                            className="text-sm font-medium text-gray-900 px-4 py-2 text-left tracking-wide w-4/12"
                          ></th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.map(
                          ({
                            id,
                            title,
                            description,
                            ticketSubmitter,
                            ticketDeveloper,
                            project,
                            priority,
                            status,
                            type,
                            createdAt,
                            updatedAt,
                          }) => (
                            <tr key={id} className="bg-gray-100 border-b">
                              <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-normal">
                                {title}
                              </td>
                              <td
                                className={`text-sm text-gray-900 font-light px-6 py-4 whitespace-normal ${
                                  !ticketSubmitter?.submitter?.user?.username
                                    ? "text-gray-400"
                                    : null
                                }`}
                              >
                                {ticketSubmitter?.submitter?.user?.username ??
                                  `[deleted]`}
                              </td>
                              <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-normal">
                                {ticketDeveloper.map(({ id, developer }) => (
                                  <p
                                    key={id}
                                    className="text-sm text-gray-900 font-light whitespace-normal"
                                  >
                                    {developer.user.username}
                                  </p>
                                ))}
                              </td>
                              <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-normal">
                                <Link
                                  href={`/p/${project.workspace.id}/${project.id}`}
                                  className="text-blue-500 underline decoration-dotted"
                                >
                                  {project.name}
                                </Link>
                              </td>
                              <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-normal">
                                {priority}
                              </td>
                              <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-normal">
                                {status}
                              </td>
                              <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-normal">
                                {type}
                              </td>
                              <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-normal">
                                {moment(createdAt).format(
                                  "MM/DD/YYYY, h:mm:ss a"
                                )}
                              </td>
                              <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-normal">
                                <Link
                                  href={`/t/${project.workspace.id}/${project.id}/${id}`}
                                  className="text-blue-500 underline decoration-dotted"
                                >
                                  More details
                                </Link>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AllWorkspaceUsersTickets;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
  query,
}) => {
  //check if session and user exists
  const sessionAndUser = await getServerSessionAndUser(req, res);
  if (!sessionAndUser) {
    return { redirect: { destination: "/signin", permanent: false } };
  }
  const { user, sessionToken } = sessionAndUser;

  //check if workspace id provided by client exists in db
  if (!params?.workspaceId || typeof params.workspaceId !== "string")
    return { redirect: { destination: "/workspaces", permanent: false } };
  const { workspaceId } = params;
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, name: true },
  });
  if (!workspace) return { notFound: true };

  //check if user is apart of the workspace
  const workspaceUser = await prisma.workspaceUser.findUnique({
    where: {
      workspaceId_userId: { workspaceId: workspace.id, userId: user.id },
    },
  });
  if (!workspaceUser)
    return { redirect: { destination: "/workspaces", permanent: false } };

  let tickets;
  //ADMINs of a workspace will see all tickets in the workspace
  if (workspaceUser.role === ROLES.ADMIN) {
    tickets = await prisma.ticket.findMany({
      where: { project: { workspaceId: workspaceUser.workspaceId } },
      select: {
        id: true,
        title: true,
        description: true,
        ticketSubmitter: {
          select: {
            id: true,
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
            workspace: { select: { id: true, name: true } },
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
  }
  //MANAGERs of a workspace will see all tickets of projects they are assigned to
  if (workspaceUser.role === ROLES.MANAGER) {
    tickets = await prisma.ticket.findMany({
      where: {
        project: {
          projectWorkspaceUser: { some: { workspaceUserId: workspaceUser.id } },
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        ticketSubmitter: {
          select: {
            id: true,
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
            workspace: { select: { id: true, name: true } },
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
  }
  //DEVELOPERs of a workspace will see all tickets where they are listed as a dev
  if (workspaceUser.role === ROLES.DEVELOPER) {
    tickets = await prisma.ticket.findMany({
      where: { ticketDeveloper: { some: { developerId: workspaceUser.id } } },
      select: {
        id: true,
        title: true,
        description: true,
        ticketSubmitter: {
          select: {
            id: true,
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
            workspace: { select: { id: true, name: true } },
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
  }
  return {
    props: {
      user,
      workspace,
      workspaceUser,
      tickets_stringify: JSON.stringify(tickets),
    },
  };
};

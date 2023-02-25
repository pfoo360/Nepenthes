import { FC, useState, useEffect } from "react";
import { User, Role, Status } from "../../types/types";
import AddTicket from "../AddTicket/AddTicket";
import { useLazyQuery } from "@apollo/client";
import ticketOperations from "../../graphql/Ticket/operations";
import useUserContext from "../../hooks/useUserContext";
import useWorkspaceContext from "../../hooks/useWorkspaceContext";
import useWorkspaceUserContext from "../../hooks/useWorkspaceUserContext";
import useProjectContext from "../../hooks/useProjectContext";
import TICKETS_PER_PAGE from "../../utils/ticketsPerPage";
import moment from "moment";
import Link from "next/link";
import ROLES from "../../utils/role";

interface ProjectsTicketsProps {
  workspaceUsersApartOfTheProject: {
    workspaceUser: {
      id: string;
      user: User;
      role: Role;
    };
  }[];
  projectTicketCount: number;
}

const ProjectsTickets: FC<ProjectsTicketsProps> = ({
  workspaceUsersApartOfTheProject,
  projectTicketCount,
}) => {
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(projectTicketCount);

  const MAX_NUM_OF_PAGES = Math.ceil(count / TICKETS_PER_PAGE);

  const userCtx = useUserContext();
  const workspaceCtx = useWorkspaceContext();
  const workspaceUserCtx = useWorkspaceUserContext();
  const projectCtx = useProjectContext();

  useEffect(() => {
    if (loading) return;
    if (!projectCtx?.id || !workspaceCtx?.id) return;

    getProjectsTickets({
      variables: {
        projectId: projectCtx.id,
        workspaceId: workspaceCtx.id,
        page,
      },
    });
  }, [page, projectCtx?.id, workspaceCtx?.id]);

  const [getProjectsTickets, { loading, error, data }] = useLazyQuery<
    {
      getProjectsTickets: Array<{
        id: string;
        title: string;
        ticketSubmitter: {
          submitter: { id: string; user: { username: string } };
        } | null;
        ticketDeveloper: Array<{
          developer: { id: string; user: { username: string } };
        }>;
        project: {
          id: string;
          workspaceId: string;
        };
        status: Status;
        createdAt: number;
      }>;
    },
    { projectId: string; workspaceId: string; page: number }
  >(ticketOperations.Query.GET_PROJECTS_TICKETS);

  const increment = () => {
    if (page >= MAX_NUM_OF_PAGES) return;
    setPage((page) => {
      return page + 1;
    });
  };

  const decrement = () => {
    if (page === 0 || page === 1) return;
    setPage((page) => {
      return page - 1;
    });
  };

  if (!userCtx || !workspaceCtx || !workspaceUserCtx || !projectCtx)
    return null;
  if (workspaceUserCtx.userId !== userCtx.id) return null;
  if (workspaceUserCtx.workspaceId !== workspaceCtx.id) return null;
  if (
    projectCtx.workspaceId !== workspaceCtx.id ||
    projectCtx.workspaceId !== workspaceUserCtx.workspaceId
  )
    return null;

  console.log(data);
  console.log(page, MAX_NUM_OF_PAGES, projectTicketCount);

  return (
    <div className="flex flex-col mx-6">
      <div className="overflow-x-auto sm:-mx-6">
        <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
          <div className="overflow-hidden">
            <div className=" flex items-center">
              <h1 className="text-2xl font-medium text-gray-900">Tickets</h1>
              {workspaceUserCtx.role === ROLES.ADMIN ||
              (workspaceUserCtx.role === ROLES.MANAGER &&
                workspaceUsersApartOfTheProject.find(
                  ({ workspaceUser: { id, role, user } }) =>
                    id === workspaceUserCtx.id
                )) ? (
                <AddTicket
                  workspaceUsersApartOfTheProject={
                    workspaceUsersApartOfTheProject
                  }
                  setCount={setCount}
                />
              ) : null}
            </div>
            <table className="min-w-full">
              <thead className="border-b">
                <tr>
                  <th
                    scope="col"
                    className="text-sm font-medium text-gray-900 px-6 py-4 text-left tracking-wide"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="text-sm font-medium text-gray-900 px-6 py-4 text-left tracking-wide"
                  >
                    Submitter
                  </th>
                  <th
                    scope="col"
                    className="text-sm font-medium text-gray-900 px-6 py-4 text-left tracking-wide"
                  >
                    Developers
                  </th>
                  <th
                    scope="col"
                    className="text-sm font-medium text-gray-900 px-6 py-4 text-left tracking-wide"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="text-sm font-medium text-gray-900 px-6 py-4 text-left tracking-wide"
                  >
                    Created
                  </th>
                  <th
                    scope="col"
                    className="text-sm font-medium text-gray-900 px-6 py-4 text-left tracking-wide"
                  ></th>
                </tr>
              </thead>
              <tbody>
                {data &&
                  data.getProjectsTickets.map(
                    ({
                      id,
                      title,
                      ticketSubmitter,
                      ticketDeveloper,
                      project,
                      status,
                      createdAt,
                    }) => {
                      return (
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
                            {ticketDeveloper.map(
                              ({
                                developer: {
                                  id,
                                  user: { username },
                                },
                              }) => (
                                <p
                                  key={id}
                                  className={`${
                                    workspaceUserCtx.id === id
                                      ? "font-bold"
                                      : null
                                  }`}
                                >
                                  {username}
                                </p>
                              )
                            )}
                          </td>
                          <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-normal">
                            {status}
                          </td>
                          <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-normal break-word">
                            {moment(createdAt).format("MMM DD YYYY, h:mm:ss a")}
                          </td>
                          <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-normal">
                            {workspaceUserCtx.role === ROLES.ADMIN ||
                            (workspaceUserCtx.role === ROLES.MANAGER &&
                              workspaceUsersApartOfTheProject.find(
                                ({ workspaceUser: { id, role, user } }) =>
                                  id === workspaceUserCtx.id
                              )) ||
                            ticketDeveloper.find(
                              ({ developer: { id, user } }) =>
                                id === workspaceUserCtx.id
                            ) ? (
                              <Link
                                href={`/t/${project.workspaceId}/${project.id}/${id}`}
                                className="text-blue-500 underline decoration-dotted"
                              >
                                More details
                              </Link>
                            ) : null}
                          </td>
                        </tr>
                      );
                    }
                  )}
              </tbody>
            </table>
            <div className="flex flex-row justify-center items-center w-full mt-2">
              <div className="flex flex-row justify-between w-6/12">
                <button
                  onClick={decrement}
                  disabled={loading || page === 0 || page === 1}
                  className="bg-indigo-300 px-2 py-1 rounded-sm text-slate-100 hover:bg-indigo-400 disabled:bg-indigo-100"
                >{`<`}</button>
                <p className="text-gray-900">{`${page}/${
                  MAX_NUM_OF_PAGES !== 0 ? MAX_NUM_OF_PAGES : `1`
                }`}</p>
                <button
                  onClick={increment}
                  disabled={loading || page >= MAX_NUM_OF_PAGES}
                  className="bg-indigo-300 px-2 py-1 rounded-sm text-slate-100 hover:bg-indigo-400 disabled:bg-indigo-100"
                >{`>`}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsTickets;

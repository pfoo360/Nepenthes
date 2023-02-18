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
  const MAX_NUM_OF_PAGES = Math.ceil(projectTicketCount / TICKETS_PER_PAGE);

  const userCtx = useUserContext();
  const workspaceCtx = useWorkspaceContext();
  const workspaceUserCtx = useWorkspaceUserContext();
  const projectCtx = useProjectContext();

  const [page, setPage] = useState(projectTicketCount > 0 ? 1 : 0);

  useEffect(() => {
    console.log("USEEFFECT1", page, projectCtx?.id, workspaceCtx?.id);
    if (loading) return;
    console.log("USEEFFECT2");
    if (!projectCtx?.id || !workspaceCtx?.id) return;
    console.log("USEEFFECT3");
    if (page < 1) return;
    console.log("USEEFFECT4");

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
        };
        ticketDeveloper: Array<{
          developer: { id: string; user: { username: string } };
        }>;
        status: Status;
        createdAt: number;
      }>;
    },
    { projectId: string; workspaceId: string; page: number }
  >(ticketOperations.Query.GET_PROJECTS_TICKETS);

  console.log(data);

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

  return (
    <div className="flex flex-col mx-6">
      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
          <div className="overflow-hidden">
            <div className=" flex items-center">
              <h1 className="text-2xl font-medium text-gray-900">Tickets</h1>
              <AddTicket
                workspaceUsersApartOfTheProject={
                  workspaceUsersApartOfTheProject
                }
                page={page}
              />
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
                      ticketSubmitter: { submitter },
                      ticketDeveloper,
                      status,
                      createdAt,
                    }) => {
                      return (
                        <tr key={id} className="bg-gray-100 border-b">
                          <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-normal">
                            {title}
                          </td>
                          <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-normal">
                            {submitter.user.username}
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
                          <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-normal">
                            {moment(createdAt).format(
                              "MMMM Do YYYY, h:mm:ss a"
                            )}
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
                <div className="text-gray-900">{`${page}/${MAX_NUM_OF_PAGES}`}</div>
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

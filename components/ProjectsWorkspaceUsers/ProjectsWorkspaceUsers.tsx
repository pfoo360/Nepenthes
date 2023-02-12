import { useState, useEffect, FC } from "react";
import { useLazyQuery } from "@apollo/client";
import projectOperations from "../../graphql/Project/operations";
import useUserContext from "../../hooks/useUserContext";
import useWorkspaceContext from "../../hooks/useWorkspaceContext";
import useWorkspaceUserContext from "../../hooks/useWorkspaceUserContext";
import useProjectContext from "../../hooks/useProjectContext";
import { Role, User } from "../../types/types";
import USERS_PER_PAGE from "../../utils/usersPerPage";
import AddWorkspaceUserToProject from "../AddWorkspaceUserToProject/AddWorkspaceUserToProject";
import DeleteWorkspaceUserFromProject from "../DeleteWorkspaceUserFromProject/DeleteWorkspaceUserFromProject";

//todo: listOfWOrkspaceUsersNotapartoftheproject state and pass the state down
//todo: update delete user
//todo: update add user

interface ProjectsWorkspaceUsersProps {
  count: number;
  listOfWorkspaceUsersNotApartOfTheProject: Array<{
    id: string;
    workspaceId: string;
    user: User;
    role: Role;
  }>;
}

const ProjectsWorkspaceUsers: FC<ProjectsWorkspaceUsersProps> = ({
  count,
  listOfWorkspaceUsersNotApartOfTheProject,
}) => {
  const MAX_NUM_OF_PAGES = Math.ceil(count / USERS_PER_PAGE);

  const userCtx = useUserContext();
  const workspaceCtx = useWorkspaceContext();
  const workspaceUserCtx = useWorkspaceUserContext();
  const projectCtx = useProjectContext();

  const [page, setPage] = useState(count > 0 ? 1 : 0);

  useEffect(() => {
    if (loading) return;
    if (!projectCtx?.id || !workspaceCtx?.id) return;
    getProjectsWorkspaceUsers({
      variables: {
        projectId: projectCtx.id,
        workspaceId: workspaceCtx.id,
        page,
      },
    });
  }, [page]);

  const [getProjectsWorkspaceUsers, { loading, error, data }] = useLazyQuery<
    {
      getProjectsWorkspaceUsers: Array<{
        id: string;
        workspaceUser: { id: string; user: User; role: Role };
      }>;
    },
    { projectId: string; workspaceId: string; page: number }
  >(projectOperations.Query.GET_PROJECTS_WORKSPACEUSERS);

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

  console.log("projectCtx", projectCtx);
  console.log("PROJECT WORKSPACE USERS", data);

  if (!userCtx || !workspaceCtx || !workspaceUserCtx || !projectCtx)
    return null;
  if (workspaceUserCtx.userId !== userCtx.id) return null;
  if (workspaceUserCtx.workspaceId !== workspaceCtx.id) return null;
  if (
    projectCtx.workspaceId !== workspaceCtx.id ||
    projectCtx.workspaceId !== workspaceUserCtx.workspaceId
  )
    return null;
  //if (!count) return null;

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
          <div className="overflow-hidden">
            <div className=" flex items-center">
              <h1 className="text-2xl font-medium text-gray-900 pl-6">Team</h1>
              <AddWorkspaceUserToProject
                listOfWorkspaceUsersNotApartOfTheProject={
                  listOfWorkspaceUsersNotApartOfTheProject
                }
              />
            </div>
            <table className="min-w-full">
              <thead className="border-b">
                <tr>
                  <th
                    scope="col"
                    className="text-sm font-medium text-gray-900 px-6 py-4 text-left tracking-wide"
                  >
                    Username
                  </th>
                  <th
                    scope="col"
                    className="text-sm font-medium text-gray-900 px-6 py-4 text-left tracking-wide"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="text-sm font-medium text-gray-900 px-6 py-4 text-left tracking-wide"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="text-sm font-medium text-gray-900 px-6 py-4 text-left tracking-wide"
                  ></th>
                </tr>
              </thead>
              <tbody>
                {data &&
                  data.getProjectsWorkspaceUsers.map(
                    ({ id, workspaceUser }) => {
                      return (
                        <tr key={id} className="bg-gray-100 border-b">
                          <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-normal">
                            {workspaceUser.user.username}
                          </td>
                          <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-normal">
                            {workspaceUser.user.email}
                          </td>
                          <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-normal">
                            {workspaceUser.role}
                          </td>
                          <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-normal">
                            <DeleteWorkspaceUserFromProject
                              projectWorkspaceUserId={id}
                              workspaceUser={workspaceUser}
                              page={page}
                            />
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

export default ProjectsWorkspaceUsers;

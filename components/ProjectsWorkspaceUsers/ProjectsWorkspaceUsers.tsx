import { useState, useEffect, FC, Dispatch, SetStateAction } from "react";
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
import ROLES from "../../utils/role";

interface ProjectsWorkspaceUsersProps {
  projectWorkspaceUserCount: number;
  workspaceUsersApartOfTheProject: Array<{
    workspaceUser: {
      id: string;
      user: User;
      role: Role;
    };
  }>;
  workspaceUsersNotApartOfTheProject: Array<{
    id: string;
    user: User;
    role: Role;
  }>;
  setWorkspaceUsersNotApartOfTheProject: Dispatch<
    SetStateAction<
      {
        id: string;
        user: User;
        role: Role;
      }[]
    >
  >;
  setWorkspaceUsersApartOfTheProject: Dispatch<
    SetStateAction<
      {
        workspaceUser: {
          id: string;
          user: User;
          role: Role;
        };
      }[]
    >
  >;
}

const ProjectsWorkspaceUsers: FC<ProjectsWorkspaceUsersProps> = ({
  projectWorkspaceUserCount,
  workspaceUsersNotApartOfTheProject,
  setWorkspaceUsersNotApartOfTheProject,
  setWorkspaceUsersApartOfTheProject,
  workspaceUsersApartOfTheProject,
}) => {
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(projectWorkspaceUserCount);

  const [maxNumOfPages, setMaxNumOfPages] = useState(
    Math.ceil(count / USERS_PER_PAGE)
  );

  useEffect(() => {
    setMaxNumOfPages(Math.ceil(count / USERS_PER_PAGE));
  }, [count, USERS_PER_PAGE]);

  const userCtx = useUserContext();
  const workspaceCtx = useWorkspaceContext();
  const workspaceUserCtx = useWorkspaceUserContext();
  const projectCtx = useProjectContext();

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
  }, [page, projectCtx?.id, workspaceCtx?.id]);

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
    if (page >= maxNumOfPages) return;
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
  if (
    projectWorkspaceUserCount === null ||
    projectWorkspaceUserCount === undefined
  )
    return null;

  return (
    <div className="flex flex-col mx-6">
      <div className="overflow-x-auto sm:-mx-6">
        <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
          <div className="overflow-hidden">
            <div className=" flex items-center">
              <h1 className="text-2xl font-medium text-gray-900">Team</h1>
              {workspaceUserCtx.role === ROLES.ADMIN ||
              (workspaceUserCtx.role === ROLES.MANAGER &&
                workspaceUsersApartOfTheProject.find(
                  ({ workspaceUser: { id } }) => workspaceUserCtx.id === id
                )) ? (
                <AddWorkspaceUserToProject
                  workspaceUsersNotApartOfTheProject={
                    workspaceUsersNotApartOfTheProject
                  }
                  setWorkspaceUsersNotApartOfTheProject={
                    setWorkspaceUsersNotApartOfTheProject
                  }
                  setWorkspaceUsersApartOfTheProject={
                    setWorkspaceUsersApartOfTheProject
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
                            {workspaceUserCtx.role === ROLES.ADMIN ||
                            (workspaceUserCtx.role === ROLES.MANAGER &&
                              workspaceUsersApartOfTheProject.find(
                                ({ workspaceUser: { id } }) =>
                                  workspaceUserCtx.id === id
                              )) ? (
                              <DeleteWorkspaceUserFromProject
                                projectWorkspaceUserId={id}
                                workspaceUser={workspaceUser}
                                page={page}
                                setWorkspaceUsersNotApartOfTheProject={
                                  setWorkspaceUsersNotApartOfTheProject
                                }
                                setWorkspaceUsersApartOfTheProject={
                                  setWorkspaceUsersApartOfTheProject
                                }
                                setCount={setCount}
                              />
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
                  maxNumOfPages !== 0 ? maxNumOfPages : `1`
                }`}</p>
                <button
                  onClick={increment}
                  disabled={loading || page >= maxNumOfPages}
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

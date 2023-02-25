import { FC } from "react";
import { useQuery } from "@apollo/client";
import useWorkspaceUserContext from "../../hooks/useWorkspaceUserContext";
import ROLES from "../../utils/role";
import workspaceOperations from "../../graphql/Workspace/operations";
import Error from "../Error/Error";
import { WorkspaceUser } from "../../types/types";
import User from "../User/User";

const WorkspacesUsers: FC = () => {
  const workspaceUser = useWorkspaceUserContext();

  const {
    loading,
    error,
    data: workspacesUsers,
  } = useQuery<{
    getWorkspacesUsers: WorkspaceUser[];
  }>(workspaceOperations.Query.GET_WORKSPACES_USERS, {
    variables: { workspaceId: workspaceUser?.workspaceId },
  });

  if (!workspaceUser || !workspaceUser.workspaceId) return null;
  if (workspaceUser.role !== ROLES.ADMIN) return null;

  if (loading)
    return (
      <div className="flex flex-col items-center">
        <p className="text-gray-900">Loading...</p>
      </div>
    );

  if (error) return <Error message="Looks like something went wrong..." />;

  if (!workspacesUsers || workspacesUsers.getWorkspacesUsers.length === 0)
    return (
      <div className="flex flex-col items-center">
        <p className="text-gray-900">Seems like there is nothing here...</p>
      </div>
    );

  return (
    <div className="bg-slate-50 w-full px-3 py-1 grid grid-cols-2 gap-2">
      {workspacesUsers.getWorkspacesUsers.map(({ user, role }) => (
        <User key={user.id} user={user} role={role} />
      ))}
    </div>
  );
};

export default WorkspacesUsers;

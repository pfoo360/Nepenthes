import ROLES from "../../utils/role";
import { Role } from "../../types/types";
import { FC } from "react";
import Link from "next/link";
import returnRoleColor from "../../utils/returnRoleColor";
import UpdateWorkspaceName from "../UpdateWorkspaceName/UpdateWorkspaceName";
import DeleteWorkspace from "../DeleteWorkspace/DeleteWorkspace";

interface WorkspaceProps {
  role: Role;
  workspace: {
    id: string;
    name: string;
  };
}

const Workspace: FC<WorkspaceProps> = ({ role, workspace }) => {
  const color = returnRoleColor(role);

  return (
    <div
      className={`bg-${color}-500 bg- hover:bg-${color}-600 text-slate-50 rounded-sm break-words w-11/12 mb-4 px-3 py-2 flex flex-row justify-between items-center`}
    >
      <Link href={`/w/${workspace.id}`} className="w-full">
        <h1 className="text-lg mb-1 font-bold">{workspace.name}</h1>
        <p className="text-xs">{role}</p>
      </Link>
      {role === ROLES.ADMIN ? (
        <div className="flex flex-row">
          <UpdateWorkspaceName
            workspaceId={workspace.id}
            oldWorkspaceName={workspace.name}
          />
          <DeleteWorkspace
            workspaceId={workspace.id}
            workspaceName={workspace.name}
          />
        </div>
      ) : null}
    </div>
  );
};

export default Workspace;

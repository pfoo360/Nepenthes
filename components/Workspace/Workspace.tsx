import ROLES from "../../utils/role";
import { Role } from "../../types/types";
import { FC } from "react";
import Link from "next/link";
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
  return (
    <div
      className={`${
        role === ROLES.ADMIN ? `bg-indigo-500 hover:bg-indigo-600` : null
      } ${
        role === ROLES.MANAGER ? `bg-fuchsia-500 hover:bg-fuchsia-600` : null
      } ${
        role === ROLES.DEVELOPER ? `bg-cyan-500 hover:bg-cyan-600` : null
      } text-slate-50 rounded-sm break-words w-11/12 mb-4 px-3 py-2 flex flex-row justify-between items-center`}
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

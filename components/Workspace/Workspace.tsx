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
        <h1 className="text-lg mb-1">{workspace.name}</h1>
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

  // if (ROLES.ADMIN === role)
  //   return (
  //     <Link
  //       href={`/w/${workspace.id}`}
  //       className={`bg-${color}-500 bg- hover:bg-${color}-600 rounded-sm overflow-x-hidden overflow-y-hidden w-11/12 text-slate-50 flex flex-col justify-center items-center mb-4`}
  //     >
  //       <h1 className="text-2xl mt-3">{workspace.name}</h1>
  //       <p className="text-xs mb-2">{role}</p>
  //     </Link>
  //   );
  // if (ROLES.MANAGER === role)
  //   return (
  //     <Link
  //       href={`/w/${workspace.id}`}
  //       className="bg-fuchsia-500 hover:bg-fuchsia-600 rounded-sm overflow-x-hidden overflow-y-hidden w-11/12 text-slate-50 flex flex-col justify-center items-center mb-4"
  //     >
  //       <div className="text-2xl mt-3">{workspace.name}</div>
  //       <div className="text-xs mb-2">{role}</div>
  //     </Link>
  //   );
  // if (ROLES.DEVELOPER === role)
  //   return (
  //     <Link
  //       href={`/w/${workspace.id}`}
  //       className="bg-cyan-500 hover:bg-cyan-600 rounded-sm overflow-x-hidden overflow-y-hidden w-11/12 text-slate-50 flex flex-col justify-center items-center mb-4"
  //     >
  //       <div className="text-2xl mt-3">{workspace.name}</div>
  //       <div className="text-xs mb-2">{role}</div>
  //     </Link>
  //   );

  // return null;
};

export default Workspace;

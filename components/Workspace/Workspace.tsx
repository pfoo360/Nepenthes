import ROLES from "../../utils/role";
import { Role } from "../../types/types";
import { FC } from "react";
import Link from "next/link";

interface WorkspaceProps {
  role: Role;
  workspace: {
    id: string;
    name: string;
  };
}

const Workspace: FC<WorkspaceProps> = ({ role, workspace }) => {
  let color = "";
  if (role === ROLES.ADMIN) color = "indigo";
  if (role === ROLES.MANAGER) color = "fuchsia";
  if (role === ROLES.DEVELOPER) color = "cyan";

  return (
    <Link
      href={`/w/${workspace.id}`}
      className={`bg-${color}-500 bg- hover:bg-${color}-600 text-slate-50 rounded-sm overflow-x-hidden overflow-y-hidden w-11/12 mb-4 pl-3 py-2`}
    >
      <h1 className="text-lg mb-1">{workspace.name}</h1>
      <p className="text-xs">{role}</p>
    </Link>
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

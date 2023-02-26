import { FC } from "react";
import { Role, User } from "../../types/types";
import DeleteUserFromWorkspace from "../DeleteUserFromWorkspace/DeleteUserFromWorkspace";
import UpdateRole from "../UpdateRole/UpdateRole";
import ROLES from "../../utils/role";

const User: FC<{ user: User; role: Role }> = ({ user, role }) => {
  return (
    <div
      className={`${
        role === ROLES.ADMIN ? `bg-indigo-500 hover:bg-indigo-600` : null
      } ${
        role === ROLES.MANAGER ? `bg-fuchsia-500 hover:bg-fuchsia-600` : null
      } ${
        role === ROLES.DEVELOPER ? `bg-cyan-500 hover:bg-cyan-600` : null
      } rounded-sm text-gray-50 w-full px-2 pt-1 pb-2`}
    >
      <h1 className="break-words text-2xl pb-2">{user.username}</h1>
      <h2 className="break-words text-base pb-[1px]">{user.email}</h2>
      <h3 className={`break-words text-xs pb-1`}>{role}</h3>
      <div className="flex flex-row justify-between">
        <UpdateRole user={user} role={role} />
        <DeleteUserFromWorkspace user={user} />
      </div>
    </div>
  );
};

export default User;

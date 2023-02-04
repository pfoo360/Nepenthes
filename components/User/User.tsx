import { FC } from "react";
import { Role, User } from "../../types/types";
import returnRoleColor from "../../utils/returnRoleColor";
import UpdateRole from "../UpdateRole/UpdateRole";

const User: FC<{ user: User; role: Role }> = ({ user, role }) => {
  const color = returnRoleColor(role);
  return (
    <div
      className={`bg-${color}-500 hover:bg-${color}-600 rounded-sm text-gray-50 w-full px-2 py-1`}
    >
      <h1 className="break-words text-2xl pb-2">{user.username}</h1>
      <h2 className="break-words text-base pb-[1px]">{user.email}</h2>
      <h3 className={`break-words text-xs pb-1`}>{role}</h3>
      <UpdateRole user={user} role={role} />
    </div>
  );
};

export default User;

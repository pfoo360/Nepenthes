import { Role } from "./../types/types";
import ROLES from "./role";

const returnRoleColor = (role: Role): string => {
  let color = "";
  if (role === ROLES.ADMIN) color = "indigo";
  if (role === ROLES.MANAGER) color = "fuchsia";
  if (role === ROLES.DEVELOPER) color = "cyan";

  return color;
};

export default returnRoleColor;

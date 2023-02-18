import Date from "./Date";
import User from "./User";
import Auth from "./Auth";
import Workspace from "./Workspace";
import Project from "./Project";
import Ticket from "./Ticket";

const typeDefs = [
  Date.typeDefs,
  User.typeDefs,
  Auth.typeDefs,
  Workspace.typeDefs,
  Project.typeDefs,
  Ticket.typeDefs,
];

export default typeDefs;

import Date from "./Date";
import User from "./User";
import Auth from "./Auth";
import Workspace from "./Workspace";
import Project from "./Project";
import Ticket from "./Ticket";

const resolvers = [
  Date.resolvers,
  User.resolvers,
  Auth.resolvers,
  Workspace.resolvers,
  Project.resolvers,
  Ticket.resolvers,
];

export default resolvers;

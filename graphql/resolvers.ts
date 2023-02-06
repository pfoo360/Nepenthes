import User from "./User/index";
import Auth from "./Auth/index";
import Workspace from "./Workspace";
import Project from "./Project";

const resolvers = [
  User.resolvers,
  Auth.resolvers,
  Workspace.resolvers,
  Project.resolvers,
];

export default resolvers;

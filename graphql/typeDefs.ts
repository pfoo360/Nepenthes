import User from "./User/index";
import Auth from "./Auth/index";
import Workspace from "./Workspace";
import Project from "./Project";

const typeDefs = [
  User.typeDefs,
  Auth.typeDefs,
  Workspace.typeDefs,
  Project.typeDefs,
];

export default typeDefs;

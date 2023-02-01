import User from "./User/index";
import Auth from "./Auth/index";
import Workspace from "./Workspace";

const typeDefs = [User.typeDefs, Auth.typeDefs, Workspace.typeDefs];

export default typeDefs;

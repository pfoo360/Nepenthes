import User from "./User/index";
import Auth from "./Auth/index";
import Workspace from "./Workspace";

const resolvers = [User.resolvers, Auth.resolvers, Workspace.resolvers];

export default resolvers;

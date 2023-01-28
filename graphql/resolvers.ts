import User from "./User/index";
import Auth from "./Auth/index";

const resolvers = [User.resolvers, Auth.resolvers];

export default resolvers;

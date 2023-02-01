import { gql } from "graphql-tag";

const typeDefs = gql`
  #graphql
  type User {
    id: ID
    username: String
    email: String
  }

  type Query {
    me: Me
  }

  type Me {
    myAccount: User
    myWorkspace: [MyWorkspace]
  }

  type MyWorkspace {
    workspace: Wrkspc
    role: Role
  }

  type Wrkspc {
    id: ID
    name: String
  }

  type Mutation {
    createUser(
      username: String!
      email: String!
      password: String!
    ): createUserResponse
  }

  type createUserResponse {
    successStatus: Boolean
    message: String
    user: User
  }
`;

export default typeDefs;

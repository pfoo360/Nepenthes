import { gql } from "graphql-tag";

const typeDefs = gql`
  type Workspace {
    id: ID
    name: String
    workspaceUser: [WorkspaceUser]
  }

  type WorkspaceUser {
    user: User
    role: Role
  }

  enum Role {
    ADMIN
    MANAGER
    DEVELOPER
  }

  type Mutation {
    createWorkspace(workspaceName: String!): Workspace
  }
`;

export default typeDefs;

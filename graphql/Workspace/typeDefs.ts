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

  type Query {
    getWorkspacesUsers(workspaceId: String!): [WorkspaceUser]!
  }

  type Mutation {
    createWorkspace(workspaceName: String!): Workspace
    addUserToWorkspace(
      username: String!
      role: Role!
      workspaceId: String!
    ): WorkspaceUser!
  }
`;

export default typeDefs;

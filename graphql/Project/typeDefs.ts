import { gql } from "graphql-tag";

const typeDefs = gql`
  type Project {
    id: ID
    name: String
    description: String
    workspaceId: String
  }

  type ProjectsWorkspaceUser {
    id: String
    workspaceUser: WorkspaceUser
  }

  type AddWorkspaceUserToProjectResponse {
    count: Int
  }

  type Query {
    getProjectsWorkspaceUsers(
      projectId: String!
      workspaceId: String!
      page: Int!
    ): [ProjectsWorkspaceUser]!
  }

  type Mutation {
    createProject(
      projectName: String!
      projectDescription: String
      workspaceId: String!
      selectedWorkspaceUserIds: [String]!
    ): Project!
    addWorkspaceUserToProject(
      selectedWorkspaceUserIds: [String]!
      workspaceId: String!
      projectId: String!
    ): AddWorkspaceUserToProjectResponse!
    deleteWorkspaceUserFromProject(
      workspaceId: String!
      projectId: String!
      projectWorkspaceUserId: String!
    ): ProjectsWorkspaceUser!
    deleteProject(workspaceId: String!, projectId: String!): Project!
  }
`;

export default typeDefs;

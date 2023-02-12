import { User } from "./../../types/types";
import { gql } from "@apollo/client";

const operations = {
  Query: {
    GET_PROJECTS_WORKSPACEUSERS: gql`
      query GetProjectsWorkspaceUsers(
        $projectId: String!
        $workspaceId: String!
        $page: Int!
      ) {
        getProjectsWorkspaceUsers(
          projectId: $projectId
          workspaceId: $workspaceId
          page: $page
        ) {
          id
          workspaceUser {
            id
            user {
              id
              username
              email
            }
            role
          }
        }
      }
    `,
  },
  Mutation: {
    CREATE_PROJECT: gql`
      mutation CreateProject(
        $projectName: String!
        $projectDescription: String
        $workspaceId: String!
        $selectedWorkspaceUserIds: [String]!
      ) {
        createProject(
          projectName: $projectName
          projectDescription: $projectDescription
          workspaceId: $workspaceId
          selectedWorkspaceUserIds: $selectedWorkspaceUserIds
        ) {
          id
          name
          description
          workspaceId
        }
      }
    `,
    ADD_WORKSPACEUSER_TO_PROJECT: gql`
      mutation AddWorkspaceUserToProject(
        $selectedWorkspaceUserIds: [String]!
        $workspaceId: String!
        $projectId: String!
      ) {
        addWorkspaceUserToProject(
          selectedWorkspaceUserIds: $selectedWorkspaceUserIds
          workspaceId: $workspaceId
          projectId: $projectId
        ) {
          count
        }
      }
    `,
    DELETE_WORKSPACEUSER_FROM_PROJECT: gql`
      mutation DeleteWorkspaceUserFromProject(
        $workspaceId: String!
        $projectId: String!
        $projectWorkspaceUserId: String!
      ) {
        deleteWorkspaceUserFromProject(
          workspaceId: $workspaceId
          projectId: $projectId
          projectWorkspaceUserId: $projectWorkspaceUserId
        ) {
          id
          workspaceUser {
            id
            user {
              id
              username
              email
            }
            role
          }
        }
      }
    `,
  },
};

export default operations;

import { gql } from "@apollo/client";

const operations = {
  Query: {
    GET_WORKSPACES_USERS: gql`
      query GetWorkspacesUsers($workspaceId: String!) {
        getWorkspacesUsers(workspaceId: $workspaceId) {
          user {
            id
            username
            email
          }
          role
        }
      }
    `,
  },
  Mutation: {
    CREATE_WORKSPACE: gql`
      mutation CreateWorkspace($workspaceName: String!) {
        createWorkspace(workspaceName: $workspaceName) {
          id
          name
          workspaceUser {
            role
          }
        }
      }
    `,
    ADD_USER_TO_WORKSPACE: gql`
      mutation AddUserToWorkspace(
        $username: String!
        $role: Role!
        $workspaceId: String!
      ) {
        addUserToWorkspace(
          username: $username
          role: $role
          workspaceId: $workspaceId
        ) {
          user {
            id
            username
            email
          }
          role
        }
      }
    `,
    UPDATE_A_USERS_ROLE: gql`
      mutation UpdateUserRole(
        $userId: String!
        $role: Role!
        $workspaceId: String!
      ) {
        updateUserRole(
          userId: $userId
          role: $role
          workspaceId: $workspaceId
        ) {
          user {
            id
            username
            email
          }
          role
        }
      }
    `,
  },
};

export default operations;

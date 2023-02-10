import { gql } from "@apollo/client";

const operations = {
  Query: {
    GET_CURRENT_USERS_WORKSPACES: gql`
      query GetCurrentUsersWorkspaces {
        me {
          myWorkspaces {
            workspace {
              id
              name
            }
            role
          }
        }
      }
    `,
    GET_CURRENT_USERS_PROJECTS: gql`
      query GetCurrentUsersProjects($workspaceId: String!) {
        me {
          myProjects(workspaceId: $workspaceId) {
            id
            name
            description
            workspaceId
          }
        }
      }
    `,
  },
  Mutation: {
    CREATE_USER: gql`
      mutation CreateUser(
        $username: String!
        $email: String!
        $password: String!
      ) {
        createUser(username: $username, email: $email, password: $password) {
          successStatus
          message
          user {
            id
            username
            email
          }
        }
      }
    `,
  },
};

export default operations;

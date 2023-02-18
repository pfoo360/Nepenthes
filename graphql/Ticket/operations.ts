import { gql } from "@apollo/client";

const operations = {
  Query: {
    GET_PROJECTS_TICKETS: gql`
      query GetProjectsTickets(
        $projectId: String!
        $workspaceId: String!
        $page: Int!
      ) {
        getProjectsTickets(
          projectId: $projectId
          workspaceId: $workspaceId
          page: $page
        ) {
          id
          title
          ticketSubmitter {
            submitter {
              id
              user {
                username
              }
            }
          }
          ticketDeveloper {
            developer {
              id
              user {
                username
              }
            }
          }
          status
          createdAt
        }
      }
    `,
  },
  Mutation: {
    CREATE_TICKET: gql`
      mutation CreateTicket(
        $title: String!
        $description: String!
        $workspaceUserIds: [String!]!
        $projectId: String!
        $workspaceId: String!
        $priority: Priority!
        $type: Type!
      ) {
        createTicket(
          title: $title
          description: $description
          workspaceUserIds: $workspaceUserIds
          projectId: $projectId
          workspaceId: $workspaceId
          priority: $priority
          type: $type
        ) {
          id
          title
          ticketSubmitter {
            submitter {
              id
              user {
                username
              }
            }
          }
          ticketDeveloper {
            developer {
              id
              user {
                username
              }
            }
          }
          status
          createdAt
        }
      }
    `,
  },
};

export default operations;

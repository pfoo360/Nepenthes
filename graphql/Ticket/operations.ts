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
          project {
            id
            workspaceId
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
          project {
            id
            workspaceId
          }
          status
          createdAt
        }
      }
    `,
    UPDATE_TICKET: gql`
      mutation UpdateTicket(
        $title: String!
        $description: String!
        $workspaceUserIds: [String!]!
        $priority: Priority!
        $type: Type!
        $status: Status!
        $workspaceId: String!
        $projectId: String!
        $ticketId: String!
      ) {
        updateTicket(
          title: $title
          description: $description
          workspaceUserIds: $workspaceUserIds
          priority: $priority
          type: $type
          status: $status
          workspaceId: $workspaceId
          projectId: $projectId
          ticketId: $ticketId
        ) {
          id
          project {
            id
            workspaceId
          }
        }
      }
    `,
  },
};

export default operations;

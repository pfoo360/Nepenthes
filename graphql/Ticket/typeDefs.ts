import { gql } from "graphql-tag";

const typeDefs = gql`
  type Ticket {
    id: ID
    title: String
    description: String
    ticketSubmitter: TicketSubmitter
    ticketDeveloper: [TicketDeveloper]
    project: Project
    priority: Priority
    status: Status
    type: Type
    createdAt: Date
    updatedAt: Date
  }

  type TicketSubmitter {
    id: ID
    submitterId: String
    submitter: WorkspaceUser
  }

  type TicketDeveloper {
    id: ID
    developerId: String
    developer: WorkspaceUser
  }

  enum Priority {
    LOW
    MEDIUM
    HIGH
  }

  enum Status {
    OPEN
    CLOSED
  }

  enum Type {
    BUG
    ISSUE
    ERROR
    FEATURE
    OTHER
  }

  type Comment {
    id: ID
    comment: String
    author: WorkspaceUser
    createdAt: Date
  }

  type TicketComment {
    id: ID
    ticketId: String
    comment: Comment
  }

  type Query {
    getProjectsTickets(
      projectId: String!
      workspaceId: String!
      page: Int!
    ): [Ticket]!
  }

  type Mutation {
    createTicket(
      title: String!
      description: String!
      workspaceUserIds: [String!]!
      projectId: String!
      workspaceId: String!
      priority: Priority!
      type: Type!
    ): Ticket!
    updateTicket(
      title: String!
      description: String!
      workspaceUserIds: [String!]!
      priority: Priority!
      type: Type!
      status: Status!
      workspaceId: String!
      projectId: String!
      ticketId: String!
    ): Ticket!
    createComment(
      comment: String!
      workspaceId: String!
      projectId: String!
      ticketId: String!
    ): TicketComment!
  }
`;

export default typeDefs;

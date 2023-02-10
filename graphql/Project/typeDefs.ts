import { gql } from "graphql-tag";

const typeDefs = gql`
  type Project {
    id: ID
    name: String
    description: String
    workspaceId: String
  }

  type Mutation {
    createProject(
      projectName: String!
      projectDescription: String
      workspaceId: String!
      selectedWorkspaceUserIds: [String]!
    ): Project!
  }
`;

export default typeDefs;

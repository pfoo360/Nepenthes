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
    ): Project!
  }

  type Test {
    a: Boolean
  }
`;

export default typeDefs;

import { gql } from "graphql-tag";

const typeDefs = gql`
  type Project {
    id: ID
    name: String
    description: String
    workspace: Workspace
  }

  type Mutation {
    createProject(
      projectName: String!
      projectDescription: String
      workspaceId: String!
    ): Test
  }

  type Test {
    a: Boolean
  }
`;

export default typeDefs;

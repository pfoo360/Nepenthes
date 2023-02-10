import { gql } from "@apollo/client";

const operations = {
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
  },
};

export default operations;

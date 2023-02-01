import { gql } from "@apollo/client";

const operations = {
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
  },
};

export default operations;

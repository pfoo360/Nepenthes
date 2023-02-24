import { gql } from "@apollo/client";

const operations = {
  Mutation: {
    SIGN_IN: gql`
      mutation SignIn($username: String!, $password: String!) {
        signIn(username: $username, password: $password) {
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
    SIGN_OUT: gql`
      mutation SignIn {
        signOut {
          successStatus
          message
        }
      }
    `,
  },
};

export default operations;

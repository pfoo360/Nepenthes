import { gql } from "@apollo/client";

const operations = {
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

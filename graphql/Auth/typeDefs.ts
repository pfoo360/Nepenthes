import { gql } from "graphql-tag";

const typeDefs = gql`
  #graphql

  type Mutation {
    signIn(username: String!, password: String!): SignInResponse
  }

  type SignInResponse {
    successStatus: Boolean
    message: String
    user: User
  }
`;

export default typeDefs;

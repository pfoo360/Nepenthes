import { gql } from "graphql-tag";

const typeDefs = gql`
  #graphql

  type Mutation {
    signIn(username: String!, password: String!): SignInResponse
    signOut: SignOutResponse
  }

  type SignInResponse {
    successStatus: Boolean
    message: String
    user: User
  }

  type SignOutResponse {
    successStatus: Boolean
    message: String
  }
`;

export default typeDefs;

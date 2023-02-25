import { ApolloClient, InMemoryCache } from "@apollo/client";

const uri = process.env.VERCEL_URL ?? "http://localhost:3000/api/graphql";

const client = new ApolloClient({
  uri,
  cache: new InMemoryCache(),
});

export default client;

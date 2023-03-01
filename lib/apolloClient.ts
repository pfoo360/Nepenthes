import { ApolloClient, InMemoryCache } from "@apollo/client";

const uri =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000/api/graphql"
    : `https://${process.env.NEXT_PUBLIC_SITE_URL}/api/graphql`;

const client = new ApolloClient({
  uri,
  cache: new InMemoryCache(),
});

export default client;

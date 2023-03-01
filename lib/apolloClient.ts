import { ApolloClient, InMemoryCache } from "@apollo/client";

const uri = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/graphql`
  : "http://localhost:3000/api/graphql";

const client = new ApolloClient({
  uri,
  cache: new InMemoryCache(),
});

export default client;

import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import UserProvider from "../context/UserProvider";
import WorkspaceProvider from "../context/WorkspaceProvider";
import WorkspaceUserProvider from "../context/WorkspaceUserProvider";
import { User, WorkspaceUserProviderValue } from "../types/types";

const client = new ApolloClient({
  uri: "http://localhost:3000/api/graphql",
  cache: new InMemoryCache(),
});

interface PageProps {
  workspaceUser?: WorkspaceUserProviderValue;
  user?: User;
  workspace?: {
    id: string;
    name: string;
  };
  rest:
    | {
        [key: string]: any;
      }
    | Promise<{
        [key: string]: any;
      }>;
}

function MyApp({
  Component,
  pageProps: { workspaceUser, user, workspace, ...rest },
}: AppProps<PageProps>) {
  console.log("------------------------------");
  console.log("WORKSPACEUSER", workspaceUser);
  console.log("USER", user);
  console.log("WORKSPACE", workspace);
  console.log("REST", rest);
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
  return (
    <ApolloProvider client={client}>
      <UserProvider value={user}>
        <WorkspaceProvider value={workspace}>
          <WorkspaceUserProvider value={workspaceUser}>
            <Component {...rest} />
          </WorkspaceUserProvider>
        </WorkspaceProvider>
      </UserProvider>
    </ApolloProvider>
  );
}

export default MyApp;

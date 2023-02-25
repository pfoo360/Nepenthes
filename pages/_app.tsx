import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import UserProvider from "../context/UserProvider";
import WorkspaceProvider from "../context/WorkspaceProvider";
import WorkspaceUserProvider from "../context/WorkspaceUserProvider";
import ProjectProvider from "../context/ProjectProvider";
import {
  Project,
  User,
  WorkspaceUserContextValue,
  WorkspaceContextValue,
} from "../types/types";
import apolloClient from "../lib/apolloClient";

interface PageProps {
  workspaceUser?: WorkspaceUserContextValue;
  user?: User;
  workspace?: WorkspaceContextValue;
  project?: Project;
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
  pageProps: { workspaceUser, user, workspace, project, ...rest },
}: AppProps<PageProps>) {
  console.log("------------------------------");
  console.log("WORKSPACEUSER", workspaceUser);
  console.log("USER", user);
  console.log("WORKSPACE", workspace);
  console.log("REST", rest);
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
  return (
    <ApolloProvider client={apolloClient}>
      <UserProvider value={user}>
        <WorkspaceProvider value={workspace}>
          <WorkspaceUserProvider value={workspaceUser}>
            <ProjectProvider value={project}>
              <Component {...rest} />
            </ProjectProvider>
          </WorkspaceUserProvider>
        </WorkspaceProvider>
      </UserProvider>
    </ApolloProvider>
  );
}

export default MyApp;

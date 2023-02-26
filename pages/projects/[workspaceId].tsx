import type { GetServerSideProps, NextPage } from "next";
import prisma from "../../lib/prisma";
import getServerSessionAndUser from "../../utils/getServerSessionAndUser";
import NavBar from "../../components/NavBar/NavBar";
import AddProject from "../../components/AddProject/AddProject";
import MyProject from "../../components/MyProject/MyProject";
import ROLES from "../../utils/role";
import { Role, User } from "../../types/types";
import Head from "next/head";

interface ProjectsProps {
  workspacesUsers: Array<{ id: string; user: User; role: Role }>;
}

const Projects: NextPage<ProjectsProps> = ({ workspacesUsers }) => {
  return (
    <>
      <Head>
        <title>Projects</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <AddProject workspacesUsers={workspacesUsers} />
      <MyProject />
    </>
  );
};

export default Projects;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
  query,
}) => {
  //check if session and user exists
  const sessionAndUser = await getServerSessionAndUser(req, res);
  if (!sessionAndUser) {
    return { redirect: { destination: "/signin", permanent: false } };
  }
  const { user, sessionToken } = sessionAndUser;

  //check if workspace id provided by client exists in db
  if (!params?.workspaceId || typeof params.workspaceId !== "string")
    return { redirect: { destination: "/workspaces", permanent: false } };
  const { workspaceId } = params;
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, name: true },
  });
  if (!workspace) return { notFound: true };

  //check if user is apart of the workspace
  const workspaceUser = await prisma.workspaceUser.findUnique({
    where: {
      workspaceId_userId: { workspaceId: workspace.id, userId: user.id },
    },
  });
  if (!workspaceUser)
    return { redirect: { destination: "/workspaces", permanent: false } };

  //if currently logged in user is an ADMIN or MANAGER of workspace X, get all users that are apart of a workspace X
  let workspacesUsers = null;
  if (
    workspaceUser.role === ROLES.ADMIN ||
    workspaceUser.role === ROLES.MANAGER
  ) {
    workspacesUsers = await prisma.workspaceUser.findMany({
      where: { workspaceId, NOT: { userId: user.id } },
      select: {
        id: true,
        user: { select: { id: true, username: true, email: true } },
        role: true,
      },
    });
  }

  return { props: { user, workspace, workspaceUser, workspacesUsers } };
};

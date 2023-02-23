import type { GetServerSideProps, NextPage } from "next";
import React from "react";
import getServerSessionAndUser from "../../utils/getServerSessionAndUser";
import prisma from "../../lib/prisma";
import ROLES from "../../utils/role";
import NavBar from "../../components/NavBar/NavBar";
import AddUserToWorkspace from "../../components/AddUserToWorkspace/AddUserToWorkspace";
import WorkspacesUsers from "../../components/WorkspacesUsers/WorkspacesUsers";

const Admin: NextPage = () => {
  return (
    <>
      <NavBar />
      <AddUserToWorkspace />
      <WorkspacesUsers />
    </>
  );
};

export default Admin;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
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

  //check if user is apart of the workspace AND that user is an ADMIN in the workspace
  const workspaceUser = await prisma.workspaceUser.findUnique({
    where: {
      workspaceId_userId: { workspaceId: workspace.id, userId: user.id },
    },
  });
  if (!workspaceUser || workspaceUser.role !== ROLES.ADMIN)
    return { redirect: { destination: "/workspaces", permanent: false } };

  console.log("ADMIN GSSP", user, sessionToken, workspace, workspaceUser);

  return { props: { user, workspace, workspaceUser } };
};

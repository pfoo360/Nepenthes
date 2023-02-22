import {} from "react";
import type { GetServerSideProps, NextPage } from "next";
import getServerSessionAndUser from "../../utils/getServerSessionAndUser";
import NavBar from "../../components/NavBar/NavBar";
import prisma from "../../lib/prisma";
import Link from "next/link";

const AllWorkspaceUsersTickets: NextPage = () => {
  return (
    <>
      <NavBar />
      <div>AllWorkspaceUsersTickets</div>
    </>
  );
};

export default AllWorkspaceUsersTickets;

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
  console.log("PROJECT QUERY AND PARAMS", params, query);

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

  console.log(sessionToken, user, workspace, workspaceUser);

  //ADMIN
  // const ticket = await prisma.ticket.findMany({
  //   where: { project: { workspaceId: workspaceUser.workspaceId } },
  // });
  //DEVELOPER
  // const ticket = await prisma.ticket.findMany({
  //   where: { ticketDeveloper: { some: { developerId: workspaceUser.id } } },
  // });
  //MANAGER
  // const ticket = await prisma.ticket.findMany({
  //   where: {
  //     project: {
  //       projectWorkspaceUser: { some: { workspaceUserId: workspaceUser.id } },
  //     },
  //   },
  // });
  //console.log("TICKET", ticket);
  //if ADMIN in workspace return all tickets in the workspace
  //if MANAGER in workspace return all tickets from projects you are assigned to
  //if DEVELOPER in workspace treturn tickets where you are listed as a developer
  return { props: { user, workspace, workspaceUser } };
};

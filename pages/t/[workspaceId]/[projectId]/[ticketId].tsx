import type { GetServerSideProps, NextPage } from "next";
import getServerSessionAndUser from "../../../../utils/getServerSessionAndUser";
import prisma from "../../../../lib/prisma";
import ROLES from "../../../../utils/role";
import { default as TicketComponent } from "../../../../components/Ticket/Ticket";
import DeleteProject from "../../../../components/DeleteProject/DeleteProject";
import NavBar from "../../../../components/NavBar/NavBar";
import ProjectsTickets from "../../../../components/ProjectsTickets/ProjectsTickets";
import { FC, useState } from "react";
import { Role, User, Ticket } from "../../../../types/types";
import useUserContext from "../../../../hooks/useUserContext";
import useWorkspaceContext from "../../../../hooks/useWorkspaceContext";
import useWorkspaceUserContext from "../../../../hooks/useWorkspaceUserContext";
import useProjectContext from "../../../../hooks/useProjectContext";

interface TicketDetailsProps {
  ticket_stringify: string;
}

const TicketDetails: NextPage<TicketDetailsProps> = ({ ticket_stringify }) => {
  const ticket: Ticket = JSON.parse(ticket_stringify);

  return (
    <>
      <NavBar />
      <TicketComponent ticket={ticket} />
    </>
  );
};

export default TicketDetails;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
  query,
}) => {
  //check if args exist
  if (
    !params?.workspaceId ||
    !params?.projectId ||
    !params?.ticketId ||
    typeof params.workspaceId !== "string" ||
    typeof params.projectId !== "string" ||
    typeof params.ticketId !== "string"
  )
    return { redirect: { destination: "/workspaces", permanent: false } };
  const { workspaceId, projectId, ticketId } = params;
  console.log("PARAMS", params);

  //check if session and user exists
  const sessionAndUser = await getServerSessionAndUser(req, res);
  if (!sessionAndUser) {
    return { redirect: { destination: "/signin", permanent: false } };
  }
  const { sessionToken, user } = sessionAndUser;
  console.log("SAU", sessionAndUser);

  //check if workspace id provided by client exists
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, name: true },
  });
  if (!workspace) return { notFound: true };
  console.log("WORKSPACE", workspace);

  //check if user is apart of the workspace
  const workspaceUser = await prisma.workspaceUser.findUnique({
    where: {
      workspaceId_userId: { workspaceId: workspace.id, userId: user.id },
    },
  });
  if (!workspaceUser)
    return { redirect: { destination: "/workspaces", permanent: false } };
  console.log("WORKSPACEUSER", workspaceUser);

  //check if project id provided by client exists in db AND if project belongs to the workspace the user is apart of
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true, description: true, workspaceId: true },
  });
  if (!project) return { notFound: true };
  if (project.workspaceId !== workspaceUser.workspaceId)
    return { redirect: { destination: "/workspaces", permanent: false } };
  console.log("PROJECT", project);

  //a workspace's ADMIN can view any project in the workspace
  //a workspace's non-ADMINs can only view a project IF they are apart of the project
  //if a user is NOT an ADMIN of a workspace, check to see if user is at least assigned to project
  if (workspaceUser.role !== ROLES.ADMIN) {
    const projectWorkspaceUser = await prisma.projectWorkspaceUser.findUnique({
      where: {
        projectId_workspaceUserId: {
          projectId: project.id,
          workspaceUserId: workspaceUser.id,
        },
      },
    });
    console.log("projectWorkspaceUser", projectWorkspaceUser);
    if (!projectWorkspaceUser)
      return { redirect: { destination: "/workspaces", permanent: false } };
  }

  //below this point we know: user is assigned to workspace, project is apart of same workspace, user is: an ADMIN of workspace OR user is a MANAGER/DEVELOPER of workspace AND assigned to project

  //find ticket and see if ticket is apart of the project
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      title: true,
      description: true,
      ticketSubmitter: {
        select: {
          id: true,
          submitter: {
            select: {
              id: true,
              user: { select: { id: true, username: true, email: true } },
              role: true,
            },
          },
        },
      },
      ticketDeveloper: {
        select: {
          id: true,
          developer: {
            select: {
              id: true,
              user: { select: { id: true, username: true, email: true } },
              role: true,
            },
          },
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          description: true,
          workspace: { select: { id: true, name: true } },
        },
      },
      priority: true,
      status: true,
      type: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  console.log("TICKET", ticket);
  if (!ticket) return { notFound: true };
  if (ticket.project.id !== project.id)
    return { redirect: { destination: "/workspaces", permanent: false } };

  //we know: ticket is apart of project and project is apart of workspace
  //we know: user is an ADMIN of workspace OR user is a MANAGER/DEVELOPER of workspace and assigned to project

  //ADMINs can see all ticket details of a workspace unconditionally
  //MANAGERs can see all ticket details of projects if they are assigned to the project
  //DEVELOPERs can see all ticket details where they are listed as a ticketDeveloper
  if (
    workspaceUser.role !== ROLES.ADMIN &&
    workspaceUser.role !== ROLES.MANAGER
  ) {
    if (
      !ticket.ticketDeveloper.find(
        ({ id, developer }) => developer.id === workspaceUser.id
      )
    )
      return { redirect: { destination: "/workspaces", permanent: false } };
  }

  return {
    props: {
      user,
      workspace,
      workspaceUser,
      project,
      ticket_stringify: JSON.stringify(ticket),
    },
  };
};

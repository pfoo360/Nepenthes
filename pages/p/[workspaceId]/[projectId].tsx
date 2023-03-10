import type { GetServerSideProps, NextPage } from "next";
import getServerSessionAndUser from "../../../utils/getServerSessionAndUser";
import prisma from "../../../lib/prisma";
import ROLES from "../../../utils/role";
import ProjectsWorkspaceUsers from "../../../components/ProjectsWorkspaceUsers/ProjectsWorkspaceUsers";
import DeleteProject from "../../../components/DeleteProject/DeleteProject";
import NavBar from "../../../components/NavBar/NavBar";
import ProjectsTickets from "../../../components/ProjectsTickets/ProjectsTickets";
import { useState } from "react";
import { Role, User } from "../../../types/types";
import useUserContext from "../../../hooks/useUserContext";
import useWorkspaceContext from "../../../hooks/useWorkspaceContext";
import useWorkspaceUserContext from "../../../hooks/useWorkspaceUserContext";
import useProjectContext from "../../../hooks/useProjectContext";
import Head from "next/head";

interface ProjectDetailsProps {
  projectWorkspaceUserCount: number;
  listOfWorkspaceUsersNotApartOfTheProject: Array<{
    id: string;
    user: User;
    role: Role;
  }>;
  listOfWorkspaceUsersApartOfTheProject: Array<{
    workspaceUser: { id: string; user: User; role: Role };
  }>;
  projectTicketCount: number;
}

const ProjectDetails: NextPage<ProjectDetailsProps> = ({
  projectWorkspaceUserCount,
  listOfWorkspaceUsersNotApartOfTheProject,
  listOfWorkspaceUsersApartOfTheProject,
  projectTicketCount,
}) => {
  const [
    workspaceUsersNotApartOfTheProject,
    setWorkspaceUsersNotApartOfTheProject,
  ] = useState(listOfWorkspaceUsersNotApartOfTheProject);

  const [workspaceUsersApartOfTheProject, setWorkspaceUsersApartOfTheProject] =
    useState(listOfWorkspaceUsersApartOfTheProject);

  const userCtx = useUserContext();
  const workspaceCtx = useWorkspaceContext();
  const workspaceUserCtx = useWorkspaceUserContext();
  const projectCtx = useProjectContext();
  if (!userCtx || !workspaceCtx || !workspaceUserCtx || !projectCtx)
    return null;
  if (workspaceUserCtx.userId !== userCtx.id) return null;
  if (workspaceUserCtx.workspaceId !== workspaceCtx.id) return null;
  if (workspaceUserCtx.workspaceId !== projectCtx.workspaceId) return null;

  return (
    <>
      <Head>
        <title>Project</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className="mx-6 mt-2 mb-1 text-gray-900 text-lg">
        <h1 className="font-semibold text-gray-500 text-sm">Project Name</h1>
        <p className="px-4">{projectCtx.name}</p>
        <h1 className="font-semibold text-gray-500 text-sm">
          Project Description
        </h1>
        <p className="px-4 break-all">{projectCtx.description}</p>
      </div>
      <ProjectsTickets
        workspaceUsersApartOfTheProject={workspaceUsersApartOfTheProject}
        projectTicketCount={projectTicketCount}
      />
      <ProjectsWorkspaceUsers
        projectWorkspaceUserCount={projectWorkspaceUserCount}
        workspaceUsersApartOfTheProject={workspaceUsersApartOfTheProject}
        workspaceUsersNotApartOfTheProject={workspaceUsersNotApartOfTheProject}
        setWorkspaceUsersNotApartOfTheProject={
          setWorkspaceUsersNotApartOfTheProject
        }
        setWorkspaceUsersApartOfTheProject={setWorkspaceUsersApartOfTheProject}
      />
      {workspaceUserCtx.role === ROLES.ADMIN ||
      workspaceUserCtx.role === ROLES.MANAGER ? (
        <DeleteProject />
      ) : null}
    </>
  );
};

export default ProjectDetails;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
  query,
}) => {
  //check if workspaceId and projectId exists in user request
  if (
    !params?.workspaceId ||
    typeof params.workspaceId !== "string" ||
    !params.projectId ||
    typeof params.projectId !== "string"
  )
    return { redirect: { destination: "/workspaces", permanent: false } };

  //check if session and user exists
  const sessionAndUser = await getServerSessionAndUser(req, res);
  if (!sessionAndUser) {
    return { redirect: { destination: "/signin", permanent: false } };
  }

  const { user, sessionToken } = sessionAndUser;
  const { workspaceId, projectId } = params;

  //check if workspace id provided by client exists in db
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

  //check if project id provided by client exists in db AND if project belongs to the workspace the user is apart of
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true, description: true, workspaceId: true },
  });
  if (!project) return { notFound: true };
  if (project.workspaceId !== workspace.id)
    return { redirect: { destination: "/workspaces", permanent: false } };

  //below this point we know: user and session exists, workspace exists, user is apart of the workspace, project exists, project is apart of the workspace

  //a workspace's ADMIN can view any project in their workspace
  //non-ADMINs can only view a project IF they are apart of the project
  //IF a project is apart of the workspace AND the user is apart of the workspace AND the user is an ADMIN in the workspace, they have unconditional access to the project
  //IF a project is apart of the workspace AND the user is apart of the workspace AND the user is NOT an ADMIN in the workspace, check to see if the user is apart of the project- grant access if user is apart of the project
  if (workspaceUser.role !== ROLES.ADMIN) {
    const projectWorkspaceUser = await prisma.projectWorkspaceUser.findUnique({
      where: {
        projectId_workspaceUserId: {
          projectId: project.id,
          workspaceUserId: workspaceUser.id,
        },
      },
    });
    if (!projectWorkspaceUser)
      return { redirect: { destination: "/workspaces", permanent: false } };
  }

  //find all users that are apart of the project and the count
  const [listOfWorkspaceUsersApartOfTheProject, projectWorkspaceUserCount] =
    await Promise.all([
      prisma.projectWorkspaceUser.findMany({
        where: { projectId: projectId },
        select: {
          workspaceUser: {
            select: {
              id: true,
              user: { select: { id: true, email: true, username: true } },
              role: true,
            },
          },
        },
      }),
      prisma.projectWorkspaceUser.count({
        where: { projectId },
      }),
    ]);

  //used in next db query to find the workspace users that are NOT apart of the project
  const listOfWorkspaceUserIdsThatBelongToUsersThatAreAlreadyApartOfTheProject =
    Array.from(listOfWorkspaceUsersApartOfTheProject, (x) => ({
      id: x.workspaceUser.id,
    }));

  const listOfWorkspaceUsersNotApartOfTheProject =
    await prisma.workspaceUser.findMany({
      where: {
        workspaceId: workspaceId,
        NOT: listOfWorkspaceUserIdsThatBelongToUsersThatAreAlreadyApartOfTheProject,
      },
      select: {
        id: true,
        user: { select: { id: true, username: true, email: true } },
        role: true,
      },
    });

  const projectTicketCount = await prisma.ticket.count({
    where: { projectId },
  });

  return {
    props: {
      user,
      workspace,
      workspaceUser,
      project,
      listOfWorkspaceUsersNotApartOfTheProject,
      listOfWorkspaceUsersApartOfTheProject,
      projectWorkspaceUserCount,
      projectTicketCount,
    },
  };
};

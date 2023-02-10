import type { GetServerSideProps, NextPage } from "next";
import getServerSessionAndUser from "../../../utils/getServerSessionAndUser";
import prisma from "../../../lib/prisma";
import ROLES from "../../../utils/role";

const ProjectDetails = () => {
  return <div>projectdetails</div>;
};

export default ProjectDetails;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
  query,
}) => {
  console.log("PARAMS", params);
  //check if workspaceId and projectId exists in user request
  if (
    !params?.workspaceId ||
    typeof params.workspaceId !== "string" ||
    !params.projectId ||
    typeof params.projectId !== "string"
  )
    return { redirect: { destination: "/dash", permanent: false } };

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
    return { redirect: { destination: "/dash", permanent: false } };

  //check if project id provided by client exists in db AND if project belongs to the current workspace
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return { notFound: true };
  if (project.workspaceId !== workspace.id)
    return { redirect: { destination: "/dash", permanent: false } };

  //below this point we know: user and session exists, workspace exists, user is apart of the workspace, project exists, project is apart of the workspace

  console.log(workspaceUser.role);
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
    console.log("projectWorkspaceUser", projectWorkspaceUser);
    if (!projectWorkspaceUser)
      return { redirect: { destination: "/dash", permanent: false } };
  }

  // console.log(user, sessionToken);
  // console.log(workspaceId, projectId);
  // console.log(project);
  // console.log(workspace);
  // console.log(workspaceUser);
  // console.log(project);

  return { props: { user, workspace, workspaceUser } };
};

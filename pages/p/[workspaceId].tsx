import type { GetServerSideProps, NextPage } from "next";
import prisma from "../../lib/prisma";
import getServerSessionAndUser from "../../utils/getServerSessionAndUser";
import useWorkspaceUserContext from "../../hooks/useWorkspaceUserContext";
import useUserContext from "../../hooks/useUserContext";
import useWorkspaceContext from "../../hooks/useWorkspaceContext";
import NavBar from "../../components/NavBar/NavBar";
import AddProject from "../../components/AddProject/AddProject";

const Project: NextPage = () => {
  const a = useWorkspaceUserContext();
  const b = useUserContext();
  const c = useWorkspaceContext();

  return (
    <>
      <NavBar />
      <AddProject />
      <div>{JSON.stringify(a?.role)}</div>
      <div>{JSON.stringify(b?.username)}</div>
      <div>{JSON.stringify(c?.name)}</div>
    </>
  );
};

export default Project;

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
    return { redirect: { destination: "/dash", permanent: false } };
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
    return { redirect: { destination: "/dash", permanent: false } };

  //console.log(user, sessionToken, workspace, workspaceUser);

  return { props: { user, workspace, workspaceUser } };
};

import { GetServerSideProps } from "next";
import React from "react";
import prisma from "../../lib/prisma";
import getServerSessionAndUser from "../../utils/getServerSessionAndUser";
import useWorkspaceUserContext from "../../hooks/useWorkspaceUserContext";
import useUserContext from "../../hooks/useUserContext";
import useWorkspaceContext from "../../hooks/useWorkspaceContext";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar/NavBar";

const Home = () => {
  const a = useWorkspaceUserContext();
  const b = useUserContext();
  const c = useWorkspaceContext();
  const { push } = useRouter();

  return (
    <>
      <NavBar />
      <div>hello</div>
      <div>hello</div>
      <div>hello</div>
      <div>hello</div>

      <div>{JSON.stringify(a?.role)}</div>
      <div>{JSON.stringify(b?.username)}</div>
      <div>{JSON.stringify(c?.name)}</div>
      <button
        onClick={() => {
          push("/a/cldlsa9ya0007utp80fqpn65j");
        }}
      >
        clk
      </button>
    </>
  );
};

export default Home;

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

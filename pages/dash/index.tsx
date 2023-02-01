import { GetServerSideProps } from "next";
import React from "react";
import type { NextPage } from "next";
import Head from "next/head";
import getServerSessionAndUser from "../../utils/getServerSessionAndUser";
import AddWorkspace from "../../components/AddWorkspace/AddWorkspace";
import MyWorkspace from "../../components/MyWorkspace/MyWorkspace";

const Dash: NextPage = (a) => {
  return (
    <>
      <Head>
        <title>Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-gray-50 pt-4 flex flex-col justify-center items-center">
        <MyWorkspace />
        <AddWorkspace />
      </div>
    </>
  );
};

export default Dash;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  console.log("gssp before", req.cookies);
  const sessionAndUser = await getServerSessionAndUser(req, res);
  console.log("gssp after", req.cookies);
  console.log("user", sessionAndUser);

  if (!sessionAndUser) {
    return { redirect: { destination: "/signin", permanent: false } };
  }

  return {
    props: { session: sessionAndUser.sessionToken, user: sessionAndUser.user },
  };
};

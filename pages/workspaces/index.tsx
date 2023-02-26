import { GetServerSideProps } from "next";
import React from "react";
import type { NextPage } from "next";
import Head from "next/head";
import getServerSessionAndUser from "../../utils/getServerSessionAndUser";
import AddWorkspace from "../../components/AddWorkspace/AddWorkspace";
import MyWorkspace from "../../components/MyWorkspace/MyWorkspace";
import SignOut from "../../components/SignOut/SignOut";

const Dashboard: NextPage = (a) => {
  return (
    <>
      <Head>
        <title>Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className="bg-gray-50 h-9 px-4 flex flex-row justify-end items-center border-b-gray-200 border-b">
        <SignOut />
      </nav>
      <div className="bg-gray-50 pt-4 flex flex-col justify-center items-center">
        <AddWorkspace />
        <MyWorkspace />
      </div>
    </>
  );
};

export default Dashboard;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const sessionAndUser = await getServerSessionAndUser(req, res);

  if (!sessionAndUser) {
    return { redirect: { destination: "/signin", permanent: false } };
  }

  return {
    props: { session: sessionAndUser.sessionToken, user: sessionAndUser.user },
  };
};

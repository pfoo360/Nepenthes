import type { GetServerSideProps, NextPage } from "next";
import getServerSessionAndUser from "../utils/getServerSessionAndUser";
import Head from "next/head";

const Index: NextPage = () => {
  return (
    <>
      <Head>
        <title>Welcome</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </>
  );
};

export default Index;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const sessionAndUser = await getServerSessionAndUser(req, res);
  console.log(sessionAndUser);
  if (!sessionAndUser) {
    return { redirect: { destination: "/signin", permanent: false } };
  }

  if (sessionAndUser.sessionToken) {
    return { redirect: { destination: "/workspaces", permanent: false } };
  }

  return { props: {} };
};

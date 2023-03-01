import type { GetServerSideProps, NextPage } from "next";
import getServerSessionAndUser from "../utils/getServerSessionAndUser";
import Link from "next/link";
import Head from "next/head";

const Index: NextPage = () => {
  return <></>;
};

export default Index;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const sessionAndUser = await getServerSessionAndUser(req, res);

  if (!sessionAndUser) {
    return { redirect: { destination: "/signin", permanent: false } };
  }

  if (sessionAndUser.sessionToken) {
    return { redirect: { destination: "/workspaces", permanent: false } };
  }

  return { props: {} };
};

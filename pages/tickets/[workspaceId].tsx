import {} from "react";
import type { GetServerSideProps, NextPage } from "next";
import getServerSessionAndUser from "../../utils/getServerSessionAndUser";
import NavBar from "../../components/NavBar/NavBar";
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

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const sessionAndUser = await getServerSessionAndUser(req, res);

  //if ADMIN in workspace return all tickets in the workspace
  //if MANAGER in workspace return all tickets from projects you are assigned to
  //if DEVELOPER in workspace treturn tickets where you are listed as a developer
  return { props: {} };
};

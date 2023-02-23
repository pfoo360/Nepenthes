import type { GetServerSideProps, NextPage } from "next";
import React from "react";
import prisma from "../../lib/prisma";
import getServerSessionAndUser from "../../utils/getServerSessionAndUser";
import useWorkspaceUserContext from "../../hooks/useWorkspaceUserContext";
import useUserContext from "../../hooks/useUserContext";
import useWorkspaceContext from "../../hooks/useWorkspaceContext";
import NavBar from "../../components/NavBar/NavBar";
import STATUS from "../../utils/status";
import TYPE from "../../utils/type";
import PRIORITY from "../../utils/priority";
import { PieChartData, Priority, Status, Type } from "../../types/types";
import Chart from "../../components/Chart/Chart";

interface TicketBreakdownProps {
  STATUS_DATA: PieChartData;
  TYPE_DATA: PieChartData;
  PRIORITY_DATA: PieChartData;
}

const TicketBreakdown: NextPage<TicketBreakdownProps> = ({
  STATUS_DATA,
  TYPE_DATA,
  PRIORITY_DATA,
}) => {
  const userCtx = useUserContext();
  const workspaceCtx = useWorkspaceContext();
  const workspaceUserCtx = useWorkspaceUserContext();
  if (!userCtx || !workspaceCtx || !workspaceUserCtx) return null;
  if (workspaceUserCtx.userId !== userCtx.id) return null;
  if (workspaceUserCtx.workspaceId !== workspaceCtx.id) return null;

  return (
    <>
      <NavBar />
      <main className="lg:flex lg:flex-row lg:justify-center lg:items-center">
        <section className="flex flex-col justify-center items-center lg:flex-row lg:mx-10 lg:justify-between lg:max-w-[1920px]">
          <Chart data={STATUS_DATA} title={"Tickets by STATUS"} />
          <Chart data={TYPE_DATA} title={"Tickets by TYPE"} />
          <Chart data={PRIORITY_DATA} title={"Tickets by PRIORITY"} />
        </section>
      </main>
    </>
  );
};

export default TicketBreakdown;

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
    return { redirect: { destination: "/workspaces", permanent: false } };
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
    return { redirect: { destination: "/workspaces", permanent: false } };

  //console.log(user, sessionToken, workspace, workspaceUser);

  //STATUS
  //index 0 = OPEN
  //index 1 = CLOSED
  const STATUS_VALUES = Object.values(STATUS);
  const STATUS_COUNT = await Promise.all(
    Array.from(STATUS_VALUES, (STATUS) =>
      prisma.ticket.count({
        where: {
          AND: {
            project: { workspaceId: workspaceUser.workspaceId },
            status: STATUS as Status,
          },
        },
      })
    )
  );
  const STATUS_DATA = {
    labels: STATUS_VALUES,
    datasets: [
      {
        label: "STATUS",
        data: STATUS_COUNT,
        backgroundColor: ["rgba(255, 99, 132, 0.2)", "rgba(75, 192, 192, 0.2)"],
        borderColor: ["rgba(255, 99, 132, 1)", "rgba(75, 192, 192, 1)"],
        borderWidth: 1,
      },
    ],
  };
  console.log(STATUS_VALUES, STATUS_COUNT, STATUS_DATA);

  //TYPE
  //index 0 = BUG
  //index 1 = ERROR
  //index 2 = FEATURE
  //index 3 = ISSUE
  //index 4 = OTHER
  const TYPE_VALUES = Object.values(TYPE);
  const TYPE_COUNT = await Promise.all(
    Array.from(TYPE_VALUES, (TYPE) =>
      prisma.ticket.count({
        where: {
          AND: {
            project: { workspaceId: workspaceUser.workspaceId },
            type: TYPE as Type,
          },
        },
      })
    )
  );
  const TYPE_DATA = {
    labels: TYPE_VALUES,
    datasets: [
      {
        label: "TYPE",
        data: TYPE_COUNT,
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 159, 64, 0.2)",
          "rgba(153, 102, 255, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
  console.log(TYPE_VALUES, TYPE_COUNT, TYPE_DATA);

  //PRIORITY
  //index 0 = LOW
  //index 1 = MEDIUM
  //index 2 = HIGH
  const PRIORITY_VALUES = Object.values(PRIORITY);
  const PRIORITY_COUNT = await Promise.all(
    Array.from(PRIORITY_VALUES, (PRIORITY) =>
      prisma.ticket.count({
        where: {
          AND: {
            project: { workspaceId: workspaceUser.workspaceId },
            priority: PRIORITY as Priority,
          },
        },
      })
    )
  );
  const PRIORITY_DATA = {
    labels: PRIORITY_VALUES,
    datasets: [
      {
        label: "PRIORITY",
        data: PRIORITY_COUNT,
        backgroundColor: [
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 159, 64, 0.2)",
          "rgba(255, 99, 132, 0.2)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(255, 99, 132, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
  console.log(PRIORITY_VALUES, PRIORITY_COUNT, PRIORITY_DATA);

  return {
    props: {
      user,
      workspace,
      workspaceUser,
      STATUS_DATA,
      TYPE_DATA,
      PRIORITY_DATA,
    },
  };
};

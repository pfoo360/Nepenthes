import type { GetServerSideProps, NextPage } from "next";
import getServerSessionAndUser from "../../../../utils/getServerSessionAndUser";
import prisma from "../../../../lib/prisma";
import ROLES from "../../../../utils/role";
import Error from "../../../../components/Error/Error";
import NavBar from "../../../../components/NavBar/NavBar";
import { useState, useEffect, useCallback, ChangeEvent } from "react";
import {
  Ticket,
  WorkspaceUser,
  Priority,
  Type,
  Status,
} from "../../../../types/types";
import useUserContext from "../../../../hooks/useUserContext";
import useWorkspaceContext from "../../../../hooks/useWorkspaceContext";
import useWorkspaceUserContext from "../../../../hooks/useWorkspaceUserContext";
import useProjectContext from "../../../../hooks/useProjectContext";
import PRIORITIES from "../../../../utils/priority";
import TYPES from "../../../../utils/type";
import STATUS from "../../../../utils/status";
import Link from "next/link";

interface TicketEditProps {
  ticket_stringify: string;
  workspaceUsersAssignedToProject: Array<{
    id: string;
    projectId: string;
    workspaceUser: WorkspaceUser;
  }>;
}

const TicketEdit: NextPage<TicketEditProps> = ({
  ticket_stringify,
  workspaceUsersAssignedToProject,
}) => {
  const ticket: Ticket = JSON.parse(ticket_stringify);

  const PRIORITY_VALUES = Object.values(PRIORITIES);
  const TYPE_VALUES = Object.values(TYPES);
  const STATUS_VALUES = Object.values(STATUS);

  const userCtx = useUserContext();
  const workspaceCtx = useWorkspaceContext();
  const workspaceUserCtx = useWorkspaceUserContext();
  const projectCtx = useProjectContext();

  const [title, setTitle] = useState(ticket.title);
  const [titleInitialFocus, setTitleInitialFocus] = useState(false);
  const [titleError, setTitleError] = useState("");

  const [description, setDescription] = useState(ticket.description);
  const [descriptionInitialFocus, setDescriptionInitialFocus] = useState(false);
  const [descriptionError, setDescriptionError] = useState("");
  const [descriptionLength, setDescriptionLength] = useState(0);

  const [workspaceUserIds, setWorkspaceUserIds] = useState<string[]>(
    Array.from(
      ticket.ticketDeveloper,
      ({ developer: { id, user, role } }) => id
    )
  );
  const [workspaceUserIdsInitialFocus, setWorkspaceUserIdsInitialFocus] =
    useState(false);
  const [workspaceUserIdsError, setWorkspaceUserIdsError] = useState("");

  const [priority, setPriority] = useState<Priority>(ticket.priority);
  const [priorityInitialFocus, setPriorityInitialFocus] = useState(false);
  const [priorityError, setPriorityError] = useState("");

  const [type, setType] = useState<Type>(ticket.type);
  const [typeInitialFocus, setTypeInitialFocus] = useState(false);
  const [typeError, setTypeError] = useState("");

  const [status, setStatus] = useState<Status>(ticket.status);
  const [statusInitialFocus, setStatusInitialFocus] = useState(false);
  const [statusError, setStatusError] = useState("");

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setTitle(e.target.value);
  };

  const inputRef = useCallback((node: HTMLInputElement | null) => {
    if (!node) return;
    node.focus();
  }, []);

  const handleTitleInitialFocus = () => {
    if (titleInitialFocus) return;
    setTitleInitialFocus(true);
  };

  useEffect(() => {
    setTitleError("");
    if (!title) setTitleError("Required");
    if (title.length > 20) setTitleError("Exceeds limit");
  }, [title, titleInitialFocus]);

  const handleDescriptionTextAreaChange = (
    e: ChangeEvent<HTMLTextAreaElement>
  ) => {
    e.preventDefault();
    setDescription(e.target.value);
  };

  const handleDescriptionInitialFocus = () => {
    if (descriptionInitialFocus) return;
    setDescriptionInitialFocus(true);
  };

  useEffect(() => {
    setDescriptionLength(description.length);
    setDescriptionError("");
    if (description.length > 120) setDescriptionError("Exceeds limit");
  }, [description]);

  const handleWorkspaceUserIdsSelectChange = (
    e: ChangeEvent<HTMLSelectElement>
  ) => {
    e.preventDefault();
    setWorkspaceUserIds(
      Array.from(e.target.selectedOptions, (option) => option.value)
    );
  };

  const handleWorkspaceUserIdsInitialFocus = () => {
    if (workspaceUserIdsInitialFocus) return;
    setWorkspaceUserIdsInitialFocus(true);
  };

  useEffect(() => {
    setWorkspaceUserIdsError("");
    if (workspaceUserIds.length <= 0) setWorkspaceUserIdsError("Required");
  }, [workspaceUserIds]);

  const handlePrioritySelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    console.log(e.target.value);
    setPriority(e.target.value as Priority);
  };

  const handlePriorityInitialFocus = () => {
    if (priorityInitialFocus) return;
    setPriorityInitialFocus(true);
  };

  useEffect(() => {
    setPriorityError("");
    console.log(PRIORITY_VALUES.indexOf(priority) === -1);
    console.log(PRIORITY_VALUES.indexOf(priority) < 0);
    if (PRIORITY_VALUES.indexOf(priority) < 0)
      setPriorityError("Invalid value");
  }, [priority]);

  const handleTypeSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    console.log(e.target.value);
    setType(e.target.value as Type);
  };

  const handleTypeInitialFocus = () => {
    if (typeInitialFocus) return;
    setTypeInitialFocus(true);
  };

  useEffect(() => {
    setTypeError("");
    console.log(TYPE_VALUES.indexOf(type) === -1);
    console.log(TYPE_VALUES.indexOf(type) < 0);
    if (TYPE_VALUES.indexOf(type) < 0) setTypeError("Invalid value");
  }, [type]);

  const handleStatusSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    console.log(e.target.value);
    setStatus(e.target.value as Status);
  };

  const handleStatusInitialFocus = () => {
    if (statusInitialFocus) return;
    setStatusInitialFocus(true);
  };

  useEffect(() => {
    setStatusError("");
    console.log(STATUS_VALUES.indexOf(status) === -1);
    console.log(STATUS_VALUES.indexOf(status) < 0);
    if (STATUS_VALUES.indexOf(status) < 0) setStatusError("Invalid value");
  }, [status]);

  if (!ticket) return null;
  if (!userCtx || !workspaceCtx || !workspaceUserCtx || !projectCtx)
    return null;
  if (workspaceUserCtx.userId !== userCtx.id) return null;
  if (workspaceUserCtx.workspaceId !== workspaceCtx.id) return null;
  if (projectCtx.workspaceId !== workspaceUserCtx.workspaceId) return null;
  if (ticket.project.id !== projectCtx.id) return null;

  console.log(ticket.project.id);
  console.log(projectCtx);
  console.log(workspaceUsersAssignedToProject);
  console.log(
    Array.from(
      ticket.ticketDeveloper,
      ({ developer: { id, user, role } }) => id
    )
  );
  return (
    <>
      <NavBar />
      <div className="mx-4 my-4 border border-indigo-500 rounded-sm">
        <div className="h-[60px] bg-indigo-500 px-4 pt-2">
          <h1 className="text-gray-50 font-bold">{`Ticket# ${ticket.id}`}</h1>
          <Link
            href={`/p/${ticket.project.workspace.id}/${ticket.project.id}`}
            className="text-xs underline decoration-dotted text-gray-50"
          >
            back to project info
          </Link>
          <span className="text-sm px-2 text-gray-50">|</span>
          <Link
            href={`/t/${ticket.project.workspace.id}/${ticket.project.id}/${ticket.id}`}
            className="text-xs underline decoration-dotted text-gray-50"
          >
            back to ticket info
          </Link>
        </div>
        <form className="p-2 bg-gray-50">
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleInitialFocus}
            required
            ref={inputRef}
            disabled={false}
            placeholder="Ticket title"
            className={`border border-gray-300 rounded-sm px-2 w-full py-1 mt-5 mb-3 text-4xl text-gray-900 placeholder-gray-300 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200`}
          />
          {titleInitialFocus && titleError ? (
            <Error message={titleError} />
          ) : null}
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={handleDescriptionTextAreaChange}
            onBlur={handleDescriptionInitialFocus}
            maxLength={120}
            disabled={false}
            placeholder="Description"
            className={`border border-gray-300 rounded-sm px-2 w-full h-32 py-1 mt-2 mb-0.5 text-lg text-gray-900 placeholder-gray-300 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200 resize-none`}
          />
          <div className="flex flex-row justify-end mb-3">
            <p
              className={`pr-3 ${
                descriptionLength > 120 ? `text-rose-500 ` : null
              }`}
            >
              {descriptionLength}/120
            </p>
          </div>
          {descriptionInitialFocus && descriptionError ? (
            <Error message={descriptionError} />
          ) : null}
          <select
            multiple={true}
            value={workspaceUserIds}
            onChange={handleWorkspaceUserIdsSelectChange}
            onBlur={handleWorkspaceUserIdsInitialFocus}
            disabled={false}
            className={`border border-gray-300 rounded-sm px-2 w-full h-32 py-1 mb-6 text-base text-gray-900 placeholder-gray-300 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200 overflow-y-scroll `}
          >
            {workspaceUsersAssignedToProject.map(
              ({ workspaceUser: { id, role, user } }) => {
                return (
                  <option
                    key={id}
                    value={id}
                  >{`${user.username}, ${role}`}</option>
                );
              }
            )}
          </select>
          {workspaceUserIdsInitialFocus && workspaceUserIdsError ? (
            <Error message={workspaceUserIdsError} />
          ) : null}
          <select
            value={priority}
            onChange={handlePrioritySelectChange}
            onBlur={handlePriorityInitialFocus}
            disabled={false}
            className={`border border-gray-300 rounded-sm px-2 w-full py-1 mb-6 text-lg text-gray-900 placeholder-gray-300 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200`}
          >
            {PRIORITY_VALUES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          {priorityInitialFocus && priorityError ? (
            <Error message={priorityError} />
          ) : null}
          <select
            value={type}
            onChange={handleTypeSelectChange}
            onBlur={handleTypeInitialFocus}
            disabled={false}
            className={`border border-gray-300 rounded-sm px-2 w-full py-1 mb-6 text-lg text-gray-900 placeholder-gray-300 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200`}
          >
            {TYPE_VALUES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {typeInitialFocus && typeError ? <Error message={typeError} /> : null}
          <select
            value={status}
            onChange={handleStatusSelectChange}
            onBlur={handleStatusInitialFocus}
            disabled={false}
            className={`border border-gray-300 rounded-sm px-2 w-full py-1 mb-6 text-lg text-gray-900 placeholder-gray-300 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200`}
          >
            {STATUS_VALUES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {statusInitialFocus && statusError ? (
            <Error message={statusError} />
          ) : null}
          <div className="flex flex-row justify-end mt-4">
            <button
              type="submit"
              disabled={
                !!titleError ||
                !!descriptionError ||
                !!workspaceUserIdsError ||
                !!priorityError ||
                !!typeError ||
                !!statusError
              }
              className={`flex-shrink-0 bg-indigo-500 rounded-sm py-1 px-2 text-gray-50 text-xl hover:bg-indigo-600 active:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-300 disabled:bg-indigo-400`}
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default TicketEdit;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
}) => {
  //check if args exist
  if (
    !params?.workspaceId ||
    !params?.projectId ||
    !params?.ticketId ||
    typeof params.workspaceId !== "string" ||
    typeof params.projectId !== "string" ||
    typeof params.ticketId !== "string"
  )
    return { redirect: { destination: "/workspaces", permanent: false } };
  const { workspaceId, projectId, ticketId } = params;
  console.log("PARAMS", params);

  //check if session and user exists
  const sessionAndUser = await getServerSessionAndUser(req, res);
  if (!sessionAndUser) {
    return { redirect: { destination: "/signin", permanent: false } };
  }
  const { sessionToken, user } = sessionAndUser;
  console.log("SAU", sessionAndUser);

  //check if workspace id provided by client exists
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, name: true },
  });
  if (!workspace) return { notFound: true };
  console.log("WORKSPACE", workspace);

  //check if user is apart of the workspace
  const workspaceUser = await prisma.workspaceUser.findUnique({
    where: {
      workspaceId_userId: { workspaceId: workspace.id, userId: user.id },
    },
  });
  if (!workspaceUser)
    return { redirect: { destination: "/workspaces", permanent: false } };
  console.log("WORKSPACEUSER", workspaceUser);

  //check if project id provided by client exists in db AND if project belongs to the workspace the user is apart of
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true, description: true, workspaceId: true },
  });
  if (!project) return { notFound: true };
  if (project.workspaceId !== workspaceUser.workspaceId)
    return { redirect: { destination: "/workspaces", permanent: false } };
  console.log("PROJECT", project);

  //a workspace's ADMIN can view any project in the workspace
  //a workspace's non-ADMINs can only view a project IF they are assigned to the project
  //if a user is NOT an ADMIN of a workspace, check to see if user is at least assigned to project
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
      return { redirect: { destination: "/workspaces", permanent: false } };
  }

  //below this point we know: user is assigned to workspace, project is apart of same workspace, user is: an ADMIN of workspace OR user is a MANAGER/DEVELOPER of workspace AND assigned to project

  //find ticket and see if ticket is apart of the project
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      title: true,
      description: true,
      ticketSubmitter: {
        select: {
          id: true,
          submitter: {
            select: {
              id: true,
              user: { select: { id: true, username: true, email: true } },
              role: true,
            },
          },
        },
      },
      ticketDeveloper: {
        select: {
          id: true,
          developer: {
            select: {
              id: true,
              user: { select: { id: true, username: true, email: true } },
              role: true,
            },
          },
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          description: true,
          workspace: { select: { id: true, name: true } },
        },
      },
      priority: true,
      status: true,
      type: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  console.log("TICKET", ticket);
  if (!ticket) return { notFound: true };
  if (ticket.project.id !== project.id)
    return { redirect: { destination: "/workspaces", permanent: false } };

  //(we checked if non-ADMINs are assigned to the project already so we do not need to check again)
  //now we need to see who is allowed to edit the specific ticket in a project
  //user needs to be an ADMIN of the workspace to be able to edit ticket
  //user needs to be a MANAGER of the workspace and assigned to the project to be able to edit ticket
  //user needs to be listed on the ticket to be able to edit ticket
  if (
    workspaceUser.role !== ROLES.ADMIN &&
    workspaceUser.role !== ROLES.MANAGER &&
    workspaceUser.id !== ticket.ticketSubmitter.submitter.id &&
    !ticket.ticketDeveloper.find(
      ({ developer: { id, role, user } }) => id === workspaceUser.id
    )
  )
    return { redirect: { destination: "/workspaces", permanent: false } };

  //used for the form
  const workspaceUsersAssignedToProject =
    await prisma.projectWorkspaceUser.findMany({
      where: { projectId: project.id },
      select: {
        id: true,
        projectId: true,
        workspaceUser: {
          select: {
            id: true,
            user: { select: { id: true, username: true, email: true } },
            role: true,
          },
        },
      },
    });

  return {
    props: {
      user,
      workspace,
      workspaceUser,
      project,
      ticket_stringify: JSON.stringify(ticket),
      workspaceUsersAssignedToProject,
    },
  };
};

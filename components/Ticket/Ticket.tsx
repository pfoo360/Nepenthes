import { FC } from "react";
import { Ticket } from "../../types/types";
import moment from "moment";
import useUserContext from "../../hooks/useUserContext";
import useWorkspaceContext from "../../hooks/useWorkspaceContext";
import useWorkspaceUserContext from "../../hooks/useWorkspaceUserContext";
import useProjectContext from "../../hooks/useProjectContext";
import Link from "next/link";
import ROLES from "../../utils/role";

interface TicketProps {
  ticket: Ticket;
  managersAssignedToProject: Array<{ workspaceUserId: string }>;
}

const Ticket: FC<TicketProps> = ({ ticket, managersAssignedToProject }) => {
  console.log("TICKET", ticket);
  const userCtx = useUserContext();
  const workspaceCtx = useWorkspaceContext();
  const workspaceUserCtx = useWorkspaceUserContext();
  const projectCtx = useProjectContext();
  if (!ticket) return null;
  if (!userCtx || !workspaceCtx || !workspaceUserCtx || !projectCtx)
    return null;
  if (workspaceUserCtx.userId !== userCtx.id) return null;
  if (workspaceUserCtx.workspaceId !== workspaceCtx.id) return null;
  if (projectCtx.workspaceId !== workspaceUserCtx.workspaceId) return null;

  console.log("ADMIN?", workspaceUserCtx.role === ROLES.ADMIN);
  console.log("IS MANAGER?", workspaceUserCtx.role === ROLES.MANAGER);
  console.log(
    "MANAGER ASSIGNED?",
    managersAssignedToProject.find(
      ({ workspaceUserId }) => workspaceUserCtx.id === workspaceUserId
    )
  );
  console.log(
    "SUBMITTER?",
    workspaceUserCtx.id === ticket.ticketSubmitter.submitter.id
  );
  console.log(
    "DEVELOPER?",
    ticket.ticketDeveloper.find(
      ({ developer: { id, role, user } }) => id === workspaceUserCtx.id
    )
  );
  return (
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
        {workspaceUserCtx.role === ROLES.ADMIN ||
        (workspaceUserCtx.role === ROLES.MANAGER &&
          managersAssignedToProject.find(
            ({ workspaceUserId }) => workspaceUserCtx.id === workspaceUserId
          )) ||
        workspaceUserCtx.id === ticket.ticketSubmitter.submitter.id ||
        ticket.ticketDeveloper.find(
          ({ developer: { id, role, user } }) => id === workspaceUserCtx.id
        ) ? (
          <Link
            href={`/e/${ticket.project.workspace.id}/${ticket.project.id}/${ticket.id}`}
            className="text-xs underline decoration-dotted text-gray-50"
          >
            edit ticket
          </Link>
        ) : null}
      </div>
      <div className="px-4 py-2 grid grid-cols-2 bg-gray-50">
        <div className="my-3 w-full">
          <h1 className=" text-base text-gray-900 font-bold">TICKET TITLE</h1>
          <h2 className="mx-3 text-sm text-gray-900 mt-[2px]">
            {ticket.title}
          </h2>
        </div>
        <div className="my-3 w-full">
          <h1 className=" text-base text-gray-900 font-bold">
            TICKET DESCRIPTION
          </h1>
          <h2 className="mx-3 text-sm text-gray-900 mt-[2px] break-all">
            {ticket.description}
          </h2>
        </div>
        <div className="my-3 w-full">
          <h1 className=" text-base text-gray-900 font-bold">SUBMITTER</h1>
          <h2 className="mx-3 text-sm text-gray-900 mt-[2px]">
            {ticket.ticketSubmitter.submitter.user.username}
          </h2>
        </div>
        <div className="my-3 w-full">
          <h1 className=" text-base text-gray-900 font-bold">
            {ticket.ticketDeveloper.length > 1 ? "DEVELOPERS" : "DEVELOPER"}
          </h1>
          <div className="mt-[2px]">
            {ticket.ticketDeveloper.map(({ id, developer }) => (
              <h2 key={id} className="mx-3 text-sm text-gray-900">
                {developer.user.username}
              </h2>
            ))}
          </div>
        </div>
        <div className="my-3 w-full">
          <h1 className=" text-base text-gray-900 font-bold">PROJECT</h1>
          <h2 className="mx-3 text-sm text-gray-900 mt-[2px]">
            {ticket.project.name}
          </h2>
        </div>
        <div className="my-3 w-full">
          <h1 className=" text-base text-gray-900 font-bold">PRIORITY</h1>
          <h2 className="mx-3 text-sm text-gray-900 mt-[2px]">
            {ticket.priority}
          </h2>
        </div>
        <div className="my-3 w-full">
          <h1 className=" text-base text-gray-900 font-bold">STATUS</h1>
          <h2 className="mx-3 text-sm text-gray-900 mt-[2px]">
            {ticket.status}
          </h2>
        </div>
        <div className="my-3 w-full">
          <h1 className=" text-base text-gray-900 font-bold">TYPE</h1>
          <h2 className="mx-3 text-sm text-gray-900 mt-[2px]">{ticket.type}</h2>
        </div>
        <div className="my-3 w-full">
          <h1 className=" text-base text-gray-900 font-bold">CREATED AT</h1>
          <h2 className="mx-3 text-sm text-gray-900 mt-[2px]">
            {moment(ticket.createdAt).format("MMMM Do YYYY, h:mm:ss a")}
          </h2>
        </div>
        <div className="my-3 w-full">
          <h1 className=" text-base text-gray-900 font-bold">UPDATED AT</h1>
          <h2 className="mx-3 text-sm text-gray-900 mt-[2px]">
            {moment(ticket.updatedAt).format("MMMM Do YYYY, h:mm:ss a")}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Ticket;

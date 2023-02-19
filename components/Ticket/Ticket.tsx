import { FC } from "react";
import { Ticket } from "../../types/types";
import moment from "moment";

interface TicketProps {
  ticket: Ticket;
}

const Ticket: FC<TicketProps> = ({ ticket }) => {
  if (!ticket) return null;
  console.log("TICKET", ticket);
  return (
    <div className="mx-4 my-4 px-4 py-4 grid grid-cols-2 bg-gray-50 border border-slate-400 rounded-sm">
      <div className="my-3">
        <h1 className=" text-base text-gray-900 font-bold">TICKET TITLE</h1>
        <h2 className="ml-3 text-sm text-gray-900 mt-[2px]">{ticket.title}</h2>
      </div>
      <div className="my-3">
        <h1 className=" text-base text-gray-900 font-bold">
          TICKET DESCRIPTION
        </h1>
        <h2 className="ml-3 text-sm text-gray-900 mt-[2px]">
          {ticket.description}
        </h2>
      </div>
      <div className="my-3">
        <h1 className=" text-base text-gray-900 font-bold">SUBMITTER</h1>
        <h2 className="ml-3 text-sm text-gray-900 mt-[2px]">
          {ticket.ticketSubmitter.submitter.user.username}
        </h2>
      </div>
      <div className="my-3">
        <h1 className=" text-base text-gray-900 font-bold">
          {ticket.ticketDeveloper.length > 1 ? "DEVELOPERS" : "DEVELOPER"}
        </h1>
        <div className="mt-[2px]">
          {ticket.ticketDeveloper.map(({ id, developer }) => (
            <h2 key={id} className="ml-3 text-sm text-gray-900">
              {developer.user.username}
            </h2>
          ))}
        </div>
      </div>
      <div className="my-3">
        <h1 className=" text-base text-gray-900 font-bold">PROJECT</h1>
        <h2 className="ml-3 text-sm text-gray-900 mt-[2px]">
          {ticket.project.name}
        </h2>
      </div>
      <div className="my-3">
        <h1 className=" text-base text-gray-900 font-bold">PRIORITY</h1>
        <h2 className="ml-3 text-sm text-gray-900 mt-[2px]">
          {ticket.priority}
        </h2>
      </div>
      <div className="my-3">
        <h1 className=" text-base text-gray-900 font-bold">STATUS</h1>
        <h2 className="ml-3 text-sm text-gray-900 mt-[2px]">{ticket.status}</h2>
      </div>
      <div className="my-3">
        <h1 className=" text-base text-gray-900 font-bold">TYPE</h1>
        <h2 className="ml-3 text-sm text-gray-900 mt-[2px]">{ticket.type}</h2>
      </div>
      <div className="my-3">
        <h1 className=" text-base text-gray-900 font-bold">CREATED AT</h1>
        <h2 className="ml-3 text-sm text-gray-900 mt-[2px]">
          {moment(ticket.createdAt).format("MMMM Do YYYY, h:mm:ss a")}
        </h2>
      </div>
      <div className="my-3">
        <h1 className=" text-base text-gray-900 font-bold">UPDATED AT</h1>
        <h2 className="ml-3 text-sm text-gray-900 mt-[2px]">
          {moment(ticket.updatedAt).format("MMMM Do YYYY, h:mm:ss a")}
        </h2>
      </div>
    </div>
  );
};

export default Ticket;

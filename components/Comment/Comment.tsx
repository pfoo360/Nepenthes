import { FC } from "react";
import { Ticket } from "../../types/types";
import AddComment from "../AddComment/AddComment";
import ticketOperations from "../../graphql/Ticket/operations";
import { useQuery } from "@apollo/client";

interface CommentProps {
  ticket: Ticket;
}

const Comment: FC<CommentProps> = ({ ticket }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="mx-4 my-4 w-11/12 border border-indigo-500 rounded-sm">
        <div className="bg-indigo-500 px-4 py-2">
          <h1 className="text-gray-50 font-bold">Comments</h1>
        </div>
        <AddComment ticket={ticket} />
      </div>
    </div>
  );
};

export default Comment;

import { FC, useState, useCallback } from "react";
import { TicketComment } from "../../types/types";
import AddComment from "../AddComment/AddComment";
import moment from "moment";

interface CommentProps {
  ticketId: string;
  ticketComment: Array<TicketComment>;
}

const Comment: FC<CommentProps> = ({ ticketId, ticketComment }) => {
  const [comments, setComments] = useState(ticketComment);

  const scrollRef = useCallback((node: HTMLTableRowElement | null) => {
    if (!node) return;
    node.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="mx-4 my-4 w-11/12 border border-indigo-500 rounded-sm">
        <div className="bg-indigo-500 px-4 py-2">
          <h1 className="text-gray-50 font-bold">Comments</h1>
        </div>
        <div className="flex flex-col">
          <div className="h-48 overflow-y-auto">
            <div className="overflow-x-auto sm:-mx-6">
              <div className="py-2 inline-block min-w-full sm:pl-6 lg:pl-8">
                <div className="overflow-hidden">
                  <table className="min-w-full h-4/12 overflow-y-auto">
                    <thead className="border-b">
                      <tr>
                        <th
                          scope="col"
                          className="text-sm font-medium text-gray-900 px-4 py-2 text-left tracking-wide w-4/12"
                        >
                          Commenter
                        </th>
                        <th
                          scope="col"
                          className="text-sm font-medium text-gray-900 px-4 py-2 text-left tracking-wide w-4/12"
                        >
                          Message
                        </th>
                        <th
                          scope="col"
                          className="text-sm font-medium text-gray-900 px-4 py-2 text-left tracking-wide w-4/12"
                        >
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comments.map(
                        (
                          {
                            id: ticketCommentId,
                            ticketId,
                            comment: {
                              id: commentId,
                              comment,
                              author,
                              createdAt,
                            },
                          },
                          index
                        ) => {
                          const DATA = (
                            <>
                              <td
                                className={`text-sm text-gray-900 font-light px-4 py-2 whitespace-normal break-all ${
                                  !author?.user?.username
                                    ? "text-gray-400"
                                    : null
                                }`}
                              >
                                {author?.user?.username ?? `[deleted]`}
                              </td>
                              <td className="text-sm text-gray-900 font-light px-4 py-2 whitespace-normal break-all">
                                {comment}
                              </td>
                              <td className="text-sm text-gray-900 font-light px-4 py-2 whitespace-normal break-words">
                                {moment(createdAt).format(
                                  "MM/DD/YYYY, h:mm:ss a"
                                )}
                              </td>
                            </>
                          );

                          if (index !== comments.length - 1)
                            return (
                              <tr
                                key={ticketCommentId}
                                className="bg-gray-100 border-b"
                              >
                                {DATA}
                              </tr>
                            );

                          if (index === comments.length - 1)
                            return (
                              <tr
                                key={ticketCommentId}
                                className="bg-gray-100 border-b"
                                ref={scrollRef}
                              >
                                {DATA}
                              </tr>
                            );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <AddComment ticketId={ticketId} setComments={setComments} />
      </div>
    </div>
  );
};

export default Comment;

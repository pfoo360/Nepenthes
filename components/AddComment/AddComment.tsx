import {
  FC,
  useState,
  useEffect,
  ChangeEvent,
  MouseEvent,
  Dispatch,
  SetStateAction,
} from "react";
import { TicketComment, WorkspaceUser } from "../../types/types";
import ticketOperations from "../../graphql/Ticket/operations";
import { useMutation } from "@apollo/client";
import useUserContext from "../../hooks/useUserContext";
import useWorkspaceContext from "../../hooks/useWorkspaceContext";
import useWorkspaceUserContext from "../../hooks/useWorkspaceUserContext";
import useProjectContext from "../../hooks/useProjectContext";

interface AddCommentProps {
  ticketId: string;
  setComments: Dispatch<SetStateAction<TicketComment[]>>;
}

const AddComment: FC<AddCommentProps> = ({ ticketId, setComments }) => {
  const userCtx = useUserContext();
  const workspaceCtx = useWorkspaceContext();
  const workspaceUserCtx = useWorkspaceUserContext();
  const projectCtx = useProjectContext();

  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState(false);

  const [createComment, { data, loading: isSubmitting, error }] = useMutation<
    {
      createComment: {
        id: string;
        ticketId: string;
        comment: {
          id: string;
          comment: string;
          author: WorkspaceUser;
          createdAt: Date;
        };
      };
    },
    {
      comment: string;
      workspaceId: string;
      projectId: string;
      ticketId: string;
    }
  >(ticketOperations.Mutation.CREATE_COMMENT, {
    onError: (error, clientOptions) => {},
    update: (cache, { data }) => {
      if (!data) return;

      setComments((prev) => [...prev, data.createComment]);
    },
    onCompleted: (data, clientOptions) => {
      setComment("");
    },
  });

  const handleCommentInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setComment(e.target.value);
  };

  useEffect(() => {
    setCommentError(false);
    if (!comment) setCommentError(true);
    if (comment.length > 120) setCommentError(true);
  }, [comment]);

  const handleAddCommentSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (commentError) return;
    if (isSubmitting) return;
    if (!workspaceUserCtx?.workspaceId || !projectCtx?.id || !ticketId) return;

    await createComment({
      variables: {
        comment,
        workspaceId: workspaceUserCtx.workspaceId,
        projectId: projectCtx.id,
        ticketId,
      },
    });
  };

  if (!userCtx || !workspaceCtx || !workspaceUserCtx || !projectCtx)
    return null;
  if (workspaceUserCtx.userId !== userCtx.id) return null;
  if (workspaceUserCtx.workspaceId !== workspaceCtx.id) return null;
  if (projectCtx.workspaceId !== workspaceUserCtx.workspaceId) return null;

  return (
    <div className="bg-gray-50 h-auto flex flex-col">
      <form className="flex flex-row justify-center">
        <input
          type="text"
          id="comment"
          name="comment"
          value={comment}
          onChange={handleCommentInputChange}
          disabled={isSubmitting}
          required
          placeholder="Add a comment..."
          className={`border border-gray-300 rounded-sm w-full px-2 py-1 text-base text-gray-900 placeholder-gray-300 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200`}
        />
        <button
          type="submit"
          onClick={handleAddCommentSubmit}
          disabled={commentError || isSubmitting}
          className={`flex-shrink-0 bg-indigo-500 rounded-sm py-1 px-2 text-gray-50 text-xl hover:bg-indigo-600 active:bg-indigo-700 focus:outline-none disabled:bg-indigo-400`}
        >
          Add
        </button>
      </form>
    </div>
  );
};

export default AddComment;

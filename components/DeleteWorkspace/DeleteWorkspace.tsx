import { FC, MouseEvent, useState } from "react";
import Modal from "../Modal/Modal";
import Error from "../Error/Error";
import { useMutation } from "@apollo/client";
import workspaceOperations from "../../graphql/Workspace/operations";
import userOperations from "../../graphql/User/operations";
import { Role } from "../../types/types";

interface DeleteWorkspace {
  workspaceId: string;
  workspaceName: string;
}

const DeleteWorkspace: FC<DeleteWorkspace> = ({
  workspaceId,
  workspaceName,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleModalOpen = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleModalClose = (
    e: MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError("");
    setIsModalOpen(false);
  };

  const [deleteWorkspace, { loading: isSubmitting }] = useMutation<
    { deleteWorkspace: { id: string; name: string } },
    { workspaceId: string }
  >(workspaceOperations.Mutation.DELETE_WORKSPACE, {
    onError: (error, clientOptions) => {
      setSubmitError(error.message);
    },
    update: (cache, { data }) => {
      if (!data) return;
      const oldCache = cache.readQuery<{
        me: {
          __typename: "Me";
          myWorkspaces: {
            role: Role;
            workspace: { id: string; name: string; __typename: "Workspace" };
            __typename: "MyWorkspace";
          }[];
        };
      }>({
        query: userOperations.Query.GET_CURRENT_USERS_WORKSPACES,
      });

      if (!oldCache) return;

      const updatedArray = oldCache.me.myWorkspaces.filter(
        (myWorkspace) => myWorkspace.workspace.id !== data.deleteWorkspace.id
      );

      cache.writeQuery({
        query: userOperations.Query.GET_CURRENT_USERS_WORKSPACES,
        data: {
          ...oldCache,
          me: { ...oldCache.me, myWorkspaces: updatedArray },
        },
      });
    },
    onCompleted: (data, clientOptions) => {
      setSubmitError("");
      setIsModalOpen(false);
    },
  });

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isSubmitting || !workspaceId) return;
    setSubmitError("");
    await deleteWorkspace({ variables: { workspaceId } });
  };

  if (!workspaceId) return null;

  return (
    <>
      <button
        onClick={handleModalOpen}
        className={`mx-1 my-2 py-0.5 px-1 bg-rose-400 rounded-sm text-gray-50 hover:bg-rose-500 active:bg-rose-600 focus:outline-none focus:ring focus:ring-rose-300 disabled:bg-rose-400`}
      >
        Delete
      </button>
      <Modal open={isModalOpen} onClose={handleModalClose}>
        <form className="p-2 rounded relative bg-gray-50 w-72 h-auto flex flex-col ">
          <p>{`Are you sure you want to delete ${workspaceName}?`}</p>
          {submitError ? <Error message={submitError} /> : null}
          <div className="flex flex-row justify-end mt-4">
            <button
              onClick={handleModalClose}
              disabled={isSubmitting}
              className={`false-shrink-0 bg-slate-300 rounded-sm py-1 px-2 mr-2 text-gray-50 text-xl hover:bg-slate-500 active:bg-slate-700 focus:outline-none focus:ring focus:ring-slate-300 disabled:bg-slate-200`}
            >
              Close
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || !workspaceId}
              className={`flex-shrink-0 bg-rose-500 rounded-sm py-1 px-2 text-gray-50 text-xl hover:bg-rose-600 active:bg-rose-700 focus:outline-none focus:ring focus:ring-rose-300 disabled:bg-rose-400`}
            >
              Delete
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default DeleteWorkspace;

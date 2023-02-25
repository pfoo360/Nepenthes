import { FC, MouseEvent, ChangeEvent, useCallback, useState } from "react";
import Modal from "../Modal/Modal";
import Error from "../Error/Error";
import { useMutation } from "@apollo/client";
import workspaceOperations from "../../graphql/Workspace/operations";
import userOperations from "../../graphql/User/operations";
import { Role } from "../../types/types";
import ROLES from "../../utils/role";

interface UpdateWorkspaceNameProps {
  workspaceId: string;
  oldWorkspaceName: string;
}

const UpdateWorkspaceName: FC<UpdateWorkspaceNameProps> = ({
  workspaceId,
  oldWorkspaceName,
}) => {
  if (!workspaceId) return null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState(oldWorkspaceName ?? "");
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
    setNewName(oldWorkspaceName);
    setIsModalOpen(false);
  };

  const handleNewNameInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setNewName(e.target.value);
  };

  const inputRef = useCallback((node: HTMLInputElement | null) => {
    if (!node) return;
    node.focus();
  }, []);

  const [updateWorkspaceName, { loading: isSubmitting, data }] = useMutation<
    { updateWorkspaceName: { id: string; name: string } },
    { workspaceId: string; newName: string }
  >(workspaceOperations.Mutation.UPDATE_WORKSPACE_NAME, {
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

      const updatedArray = oldCache.me.myWorkspaces.map((myWorkspace) => {
        if (myWorkspace.workspace.id !== data.updateWorkspaceName.id)
          return myWorkspace;
        if (myWorkspace.workspace.id === data.updateWorkspaceName.id)
          return {
            ...myWorkspace,
            workspace: {
              ...myWorkspace.workspace,
              name: data.updateWorkspaceName.name,
            },
          };
      });

      cache.writeQuery({
        query: userOperations.Query.GET_CURRENT_USERS_WORKSPACES,
        data: {
          ...oldCache,
          me: {
            ...oldCache.me,
            myWorkspaces: updatedArray,
          },
        },
      });
    },
    onCompleted: (data, clientOptions) => {
      setSubmitError("");
      setIsModalOpen(false);
    },
  });

  const handleNewNameInputSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!newName || newName.length > 25 || newName === oldWorkspaceName) return;
    await updateWorkspaceName({ variables: { workspaceId, newName } });
  };

  return (
    <>
      <button
        onClick={handleModalOpen}
        className={`mx-1 my-2 py-0.5 px-1 bg-amber-400 rounded-sm text-gray-50 hover:bg-amber-500 active:bg-amber-600 focus:outline-none focus:ring focus:ring-amber-300 disabled:bg-amber-400`}
      >
        Edit
      </button>
      <Modal open={isModalOpen} onClose={handleModalClose}>
        <form className="p-2 rounded relative bg-gray-50 w-72 h-auto flex flex-col ">
          <input
            type="text"
            id="newName"
            name="newName"
            value={newName}
            onChange={handleNewNameInputChange}
            required
            ref={inputRef}
            disabled={isSubmitting}
            placeholder="New name"
            className={`border border-gray-300 rounded-sm px-2 w-full py-1 mt-5 mb-3 text-4xl text-gray-900 placeholder-gray-300 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200`}
          />
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
              onClick={handleNewNameInputSubmit}
              disabled={
                isSubmitting ||
                !newName ||
                newName.length > 25 ||
                newName === oldWorkspaceName
              }
              className={`flex-shrink-0 bg-indigo-500 rounded-sm py-1 px-2 text-gray-50 text-xl hover:bg-indigo-600 active:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-300 disabled:bg-indigo-400`}
            >
              Update
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default UpdateWorkspaceName;

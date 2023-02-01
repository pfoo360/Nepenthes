import { FC, useState, MouseEvent, ChangeEvent, useCallback } from "react";
import Modal from "../Modal/Modal";
import workspaceOperations from "../../graphql/Workspace/operations";
import { useMutation } from "@apollo/client";
import { Role } from "../../types/types";
import userOperations from "../../graphql/User/operations";

interface AddWorkSpaceProps {}

const AddWorkspace: FC<AddWorkSpaceProps> = () => {
  //if (!session) return null;

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");

  const handleModalOpen = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setModalIsOpen(true);
  };

  const handleModalClose = (
    e: MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>
  ) => {
    e.preventDefault();

    if (isSubmitting) return; //prevent modal from closing when submitting to backend
    setWorkspaceName("");
    setModalIsOpen(false);
  };

  const handleWorkspaceNameInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setWorkspaceName(e.target.value);
  };

  const inputRef = useCallback((node: HTMLInputElement | null) => {
    if (!node) return;
    node.focus();
  }, []);

  const [
    createWorkspace,
    {
      loading: isSubmitting,
      data: createWorkspaceData,
      error: createWorkspaceError,
    },
  ] = useMutation<
    {
      createWorkspace: {
        id: string;
        name: string;
        workspaceUser: { role: Role }[];
      };
    },
    { workspaceName: string }
  >(workspaceOperations.Mutation.CREATE_WORKSPACE, {
    update: (cache, { data }) => {
      if (!data) return;

      const oldCache = cache.readQuery<{
        me: {
          __typename: "Me";
          myWorkspace: {
            role: Role;
            workspace: { id: string; name: string; __typename: "Wrkspc" };
            __type: "MyWorkspace";
          }[];
        };
      }>({
        query: userOperations.Query.GET_CURRENT_USERS_WORKSPACES,
      });

      if (!oldCache) return;

      //console.log(oldCache);

      const newlyCreatedWorkspace = {
        role: data.createWorkspace.workspaceUser[0].role,
        workspace: {
          id: data.createWorkspace.id,
          name: data.createWorkspace.name,
          __typename: "Wrkspc",
        },
        __typename: "MyWorkspace",
      };

      cache.writeQuery({
        query: userOperations.Query.GET_CURRENT_USERS_WORKSPACES,
        data: {
          ...oldCache,
          me: {
            ...oldCache.me,
            myWorkspace: [newlyCreatedWorkspace, ...oldCache.me.myWorkspace],
          },
        },
      });

      // const newCache = cache.readQuery<{
      //   me: {
      //     myWorkspace: {
      //       role: Role;
      //       workspace: { id: string; name: string };
      //     }[];
      //   };
      // }>({
      //   query: userOperations.Query.GET_CURRENT_USERS_WORKSPACES,
      // });

      // console.log(newCache);
    },
    onCompleted: () => {
      setWorkspaceName("");
      setModalIsOpen(false);
    },
    // refetchQueries: [
    //   { query: userOperations.Query.GET_CURRENT_USERS_WORKSPACES },
    // ],
  });

  const handleWorkspaceNameSubmit = async (
    e: MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (!workspaceName || workspaceName.length > 25) return;
    await createWorkspace({ variables: { workspaceName } });
  };

  return (
    <>
      <button
        onClick={handleModalOpen}
        className={`w-5/6 my-8 py-3 bg-indigo-500 rounded-sm text-gray-50 hover:bg-indigo-600 active:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-300 disabled:bg-indigo-400`}
      >
        Add workspace
      </button>
      <Modal open={modalIsOpen} onClose={handleModalClose}>
        <form className="p-2 rounded relative bg-gray-50 w-80 h-44">
          <input
            type="text"
            id="workspaceName"
            name="workspaceName"
            value={workspaceName}
            onChange={handleWorkspaceNameInputChange}
            ref={inputRef}
            disabled={isSubmitting}
            placeholder="Workspace name"
            className={`static border border-gray-300 rounded-sm px-2 w-full py-1 mt-8 mb-16 text-4xl placeholder-gray-300 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200`}
          />
          <button
            onClick={handleModalClose}
            disabled={isSubmitting}
            className={`absolute bottom-2 right-24 flex-shrink-0 bg-slate-300 rounded-sm py-1 px-2 text-gray-50 text-xl hover:bg-slate-500 active:bg-slate-700 focus:outline-none focus:ring focus:ring-slate-300 disabled:bg-slate-200`}
          >
            Close
          </button>
          <button
            type="submit"
            onClick={handleWorkspaceNameSubmit}
            disabled={isSubmitting}
            className={`absolute bottom-2 right-2 flex-shrink-0 bg-indigo-500 rounded-sm py-1 px-2 text-gray-50 text-xl hover:bg-indigo-600 active:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-300 disabled:bg-indigo-400`}
          >
            Submit
          </button>
        </form>
      </Modal>
    </>
  );
};

export default AddWorkspace;

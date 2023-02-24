import { useMutation } from "@apollo/client";
import { FC, useState, MouseEvent, ChangeEvent, useCallback } from "react";
import useUserContext from "../../hooks/useUserContext";
import useWorkspaceContext from "../../hooks/useWorkspaceContext";
import useWorkspaceUserContext from "../../hooks/useWorkspaceUserContext";
import ROLES from "../../utils/role";
import Modal from "../Modal/Modal";
import Error from "../Error/Error";
import workspaceOperations from "../../graphql/Workspace/operations";
import { Role, User } from "../../types/types";

const AddUserToWorkspace: FC = () => {
  const workspaceUser = useWorkspaceUserContext();
  const workspace = useWorkspaceContext();
  const user = useUserContext();
  if (
    !workspaceUser ||
    workspaceUser.role !== ROLES.ADMIN ||
    !workspace?.id ||
    !user
  )
    return null;

  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState(ROLES.DEVELOPER);
  const [error, setError] = useState("");

  const handleModalOpen = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setOpen(true);
  };

  const handleModalClose = (
    e: MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    if (isSubmitting) return; //prevent modal from closing when submitting to backend

    //reset form to initial state
    setUsername("");
    setRole(ROLES.DEVELOPER);
    setError("");

    setOpen(false);
  };

  const handleUsernameInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setUsername(e.target.value);
  };

  const handleRoleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    setRole(e.target.value);
  };

  const inputRef = useCallback((node: HTMLInputElement | null) => {
    if (!node) return;
    node.focus();
  }, []);

  const [addUserToWorkspace, { loading: isSubmitting, data }] = useMutation<
    { addUserToWorkspace: { role: Role; user: User } },
    { username: string; role: Role; workspaceId: string }
  >(workspaceOperations.Mutation.ADD_USER_TO_WORKSPACE, {
    onError: (error, clientOptions) => {
      setError(error.message);
      console.log("ONERROR", error.message);
    },
    update: (cache, { data }) => {
      if (!data) return;
      console.log("UPDATE", data);

      //fetch the cached workspace's Users items with variable workspace ID equal to current workspace ID
      const oldCache = cache.readQuery<{
        getWorkspacesUsers: Array<{
          role: Role;
          user: User & { __typename: "User" };
          __typename: "WorkspaceUser";
        }>;
      }>({
        query: workspaceOperations.Query.GET_WORKSPACES_USERS,
        variables: { workspaceId: workspaceUser.workspaceId },
      });

      if (!oldCache) return;
      console.log("OC", oldCache);

      cache.writeQuery({
        query: workspaceOperations.Query.GET_WORKSPACES_USERS,
        variables: { workspaceId: workspaceUser.workspaceId },
        data: {
          ...oldCache,
          getWorkspacesUsers: [
            data.addUserToWorkspace, //is the new user in the workspace
            ...oldCache.getWorkspacesUsers, //is the old users in the workspace
          ],
        },
      });

      const updatedCache = cache.readQuery<{
        getWorkspacesUsers: Array<{
          role: Role;
          user: User & { __typename: "User" };
          __typename: "WorkspaceUser";
        }>;
      }>({
        query: workspaceOperations.Query.GET_WORKSPACES_USERS,
        variables: { workspaceId: workspaceUser.workspaceId },
      });

      console.log("NC", updatedCache);
    },
    onCompleted: (data, clientOptions) => {
      //reset form to initial state ad close modal
      setUsername("");
      setRole(ROLES.DEVELOPER);
      setError("");
      setOpen(false);
    },
  });

  const handleUsernameInputSubmit = async (
    e: MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();

    //prevent submit if user is not apart of workspace
    if (user.id !== workspaceUser.userId) return;
    if (workspace.id !== workspaceUser.workspaceId) return;

    if (workspaceUser.role !== ROLES.ADMIN) return; //prevent submit if current user is not ADMIN

    if (!username) return; //prevent submit if user did not enter a username

    if (
      role !== ROLES.ADMIN &&
      role !== ROLES.MANAGER &&
      role !== ROLES.DEVELOPER
    )
      return; //prevent submit if user selected an invalid ROLE

    setError("");
    console.log(
      "ADDUSER",
      workspaceUser.userId,
      user.id,
      workspace.id,
      workspaceUser.workspaceId
    );
    console.log(username, role);
    await addUserToWorkspace({
      variables: { username, role: role as Role, workspaceId: workspace.id },
    });
  };

  return (
    <>
      <div className="flex flex-col items-center my-2">
        <button
          onClick={handleModalOpen}
          className={`py-3 px-2 bg-indigo-500 rounded-sm text-gray-50 hover:bg-indigo-600 active:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-300 disabled:bg-indigo-400`}
        >
          Add user to workspace
        </button>
      </div>
      <Modal open={open} onClose={handleModalClose}>
        <form className="p-2 rounded relative bg-gray-50 w-full h-auto flex flex-col">
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={handleUsernameInputChange}
            ref={inputRef}
            disabled={isSubmitting}
            placeholder="Username"
            className={`border border-gray-300 rounded-sm px-2 w-full py-1 mt-5 mb-3 text-4xl text-gray-900 placeholder-gray-300 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200`}
          />
          <select
            onChange={handleRoleSelectChange}
            value={role}
            disabled={isSubmitting}
            className={`border border-gray-300 rounded-sm px-2 w-full py-1 mb-6 text-lg text-gray-900 placeholder-gray-300 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200`}
          >
            <option value={ROLES.DEVELOPER}>{ROLES.DEVELOPER}</option>
            <option value={ROLES.MANAGER}>{ROLES.MANAGER}</option>
            <option value={ROLES.ADMIN}>{ROLES.ADMIN}</option>
          </select>
          {error ? <Error message={error} /> : null}
          <div className="flex flex-row justify-end mt-4">
            <button
              onClick={handleModalClose}
              disabled={isSubmitting}
              className={`flex-shrink-0 bg-slate-300 rounded-sm py-1 px-2 mr-2 text-gray-50 text-xl hover:bg-slate-500 active:bg-slate-700 focus:outline-none focus:ring focus:ring-slate-300 disabled:bg-slate-200`}
            >
              Close
            </button>
            <button
              type="submit"
              onClick={handleUsernameInputSubmit}
              disabled={isSubmitting}
              className={`flex-shrink-0 bg-indigo-500 rounded-sm py-1 px-2 text-gray-50 text-xl hover:bg-indigo-600 active:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-300 disabled:bg-indigo-400`}
            >
              Add
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default AddUserToWorkspace;

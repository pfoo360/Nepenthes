import { useMutation } from "@apollo/client";
import { FC, useState, MouseEvent } from "react";
import useUserContext from "../../hooks/useUserContext";
import useWorkspaceContext from "../../hooks/useWorkspaceContext";
import useWorkspaceUserContext from "../../hooks/useWorkspaceUserContext";
import { Role, User } from "../../types/types";
import ROLES from "../../utils/role";
import Modal from "../Modal/Modal";
import workspaceOperations from "../../graphql/Workspace/operations";
import Error from "../Error/Error";
import { useRouter } from "next/router";

const DeleteUser: FC<{ user: User }> = ({ user }) => {
  //button is only visible if current user is ADMIN
  const userCtx = useUserContext();
  const workspaceCtx = useWorkspaceContext();
  const workspaceUserCtx = useWorkspaceUserContext();
  if (!userCtx || !workspaceCtx || !workspaceUserCtx) return null;
  if (userCtx.id !== workspaceUserCtx.userId) return null;
  if (workspaceCtx.id !== workspaceUserCtx.workspaceId) return null;
  if (workspaceUserCtx.role !== ROLES.ADMIN) return null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  const { push } = useRouter();

  const handleModalOpen = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleModalClose = (
    e: MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");
    setIsModalOpen(false);
  };

  const [deleteUser, { loading: isSubmitting, data }] = useMutation<
    { deleteUserFromWorkspace: { user: User; role: Role } },
    { userId: string; workspaceId: string }
  >(workspaceOperations.Mutation.DELETE_A_USER, {
    onError: (error, clientOptions) => {
      console.log("DELETEUSERERROR", error.message);
      setError(error.message);
    },
    update: (cache, { data }) => {
      if (!data) return;

      if (data.deleteUserFromWorkspace.user.id === userCtx.id) {
        //only ADMINs in a workspace can see the admin panel and delete users
        //if current user has come this far, then they are most likely an ADMIN in the current workspace
        //workspaceUserCtx cannot to updated manually, so if current user is deleting theselves, then force them back to dashboard page. This will also update workspaceUsersCtx, userCx, and workspaceCtx
        push("/dash");
      }

      const oldCache = cache.readQuery<{
        getWorkspacesUsers: Array<{
          role: Role;
          user: User & { __typename: "User" };
          __typename: "WorkspaceUser";
        }>;
      }>({
        query: workspaceOperations.Query.GET_WORKSPACES_USERS,
        variables: { workspaceId: workspaceCtx.id },
      });

      if (!oldCache) return;

      const updatedArray = oldCache.getWorkspacesUsers.filter(
        (workspaceUser) => {
          if (workspaceUser.user.id !== data.deleteUserFromWorkspace.user.id)
            return workspaceUser;
        }
      );

      cache.writeQuery({
        query: workspaceOperations.Query.GET_WORKSPACES_USERS,
        variables: { workspaceId: workspaceCtx.id },
        data: { ...oldCache, getWorkspacesUsers: updatedArray },
      });

      const updatedCache = cache.readQuery<{
        getWorkspacesUsers: Array<{
          role: Role;
          user: User & { __typename: "User" };
          __typename: "WorkspaceUser";
        }>;
      }>({
        query: workspaceOperations.Query.GET_WORKSPACES_USERS,
        variables: { workspaceId: workspaceCtx.id },
      });

      console.log("OC", oldCache);
      console.log("UA", updatedArray);
      console.log("UC", updatedCache);
    },
    onCompleted: (data, clientOptions) => {
      setError("");
      setIsModalOpen(false);
      console.log("DELETEUSERCOMPLETE", data);
    },
  });

  const handleDeleteSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (userCtx.id !== workspaceUserCtx.userId) return; //make sure user submitting is apart of the workspace
    if (workspaceCtx.id !== workspaceUserCtx.workspaceId) return;
    if (workspaceUserCtx.role !== ROLES.ADMIN) return; //make sure user submitting is an ADMIN in the workspace

    //make sure args are valid
    if (!user.id || !workspaceCtx.id) return;

    setError("");

    console.log(user.id, workspaceCtx.id);
    await deleteUser({
      variables: { userId: user.id, workspaceId: workspaceCtx.id },
    });
  };

  return (
    <>
      <button
        onClick={handleModalOpen}
        className={`py-0.5 px-1 bg-rose-400 rounded-sm text-gray-50 hover:bg-rose-500 active:bg-rose-600 focus:outline-none focus:ring focus:ring-rose-300 disabled:bg-rose-400`}
      >
        delete
      </button>
      <Modal open={isModalOpen} onClose={handleModalClose}>
        <form className="p-2 rounded relative bg-gray-50 w-72 h-auto flex flex-col">
          {error ? <Error message={error} /> : null}
          <p>{`Are you sure you want to remove ${user.username} from the workspace?`}</p>
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
              onClick={handleDeleteSubmit}
              disabled={isSubmitting}
              className={`flex-shrink-0 bg-indigo-500 rounded-sm py-1 px-2 text-gray-50 text-xl hover:bg-indigo-600 active:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-300 disabled:bg-indigo-400`}
            >
              Delete
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default DeleteUser;

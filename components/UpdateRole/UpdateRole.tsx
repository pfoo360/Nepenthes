import { useMutation } from "@apollo/client";
import { ChangeEvent, FC, MouseEvent, useState } from "react";
import useUserContext from "../../hooks/useUserContext";
import useWorkspaceContext from "../../hooks/useWorkspaceContext";
import useWorkspaceUserContext from "../../hooks/useWorkspaceUserContext";
import { Role, User } from "../../types/types";
import ROLES from "../../utils/role";
import Modal from "../Modal/Modal";
import Error from "../Error/Error";
import workspaceOperations from "../../graphql/Workspace/operations";

const UpdateRole: FC<{ user: User; role: Role }> = ({ user, role }) => {
  //button is only visible if current user is ADMIN
  const userCtx = useUserContext();
  const workspaceCtx = useWorkspaceContext();
  const workspaceUserCtx = useWorkspaceUserContext();
  if (!userCtx || !workspaceCtx || !workspaceUserCtx) return null;
  if (userCtx.id !== workspaceUserCtx.userId) return null;
  if (workspaceCtx.id !== workspaceUserCtx.workspaceId) return null;
  if (workspaceUserCtx.role !== ROLES.ADMIN) return null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRole, setNewRole] = useState(role);
  const [error, setError] = useState("");

  const originalRole = role; //used to reset the form to original role

  const handleModalOpen = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log(user.id, workspaceCtx.id);
    setIsModalOpen(true);
  };

  const handleModalClose = (
    e: MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError("");
    setNewRole(originalRole);
    setIsModalOpen(false);
  };

  const handleNewRoleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    setNewRole(e.target.value as Role);
  };

  const [updateUserRole, { loading: isSubmitting, data }] = useMutation<
    { updateUserRole: { user: User; role: Role } },
    { userId: string; role: Role; workspaceId: string }
  >(workspaceOperations.Mutation.UPDATE_A_USERS_ROLE, {
    onError: (error, clientOptions) => {
      console.log("UPDATEROLEERROR", error.message);
      setError(error.message);
    },
    update: (cache, { data }) => {
      if (!data) return;

      if (data?.updateUserRole.user.id === userCtx.id) {
        //only ADMINs in a workspace can update roles
        //if current user has come this far, then they are most likely an ADMIN in the current workspace
        //workspaceUserCtx cannot to updated manually, so if current user is updating their own ADMIN role to a non-ADMIN roles, then force a refresh of the page. This will update workspaceUsersCtx
        location.reload();
      }

      console.log("UPDATEROLEUPDATE", data.updateUserRole.user.id);
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

      const updatedArray = oldCache.getWorkspacesUsers.map((workspaceUser) => {
        console.log(workspaceUser.user.id, data.updateUserRole.user.id);
        if (workspaceUser.user.id !== data.updateUserRole.user.id)
          return workspaceUser;
        if (workspaceUser.user.id === data.updateUserRole.user.id)
          return data.updateUserRole;
      });

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
      console.log("UPDATEROLEONCOMPLETED", data);
    },
  });

  const handleUpdateRoleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (userCtx.id !== workspaceUserCtx.userId) return; //make sure user submitting is apart of the workspace
    if (workspaceCtx.id !== workspaceUserCtx.workspaceId) return;
    if (workspaceUserCtx.role !== ROLES.ADMIN) return; //make sure user is an ADMIN in the workspace

    //make sure args are valid
    if (!user.id || !workspaceCtx.id) return;
    if (
      newRole !== ROLES.ADMIN &&
      newRole !== ROLES.MANAGER &&
      newRole !== ROLES.DEVELOPER
    )
      return;

    if (newRole === originalRole) return;

    setError("");

    console.log(user.id, workspaceCtx.id, newRole);
    await updateUserRole({
      variables: {
        userId: user.id,
        workspaceId: workspaceCtx.id,
        role: newRole,
      },
    });
  };

  return (
    <>
      <button
        onClick={handleModalOpen}
        className={`py-0.5 px-1 bg-amber-400 rounded-sm text-gray-50 hover:bg-amber-500 active:bg-amber-600 focus:outline-none focus:ring focus:ring-amber-300 disabled:bg-amber-400`}
      >
        update role
      </button>
      <Modal open={isModalOpen} onClose={handleModalClose}>
        <form className="p-2 rounded relative bg-gray-50 w-72 h-auto flex flex-col">
          <select
            value={newRole}
            onChange={handleNewRoleSelectChange}
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
              onClick={handleUpdateRoleSubmit}
              disabled={isSubmitting}
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

export default UpdateRole;

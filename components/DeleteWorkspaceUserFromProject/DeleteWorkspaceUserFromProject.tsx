import { FC, useState, MouseEvent, Dispatch, SetStateAction } from "react";
import useUserContext from "../../hooks/useUserContext";
import useWorkspaceContext from "../../hooks/useWorkspaceContext";
import useWorkspaceUserContext from "../../hooks/useWorkspaceUserContext";
import useProjectContext from "../../hooks/useProjectContext";
import Modal from "../Modal/Modal";
import Error from "../Error/Error";
import { User, Role } from "../../types/types";
import ROLES from "../../utils/role";
import { useMutation } from "@apollo/client";
import projectOperations from "../../graphql/Project/operations";
import apolloClient from "../../lib/apolloClient";

interface DeleteWorkspaceUserFromProjectProps {
  projectWorkspaceUserId: string;
  workspaceUser: { id: string; user: User; role: Role };
  page: number;
  setWorkspaceUsersNotApartOfTheProject: Dispatch<
    SetStateAction<
      {
        id: string;
        user: User;
        role: Role;
      }[]
    >
  >;
  setWorkspaceUsersApartOfTheProject: Dispatch<
    SetStateAction<
      {
        workspaceUser: {
          id: string;
          user: User;
          role: Role;
        };
      }[]
    >
  >;
}

const DeleteWorkspaceUserFromProject: FC<
  DeleteWorkspaceUserFromProjectProps
> = ({
  projectWorkspaceUserId,
  workspaceUser,
  page,
  setWorkspaceUsersNotApartOfTheProject,
  setWorkspaceUsersApartOfTheProject,
}) => {
  const userCtx = useUserContext();
  const workspaceCtx = useWorkspaceContext();
  const workspaceUserCtx = useWorkspaceUserContext();
  const projectCtx = useProjectContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [
    deleteWorkspaceUserFromProject,
    { loading: isSubmitting, data, error },
  ] = useMutation<
    {
      deleteWorkspaceUserFromProject: {
        id: string;
        workspaceUser: { id: string; user: User; role: Role };
      };
    },
    { workspaceId: string; projectId: string; projectWorkspaceUserId: string }
  >(projectOperations.Mutation.DELETE_WORKSPACEUSER_FROM_PROJECT, {
    onError: (error, clientOptions) => {
      setSubmitError(error.message);
    },
    update: async (cache, { data }) => {
      if (!data) return;

      setWorkspaceUsersNotApartOfTheProject((prev) => {
        return [
          ...prev,
          {
            id: data.deleteWorkspaceUserFromProject.workspaceUser.id,
            user: data.deleteWorkspaceUserFromProject.workspaceUser.user,
            role: data.deleteWorkspaceUserFromProject.workspaceUser.role,
          },
        ];
      });

      setWorkspaceUsersApartOfTheProject((prev) => {
        return prev.filter(
          (workspaceUser) =>
            workspaceUser.workspaceUser.id !==
            data.deleteWorkspaceUserFromProject.workspaceUser.id
        );
      });

      await apolloClient.resetStore();

      // const oldCache = cache.readQuery<{
      //   getProjectsWorkspaceUsers: Array<{
      //     id: string;
      //     workspaceUser: { id: string; user: User; role: Role };
      //   }>;
      // }>({
      //   query: projectOperations.Query.GET_PROJECTS_WORKSPACEUSERS,
      //   variables: {
      //     projectId: projectCtx.id,
      //     workspaceId: workspaceCtx.id,
      //     page,
      //   },
      // });
      // if (!oldCache) return;

      // const updatedArray = oldCache.getProjectsWorkspaceUsers.filter(
      //   (projectWorkspaceUser) =>
      //     projectWorkspaceUser.id !== data.deleteWorkspaceUserFromProject.id
      // );

      // cache.writeQuery({
      //   query: projectOperations.Query.GET_PROJECTS_WORKSPACEUSERS,
      //   variables: {
      //     projectId: projectCtx.id,
      //     workspaceId: workspaceCtx.id,
      //     page,
      //   },
      //   data: { ...oldCache, getProjectsWorkspaceUsers: updatedArray },
      // });
    },
    onCompleted: (data, clientOptions) => {
      setSubmitError("");
      setIsModalOpen(false);
    },
  });

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

  const handleDeleteWorkspaceUserFromProjectSubmit = async (
    e: MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!projectCtx?.id || !workspaceCtx?.id) return;

    setSubmitError("");

    await deleteWorkspaceUserFromProject({
      variables: {
        projectId: projectCtx.id,
        workspaceId: workspaceCtx.id,
        projectWorkspaceUserId,
      },
    });
  };

  if (!userCtx || !workspaceCtx || !workspaceUserCtx || !projectCtx)
    return null;
  if (workspaceUserCtx.userId !== userCtx.id) return null;
  if (workspaceUserCtx.workspaceId !== workspaceCtx.id) return null;
  if (projectCtx.workspaceId !== workspaceCtx.id) return null;
  if (
    workspaceUserCtx.role !== ROLES.ADMIN &&
    workspaceUserCtx.role !== ROLES.MANAGER
  )
    return null;

  return (
    <>
      <button
        onClick={handleModalOpen}
        className={`py-0.5 px-1 bg-rose-400 rounded-sm text-gray-50 hover:bg-rose-500 active:bg-rose-600 focus:outline-none focus:ring focus:ring-rose-300 disabled:bg-rose-400`}
      >
        Delete
      </button>
      <Modal open={isModalOpen} onClose={handleModalClose}>
        <form className="p-2 rounded relative bg-gray-50 w-[300px] h-auto flex flex-col">
          {error ? <Error message={submitError} /> : null}
          <p>{`Are you sure you want to remove ${workspaceUser.user.username} from the project?`}</p>
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
              onClick={handleDeleteWorkspaceUserFromProjectSubmit}
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

export default DeleteWorkspaceUserFromProject;

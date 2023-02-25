import { FC, useState, MouseEvent } from "react";
import useUserContext from "../../hooks/useUserContext";
import useWorkspaceContext from "../../hooks/useWorkspaceContext";
import useWorkspaceUserContext from "../../hooks/useWorkspaceUserContext";
import useProjectContext from "../../hooks/useProjectContext";
import Modal from "../Modal/Modal";
import Error from "../Error/Error";
import ROLES from "../../utils/role";
import { useMutation } from "@apollo/client";
import projectOperations from "../../graphql/Project/operations";
import userOperations from "../../graphql/User/operations";
import { Project } from "../../types/types";
import { useRouter } from "next/router";

const DeleteProject: FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const { push } = useRouter();

  const userCtx = useUserContext();
  const workspaceCtx = useWorkspaceContext();
  const workspaceUserCtx = useWorkspaceUserContext();
  const projectCtx = useProjectContext();

  const [deleteProject, { loading: isSubmitting, error, data }] = useMutation<
    { deleteProject: Project },
    { projectId: string; workspaceId: string }
  >(projectOperations.Mutation.DELETE_PROJECT, {
    onError: (error, clientOptions) => {
      setSubmitError(error.message);
    },
    update: (cache, { data }) => {
      if (!data) return;
      if (!workspaceCtx?.id) return;

      const oldCache = cache.readQuery<{
        me: { myProjects: Project[] };
      }>({
        query: userOperations.Query.GET_CURRENT_USERS_PROJECTS,
        variables: { workspaceId: workspaceCtx.id },
      });
      if (!oldCache) return;

      const updatedListOfCurrentUsersProjects = oldCache.me.myProjects.filter(
        (project) => project.id !== data.deleteProject.id
      );

      cache.writeQuery({
        query: userOperations.Query.GET_CURRENT_USERS_PROJECTS,
        variables: { workspaceId: workspaceCtx.id },
        data: {
          ...oldCache,
          me: { ...oldCache.me, myProjects: updatedListOfCurrentUsersProjects },
        },
      });
    },
    onCompleted: (data, clientOptions) => {
      setSubmitError("");
      setSubmitSuccess("Successfully deleted project!");
      push(`/projects/${data.deleteProject.workspaceId}`);
    },
  });

  const handleModalOpen = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setModalOpen(true);
  };

  const handleModalClose = (
    e: MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError("");
    setSubmitSuccess("");
    setModalOpen(false);
  };

  const handleDeleteProjectButtonClick = async (
    e: MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!workspaceUserCtx?.workspaceId || !projectCtx?.id) return;
    setSubmitError("");
    setSubmitSuccess("");

    await deleteProject({
      variables: {
        workspaceId: workspaceUserCtx.workspaceId,
        projectId: projectCtx.id,
      },
    });
  };

  //make sure all contexts are in sync and that the current user is an ADMIN or MANAGER in the workspace
  if (!userCtx || !workspaceCtx || !workspaceUserCtx || !projectCtx)
    return null;
  if (workspaceUserCtx.userId !== userCtx.id) return null;
  if (workspaceUserCtx.workspaceId !== workspaceCtx.id) return null;
  if (
    workspaceUserCtx.role !== ROLES.ADMIN &&
    workspaceUserCtx.role !== ROLES.MANAGER
  )
    return null;

  return (
    <>
      <div className="w-full flex flex-row justify-center mt-8 mb-4">
        <button
          onClick={handleModalOpen}
          className={`py-1 px-1 text-lg bg-rose-400 rounded-sm text-gray-50 hover:bg-rose-500 active:bg-rose-600 focus:outline-none focus:ring focus:ring-rose-300 disabled:bg-rose-400`}
        >
          Delete project
        </button>
      </div>
      <Modal open={modalOpen} onClose={handleModalClose}>
        <form className="p-2 rounded relative bg-gray-50 w-72 h-auto flex flex-col">
          {submitError ? <Error message={submitError} /> : null}
          {submitSuccess ? (
            <p className="text-emerald-500">{submitSuccess}</p>
          ) : null}
          <p>
            Are you sure you want to delete{" "}
            <span className="font-bold">{projectCtx.name}?</span>
          </p>
          <div className="flex flex-row justify-end mt-4">
            <button
              onClick={handleModalClose}
              disabled={isSubmitting}
              className={`flex-shrink-0 bg-slate-300 rounded-sm py-1 px-2 mr-2 text-gray-50 text-xl hover:bg-slate-500 active:bg-slate-700 focus:outline-none focus:ring focus:ring-slate-300 disabled:bg-slate-200`}
            >
              Close
            </button>
            <button
              onClick={handleDeleteProjectButtonClick}
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

export default DeleteProject;

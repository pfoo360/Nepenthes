import {
  FC,
  useState,
  MouseEvent,
  ChangeEvent,
  Dispatch,
  SetStateAction,
} from "react";
import { useMutation } from "@apollo/client";
import projectOperations from "../../graphql/Project/operations";
import useUserContext from "../../hooks/useUserContext";
import useWorkspaceContext from "../../hooks/useWorkspaceContext";
import useWorkspaceUserContext from "../../hooks/useWorkspaceUserContext";
import useProjectContext from "../../hooks/useProjectContext";
import { User, Role } from "../../types/types";
import Modal from "../Modal/Modal";
import Error from "../Error/Error";
import ROLES from "../../utils/role";
import apolloClient from "../../lib/apolloClient";

interface AddWorkspaceUserToProjectProps {
  workspaceUsersNotApartOfTheProject: Array<{
    id: string;
    user: User;
    role: Role;
  }>;
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
  setCount: Dispatch<SetStateAction<number>>;
}

const AddWorkspaceUserToProject: FC<AddWorkspaceUserToProjectProps> = ({
  workspaceUsersNotApartOfTheProject,
  setWorkspaceUsersNotApartOfTheProject,
  setWorkspaceUsersApartOfTheProject,
  setCount,
}) => {
  const userCtx = useUserContext();
  const workspaceCtx = useWorkspaceContext();
  const workspaceUserCtx = useWorkspaceUserContext();
  const projectCtx = useProjectContext();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWorkspaceUserIds, setSelectedWorkspaceUserIds] = useState<
    Array<string>
  >([]);
  const [submitError, setSubmitError] = useState("");

  const [addWorkspaceUserToProject, { loading: isSubmitting, error, data }] =
    useMutation<
      { addWorkspaceUserToProject: { count: number } },
      {
        selectedWorkspaceUserIds: string[];
        workspaceId: string;
        projectId: string;
      }
    >(projectOperations.Mutation.ADD_WORKSPACEUSER_TO_PROJECT, {
      onError: (error, clientOptions) => {
        setSubmitError(error.message);
      },
      update: async (cache, { data }) => {
        if (!data?.addWorkspaceUserToProject?.count) return;
        if (data?.addWorkspaceUserToProject.count === 0) return; //no rows were created in db

        //NOTE: prisma does NOT return the newly created entries when creating many entires

        setCount((prev) => prev + data.addWorkspaceUserToProject.count);

        setWorkspaceUsersNotApartOfTheProject((prev) =>
          prev.filter((workspaceUser) => {
            if (selectedWorkspaceUserIds.includes(workspaceUser.id)) {
              setWorkspaceUsersApartOfTheProject((prev) => [
                { workspaceUser },
                ...prev,
              ]);
            }
            if (!selectedWorkspaceUserIds.includes(workspaceUser.id)) {
              return workspaceUser;
            }
          })
        );

        await apolloClient.resetStore();
      },
      onCompleted: (data, clientOptions) => {
        setSelectedWorkspaceUserIds([]);
        setSubmitError("");
        setModalOpen(false);
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
    setSelectedWorkspaceUserIds([]);
    setSubmitError("");
    setModalOpen(false);
  };

  const handleWorkspaceUserSelectChange = (
    e: ChangeEvent<HTMLSelectElement>
  ) => {
    e.preventDefault();
    setSelectedWorkspaceUserIds(
      Array.from(e.target.selectedOptions, (option) => option.value)
    );
  };

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!selectedWorkspaceUserIds.length) return;
    if (!workspaceCtx?.id || !projectCtx?.id) return;

    setSubmitError("");

    await addWorkspaceUserToProject({
      variables: {
        selectedWorkspaceUserIds,
        workspaceId: workspaceCtx.id,
        projectId: projectCtx.id,
      },
    });
  };

  if (!userCtx || !workspaceCtx || !workspaceUserCtx || !projectCtx)
    return null;
  if (workspaceUserCtx.userId !== userCtx.id) return null;
  if (workspaceUserCtx.workspaceId !== workspaceCtx.id) return null;
  if (
    projectCtx.workspaceId !== workspaceCtx.id ||
    projectCtx.workspaceId !== workspaceUserCtx.workspaceId
  )
    return null;
  if (
    workspaceUserCtx.role !== ROLES.ADMIN &&
    workspaceUserCtx.role !== ROLES.MANAGER
  )
    return null;

  return (
    <>
      <button
        onClick={handleModalOpen}
        className={`ml-[4px] py-[2px] px-2 bg-indigo-500 rounded-sm text-gray-50 hover:bg-indigo-600 active:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-300 disabled:bg-indigo-400`}
      >
        Add
      </button>
      <Modal open={modalOpen} onClose={handleModalClose}>
        <form className="p-2 rounded relative bg-gray-50 w-[300px] h-auto flex flex-col">
          <select
            multiple={true}
            value={selectedWorkspaceUserIds}
            onChange={handleWorkspaceUserSelectChange}
            disabled={isSubmitting}
            className={`border border-gray-300 rounded-sm px-2 w-full h-32 py-1 mb-6 text-base text-gray-900 placeholder-gray-300 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200 overflow-y-scroll `}
          >
            {workspaceUsersNotApartOfTheProject.map(({ id, role, user }) => (
              <option key={id} value={id}>{`${user.username}, ${role}`}</option>
            ))}
          </select>
          {submitError ? <Error message={submitError} /> : null}
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
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedWorkspaceUserIds.length}
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

export default AddWorkspaceUserToProject;

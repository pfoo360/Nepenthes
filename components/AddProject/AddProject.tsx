import {
  FC,
  useState,
  MouseEvent,
  ChangeEvent,
  useCallback,
  useEffect,
} from "react";
import { Project, Role, User } from "../../types/types";
import useUserContext from "../../hooks/useUserContext";
import useWorkspaceContext from "../../hooks/useWorkspaceContext";
import useWorkspaceUserContext from "../../hooks/useWorkspaceUserContext";
import ROLES from "../../utils/role";
import Modal from "../Modal/Modal";
import Error from "../Error/Error";
import { useMutation } from "@apollo/client";
import ProjectOperations from "../../graphql/Project/operations";
import userOperations from "../../graphql/User/operations";

const AddProject: FC<{
  workspacesUsers: Array<{ id: string; user: User; role: Role }>;
}> = ({ workspacesUsers }) => {
  const userCtx = useUserContext();
  const workspaceCtx = useWorkspaceContext();
  const workspaceUserCtx = useWorkspaceUserContext();

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectNameInitialFocus, setProjectNameInitialFocus] = useState(false);
  const [projectNameError, setProjectNameError] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectDescLength, setProjectDescLength] = useState(0);
  const [projectDescInitialFocus, setProjectDescInitialFocus] = useState(false);
  const [projectDescError, setProjectDescError] = useState("");
  const [selectedWorkspaceUserIds, setSelectedWorkspaceUserIds] = useState<
    Array<string>
  >([]);
  const [submitError, setSubmitError] = useState("");

  const handleModalOpen = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setModalIsOpen(true);
  };

  const handleModalClose = (
    e: MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    if (isSubmitting) return; //prevent modal from closing when submitting to backend

    setSubmitError("");
    setProjectName("");
    setProjectNameInitialFocus(false);
    setProjectNameError("");
    setProjectDesc("");
    setProjectDescLength(0);
    setProjectDescInitialFocus(false);
    setProjectDescError("");
    setSelectedWorkspaceUserIds([]);
    setModalIsOpen(false);
  };

  const handleProjectNameInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setProjectName(e.target.value);
  };

  const handleProjectNameInitialFocus = () => {
    if (projectNameInitialFocus) return;
    setProjectNameInitialFocus(true);
  };

  useEffect(() => {
    setProjectNameError("");
    if (!projectName) setProjectNameError("Required");
    if (projectName.length > 25) setProjectNameError("Exceeds limit");
  }, [projectName]);

  const handleProjectDescTextAreaChange = (
    e: ChangeEvent<HTMLTextAreaElement>
  ) => {
    e.preventDefault();
    setProjectDesc(e.target.value);
  };

  const handleProjectDescInitialFocus = () => {
    if (projectDescInitialFocus) return;
    setProjectDescInitialFocus(true);
  };

  useEffect(() => {
    setProjectDescError("");
    if (projectDesc.length > 120) setProjectDescError("Exceeds limit");
  }, [projectDesc]);

  useEffect(() => {
    setProjectDescLength(projectDesc.length);
  }, [projectDesc]);

  const handleWorkspacesUserSelectChange = (
    e: ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedWorkspaceUserIds(
      Array.from(e.target.selectedOptions, (option) => option.value)
    );
  };

  const inputRef = useCallback((node: HTMLInputElement | null) => {
    if (!node) return;
    node.focus();
  }, []);

  const [createProject, { loading: isSubmitting }] = useMutation<
    {
      createProject: {
        id: string;
        name: string;
        description: string | null;
        workspaceId: string;
      };
    },
    {
      projectName: string;
      projectDescription?: string;
      workspaceId: string;
      selectedWorkspaceUserIds: string[];
    }
  >(ProjectOperations.Mutation.CREATE_PROJECT, {
    onError: (error, clientOptions) => {
      setSubmitError(error.message);
    },
    update: (cache, { data }) => {
      if (!data) return;
      if (!workspaceCtx?.id) return;

      const oldCache = cache.readQuery<{ me: { myProjects: Project[] } }>({
        query: userOperations.Query.GET_CURRENT_USERS_PROJECTS,
        variables: { workspaceId: workspaceCtx.id },
      });

      if (!oldCache) return;

      cache.writeQuery({
        query: userOperations.Query.GET_CURRENT_USERS_PROJECTS,
        variables: { workspaceId: workspaceCtx.id },
        data: {
          ...oldCache,
          me: {
            ...oldCache.me,
            myProjects: [data.createProject, ...oldCache.me.myProjects],
          },
        },
      });
    },
    onCompleted(data, clientOptions) {
      setSubmitError("");
      setProjectName("");
      setProjectNameInitialFocus(false);
      setProjectNameError("");
      setProjectDesc("");
      setProjectDescLength(0);
      setProjectDescInitialFocus(false);
      setProjectDescError("");
      setSelectedWorkspaceUserIds([]);
      setModalIsOpen(false);
    },
  });

  const handleAddProjectInputSubmit = async (
    e: MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (
      !workspaceCtx?.id ||
      !projectName ||
      projectName.length > 25 ||
      (projectDesc && projectDesc.length > 120)
    )
      return;

    setSubmitError("");

    if (projectDesc) {
      await createProject({
        variables: {
          projectName,
          projectDescription: projectDesc,
          workspaceId: workspaceCtx.id,
          selectedWorkspaceUserIds,
        },
      });
    } else if (!projectDesc) {
      await createProject({
        variables: {
          projectName,
          workspaceId: workspaceCtx.id,
          selectedWorkspaceUserIds,
        },
      });
    }
  };

  if (!userCtx || !workspaceCtx || !workspaceUserCtx) return null;
  if (workspaceUserCtx.userId !== userCtx.id) return null;
  if (workspaceUserCtx.workspaceId !== workspaceCtx.id) return null;
  //make sure current user is ADMIN or MANAGER for current workspace
  if (
    workspaceUserCtx.role !== ROLES.ADMIN &&
    workspaceUserCtx.role !== ROLES.MANAGER
  )
    return null;

  return (
    <>
      <div className="flex flex-row justify-center w-full mt-4">
        <button
          onClick={handleModalOpen}
          className={`w-6/12 py-3 px-2 bg-indigo-500 rounded-sm text-gray-50 hover:bg-indigo-600 active:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-300 disabled:bg-indigo-400`}
        >
          Create project
        </button>
      </div>

      <Modal open={modalIsOpen} onClose={handleModalClose}>
        <form className="p-2 rounded relative bg-gray-50 w-[300px] h-auto flex flex-col">
          <input
            type="text"
            id="projectName"
            name="projectName"
            value={projectName}
            onChange={handleProjectNameInputChange}
            onBlur={handleProjectNameInitialFocus}
            ref={inputRef}
            required
            disabled={isSubmitting}
            placeholder="Project name"
            className={`border border-gray-300 rounded-sm px-2 w-full py-1 mt-5 mb-3 text-4xl text-gray-900 placeholder-gray-300 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200`}
          />
          {projectNameInitialFocus && projectNameError ? (
            <Error message={projectNameError} />
          ) : null}
          <textarea
            id="projectDesc"
            name="projectDesc"
            value={projectDesc}
            onChange={handleProjectDescTextAreaChange}
            onBlur={handleProjectDescInitialFocus}
            maxLength={120}
            disabled={isSubmitting}
            placeholder="Description"
            className={`border border-gray-300 rounded-sm px-2 w-full h-32 py-1 mt-2 mb-0.5 text-lg text-gray-900 placeholder-gray-300 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200 resize-none`}
          />
          <div className="flex flex-row justify-end mb-3">
            <p
              className={`pr-3 ${
                projectDescLength > 120 ? `text-rose-500 ` : null
              }`}
            >
              {projectDescLength}/120
            </p>
          </div>
          {projectDescInitialFocus && projectDescError ? (
            <Error message={projectDescError} />
          ) : null}
          <select
            multiple={true}
            value={selectedWorkspaceUserIds}
            onChange={handleWorkspacesUserSelectChange}
            disabled={isSubmitting}
            className={`border border-gray-300 rounded-sm px-2 w-full h-32 py-1 mb-6 text-base text-gray-900 placeholder-gray-300 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200 overflow-y-scroll `}
          >
            {workspacesUsers.map(({ id, user, role }) => (
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
              onClick={handleAddProjectInputSubmit}
              disabled={
                !projectName ||
                projectName.length > 25 ||
                projectDesc.length > 120 ||
                isSubmitting
              }
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

export default AddProject;

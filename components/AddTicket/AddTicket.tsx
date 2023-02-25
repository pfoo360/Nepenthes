import {
  FC,
  useState,
  MouseEvent,
  ChangeEvent,
  useEffect,
  useCallback,
} from "react";
import { User, Role, Priority, Type, Status } from "../../types/types";
import Modal from "../Modal/Modal";
import Error from "../Error/Error";
import PRIORITIES from "../../utils/priority";
import TYPES from "../../utils/type";
import useUserContext from "../../hooks/useUserContext";
import useWorkspaceContext from "../../hooks/useWorkspaceContext";
import useWorkspaceUserContext from "../../hooks/useWorkspaceUserContext";
import useProjectContext from "../../hooks/useProjectContext";
import ROLES from "../../utils/role";
import ticketOperations from "../../graphql/Ticket/operations";
import { useMutation } from "@apollo/client";
import apolloClient from "../../lib/apolloClient";

interface AddTicketProps {
  workspaceUsersApartOfTheProject: {
    workspaceUser: {
      id: string;
      user: User;
      role: Role;
    };
  }[];
  page: number;
}

const AddTicket: FC<AddTicketProps> = ({
  workspaceUsersApartOfTheProject,
  page,
}) => {
  const PRIORITY_VALUES = Object.values(PRIORITIES);
  const TYPE_VALUES = Object.values(TYPES);

  const [modalOpen, setModalOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [titleInitialFocus, setTitleInitialFocus] = useState(false);
  const [titleError, setTitleError] = useState("");

  const [description, setDescription] = useState("");
  const [descriptionInitialFocus, setDescriptionInitialFocus] = useState(false);
  const [descriptionError, setDescriptionError] = useState("");
  const [descriptionLength, setDescriptionLength] = useState(0);

  const [workspaceUserIds, setWorkspaceUserIds] = useState<string[]>([]);
  const [workspaceUserIdsInitialFocus, setWorkspaceUserIdsInitialFocus] =
    useState(false);
  const [workspaceUserIdsError, setWorkspaceUserIdsError] = useState("");

  const [priority, setPriority] = useState<Priority>(
    PRIORITY_VALUES[0] as Priority
  );
  const [priorityInitialFocus, setPriorityInitialFocus] = useState(false);
  const [priorityError, setPriorityError] = useState("");

  const [type, setType] = useState<Type>(TYPE_VALUES[0] as Type);
  const [typeInitialFocus, setTypeInitialFocus] = useState(false);
  const [typeError, setTypeError] = useState("");

  const [submitError, setSubmitError] = useState("");

  const [createTicket, { data, loading: isSubmitting, error }] = useMutation<
    {
      createTicket: {
        id: string;
        title: string;
        ticketSubmitter: {
          submitter: { id: string; user: { username: string } };
        };
        ticketDeveloper: Array<{
          developer: { id: string; user: { username: string } };
        }>;
        project: {
          id: string;
          workspaceId: string;
        };
        status: Status;
        createdAt: number;
      };
    },
    {
      title: string;
      description: string;
      workspaceUserIds: string[];
      projectId: string;
      workspaceId: string;
      priority: Priority;
      type: Type;
    }
  >(ticketOperations.Mutation.CREATE_TICKET, {
    onError: (error, clientOptions) => {
      console.log(error);
      setSubmitError(error.message);
    },
    update: async (cache, { data }) => {
      await apolloClient.resetStore();

      // if (!data) return;
      // if (
      //   !projectCtx?.id ||
      //   !workspaceCtx?.id ||
      //   page === undefined ||
      //   page === null
      // )
      //   return;
      // const oldCache = cache.readQuery<{
      //   getProjectsTickets: Array<{
      //     id: string;
      //     title: string;
      //     ticketSubmitter: {
      //       submitter: { id: string; user: { username: string } };
      //     };
      //     ticketDeveloper: Array<{
      //       developer: { id: string; user: { username: string } };
      //     }>;
      //     project: {
      //       id: string;
      //       workspaceId: string;
      //     };
      //     status: Status;
      //     createdAt: number;
      //   }>;
      // }>({
      //   query: ticketOperations.Query.GET_PROJECTS_TICKETS,
      //   variables: {
      //     projectId: projectCtx.id,
      //     workspaceId: workspaceCtx.id,
      //     page,
      //   },
      // });
      // if (!oldCache || page === 0) {
      //   return location.reload();
      // }
      // cache.writeQuery({
      //   query: ticketOperations.Query.GET_PROJECTS_TICKETS,
      //   variables: {
      //     projectId: projectCtx.id,
      //     workspaceId: workspaceCtx.id,
      //     page,
      //   },
      //   data: {
      //     ...oldCache,
      //     getProjectsTickets: [
      //       data.createTicket,
      //       ...oldCache.getProjectsTickets,
      //     ],
      //   },
      // });

      // console.log("ADDTICKETUPDATE", data);
      // console.log(page);
      // console.log("OLDCACHE", oldCache);
    },
    onCompleted(data, clientOptions) {
      console.log("ADDTICKETCOMPLETE", data);
      setTitle("");
      setTitleInitialFocus(false);
      setTitleError("");
      setDescription("");
      setDescriptionInitialFocus(false);
      setDescriptionError("");
      setDescriptionLength(0);
      setWorkspaceUserIds([]);
      setWorkspaceUserIdsInitialFocus(false);
      setWorkspaceUserIdsError("");
      setPriority(PRIORITY_VALUES[0] as Priority);
      setPriorityInitialFocus(false);
      setPriorityError("");
      setType(TYPE_VALUES[0] as Type);
      setTypeInitialFocus(false);
      setTypeError("");
      setModalOpen(false);
    },
  });

  const handleAddTicketSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!projectCtx?.id) return;
    if (!workspaceCtx?.id) return;
    if (
      titleError ||
      descriptionError ||
      workspaceUserIdsError ||
      priorityError ||
      typeError
    )
      return;
    await createTicket({
      variables: {
        title,
        description,
        workspaceUserIds,
        projectId: projectCtx.id,
        workspaceId: workspaceCtx.id,
        priority,
        type,
      },
    });
    console.log(workspaceUserIds);
    console.log(userCtx, workspaceCtx, workspaceUserCtx, projectCtx);
  };

  const handleModalOpen = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setModalOpen(true);
  };

  const handleModalClose = (
    e: MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    if (isSubmitting) return;

    setTitle("");
    setTitleInitialFocus(false);
    setTitleError("");
    setDescription("");
    setDescriptionInitialFocus(false);
    setDescriptionError("");
    setDescriptionLength(0);
    setWorkspaceUserIds([]);
    setWorkspaceUserIdsInitialFocus(false);
    setWorkspaceUserIdsError("");
    setPriority(PRIORITY_VALUES[0] as Priority);
    setPriorityInitialFocus(false);
    setPriorityError("");
    setType(TYPE_VALUES[0] as Type);
    setTypeInitialFocus(false);
    setTypeError("");
    setModalOpen(false);
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setTitle(e.target.value);
  };

  const inputRef = useCallback((node: HTMLInputElement | null) => {
    if (!node) return;
    node.focus();
  }, []);

  const handleTitleInitialFocus = () => {
    if (titleInitialFocus) return;
    setTitleInitialFocus(true);
  };

  useEffect(() => {
    setTitleError("");
    if (!title) setTitleError("Required");
    if (title.length > 20) setTitleError("Exceeds limit");
  }, [title, titleInitialFocus]);

  const handleDescriptionTextAreaChange = (
    e: ChangeEvent<HTMLTextAreaElement>
  ) => {
    e.preventDefault();
    setDescription(e.target.value);
  };

  const handleDescriptionInitialFocus = () => {
    if (descriptionInitialFocus) return;
    setDescriptionInitialFocus(true);
  };

  useEffect(() => {
    setDescriptionLength(description.length);
    setDescriptionError("");
    if (description.length > 120) setDescriptionError("Exceeds limit");
  }, [description]);

  const handleWorkspaceUserIdsSelectChange = (
    e: ChangeEvent<HTMLSelectElement>
  ) => {
    e.preventDefault();
    setWorkspaceUserIds(
      Array.from(e.target.selectedOptions, (option) => option.value)
    );
  };

  const handleWorkspaceUserIdsInitialFocus = () => {
    if (workspaceUserIdsInitialFocus) return;
    setWorkspaceUserIdsInitialFocus(true);
  };

  useEffect(() => {
    setWorkspaceUserIdsError("");
    if (workspaceUserIds.length <= 0) setWorkspaceUserIdsError("Required");
  }, [workspaceUserIds]);

  const handlePrioritySelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    console.log(e.target.value);
    setPriority(e.target.value as Priority);
  };

  const handlePriorityInitialFocus = () => {
    if (priorityInitialFocus) return;
    setPriorityInitialFocus(true);
  };

  useEffect(() => {
    setPriorityError("");
    console.log(PRIORITY_VALUES.indexOf(priority) === -1);
    console.log(PRIORITY_VALUES.indexOf(priority) < 0);
    if (PRIORITY_VALUES.indexOf(priority) < 0)
      setPriorityError("Invalid value");
  }, [priority]);

  const handleTypeSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    console.log(e.target.value);
    setType(e.target.value as Type);
  };

  const handleTypeInitialFocus = () => {
    if (typeInitialFocus) return;
    setTypeInitialFocus(true);
  };

  useEffect(() => {
    setTypeError("");
    console.log(TYPE_VALUES.indexOf(type) === -1);
    console.log(TYPE_VALUES.indexOf(type) < 0);
    if (TYPE_VALUES.indexOf(type) < 0) setTypeError("Invalid value");
  }, [type]);

  const userCtx = useUserContext();
  const workspaceCtx = useWorkspaceContext();
  const workspaceUserCtx = useWorkspaceUserContext();
  const projectCtx = useProjectContext();
  if (!userCtx || !workspaceCtx || !workspaceUserCtx || !projectCtx)
    return null;
  if (workspaceUserCtx.userId !== userCtx.id) return null;
  if (workspaceUserCtx.workspaceId !== workspaceCtx.id) return null;
  if (workspaceUserCtx.workspaceId !== projectCtx.workspaceId) return null;
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
          {submitError ? <Error message={submitError} /> : null}
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleInitialFocus}
            required
            ref={inputRef}
            disabled={isSubmitting}
            placeholder="Ticket title"
            className={`border border-gray-300 rounded-sm px-2 w-full py-1 mt-5 mb-3 text-4xl text-gray-900 placeholder-gray-300 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200`}
          />
          {titleInitialFocus && titleError ? (
            <Error message={titleError} />
          ) : null}
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={handleDescriptionTextAreaChange}
            onBlur={handleDescriptionInitialFocus}
            maxLength={120}
            disabled={isSubmitting}
            placeholder="Description"
            className={`border border-gray-300 rounded-sm px-2 w-full h-32 py-1 mt-2 mb-0.5 text-lg text-gray-900 placeholder-gray-300 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200 resize-none`}
          />
          <div className="flex flex-row justify-end mb-3">
            <p
              className={`pr-3 ${
                descriptionLength > 120 ? `text-rose-500 ` : null
              }`}
            >
              {descriptionLength}/120
            </p>
          </div>
          {descriptionInitialFocus && descriptionError ? (
            <Error message={descriptionError} />
          ) : null}
          <select
            multiple={true}
            value={workspaceUserIds}
            onChange={handleWorkspaceUserIdsSelectChange}
            onBlur={handleWorkspaceUserIdsInitialFocus}
            disabled={isSubmitting}
            className={`border border-gray-300 rounded-sm px-2 w-full h-32 py-1 mb-6 text-base text-gray-900 placeholder-gray-300 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200 overflow-y-scroll `}
          >
            {workspaceUsersApartOfTheProject.map(
              ({ workspaceUser: { id, role, user } }) => {
                return (
                  <option
                    key={id}
                    value={id}
                  >{`${user.username}, ${role}`}</option>
                );
              }
            )}
          </select>
          {workspaceUserIdsInitialFocus && workspaceUserIdsError ? (
            <Error message={workspaceUserIdsError} />
          ) : null}
          <select
            value={priority}
            onChange={handlePrioritySelectChange}
            onBlur={handlePriorityInitialFocus}
            disabled={isSubmitting}
            className={`border border-gray-300 rounded-sm px-2 w-full py-1 mb-6 text-lg text-gray-900 placeholder-gray-300 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200`}
          >
            {PRIORITY_VALUES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          {priorityInitialFocus && priorityError ? (
            <Error message={priorityError} />
          ) : null}
          <select
            value={type}
            onChange={handleTypeSelectChange}
            onBlur={handleTypeInitialFocus}
            disabled={isSubmitting}
            className={`border border-gray-300 rounded-sm px-2 w-full py-1 mb-6 text-lg text-gray-900 placeholder-gray-300 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200`}
          >
            {TYPE_VALUES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {typeInitialFocus && typeError ? <Error message={typeError} /> : null}
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
              onClick={handleAddTicketSubmit}
              disabled={
                isSubmitting ||
                !!titleError ||
                !!descriptionError ||
                !!workspaceUserIdsError ||
                !!priorityError ||
                !!typeError
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

export default AddTicket;

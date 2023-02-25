import ROLES from "../../utils/role";
import Error from "../../components/Error/Error";
import {
  FC,
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  MouseEvent,
} from "react";
import {
  Ticket,
  WorkspaceUser,
  Priority,
  Type,
  Status,
} from "../../types/types";
import useUserContext from "../../hooks/useUserContext";
import useWorkspaceContext from "../../hooks/useWorkspaceContext";
import useWorkspaceUserContext from "../../hooks/useWorkspaceUserContext";
import useProjectContext from "../../hooks/useProjectContext";
import PRIORITIES from "../../utils/priority";
import TYPES from "../../utils/type";
import STATUS from "../../utils/status";
import Link from "next/link";
import { useMutation } from "@apollo/client";
import ticketOperations from "../../graphql/Ticket/operations";
import apolloClient from "../../lib/apolloClient";
import { useRouter } from "next/router";

interface EditTicketProps {
  ticket: Ticket;
  workspaceUsersAssignedToProject: Array<{
    id: string;
    projectId: string;
    workspaceUser: WorkspaceUser;
  }>;
}

const EditTicket: FC<EditTicketProps> = ({
  ticket,
  workspaceUsersAssignedToProject,
}) => {
  const { push } = useRouter();

  const PRIORITY_VALUES = Object.values(PRIORITIES);
  const TYPE_VALUES = Object.values(TYPES);
  const STATUS_VALUES = Object.values(STATUS);

  const userCtx = useUserContext();
  const workspaceCtx = useWorkspaceContext();
  const workspaceUserCtx = useWorkspaceUserContext();
  const projectCtx = useProjectContext();

  const [title, setTitle] = useState(ticket.title);
  const [titleInitialFocus, setTitleInitialFocus] = useState(false);
  const [titleError, setTitleError] = useState("");

  const [description, setDescription] = useState(ticket.description);
  const [descriptionInitialFocus, setDescriptionInitialFocus] = useState(false);
  const [descriptionError, setDescriptionError] = useState("");
  const [descriptionLength, setDescriptionLength] = useState(0);

  const [workspaceUserIds, setWorkspaceUserIds] = useState<string[]>(
    Array.from(
      ticket.ticketDeveloper,
      ({ developer: { id, user, role } }) => id
    )
  );
  const [workspaceUserIdsInitialFocus, setWorkspaceUserIdsInitialFocus] =
    useState(false);
  const [workspaceUserIdsError, setWorkspaceUserIdsError] = useState("");

  const [priority, setPriority] = useState<Priority>(ticket.priority);
  const [priorityInitialFocus, setPriorityInitialFocus] = useState(false);
  const [priorityError, setPriorityError] = useState("");

  const [type, setType] = useState<Type>(ticket.type);
  const [typeInitialFocus, setTypeInitialFocus] = useState(false);
  const [typeError, setTypeError] = useState("");

  const [status, setStatus] = useState<Status>(ticket.status);
  const [statusInitialFocus, setStatusInitialFocus] = useState(false);
  const [statusError, setStatusError] = useState("");

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
    setPriority(e.target.value as Priority);
  };

  const handlePriorityInitialFocus = () => {
    if (priorityInitialFocus) return;
    setPriorityInitialFocus(true);
  };

  useEffect(() => {
    setPriorityError("");
    if (PRIORITY_VALUES.indexOf(priority) < 0)
      setPriorityError("Invalid value");
  }, [priority]);

  const handleTypeSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    setType(e.target.value as Type);
  };

  const handleTypeInitialFocus = () => {
    if (typeInitialFocus) return;
    setTypeInitialFocus(true);
  };

  useEffect(() => {
    setTypeError("");
    if (TYPE_VALUES.indexOf(type) < 0) setTypeError("Invalid value");
  }, [type]);

  const handleStatusSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    setStatus(e.target.value as Status);
  };

  const handleStatusInitialFocus = () => {
    if (statusInitialFocus) return;
    setStatusInitialFocus(true);
  };

  useEffect(() => {
    setStatusError("");
    if (STATUS_VALUES.indexOf(status) < 0) setStatusError("Invalid value");
  }, [status]);

  const [updateTicket, { data, loading: isSubmitting, error }] = useMutation<
    {
      updateTicket: {
        id: string;
        project: { id: string; workspaceId: string };
      };
    },
    {
      title: string;
      description: string;
      workspaceUserIds: string[];
      priority: Priority;
      type: Type;
      status: Status;
      workspaceId: string;
      projectId: string;
      ticketId: string;
    }
  >(ticketOperations.Mutation.UPDATE_TICKET, {
    onError: (error, clientOptions) => {
      console.log("EDIT_TICKET", error);
    },
    update: async (cache, { data }) => {
      //if (!data) return;
      await apolloClient.resetStore();
    },
    onCompleted: (data, clientOptions) => {
      push(
        `/t/${data.updateTicket.project.workspaceId}/${data.updateTicket.project.id}/${data.updateTicket.id}`
      );
    },
  });

  const handleTicketUpdateSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (
      !!titleError ||
      !!descriptionError ||
      !!workspaceUserIdsError ||
      !!priorityError ||
      !!typeError ||
      !!statusError
    )
      return;
    if (!workspaceUserCtx?.workspaceId) return;

    await updateTicket({
      variables: {
        title,
        description,
        workspaceUserIds,
        priority,
        type,
        status,
        workspaceId: workspaceUserCtx.workspaceId,
        projectId: ticket.project.id,
        ticketId: ticket.id,
      },
    });
  };

  if (!ticket) return null;
  if (!userCtx || !workspaceCtx || !workspaceUserCtx || !projectCtx)
    return null;
  if (workspaceUserCtx.userId !== userCtx.id) return null;
  if (workspaceUserCtx.workspaceId !== workspaceCtx.id) return null;
  if (projectCtx.workspaceId !== workspaceUserCtx.workspaceId) return null;
  if (ticket.project.id !== projectCtx.id) return null;

  return (
    <div className="flex flex-col items-center">
      <div className="mx-4 my-4 w-11/12 border border-indigo-500 rounded-sm">
        <div className="h-[60px] bg-indigo-500 px-4 pt-2">
          <h1 className="text-gray-50 font-bold">{`Ticket# ${ticket.id}`}</h1>
          <Link
            href={`/p/${ticket.project.workspace.id}/${ticket.project.id}`}
            className="text-xs underline decoration-dotted text-gray-50"
          >
            back to project info
          </Link>
          <span className="text-sm px-2 text-gray-50">|</span>
          <Link
            href={`/t/${ticket.project.workspace.id}/${ticket.project.id}/${ticket.id}`}
            className="text-xs underline decoration-dotted text-gray-50"
          >
            back to ticket info
          </Link>
        </div>
        <form className="p-2 bg-gray-50">
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleInitialFocus}
            required
            ref={inputRef}
            disabled={workspaceUserCtx.role === ROLES.DEVELOPER || isSubmitting}
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
            disabled={workspaceUserCtx.role === ROLES.DEVELOPER || isSubmitting}
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
            disabled={workspaceUserCtx.role === ROLES.DEVELOPER || isSubmitting}
            className={`border border-gray-300 rounded-sm px-2 w-full h-32 py-1 mb-6 text-base text-gray-900 placeholder-gray-300 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200 overflow-y-scroll `}
          >
            {workspaceUsersAssignedToProject.map(
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
            disabled={workspaceUserCtx.role === ROLES.DEVELOPER || isSubmitting}
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
            disabled={workspaceUserCtx.role === ROLES.DEVELOPER || isSubmitting}
            className={`border border-gray-300 rounded-sm px-2 w-full py-1 mb-6 text-lg text-gray-900 placeholder-gray-300 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200`}
          >
            {TYPE_VALUES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {typeInitialFocus && typeError ? <Error message={typeError} /> : null}
          <select
            value={status}
            onChange={handleStatusSelectChange}
            onBlur={handleStatusInitialFocus}
            disabled={isSubmitting}
            className={`border border-gray-300 rounded-sm px-2 w-full py-1 mb-6 text-lg text-gray-900 placeholder-gray-300 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200`}
          >
            {STATUS_VALUES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {statusInitialFocus && statusError ? (
            <Error message={statusError} />
          ) : null}
          <div className="flex flex-row justify-end mt-4">
            <button
              type="submit"
              onClick={handleTicketUpdateSubmit}
              disabled={
                isSubmitting ||
                !!titleError ||
                !!descriptionError ||
                !!workspaceUserIdsError ||
                !!priorityError ||
                !!typeError ||
                !!statusError
              }
              className={`flex-shrink-0 bg-indigo-500 rounded-sm py-1 px-2 text-gray-50 text-xl hover:bg-indigo-600 active:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-300 disabled:bg-indigo-400`}
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTicket;

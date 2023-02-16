import { FC } from "react";
import { User, Role } from "../../types/types";
import AddTicket from "../AddTicket/AddTicket";

interface ProjectsTicketsProps {
  workspaceUsersApartOfTheProject: {
    workspaceUser: {
      id: string;
      user: User;
      role: Role;
    };
  }[];
}

const ProjectsTickets: FC<ProjectsTicketsProps> = ({
  workspaceUsersApartOfTheProject,
}) => {
  return (
    <>
      <div>ProjectsTickets</div>
      <AddTicket
        workspaceUsersApartOfTheProject={workspaceUsersApartOfTheProject}
      />
    </>
  );
};

export default ProjectsTickets;

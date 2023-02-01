import { FC } from "react";
import { useQuery } from "@apollo/client";
import userOperations from "../../graphql/User/operations";
import { Role } from "../../types/types";
import Workspace from "../Workspace/Workspace";
import Error from "../Error/Error";

const MyWorkspace: FC = () => {
  const { loading, data, error } = useQuery<{
    me: {
      myWorkspace: {
        role: Role;
        workspace: { id: string; name: string };
      }[];
    };
  }>(
    userOperations.Query.GET_CURRENT_USERS_WORKSPACES
    // {
    //   pollInterval: 10000
    // }
  );

  if (loading) return <p>Loading...</p>;

  if (error) return <Error message="Looks like something went wrong..." />;

  if (data === undefined && loading === false && !error)
    return <p>Seems like there is nothing here...</p>;

  if (data)
    return (
      <>
        {data.me.myWorkspace.map(({ role, workspace }) => (
          <Workspace key={workspace.id} role={role} workspace={workspace} />
        ))}
      </>
    );

  return null;
};

export default MyWorkspace;

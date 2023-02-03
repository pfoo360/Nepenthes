import { FC } from "react";
import { useQuery } from "@apollo/client";
import userOperations from "../../graphql/User/operations";
import { Role } from "../../types/types";
import Workspace from "../Workspace/Workspace";
import Error from "../Error/Error";

const MyWorkspace: FC = () => {
  const { loading, data, error } = useQuery<{
    me: {
      myWorkspaces: {
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
  console.log("DATA", data);
  console.log("ERROR", error);

  if (loading) return <p>Loading...</p>;

  if (error) return <Error message="Looks like something went wrong..." />;

  if (
    !data ||
    (data.me.myWorkspaces.length === 0 && loading === false && !error)
  )
    return <p>Seems like there is nothing here...</p>;

  if (data.me.myWorkspaces.length > 0)
    return (
      <>
        {data.me.myWorkspaces.map(({ role, workspace }) => (
          <Workspace key={workspace.id} role={role} workspace={workspace} />
        ))}
      </>
    );

  return null;
};

export default MyWorkspace;

import React from "react";
import { useQuery } from "@apollo/client";
import userOperations from "../../graphql/User/operations";
import useWorkspaceUserContext from "../../hooks/useWorkspaceUserContext";
import useUserContext from "../../hooks/useUserContext";
import useWorkspaceContext from "../../hooks/useWorkspaceContext";
import { Project as ProjectType } from "../../types/types";
import Error from "../Error/Error";
import Project from "../Project/Project";

const MyProject = () => {
  const workspaceCtx = useWorkspaceContext();
  const workspaceUserCtx = useWorkspaceUserContext();
  const userCtx = useUserContext();
  if (!workspaceCtx || !workspaceUserCtx || !userCtx) return null;
  if (workspaceUserCtx.workspaceId !== workspaceCtx.id) return null;
  if (workspaceUserCtx.userId !== userCtx.id) return null;

  const { loading, data, error } = useQuery<{
    me: { myProjects: ProjectType[] };
  }>(
    userOperations.Query.GET_CURRENT_USERS_PROJECTS,
    { variables: { workspaceId: workspaceCtx.id } }
    // {
    //   pollInterval: 10000
    // }
  );

  console.log("DATA", data);
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-5xl text-gray-900 m-4 break-words">{`${userCtx.username}'s Projects`}</h1>
      {error ? <Error message="Looks like something went wrong..." /> : null}
      {loading ? <p>Loading...</p> : null}
      {data?.me.myProjects.length === 0 && !loading && !error ? (
        <p>Seems like there is nothing here...</p>
      ) : null}
      {data !== undefined && data.me.myProjects.length > 0 && (
        <div className="w-full flex flex-col items-center justify-center">
          {data.me.myProjects.map(({ id, name, description, workspaceId }) => (
            <Project
              key={id}
              id={id}
              name={name}
              description={description}
              workspaceId={workspaceId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProject;

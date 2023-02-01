import { FC, createContext, useState, useEffect } from "react";
import { WorkspaceUserProviderValue } from "../types/types";

export const WorkspaceUserContext = createContext<
  WorkspaceUserProviderValue | undefined
>(undefined);

const WorkspaceUserProvider: FC<{
  children: JSX.Element;
  value: WorkspaceUserProviderValue | undefined;
}> = ({ children, value }) => {
  const [workspaceUser, setWorkspaceUser] = useState(value);

  useEffect(() => {
    console.log("WORKSPACEUSERPROVIDER", value);
    setWorkspaceUser(value);
  }, [value]);

  return (
    <WorkspaceUserContext.Provider value={workspaceUser}>
      {children}
    </WorkspaceUserContext.Provider>
  );
};

export default WorkspaceUserProvider;

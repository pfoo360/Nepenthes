import { FC, createContext, useState, useEffect } from "react";
import { WorkspaceUserContextValue } from "../types/types";

export const WorkspaceUserContext = createContext<
  WorkspaceUserContextValue | undefined
>(undefined);

const WorkspaceUserProvider: FC<{
  children: JSX.Element;
  value: WorkspaceUserContextValue | undefined;
}> = ({ children, value }) => {
  const [workspaceUser, setWorkspaceUser] = useState(value);

  useEffect(() => {
    setWorkspaceUser(value);
  }, [value]);

  return (
    <WorkspaceUserContext.Provider value={workspaceUser}>
      {children}
    </WorkspaceUserContext.Provider>
  );
};

export default WorkspaceUserProvider;

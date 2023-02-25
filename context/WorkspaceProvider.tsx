import { FC, createContext, useState, useEffect } from "react";
import { WorkspaceContextValue } from "../types/types";

export const WorkspaceContext = createContext<
  WorkspaceContextValue | undefined
>(undefined);

const WorkspaceProvider: FC<{
  children: JSX.Element;
  value: WorkspaceContextValue | undefined;
}> = ({ children, value }) => {
  const [workspace, setWorkspace] = useState(value);

  useEffect(() => {
    setWorkspace(value);
  }, [value]);

  return (
    <WorkspaceContext.Provider value={workspace}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export default WorkspaceProvider;

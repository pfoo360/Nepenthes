import { FC, createContext, useState, useEffect } from "react";

interface WorkspaceProviderContextValue {
  id: string;
  name: string;
}

export const WorkspaceContext = createContext<
  WorkspaceProviderContextValue | undefined
>(undefined);

const WorkspaceProvider: FC<{
  children: JSX.Element;
  value: WorkspaceProviderContextValue | undefined;
}> = ({ children, value }) => {
  const [workspace, setWorkspace] = useState(value);

  useEffect(() => {
    console.log("WORKSPACEPROVIDER", value);
    setWorkspace(value);
  }, [value]);

  return (
    <WorkspaceContext.Provider value={workspace}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export default WorkspaceProvider;

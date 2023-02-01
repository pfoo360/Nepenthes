import { useContext } from "react";
import { WorkspaceUserContext } from "./../context/WorkspaceUserProvider";

const useWorkspaceUserContext = () => {
  return useContext(WorkspaceUserContext);
};

export default useWorkspaceUserContext;

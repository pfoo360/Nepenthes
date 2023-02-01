import { useContext } from "react";
import { WorkspaceContext } from "../context/WorkspaceProvider";

const useWorkspaceContext = () => {
  return useContext(WorkspaceContext);
};

export default useWorkspaceContext;

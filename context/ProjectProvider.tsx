import { FC, createContext, useState, useEffect } from "react";
import { Project } from "../types/types";

export const ProjectContext = createContext<Project | undefined>(undefined);

const ProjectProvider: FC<{ children: JSX.Element; value: Project }> = ({
  children,
  value,
}) => {
  const [project, setProject] = useState(value);

  useEffect(() => {
    console.log("PROJECTPROVIDER", value);
    setProject(value);
  }, [value]);

  return (
    <ProjectContext.Provider value={project}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectProvider;

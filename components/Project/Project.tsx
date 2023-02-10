import { FC } from "react";
import Link from "next/link";

interface ProjectProps {
  id: string;
  name: string;
  description: string;
  workspaceId: string;
}

const Project: FC<ProjectProps> = ({ id, name, description, workspaceId }) => {
  return (
    <Link
      href={`/p/${workspaceId}/${id}`}
      className="bg-indigo-400 w-11/12 h-[190px] my-2 p-2 rounded-sm hover:bg-indigo-500"
    >
      <h1 className="text-3xl text-slate-100 font-bold">{name}</h1>
      <h2
        className={`text-base break-all text-slate-200 ${
          description ? "opacity-80" : "opacity-30"
        }`}
      >
        {description ? description : "n/a"}
      </h2>
    </Link>
  );
};

export default Project;

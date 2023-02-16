import { FC } from "react";
import Link from "next/link";
import { Project } from "../../types/types";

const Project: FC<Project> = ({ id, name, description, workspaceId }) => {
  return (
    <Link
      href={`/p/${workspaceId}/${id}`}
      className="bg-indigo-400 w-11/12 h-[190px] my-2 p-2 rounded-sm hover:bg-indigo-500"
    >
      <h1 className="text-3xl text-slate-100 font-bold break-all">{name}</h1>
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

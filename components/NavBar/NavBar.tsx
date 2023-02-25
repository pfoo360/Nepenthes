import { useState, MouseEvent } from "react";
import Link from "next/link";
import useWorkspaceContext from "../../hooks/useWorkspaceContext";
import { useRouter } from "next/router";
import useWorkspaceUserContext from "../../hooks/useWorkspaceUserContext";
import ROLES from "../../utils/role";
import useUserContext from "../../hooks/useUserContext";
import SignOut from "../SignOut/SignOut";

const NavBar = () => {
  const { push } = useRouter();
  const workspace = useWorkspaceContext();
  const workspaceUser = useWorkspaceUserContext();
  const user = useUserContext();

  const [navBarIsOpen, setNavBarIsOpen] = useState(false);

  const handleNavBarOpen = () => {
    setNavBarIsOpen((prev) => !prev);
  };

  const handleToDashboardClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    push("/workspaces");
  };

  return (
    <>
      <nav className="bg-gray-50 h-9 px-4 flex flex-row justify-between items-center border-b-gray-200 border-b">
        <Link
          href={workspace?.id ? `/w/${workspace.id}` : `/workspaces`}
          className="text-indigo-500 text-lg hover:text-indigo-700"
        >
          nepenthes
        </Link>
        <div
          onClick={handleNavBarOpen}
          className="w-8 h-8 flex flex-col justify-center items-center hover:bg-indigo-500 hover:rounded-full hover:opacity-50"
        >
          <div className="w-4 h-4 flex justify-around flex-col items-center z-10">
            <div className="w-4 h-px rounded-md bg-black" />
            <div className="w-4 h-px rounded-md bg-black" />
            <div className="w-4 h-px rounded-md bg-black" />
          </div>
        </div>
      </nav>
      {navBarIsOpen ? (
        <div className="fixed z-50 bg-gray-100 w-11/12 top-10 left-1/2 -translate-x-1/2 flex flex-col items-center rounded">
          <p className="mt-3 text-base text-gray-300">
            {user?.username ? `welcome, ${user.username}` : `welcome`}
          </p>
          <p
            className={`mb-1 text-xs ${
              workspaceUser?.role === ROLES.ADMIN
                ? `text-indigo-300`
                : workspaceUser?.role === ROLES.MANAGER
                ? `text-fuchsia-300`
                : workspaceUser?.role === ROLES.DEVELOPER
                ? `text-cyan-300`
                : `text-gray-300`
            }`}
          >
            {workspaceUser?.role}
          </p>
          <Link
            href={workspace?.id ? `/w/${workspace.id}` : `/workspaces`}
            className="block text-gray-500 hover:text-indigo-500 mt-4 text-3xl px-4"
          >
            home
          </Link>
          <Link
            href={workspace?.id ? `/projects/${workspace.id}` : `/workspaces`}
            className="block text-gray-500 hover:text-indigo-500 mt-4 text-3xl px-4"
          >
            projects
          </Link>
          <Link
            href={workspace?.id ? `/tickets/${workspace.id}` : `/workspaces`}
            className="block text-gray-500 hover:text-indigo-500 mt-4 text-3xl px-4"
          >
            tickets
          </Link>
          {workspaceUser?.role === ROLES.ADMIN ? (
            <>
              <div className="w-11/12 h-px rounded-md bg-gray-200 mt-20" />
              <Link
                href={`/admin/${workspace?.id}`}
                className="block text-indigo-500 hover:text-indigo-700 mt-4 text-3xl px-4"
              >
                admin
              </Link>
            </>
          ) : null}

          <div className="w-11/12 h-px rounded-md bg-gray-200 mt-20 mb-4" />
          <div className="w-full flex flex-row justify-between items-center px-4 mb-4">
            <button
              onClick={handleToDashboardClick}
              className="bg-gray-300 px-2 py-1 rounded-sm text-gray-50 hover:bg-indigo-500 active:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-300 disabled:bg-indigo-400"
            >
              to dashboard
            </button>
            <SignOut />
          </div>
        </div>
      ) : null}
    </>
  );
};

export default NavBar;

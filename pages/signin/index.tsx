import {
  useState,
  useCallback,
  useEffect,
  ChangeEvent,
  MouseEvent,
} from "react";
import type { GetServerSideProps, NextPage } from "next";
import { useMutation } from "@apollo/client";
import authOperations from "../../graphql/Auth/operations";
import Error from "../../components/Error/Error";
import { useRouter } from "next/router";
import { SignInResponse } from "../../types/types";
import getServerSessionAndUser from "../../utils/getServerSessionAndUser";
import Link from "next/link";

const SignIn: NextPage = () => {
  const [username, setUsername] = useState("");
  const [usernameInitialFocus, setUsernameInitialFocus] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  const [password, setPassword] = useState("");
  const [passwordInitialFocus, setPasswordInitialFocus] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const { push } = useRouter();

  const [signIn, { loading: submitting }] = useMutation<
    { signIn: SignInResponse },
    { username: string; password: string }
  >(authOperations.Mutation.SIGN_IN, {
    onCompleted: ({ signIn }) => {
      if (signIn.successStatus) push("/workspaces");
    },
    onError: ({ cause, name, clientErrors, graphQLErrors, message }) => {
      if (graphQLErrors.length === 0) {
        setErrorMessage("Something went wrong.");
      } else if (graphQLErrors[0]?.message) {
        setErrorMessage(graphQLErrors[0].message);
      } else {
        setErrorMessage("Something went wrong.");
      }
    },
  });

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setErrorMessage("");
    await signIn({ variables: { username, password } });
  };

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setUsername(e.target.value);
  };

  const handleUsernameInitialFocus = () => {
    if (usernameInitialFocus) return;
    setUsernameInitialFocus(true);
  };

  useEffect(() => {
    setUsernameError("");
    if (!username) setUsernameError("Required");
    else if (username.length < 5) setUsernameError("Too short");
    else if (!/^[a-zA-Z0-9_-]+$/i.test(username))
      setUsernameError("Invalid format");
    else if (username.length > 13) setUsernameError("Exceeds limit");
  }, [username]);

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setPassword(e.target.value);
  };

  const handlePasswordInitialFocus = () => {
    if (passwordInitialFocus) return;
    setPasswordInitialFocus(true);
  };

  useEffect(() => {
    setPasswordError("");
    if (!password) setPasswordError("Required");
    else if (password.length < 5) setPasswordError("Too short");
    else if (!/^[a-zA-Z0-9]+$/i.test(password))
      setPasswordError("Invalid format");
    else if (password.length > 25) setPasswordError("Exceeds limit");
  }, [password]);

  const inputRef = useCallback((node: HTMLInputElement | null) => {
    if (!node) return;
    node.focus();
  }, []);

  return (
    <div className={`fixed top-0 left-0 w-full h-full bg-gray-50`}>
      <div className="border border-gray-400 mx-8 mt-14 flex flex-col justify-center items-center">
        <form className={`flex flex-col justify-center items-center w-full`}>
          {errorMessage && <Error message={errorMessage} />}
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={handleUsernameChange}
            onBlur={handleUsernameInitialFocus}
            ref={inputRef}
            placeholder="Username"
            disabled={submitting}
            required
            className={`border border-gray-300 rounded-sm w-5/6 pl-2 py-1 mt-8 text-md placeholder-gray-400 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200`}
          />
          {usernameInitialFocus && usernameError && (
            <Error message={usernameError} />
          )}
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handlePasswordChange}
            onBlur={handlePasswordInitialFocus}
            placeholder="Password"
            disabled={submitting}
            required
            className={`border border-gray-300 rounded-sm w-5/6 pl-2 py-1 mt-8 text-md placeholder-gray-400 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200`}
          />
          {passwordInitialFocus && passwordError && (
            <Error message={passwordError} />
          )}
          <button
            type="submit"
            disabled={submitting || !!usernameError || !!passwordError}
            onClick={handleSubmit}
            className={`w-5/6 my-8 py-3 bg-indigo-500 rounded-sm text-gray-50 hover:bg-indigo-600 active:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-300 disabled:bg-indigo-400`}
          >
            Sign In
          </button>
        </form>
        <p className="text-gray-900 my-4">
          Need an account?{" "}
          <Link
            href="/register"
            className="text-blue-500 underline decoration-dotted"
          >
            register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const sessionAndUser = await getServerSessionAndUser(req, res);

  if (sessionAndUser?.sessionToken && sessionAndUser.user) {
    return { redirect: { destination: "/workspaces", permanent: false } };
  }

  return { props: {} };
};

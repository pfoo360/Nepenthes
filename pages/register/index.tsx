import {
  useState,
  useCallback,
  useEffect,
  MouseEvent,
  ChangeEvent,
} from "react";
import { useMutation, ApolloError } from "@apollo/client";
import userOperations from "../../graphql/User/operations";
import { CreateUserResponse } from "../../types/types";
import Error from "../../components/Error/Error";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import getServerSessionAndUser from "../../utils/getServerSessionAndUser";

const Register = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { push } = useRouter();

  const [createUser, { loading: submitting }] = useMutation<
    { createUser: CreateUserResponse },
    { username: string; email: string; password: string }
  >(userOperations.Mutation.CREATE_USER, {
    onCompleted: ({ createUser }) => {
      if (createUser.successStatus)
        setSuccessMessage("User created successfully");

      push("/signin");
    },
    onError: ({ graphQLErrors, message }) => {
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
    setSuccessMessage("");
    const { data } = await createUser({
      variables: { username, email, password },
    });
  };

  const [username, setUsername] = useState("");
  const [usernameInitialFocus, setUsernameInitialFocus] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  const [email, setEmail] = useState("");
  const [emailInitialFocus, setEmailInitialFocus] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [password, setPassword] = useState("");
  const [passwordInitialFocus, setPasswordInitialFocus] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordInitialFocus, setConfirmPasswordInitialFocus] =
    useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setUsername(e.target.value);
  };

  const handleUsernameInitialFocus = () => {
    if (usernameInitialFocus) return;
    console.log("usernameInitialFocus");
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

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setEmail(e.target.value);
  };

  const handleEmailInitialFocus = () => {
    if (emailInitialFocus) return;
    console.log("emailInitialFocus");
    setEmailInitialFocus(true);
  };

  useEffect(() => {
    setEmailError("");
    if (!email) setEmailError("Required");
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email))
      setEmailError("Invalid format");
  }, [email]);

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setPassword(e.target.value);
  };

  const handlePasswordInitialFocus = () => {
    if (passwordInitialFocus) return;
    console.log("pwInitialFocus");
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

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setConfirmPassword(e.target.value);
  };

  const handleConfirmPasswordInitialFocus = () => {
    if (confirmPasswordInitialFocus) return;
    console.log("confirmpwInitialFocus");
    setConfirmPasswordInitialFocus(true);
  };

  useEffect(() => {
    setConfirmPasswordError("");
    if (!confirmPassword) setConfirmPasswordError("Required");
    else if (confirmPassword !== password)
      setConfirmPasswordError("Does not match");
  }, [confirmPassword, password]);

  const inputRef = useCallback((node: HTMLInputElement | null) => {
    if (!node) return;
    node.focus();
  }, []);

  return (
    <div className={`fixed top-0 left-0 w-full h-full bg-gray-50`}>
      <form
        className={`border border-gray-400 flex flex-col justify-center items-center mx-8 mt-14 `}
      >
        {successMessage && (
          <p className={`text-lg text-emerald-600 my-1`}>{successMessage}</p>
        )}
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
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={handleEmailChange}
          onBlur={handleEmailInitialFocus}
          placeholder="Email"
          disabled={submitting}
          required
          className={`border border-gray-300 rounded-sm w-5/6 pl-2 py-1 mt-8 text-md placeholder-gray-400 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200`}
        />
        {emailInitialFocus && emailError && <Error message={emailError} />}
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
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          onBlur={handleConfirmPasswordInitialFocus}
          placeholder="Confirm password"
          disabled={submitting}
          required
          className={`border border-gray-300 rounded-sm w-5/6 pl-2 py-1 mt-8 text-md placeholder-gray-400 bg-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-200`}
        />
        {confirmPasswordInitialFocus && confirmPasswordError && (
          <Error message={confirmPasswordError} />
        )}
        <button
          type="submit"
          disabled={
            !!usernameError ||
            !!emailError ||
            !!passwordError ||
            !!confirmPasswordError ||
            submitting
          }
          onClick={handleSubmit}
          className={`w-5/6 my-8 py-3 bg-indigo-500 rounded-sm text-gray-50 hover:bg-indigo-600 active:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-300 disabled:bg-indigo-400`}
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const sessionAndUser = await getServerSessionAndUser(req, res);

  if (sessionAndUser) {
    return { redirect: { destination: "/dash", permanent: false } };
  }
  return { props: {} };
};

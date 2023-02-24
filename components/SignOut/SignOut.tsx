import { MouseEvent, FC } from "react";
import { useMutation } from "@apollo/client";
import authOperations from "../../graphql/Auth/operations";

const SignOut: FC = () => {
  const [signOut, { data, loading: isSubmitting, error }] = useMutation<{
    signOut: {
      successStatus: boolean;
      message: string;
    };
  }>(authOperations.Mutation.SIGN_OUT, {
    onError: (error, clientOptions) => {
      console.log("SIGN_OUT_ERROR", error);
    },
    update: (cache, { data }) => {},
    onCompleted: (data, clientOptions) => {
      if (data.signOut.successStatus) {
        location.reload();
      }
    },
  });

  const handleSignOutClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await signOut();
  };

  return (
    <button
      onClick={handleSignOutClick}
      disabled={isSubmitting}
      className="bg-indigo-300 px-2 py-1 rounded-sm text-gray-50 hover:bg-indigo-500 active:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-300 disabled:bg-indigo-200"
    >
      SignOut
    </button>
  );
};

export default SignOut;

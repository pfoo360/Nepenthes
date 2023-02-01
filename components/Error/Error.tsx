interface ErrorProps {
  message: string;
}

const Error: React.FC<ErrorProps> = ({ message }) => {
  return <p className={`text-base text-red-600 my-1 px-4`}>{message}</p>;
};

export default Error;

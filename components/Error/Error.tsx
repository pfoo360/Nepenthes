interface ErrorProps {
  message: string;
}

const Error: React.FC<ErrorProps> = ({ message }) => {
  return (
    <div className="flex flex-row justify-center mb-1">
      <p className={`text-base text-red-600`}>{message}</p>
    </div>
  );
};

export default Error;

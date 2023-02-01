import { FC, createContext, useState, useEffect } from "react";
import { User } from "../types/types";

export const UserContext = createContext<User | undefined>(undefined);

const UserProvider: FC<{ children: JSX.Element; value: User | undefined }> = ({
  children,
  value,
}) => {
  const [user, setUser] = useState(value);

  useEffect(() => {
    console.log("USERPROVIDER", value);
    setUser(value);
  }, [value]);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export default UserProvider;

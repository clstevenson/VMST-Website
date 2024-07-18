// provides context variables for all the navbar components
// used in Header.jsx to give context to NavBar.jsx and its "descendents"

import { createContext, useContext, useState } from "react";

const NavContext = createContext();
export const useNavContext = () => useContext(NavContext);

export const NavProvider = ({ children }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // does user want to log in (or sign up)?
  const [isLogin, setIsLogin] = useState(true);
  // control the state of the modal (Radix primitive Dialog)
  const [open, setOpen] = useState(false);
  // error message to display on modal
  const [message, setMessage] = useState("");

  return (
    <NavContext.Provider
      value={{
        email,
        setEmail,
        password,
        setPassword,
        isLogin,
        setIsLogin,
        open,
        setOpen,
        message,
        setMessage,
      }}
    >
      {children}
    </NavContext.Provider>
  );
};

/*
  This component will render the login modal. It is meant to be called as part of
  the Radix Dialog primitive; it does NOT include the trigger component that launches
  the modal. It includes all content/styling of the login and signup forms. It also
  includes the queries/mutations associated with logging in or creating a new user.
 */

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Modal from "./ModalStyles";

import LoginContent from "./LoginContent";
import SignupContent from "./SignupContent";

export default function LoginWindow({
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
}) {
  // tie form to state
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // will I need to useEffect to update a state variable to have NavBar re-rendederd?
  // for example, will the NavBar automatically re-render when the authorization expires?
  // I don't think so...
  // const [isLoggedIn, setIsLoggedIn] = useState(auth.loggedIn());

  return (
    <Dialog.Portal>
      <Modal.DialogOverlay />
      {isLogin ? (
        <LoginContent
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          setIsLogin={setIsLogin}
          open={open}
          setOpen={setOpen}
          message={message}
          setMessage={setMessage}
        />
      ) : (
        <SignupContent
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          setIsLogin={setIsLogin}
          first={firstName}
          setFirstName={setFirstName}
          last={lastName}
          setLastName={setLastName}
          message={message}
          setMessage={setMessage}
        />
      )}
    </Dialog.Portal>
  );
}

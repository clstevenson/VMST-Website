/*
  This component will render the login modal. It is meant to be called as part of
  the Radix Dialog primitive; it does NOT include the trigger component that launches
  the modal.
 */

import { useState } from "react";
import { useMutation } from "@apollo/client";
import styled from "styled-components";
import { X } from "react-feather";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import * as Separator from "@radix-ui/react-separator";

import { LOGIN_USER } from "../utils/mutations";
import { COLORS, WEIGHTS } from "../utils/constants";

export default function LoginWindow() {
  // tie form to state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  // toggle between signup or login
  const [isLogin, setIsLogin] = useState(true);

  // login checked on server
  const [login, { error, data }] = useMutation(LOGIN_USER);

  // will I need to useEffect to update a state variable to have NavBar re-rendederd?
  // for example, will the NavBar automatically re-render when the authorization expires?
  // I don't think so...
  // const [isLoggedIn, setIsLoggedIn] = useState(auth.loggedIn());

  return (
    <Dialog.Portal>
      <DialogOverlay />
      {isLogin ? (
        <LoginContent
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          setIsLogin={setIsLogin}
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
        />
      )}
    </Dialog.Portal>
  );
}

///////////////////////////////////////////////////////////////////////////////
//                            Internal Components                            //
///////////////////////////////////////////////////////////////////////////////

const LoginContent = ({
  email,
  setEmail,
  password,
  setPassword,
  setIsLogin,
}) => {
  // for email entry validation
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  const handleSubmit = (evt) => {
    evt.preventDefault();

    // attempt to log in

    // if successful, close modal, reset states, and go to User page

    // if not successful, display an error message on the modal (keeping info in input fields)
  };

  return (
    <DialogContent>
      <Xclose asChild>
        <X />
      </Xclose>
      <DialogTitle>Login</DialogTitle>
      <VisuallyHidden.Root asChild>
        <Dialog.Description>Enter your login information.</Dialog.Description>
      </VisuallyHidden.Root>
      <Form onSubmit={handleSubmit}>
        <InputWrapper>
          {/* TODO: add validation that field is not empty (onBlur) */}
          <label htmlFor="email">Email</label>
          <Input
            type="email"
            id="email"
            required
            value={email}
            tabIndex={1}
            onChange={(evt) => {
              setEmail(evt.target.value);
            }}
          />
        </InputWrapper>
        <InputWrapper>
          {/* TODO: add valudation that field is not empty (onBlue) */}
          <label htmlFor="password">Password</label>
          <Input
            type="password"
            id="password"
            required
            value={password}
            tabIndex={2}
            onChange={(evt) => {
              setPassword(evt.target.value);
            }}
          />
        </InputWrapper>
        <DialogButtonWrapper>
          <Dialog.Close asChild>
            <CloseButton tabIndex={3}>Close</CloseButton>
          </Dialog.Close>
          <SubmitButton type="submit" tabIndex={4}>
            Submit
          </SubmitButton>
        </DialogButtonWrapper>
      </Form>
      <SeparatorRoot />
      <SignupOrLogin>
        <p>Don&apos;t have an account?</p>
        <CloseButton tabIndex={5} onClick={() => setIsLogin(false)}>
          Sign Up
        </CloseButton>
      </SignupOrLogin>
    </DialogContent>
  );
};

const SignupContent = ({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  setIsLogin,
  first,
  setFirstName,
  last,
  setLastName,
}) => {
  // for email entry validation
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  const handleSubmit = (evt) => {
    evt.preventDefault();

    // attempt to sign up as a new user

    // if successful, close modal, reset states, and go to User page

    // if not successful, display an error message on the modal (keeping info in input fields)
  };

  return (
    <DialogContent>
      <Xclose asChild>
        <X />
      </Xclose>
      <DialogTitle>Sign Up</DialogTitle>
      <VisuallyHidden.Root asChild>
        <Dialog.Description>Enter your account information.</Dialog.Description>
      </VisuallyHidden.Root>
      <Form onSubmit={handleSubmit}>
        <InputWrapper>
          <label htmlFor="first">First name</label>
          <Input
            type="text"
            id="first"
            required
            value={first}
            tabIndex={1}
            onChange={(evt) => {
              setFirstName(evt.target.value);
            }}
          />
        </InputWrapper>
        <InputWrapper>
          <label htmlFor="last">Last name</label>
          <Input
            type="text"
            id="last"
            required
            value={last}
            tabIndex={1}
            onChange={(evt) => {
              setLastName(evt.target.value);
            }}
          />
        </InputWrapper>
        <InputWrapper>
          {/* TODO: add validation that field is not empty (onBlur) */}
          <label htmlFor="email">Email</label>
          <Input
            type="email"
            id="email"
            required
            value={email}
            tabIndex={1}
            onChange={(evt) => {
              setEmail(evt.target.value);
            }}
          />
        </InputWrapper>
        <InputWrapper>
          {/* TODO: add valudation that field is not empty (onBlue) */}
          <label htmlFor="password">Password</label>
          <Input
            type="password"
            id="password"
            required
            value={password}
            tabIndex={1}
            onChange={(evt) => {
              setPassword(evt.target.value);
            }}
          />
        </InputWrapper>
        <InputWrapper>
          {/* TODO: add validation/feedback that passwords match (onBlur; onChange?) */}
          <label htmlFor="confirm_password">Confirm password</label>
          <Input
            type="password"
            id="confirm_password"
            required
            value={confirmPassword}
            tabIndex={1}
            onChange={(evt) => {
              setConfirmPassword(evt.target.value);
            }}
          />
        </InputWrapper>
        <DialogButtonWrapper>
          <Dialog.Close asChild>
            <CloseButton tabIndex={3}>Close</CloseButton>
          </Dialog.Close>
          <SubmitButton type="submit" tabIndex={4}>
            Submit
          </SubmitButton>
        </DialogButtonWrapper>
      </Form>
      <SeparatorRoot />
      <SignupOrLogin>
        <p>Already have an account?</p>
        <CloseButton tabIndex={5} onClick={() => setIsLogin(true)}>
          Log In
        </CloseButton>
      </SignupOrLogin>
    </DialogContent>
  );
};

///////////////////////////////////////////////////////////////////////////////
//                             Styled Components                             //
///////////////////////////////////////////////////////////////////////////////

const SeparatorRoot = styled(Separator.Root)`
  background-color: ${COLORS.accent[7]};
  height: 1.5px;
  width: 90%;
  margin: 0 auto;
`;

const SignupOrLogin = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

const DialogContent = styled(Dialog.Content)`
  color: ${COLORS.accent[12]};
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-size: 1.1rem;
  padding: 24px;
  border: 1px solid ${COLORS.accent[7]};
  border-radius: 8px;
  background-color: white;
  position: fixed;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: fit-content;
  height: fit-content;
  box-shadow: 2px 4px 8px ${COLORS.gray[9]};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// email label and input field
const InputWrapper = styled.fieldset`
  border: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Input = styled.input`
  all: unset;
  width: 30ch;
  padding: 2px 10px;
  border: 1px solid ${COLORS.accent[7]};
  border-radius: 4px;
  outline-offset: 0;

  &:focus {
    outline: 2px solid ${COLORS.accent[10]};
    background-color: ${COLORS.accent[3]};
  }
`;

const CloseButton = styled.button`
  padding: 2px 16px;
  font-weight: ${WEIGHTS.medium};
  background-color: ${COLORS.accent[1]};
  border: 1px solid ${COLORS.accent[9]};
  border-radius: 4px;
  outline-offset: 0;

  &:hover,
  &:focus {
    outline: 2px solid ${COLORS.accent[11]};
    background-color: ${COLORS.accent[4]};
  }
`;

const SubmitButton = styled(CloseButton)`
  background-color: ${COLORS.accent[12]};
  color: white;

  &:hover,
  &:focus {
    background-color: ${COLORS.accent[11]};
  }
`;

const DialogTitle = styled(Dialog.Title)`
  font-size: 1.3em;
  font-weight: ${WEIGHTS.medium};
  color: ${COLORS.accent[12]};
`;

const DialogButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  padding: 12px;
`;

const DialogOverlay = styled(Dialog.Overlay)`
  --filter-width: 4px;
  backdrop-filter: blur(var(--filter-width));
  -webkit-backdrop-filter: blur(var(--filter-width));
  background-color: ${COLORS.overlay};
  position: absolute;
  inset: 0;
`;

const Xclose = styled(Dialog.Close)`
  position: absolute;
  top: 3px;
  right: 3px;
`;

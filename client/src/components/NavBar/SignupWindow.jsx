/*
 * This is the content of the signup portion of the login/signup modal,
 * as well as the associated mutation to create a new account.
 *
 * The styled components, most of which are shared between login and signup,
 * are stored in a separate file.
 */

import { useState } from "react";
import { X } from "react-feather";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import * as ModalStyle from "./ModalStyles";

import { useNavContext } from "./NavContext";

const SignupContent = () => {
  // tie form to state
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // get other state variables from context
  const { email, setEmail, password, setPassword, setIsLogin } =
    useNavContext();

  const handleSubmit = (evt) => {
    evt.preventDefault();

    // attempt to sign up as a new user

    // if successful, close modal, reset states, and go to User page

    // if not successful, display an error message on the modal (keeping info in input fields)
  };

  return (
    <ModalStyle.DialogContent>
      <ModalStyle.Xclose asChild>
        <X />
      </ModalStyle.Xclose>
      <ModalStyle.DialogTitle>Sign Up</ModalStyle.DialogTitle>
      <VisuallyHidden.Root asChild>
        <Dialog.Description>Enter your account information.</Dialog.Description>
      </VisuallyHidden.Root>
      <ModalStyle.Form onSubmit={handleSubmit}>
        <ModalStyle.InputWrapper>
          <label htmlFor="first">First name</label>
          <ModalStyle.Input
            type="text"
            id="first"
            required
            value={firstName}
            tabIndex={1}
            onChange={(evt) => {
              setFirstName(evt.target.value);
            }}
          />
        </ModalStyle.InputWrapper>
        <ModalStyle.InputWrapper>
          <label htmlFor="last">Last name</label>
          <ModalStyle.Input
            type="text"
            id="last"
            required
            value={lastName}
            tabIndex={1}
            onChange={(evt) => {
              setLastName(evt.target.value);
            }}
          />
        </ModalStyle.InputWrapper>
        <ModalStyle.InputWrapper>
          {/* TODO: add validation that field is not empty (onBlur) */}
          <label htmlFor="email">Email</label>
          <ModalStyle.Input
            type="email"
            id="email"
            required
            value={email}
            tabIndex={1}
            onChange={(evt) => {
              setEmail(evt.target.value);
            }}
          />
        </ModalStyle.InputWrapper>
        <ModalStyle.InputWrapper>
          {/* TODO: add valudation that field is not empty (onBlue) */}
          <label htmlFor="password">Password</label>
          <ModalStyle.Input
            type="password"
            id="password"
            required
            value={password}
            tabIndex={1}
            onChange={(evt) => {
              setPassword(evt.target.value);
            }}
          />
        </ModalStyle.InputWrapper>
        <ModalStyle.InputWrapper>
          {/* TODO: add validation/feedback that passwords match (onBlur; onChange?) */}
          <label htmlFor="confirm_password">Confirm password</label>
          <ModalStyle.Input
            type="password"
            id="confirm_password"
            required
            value={confirmPassword}
            tabIndex={1}
            onChange={(evt) => {
              setConfirmPassword(evt.target.value);
            }}
          />
        </ModalStyle.InputWrapper>
        <ModalStyle.DialogButtonWrapper>
          <Dialog.Close asChild>
            <ModalStyle.CloseButton tabIndex={3}>Close</ModalStyle.CloseButton>
          </Dialog.Close>
          <ModalStyle.SubmitButton type="submit" tabIndex={4}>
            Submit
          </ModalStyle.SubmitButton>
        </ModalStyle.DialogButtonWrapper>
      </ModalStyle.Form>
      <ModalStyle.SeparatorRoot />
      <ModalStyle.SignupOrLogin>
        <p>Already have an account?</p>
        <ModalStyle.CloseButton tabIndex={5} onClick={() => setIsLogin(true)}>
          Log In
        </ModalStyle.CloseButton>
      </ModalStyle.SignupOrLogin>
    </ModalStyle.DialogContent>
  );
};

export default SignupContent;

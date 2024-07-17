/*
 * This is the content of the signup portion of the login/signup modal,
 * as well as the associated mutation to create a new account.
 *
 * The styled components, most of which are shared between login and signup,
 * are stored in a separate file.
 */

import { X } from "react-feather";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import * as Modal from "./ModalStyles";

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
    <Modal.DialogContent>
      <Modal.Xclose asChild>
        <X />
      </Modal.Xclose>
      <Modal.DialogTitle>Sign Up</Modal.DialogTitle>
      <VisuallyHidden.Root asChild>
        <Dialog.Description>Enter your account information.</Dialog.Description>
      </VisuallyHidden.Root>
      <Modal.Form onSubmit={handleSubmit}>
        <Modal.InputWrapper>
          <label htmlFor="first">First name</label>
          <Modal.Input
            type="text"
            id="first"
            required
            value={first}
            tabIndex={1}
            onChange={(evt) => {
              setFirstName(evt.target.value);
            }}
          />
        </Modal.InputWrapper>
        <Modal.InputWrapper>
          <label htmlFor="last">Last name</label>
          <Modal.Input
            type="text"
            id="last"
            required
            value={last}
            tabIndex={1}
            onChange={(evt) => {
              setLastName(evt.target.value);
            }}
          />
        </Modal.InputWrapper>
        <Modal.InputWrapper>
          {/* TODO: add validation that field is not empty (onBlur) */}
          <label htmlFor="email">Email</label>
          <Modal.Input
            type="email"
            id="email"
            required
            value={email}
            tabIndex={1}
            onChange={(evt) => {
              setEmail(evt.target.value);
            }}
          />
        </Modal.InputWrapper>
        <Modal.InputWrapper>
          {/* TODO: add valudation that field is not empty (onBlue) */}
          <label htmlFor="password">Password</label>
          <Modal.Input
            type="password"
            id="password"
            required
            value={password}
            tabIndex={1}
            onChange={(evt) => {
              setPassword(evt.target.value);
            }}
          />
        </Modal.InputWrapper>
        <Modal.InputWrapper>
          {/* TODO: add validation/feedback that passwords match (onBlur; onChange?) */}
          <label htmlFor="confirm_password">Confirm password</label>
          <Modal.Input
            type="password"
            id="confirm_password"
            required
            value={confirmPassword}
            tabIndex={1}
            onChange={(evt) => {
              setConfirmPassword(evt.target.value);
            }}
          />
        </Modal.InputWrapper>
        <Modal.DialogButtonWrapper>
          <Dialog.Close asChild>
            <Modal.CloseButton tabIndex={3}>Close</Modal.CloseButton>
          </Dialog.Close>
          <Modal.SubmitButton type="submit" tabIndex={4}>
            Submit
          </Modal.SubmitButton>
        </Modal.DialogButtonWrapper>
      </Modal.Form>
      <Modal.SeparatorRoot />
      <Modal.SignupOrLogin>
        <p>Already have an account?</p>
        <Modal.CloseButton tabIndex={5} onClick={() => setIsLogin(true)}>
          Log In
        </Modal.CloseButton>
      </Modal.SignupOrLogin>
    </Modal.DialogContent>
  );
};

export default SignupContent;

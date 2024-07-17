/*
 * This is the content of the login portion of the login/signup modal,
 * as well as the associated mutation to login to an existing account.
 *
 * The styled components, most of which are shared between login and signup,
 * are stored in a separate file.
 */

import { X } from "react-feather";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import * as Modal from "./ModalStyles";

import { useMutation } from "@apollo/client";
import Auth from "../../utils/auth";
import { LOGIN_USER } from "../../utils/mutations";

const LoginContent = ({
  email,
  setEmail,
  password,
  setPassword,
  setIsLogin,
  open,
  setOpen,
  message,
  setMessage,
}) => {
  // login checked on server
  const [login] = useMutation(LOGIN_USER);

  const handleSubmit = async (evt) => {
    evt.preventDefault();

    // attempt to log in
    // if successful, close modal, reset states, and go to User page
    try {
      const { data } = await login({ variables: { email, password } });
      // store the token in browser
      // load the account page (with greeting)
      Auth.login(data.login.token);
      // close the modal
      setOpen(false);
      // reset states
      setEmail("");
      setPassword("");
      setIsLogin(true);
      setMessage("");
      setOpen(false);
    } catch (error) {
      // display error
      setMessage("Something went wrong. Please check your email and password.");
      console.log(`Error: ${error}`);
    }
  };

  return (
    <Modal.DialogContent>
      <Modal.Xclose asChild>
        <X />
      </Modal.Xclose>
      <Modal.DialogTitle>Login</Modal.DialogTitle>
      <VisuallyHidden.Root asChild>
        <Dialog.Description>Enter your login information.</Dialog.Description>
      </VisuallyHidden.Root>
      <Modal.Form onSubmit={(evt) => handleSubmit(evt)}>
        <Modal.InputWrapper>
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
          <label htmlFor="password">Password</label>
          <Modal.Input
            type="password"
            id="password"
            required
            value={password}
            tabIndex={2}
            onChange={(evt) => {
              setPassword(evt.target.value);
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
      {/* Put notifications here */}
      {message && (
        <>
          <Modal.ErrorMessage>{message}</Modal.ErrorMessage>
          <Modal.ForgotInfo>Click here if you forgot your password.</Modal.ForgotInfo>
        </>
      )}
      <Modal.SeparatorRoot />
      <Modal.SignupOrLogin>
        <p>Don&apos;t have an account?</p>
        <Modal.CloseButton tabIndex={5} onClick={() => setIsLogin(false)}>
          Sign Up
        </Modal.CloseButton>
      </Modal.SignupOrLogin>
    </Modal.DialogContent>
  );
};

export default LoginContent;

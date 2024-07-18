/* eslint-disable react/prop-types */
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
import * as ModalStyle from "./ModalStyles";

import { useMutation } from "@apollo/client";
import Auth from "../../utils/auth";
import { LOGIN_USER } from "../../utils/mutations";

const LoginContent = ({
  email,
  setEmail,
  password,
  setPassword,
  setIsLogin,
  setOpen,
  message,
  setMessage,
}) => {
  // clear all input fields (but not any error messages)
  const clearForm = () => {
    setEmail("");
    setPassword("");
  };

  // login checked on server
  const [login, { error, data }] = useMutation(LOGIN_USER);

  const handleSubmit = async (evt) => {
    evt.preventDefault();

    // attempt to log in
    // if successful, close modal, reset states, and go to User page
    try {
      const { data } = await login({ variables: { email, password } });

      // reset states and close the modal
      setEmail("");
      setPassword("");
      setIsLogin(true);
      setMessage("");
      setOpen(false);

      // store the token in browser
      // load the account page (with greeting)
      Auth.login(data.login.token);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <ModalStyle.DialogContent>
      <ModalStyle.Xclose asChild>
        <X />
      </ModalStyle.Xclose>
      <ModalStyle.DialogTitle>Login</ModalStyle.DialogTitle>

      {/* Description not shown visually (but yes to screenreaders) */}
      <VisuallyHidden.Root asChild>
        <Dialog.Description>Enter your login information.</Dialog.Description>
      </VisuallyHidden.Root>

      {/* login form */}
      <ModalStyle.Form
        onSubmit={(evt) => handleSubmit(evt)}
        aria-labelledby="login"
      >
        <ModalStyle.InputWrapper>
          <label htmlFor="email">Email</label>
          <ModalStyle.Input
            type="email"
            id="email"
            required
            value={email}
            tabIndex={0}
            onChange={(evt) => {
              setEmail(evt.target.value);
            }}
          />
        </ModalStyle.InputWrapper>
        <ModalStyle.InputWrapper>
          <label htmlFor="password">Password</label>
          <ModalStyle.Input
            type="password"
            id="password"
            required
            value={password}
            tabIndex={0}
            onChange={(evt) => {
              setPassword(evt.target.value);
            }}
          />
        </ModalStyle.InputWrapper>
        <ModalStyle.DialogButtonWrapper>
          <Dialog.Close asChild>
            <ModalStyle.CloseButton tabIndex={0}>Close</ModalStyle.CloseButton>
          </Dialog.Close>
          <ModalStyle.SubmitButton type="submit" tabIndex={0}>
            Submit
          </ModalStyle.SubmitButton>
        </ModalStyle.DialogButtonWrapper>
      </ModalStyle.Form>

      {/* error messsage (if any) appears below */}
      {message && (
        <>
          <ModalStyle.ErrorMessage>{message}</ModalStyle.ErrorMessage>
          {/* TODO: offer user the option to reset password */}
          <ModalStyle.ForgotInfo>
            Click here if you forgot your password.
          </ModalStyle.ForgotInfo>
        </>
      )}

      {/* allow user to switch to other form */}
      <ModalStyle.SeparatorRoot />
      <ModalStyle.SignupOrLogin>
        <p>Don&apos;t have an account?</p>
        <ModalStyle.CloseButton
          tabIndex={0}
          onClick={() => {
            setIsLogin(false);
            setMessage("");
            clearForm();
          }}
        >
          Sign Up
        </ModalStyle.CloseButton>
      </ModalStyle.SignupOrLogin>
    </ModalStyle.DialogContent>
  );
};

export default LoginContent;

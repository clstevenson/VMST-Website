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

import { useNavContext } from "./NavContext";
import { useMutation } from "@apollo/client";
import Auth from "../../utils/auth";
import { LOGIN_USER } from "../../utils/mutations";

const LoginContent = () => {
  // get state variables and setters from context
  const {
    email,
    setEmail,
    password,
    setPassword,
    setIsLogin,
    setOpen,
    message,
    setMessage,
  } = useNavContext();

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
    <ModalStyle.DialogContent>
      <ModalStyle.Xclose asChild>
        <X />
      </ModalStyle.Xclose>
      <ModalStyle.DialogTitle>Login</ModalStyle.DialogTitle>
      <VisuallyHidden.Root asChild>
        <Dialog.Description>Enter your login information.</Dialog.Description>
      </VisuallyHidden.Root>
      <ModalStyle.Form onSubmit={(evt) => handleSubmit(evt)}>
        <ModalStyle.InputWrapper>
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
          <label htmlFor="password">Password</label>
          <ModalStyle.Input
            type="password"
            id="password"
            required
            value={password}
            tabIndex={2}
            onChange={(evt) => {
              setPassword(evt.target.value);
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
      {/* Put notifications here */}
      {message && (
        <>
          <ModalStyle.ErrorMessage>{message}</ModalStyle.ErrorMessage>
          <ModalStyle.ForgotInfo>
            Click here if you forgot your password.
          </ModalStyle.ForgotInfo>
        </>
      )}
      <ModalStyle.SeparatorRoot />
      <ModalStyle.SignupOrLogin>
        <p>Don&apos;t have an account?</p>
        <ModalStyle.CloseButton tabIndex={5} onClick={() => setIsLogin(false)}>
          Sign Up
        </ModalStyle.CloseButton>
      </ModalStyle.SignupOrLogin>
    </ModalStyle.DialogContent>
  );
};

export default LoginContent;

/* eslint-disable react/prop-types */
/*
 * This is the content of the login portion of the login/signup modal,
 * as well as the associated mutation to login to an existing account.
 *
 * The styled components, most of which are shared between login and signup,
 * are stored in a separate file.
 */

import { useForm } from "react-hook-form";
import { X } from "react-feather";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import * as ModalStyle from "./ModalStyles";

import { useMutation } from "@apollo/client";
import Auth from "../../utils/auth";
import { LOGIN_USER } from "../../utils/mutations";

const LoginContent = ({ setIsLogin, setOpen, message, setMessage }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // login checked on server
  const [login, { error, data }] = useMutation(LOGIN_USER);

  const onSubmit = async ({ email, password }) => {
    // attempt to log in
    // if successful, close modal, reset states, and go to User page
    try {
      const { data } = await login({ variables: { email, password } });

      // reset states and close the modal
      setIsLogin(true);
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
        // onSubmit={(evt) => handleSubmit(evt)}
        onSubmit={handleSubmit(onSubmit)}
        aria-labelledby="login"
      >
        <ModalStyle.InputWrapper>
          <label htmlFor="email">Email</label>
          <ModalStyle.Input
            tabIndex={0}
            id="email"
            aria-invalid={errors.email ? "true" : "false"}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^([a-zA-Z0-9_.-]+)@([\da-z.-]+)\.([a-z.]{2,6})$/,
                message: "Not a valid email address",
              },
            })}
          />
          {/* output error message from validation */}
          {errors.email?.message && (
            <ModalStyle.ErrorMessage>
              {errors.email.message}
            </ModalStyle.ErrorMessage>
          )}
        </ModalStyle.InputWrapper>
        <ModalStyle.InputWrapper>
          <label htmlFor="password">Password</label>
          <ModalStyle.Input
            tabIndex={0}
            type="password"
            id="password"
            aria-invalid={errors.password ? "true" : "false"}
            {...register("password", {
              required: "Password is required",
            })}
          />
          {/* output error message from validation */}
          {errors.password?.message && (
            <ModalStyle.ErrorMessage>
              {errors.password.message}
            </ModalStyle.ErrorMessage>
          )}
        </ModalStyle.InputWrapper>
        <ModalStyle.DialogButtonWrapper>
          <Dialog.Close asChild>
            <ModalStyle.CloseButton tabIndex={0}>Close</ModalStyle.CloseButton>
          </Dialog.Close>
          <ModalStyle.SubmitButton
            type="submit"
            disabled={isSubmitting}
            tabIndex={0}
          >
            {isSubmitting ? "working..." : "Submit"}
          </ModalStyle.SubmitButton>
        </ModalStyle.DialogButtonWrapper>
      </ModalStyle.Form>

      {/* Something went wrong on the server */}
      {message && <ModalStyle.ErrorMessage>{message}</ModalStyle.ErrorMessage>}

      {/* allow user to switch to other form */}
      <ModalStyle.SeparatorRoot />
      <ModalStyle.SignupOrLogin>
        <p>Don&apos;t have an account?</p>
        <ModalStyle.CloseButton
          tabIndex={0}
          onClick={() => {
            setIsLogin(false);
            setMessage("");
          }}
        >
          Sign Up
        </ModalStyle.CloseButton>
      </ModalStyle.SignupOrLogin>
    </ModalStyle.DialogContent>
  );
};

export default LoginContent;

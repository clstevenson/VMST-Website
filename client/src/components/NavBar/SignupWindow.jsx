/* eslint-disable react/prop-types */
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

import { useMutation } from "@apollo/client";
import { ADD_USER } from "../../utils/mutations";
import Auth from "../../utils/auth";

const SignupContent = ({
  email,
  setEmail,
  password,
  setPassword,
  setIsLogin,
  setOpen,
  message,
  setMessage,
}) => {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [addUser, { error, data }] = useMutation(ADD_USER);

  // clear all input fields (but not any error messages)
  const clearForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();

    // check email
    const emailRegex = /^([a-zA-Z0-9_.-]+)@([\da-z.-]+)\.([a-z.]{2,6})$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    // make sure the passwords match and that it is long enough
    if (password !== confirmPassword) {
      setMessage("Passwords don't match, please try again.");
      return;
    } else if (password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      return;
    }

    // create a new account
    try {
      const { data } = await addUser({
        variables: {
          firstName,
          lastName,
          email,
          password,
        },
      });

      // close modal and reset states
      clearForm();

      // store the token in the browser
      Auth.login(data.addUser.token);
    } catch (err) {
      // TODO: need to display better error messages
      setMessage(`Server error: ${err}`);
    }

    // if not successful, display an error message on the modal (keeping info in input fields)
  };

  return (
    <ModalStyle.DialogContent>
      <ModalStyle.Xclose asChild>
        <X />
      </ModalStyle.Xclose>
      <ModalStyle.DialogTitle>Sign Up</ModalStyle.DialogTitle>

      {/* Description not shown visually (but yes to screenreaders) */}
      <VisuallyHidden.Root asChild>
        <Dialog.Description>Enter your account information.</Dialog.Description>
      </VisuallyHidden.Root>

      {/* signup form */}
      <ModalStyle.Form onSubmit={(evt) => handleSubmit(evt)}>
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
          <label htmlFor="email">Email (must be unique)</label>
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
          <label htmlFor="password">Password (6+ characters)</label>
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

      {/* error messsage (if any) appears below */}
      {message && <ModalStyle.ErrorMessage>{message}</ModalStyle.ErrorMessage>}

      {/* allow user to switch to other form */}
      <ModalStyle.SeparatorRoot />
      <ModalStyle.SignupOrLogin>
        <p>Already have an account?</p>
        <ModalStyle.CloseButton
          tabIndex={5}
          onClick={() => {
            setIsLogin(true);
            setMessage("");
            clearForm();
          }}
        >
          Log In
        </ModalStyle.CloseButton>
      </ModalStyle.SignupOrLogin>
    </ModalStyle.DialogContent>
  );
};

export default SignupContent;

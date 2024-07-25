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
import ErrorMessage from "../Styled/ErrorMessage";

import { useMutation } from "@apollo/client";
import { ADD_USER } from "../../utils/mutations";
import Auth from "../../utils/auth";
import { useForm } from "react-hook-form";

const SignupContent = ({ setIsLogin, message, setMessage }) => {
  const {
    register,
    handleSubmit,
    getValues,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm();

  // mutation to add a new user
  const [addUser, { error, data }] = useMutation(ADD_USER);

  const onSubmit = async ({ firstName, lastName, email, password }) => {
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
      // store the token in the browser
      Auth.login(data.addUser.token);
    } catch (err) {
      if (err.message.includes("E11000")) {
        setMessage("Error: an account with that email already exists");
        setFocus("email");
      } else setMessage(`Error: ${err.message}`);
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
      <ModalStyle.Form
        onSubmit={handleSubmit(onSubmit)}
        aria-labelledby="signup"
      >
        <ModalStyle.InputWrapper>
          <label htmlFor="first">First name</label>
          <ModalStyle.Input
            tabIndex={0}
            type="text"
            id="first"
            aria-invalid={errors.firstName ? "true" : "false"}
            {...register("firstName", {
              required: "First name is required",
            })}
          />
          {/* output error message from validation */}
          {errors.firstName?.message && (
            <ErrorMessage>{errors.firstName.message}</ErrorMessage>
          )}
        </ModalStyle.InputWrapper>
        <ModalStyle.InputWrapper>
          <label htmlFor="last">Last name</label>
          <ModalStyle.Input
            tabIndex={0}
            type="text"
            id="last"
            aria-invalid={errors.lastName ? "true" : "false"}
            {...register("lastName", {
              required: "Last name is required",
            })}
          />
          {/* output error message from validation */}
          {errors.lastName?.message && (
            <ErrorMessage>{errors.lastName.message}</ErrorMessage>
          )}
        </ModalStyle.InputWrapper>
        <ModalStyle.InputWrapper>
          <label htmlFor="email">Email (must be unique)</label>
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
            <ErrorMessage>{errors.email.message}</ErrorMessage>
          )}
        </ModalStyle.InputWrapper>
        <ModalStyle.InputWrapper>
          <label htmlFor="password">Password (6+ characters)</label>
          <ModalStyle.Input
            tabIndex={0}
            type="password"
            id="password"
            aria-invalid={errors.password ? "true" : "false"}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password is too short",
              },
            })}
          />
          {/* output error message from validation */}
          {errors.password?.message && (
            <ErrorMessage>{errors.password.message}</ErrorMessage>
          )}
        </ModalStyle.InputWrapper>
        <ModalStyle.InputWrapper>
          {/* TODO: add validation/feedback that passwords match (onBlur; onChange?) */}
          <label htmlFor="confirm_password">Confirm password</label>
          <ModalStyle.Input
            tabIndex={0}
            type="password"
            id="confirm_password"
            aria-invalid={errors.confirmPassword ? "true" : "false"}
            {...register("confirmPassword", {
              required: true,
              validate: (val) => {
                if (val !== getValues("password"))
                  return "Your passwords do not match";
                return true;
              },
            })}
          />
          {/* output error message from validation */}
          {errors.confirmPassword?.message && (
            <ErrorMessage>{errors.confirmPassword.message}</ErrorMessage>
          )}
        </ModalStyle.InputWrapper>
        <ModalStyle.DialogButtonWrapper>
          <Dialog.Close asChild>
            <ModalStyle.CloseButton tabIndex={0}>Close</ModalStyle.CloseButton>
          </Dialog.Close>
          <ModalStyle.SubmitButton
            disabled={isSubmitting}
            type="submit"
            tabIndex={0}
          >
            {isSubmitting ? "working..." : "Submit"}
          </ModalStyle.SubmitButton>
        </ModalStyle.DialogButtonWrapper>
      </ModalStyle.Form>

      {/* error messsage (if any) appears below */}
      {message && <ErrorMessage>{message}</ErrorMessage>}

      {/* allow user to switch to other form */}
      <ModalStyle.SeparatorRoot />
      <ModalStyle.SignupOrLogin>
        <p>Already have an account?</p>
        <ModalStyle.CloseButton
          tabIndex={0}
          onClick={() => {
            setIsLogin(true);
            setMessage("");
          }}
        >
          Log In
        </ModalStyle.CloseButton>
      </ModalStyle.SignupOrLogin>
    </ModalStyle.DialogContent>
  );
};

export default SignupContent;

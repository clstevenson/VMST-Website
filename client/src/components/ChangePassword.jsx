/* 
 This component is a modal for a logged-in user to change their password.

 It is part of the radix Dialog component (ie, the Dialog.Content)
 */

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import * as Dialog from "@radix-ui/react-dialog";
import * as ModalStyle from "../components/NavBar/ModalStyles";
import { X } from "react-feather";
import ErrorMessage from "../components/Styled/ErrorMessage";
import SubmitButton from "../components/Styled/SubmiButton";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { CHANGE_PASSWORD } from "../utils/mutations";
import ToastMessage from "./ToastMessage";

export default function ChangePassword({ setOpen }) {
  const [changePassword] = useMutation(CHANGE_PASSWORD);
  // general message to display
  const [message, setMessage] = useState("");
  // status of request
  const [passwordChanged, setPasswordChanged] = useState(false);
  // react-hook-form methods
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ password }) => {
    // attempt to change password
    try {
      const { data } = await changePassword({ variables: { password } });
      if (data) setPasswordChanged(true);
      reset();
      setOpen(false);
    } catch (err) {
      setMessage(`Something went wrong: ${err}`);
    }
  };

  return (
    <>
      <ModalStyle.DialogContent>
        <ModalStyle.Xclose asChild>
          <X />
        </ModalStyle.Xclose>
        <ModalStyle.DialogTitle>Change Password</ModalStyle.DialogTitle>

        <VisuallyHidden.Root asChild>
          <Dialog.Description>Enter your login information.</Dialog.Description>
        </VisuallyHidden.Root>

        <ModalStyle.Form
          onSubmit={handleSubmit(onSubmit)}
          aria-labelledby="change password"
        >
          {/* password input */}
          <ModalStyle.InputWrapper>
            <label htmlFor="password">New password (6+ characters)</label>
            <ModalStyle.Input
              id="password"
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password is too short",
                },
              })}
            />
            {errors.password?.message && (
              <ErrorMessage>{errors.password.message}</ErrorMessage>
            )}
          </ModalStyle.InputWrapper>

          {/* confirmation input */}
          <ModalStyle.InputWrapper>
            <label htmlFor="confirmation">Confirm password</label>
            <ModalStyle.Input
              id="confirmation"
              type="password"
              {...register("confirmation", {
                required: "Confirmation required",
                validate: (val) => {
                  if (val !== getValues("password"))
                    return "Your passwords do not match";
                  return true;
                },
              })}
            />
            {errors.confirmation?.message && (
              <ErrorMessage>{errors.confirmation.message}</ErrorMessage>
            )}
          </ModalStyle.InputWrapper>

          <ModalStyle.DialogButtonWrapper>
            <Dialog.Close asChild>
              <ModalStyle.CloseButton tabIndex={0}>
                Close
              </ModalStyle.CloseButton>
            </Dialog.Close>
            <SubmitButton disabled={isSubmitting} type="submit">
              {isSubmitting ? "working..." : "Submit"}
            </SubmitButton>
          </ModalStyle.DialogButtonWrapper>

          {/* general error message */}
          {message && <ErrorMessage>{message}</ErrorMessage>}
        </ModalStyle.Form>
      </ModalStyle.DialogContent>
      {passwordChanged && (
        <ToastMessage
          duration={2000}
          toastCloseEffect={() => {
            setPasswordChanged(false);
          }}
        >
          Success! Your password has been changed.
        </ToastMessage>
      )}
    </>
  );
}

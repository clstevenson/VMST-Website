/* 
 This component is a modal for a logged-in user to indicate a desire to change their email.  It is part of the radix Dialog component (ie, the Dialog.Content) and it is based on the very similar 
 ChangePassword component, though it doesn't actually perform a mutation.

 TODO: Abstract the two into one component and switch between them with an prop
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import * as Dialog from "@radix-ui/react-dialog";
import * as ModalStyle from "./Styled/ModalStyles";
import { X } from "react-feather";
import ErrorMessage from "../components/Styled/ErrorMessage";
import SubmitButton from "../components/Styled/SubmiButton";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export default function ChangeEmail({ setOpen, user, setUser }) {
  // general message to display
  const [message, setMessage] = useState("");
  // react-hook-form methods
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    // use setUser to update the email address
    setUser({ ...user, email: data.email });
    reset();
    setOpen(false);
  };

  return (
    <>
      <ModalStyle.DialogContent>
        <ModalStyle.Xclose asChild>
          <X />
        </ModalStyle.Xclose>
        <ModalStyle.DialogTitle>Change Email</ModalStyle.DialogTitle>

        <Dialog.Description>
          Since it is used for logging in, you must confirm a change in email
          address.
        </Dialog.Description>

        <ModalStyle.Form
          aria-labelledby="change email"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* password input */}
          <ModalStyle.InputWrapper>
            <label htmlFor="email">New email</label>
            <ModalStyle.Input
              id="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^([a-zA-Z0-9_.-]+)@([\da-z.-]+)\.([a-z.]{2,6})$/,
                  message: "Not a valid email address",
                },
              })}
            />
            {errors.password?.message && (
              <ErrorMessage>{errors.password.message}</ErrorMessage>
            )}
          </ModalStyle.InputWrapper>

          {/* confirmation input */}
          <ModalStyle.InputWrapper>
            <label htmlFor="confirmation">Confirm email</label>
            <ModalStyle.Input
              id="confirmation"
              {...register("confirmation", {
                required: "Confirmation required",
                validate: (val) => {
                  if (val !== getValues("email"))
                    return "Your email addresses do not match";
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
              OK
            </SubmitButton>
          </ModalStyle.DialogButtonWrapper>

          {/* general error message */}
          {message && <ErrorMessage>{message}</ErrorMessage>}
        </ModalStyle.Form>
      </ModalStyle.DialogContent>
    </>
  );
}

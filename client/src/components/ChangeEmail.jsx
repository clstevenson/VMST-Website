/* 
 This component is a modal for a logged-in user to indicate a desire to change their email.  It is part of the radix Dialog component (ie, the Dialog.Content) and it is based on the very similar 
 ChangePassword component, though it doesn't actually perform a mutation.

 TODO: Abstract the two into one component and switch between them with an prop
 */

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as ModalStyle from "./Styled/ModalStyles";
import { X } from "react-feather";
import { useLazyQuery } from "@apollo/client";

import { QUERY_EMAIL } from "../utils/queries";
import ErrorMessage from "../components/Styled/ErrorMessage";
import SubmitButton from "../components/Styled/SubmiButton";
import Spinner from "./Spinner";
import styled from "styled-components";

export default function ChangeEmail({ setOpen, user, setUser }) {
  // general message to display
  const [message, setMessage] = useState("");
  // constrolled form values
  const [email, setEmail] = useState("");
  const [confirmation, setConfirmation] = useState("");
  // check if email already being used
  const [emailDuplicate, setEmailDuplicate] = useState(false);

  // email validation; this is the regex the HTML form uses for validation
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  const [emailExists, { loading }] = useLazyQuery(QUERY_EMAIL, {
    onCompleted: (data) => {
      if (data.emailExists === null) {
        setMessage("");
        return;
      }
      if (data.emailExists._id) {
        setMessage(
          "That email address is already in use; please choose another."
        );
        setEmailDuplicate(true);
      }
    },
  });

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    // if "duplicate email" error has been thrown return early
    if (emailDuplicate) return;
    // check that the emails match, return early if they don't
    if (email !== confirmation) {
      setMessage("Emails do not match");
      return;
    }
    // use setUser to update the email address
    setUser({ ...user, email });
    // clean up
    setEmailDuplicate(false);
    setMessage("");
    setEmail("");
    setConfirmation("");
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
          onSubmit={(evt) => handleSubmit(evt)}
        >
          {/* password input */}
          <ModalStyle.InputWrapper>
            <label htmlFor="email">New email</label>
            <ModalStyle.Input
              id="email"
              type="email"
              value={email}
              onBlur={(e) => {
                // if empty don't do anything
                if (email === "") return;
                // check that it is a valid email address first (avoid query if possible)
                if (!emailRegex.test(email)) {
                  setMessage("Not a valid email address");
                  return;
                }
                // check if email is already being used
                emailExists({ variables: { email: e.target.value } });
              }}
              onChange={(e) => {
                if (message) setMessage("");
                setEmail(e.target.value);
              }}
            />
          </ModalStyle.InputWrapper>

          {/* confirmation input */}
          <ModalStyle.InputWrapper>
            <label htmlFor="confirmation">Confirm email</label>
            <ModalStyle.Input
              id="confirmation"
              type="email"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
            />
          </ModalStyle.InputWrapper>

          <ModalStyle.DialogButtonWrapper>
            <Dialog.Close asChild>
              <ModalStyle.CloseButton>Close</ModalStyle.CloseButton>
            </Dialog.Close>
            <SubmitButton disabled={emailDuplicate} type="submit">
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

const SpinnerWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

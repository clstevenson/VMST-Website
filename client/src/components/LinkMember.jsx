/*
 Modal for a logged-in user to link their account to their USMS membership
 record by USMS ID. Unlike ChangeEmail (which only stages a local edit until
 "Save Changes" is pressed), this performs the linkMember mutation directly
 on submit -- the modal stays open until the server confirms a match.
 */

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as ModalStyle from "./Styled/ModalStyles";
import { X } from "react-feather";
import { useMutation } from "@apollo/client";

import { LINK_MEMBER } from "../utils/mutations";
import ErrorMessage from "../components/Styled/ErrorMessage";
import SubmitButton from "../components/Styled/SubmiButton";

export default function LinkMember({ setOpen, onLinked }) {
  const [usmsId, setUsmsId] = useState("");
  const [message, setMessage] = useState("");

  const [linkMember, { loading }] = useMutation(LINK_MEMBER);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (usmsId.length !== 5) {
      setMessage("USMS ID must be exactly 5 characters.");
      return;
    }
    try {
      const { data } = await linkMember({ variables: { usmsId } });
      onLinked(data.linkMember);
      setOpen(false);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <ModalStyle.DialogContent>
      <ModalStyle.Xclose asChild>
        <X />
      </ModalStyle.Xclose>
      <ModalStyle.DialogTitle>Link USMS Membership</ModalStyle.DialogTitle>

      <Dialog.Description>
        Enter your permanent 5-character USMS ID (the last 5 digits of your USMS
        number). You must be a currently registered USMS member for this to
        succeed.
      </Dialog.Description>

      <ModalStyle.Form
        aria-labelledby="link USMS membership"
        onSubmit={handleSubmit}
      >
        <ModalStyle.InputWrapper>
          <label htmlFor="usmsId">USMS ID</label>
          <ModalStyle.Input
            id="usmsId"
            type="text"
            maxLength={5}
            value={usmsId}
            onChange={(e) => {
              if (message) setMessage("");
              setUsmsId(e.target.value.trim());
            }}
          />
        </ModalStyle.InputWrapper>

        <ModalStyle.DialogButtonWrapper>
          <Dialog.Close asChild>
            <ModalStyle.CloseButton type="button">
              Cancel
            </ModalStyle.CloseButton>
          </Dialog.Close>
          <SubmitButton disabled={loading} type="submit">
            {loading ? "Checking..." : "Submit"}
          </SubmitButton>
        </ModalStyle.DialogButtonWrapper>

        {message && <ErrorMessage>{message}</ErrorMessage>}
      </ModalStyle.Form>
    </ModalStyle.DialogContent>
  );
}

/* 
 Alert dialog box based on styled Radix primitive.
 Input props:
 - CB function to execute if user confirms the action that prompted the alert
 - CB function to execute if the user cancels the action
 - title of the alert dialog (usually bolded/heading), displayed to user
 - description of the alert dialog
 - actionText (defaults to "Proceed") to be used on the action button
 - child (used as the trigger for the alert)
 - props to be forwarded to AlertDialog.Root

 In this component, AlertDialog.Trigger is set to "asChild=true" which means that the trigger styling is controlled by the calling component. It also means you usualy want to use a button as the trigger element (ie, child prop).
 */

import styled from "styled-components";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as ModalStyles from "./Styled/ModalStyles";
import { COLORS } from "../utils/constants";

export default function Alert({
  title,
  description,
  actionText = "Proceed",
  confirmAction,
  cancelAction,
  children,
  ...delegated
}) {
  return (
    <AlertDialog.Root {...delegated}>
      <AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <ModalStyles.AlertOverlay />
        <ModalStyles.AlertContent>
          <AlertDialog.Title>{title}</AlertDialog.Title>
          <AlertDialog.Description>{description}</AlertDialog.Description>
          <ModalStyles.DialogButtonWrapper>
            <ModalStyles.CloseButton onClick={cancelAction}>
              Cancel
            </ModalStyles.CloseButton>
            <ActionButton onClick={confirmAction}>{actionText}</ActionButton>
          </ModalStyles.DialogButtonWrapper>
        </ModalStyles.AlertContent>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

const ActionButton = styled(ModalStyles.CloseButton)`
  color: ${COLORS.text};
  background-color: ${COLORS.urgent_light};
  border-color: black;

  &:hover {
    background-color: ${COLORS.urgent};
  }
`;

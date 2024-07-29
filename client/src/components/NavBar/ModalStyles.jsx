/*
 * Styled Components for login/signup modals
 */

import styled from "styled-components";
import * as Separator from "@radix-ui/react-separator";
import * as Dialog from "@radix-ui/react-dialog";
import { COLORS, QUERIES, WEIGHTS } from "../../utils/constants";

// dividing line between form and signup vs login prompt
export const SeparatorRoot = styled(Separator.Root)`
  background-color: ${COLORS.accent[7]};
  height: 1.5px;
  width: 90%;
  margin: 0 auto;
`;

// div containing prompt and button to switch between modals
export const SignupOrLogin = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: 3fr minmax(120px, 1fr);
  align-items: center;

  & p {
    text-align: right;
  }
`;

// wrapper for modal content
export const DialogContent = styled(Dialog.Content)`
  color: ${COLORS.accent[12]};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  font-size: 1.1rem;
  padding: 24px;
  border: 1px solid ${COLORS.accent[7]};
  border-radius: 8px;
  background-color: white;
  position: fixed;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: fit-content;
  box-shadow: 2px 4px 8px ${COLORS.gray[9]};

  @media ${QUERIES.mobile} {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform: translate(0, 0);
    box-shadow: none;
  }
`;

// form wrapper
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// wrapper for label/input combos
export const InputWrapper = styled.fieldset`
  border: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

// text input field
export const Input = styled.input`
  all: unset;
  width: 30ch;
  padding: 2px 10px;
  border: 1px solid ${COLORS.accent[7]};
  border-radius: 4px;
  outline-offset: 0;

  &:focus {
    outline: 2px solid ${COLORS.accent[10]};
    background-color: ${COLORS.accent[3]};
  }
`;

// styling for all form buttons except "Submit"
export const CloseButton = styled.button`
  padding: 2px 16px;
  font-weight: ${WEIGHTS.medium};
  background-color: ${COLORS.accent[1]};
  border: 1px solid ${COLORS.accent[9]};
  border-radius: 4px;
  outline-offset: 0;

  &:hover,
  &:focus {
    outline: 2px solid ${COLORS.accent[11]};
    background-color: ${COLORS.accent[4]};
  }
`;

// displayed at top of modal
export const DialogTitle = styled(Dialog.Title)`
  align-self: flex-start;
  font-size: 1.3em;
  font-weight: ${WEIGHTS.medium};
  color: ${COLORS.accent[12]};
`;

// wrapper for "Close" and "Submit" buttons below input fields
export const DialogButtonWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  justify-content: space-around;
  gap: 32px;
  padding: 12px 24px;
`;

// styling of the backdrop of the modal
export const DialogOverlay = styled(Dialog.Overlay)`
  --filter-width: 4px;
  backdrop-filter: blur(var(--filter-width));
  -webkit-backdrop-filter: blur(var(--filter-width));
  background-color: ${COLORS.overlay};
  position: absolute;
  inset: 0;
`;

// styling/positioning of the X to close the modal
export const Xclose = styled(Dialog.Close)`
  position: absolute;
  top: 3px;
  right: 3px;
`;

// prompt to give the user a chance to reset password (placeholder for now)
export const ForgotInfo = styled.p`
  display: block;
  font-style: italic;
  font-size: 1rem;
  padding: 0 16px;
  align-self: flex-start;
`;

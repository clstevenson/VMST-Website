/* 
 A component to temporarily display a message to the user, based on
 unstyled Radix "Toast" component.

 Input props:
 - duration in ms (default is 3000)
- title (optional, default to empty)
- message to display
- toastCloseEffect, a callback function that will run when the component closes (eg to change some state)

See https://www.radix-ui.com/primitives/docs/components/dialog for more options.
 */

import styled, { keyframes } from "styled-components";
import * as Toast from "@radix-ui/react-toast";
import { COLORS } from "../utils/constants";

const ToastMessage = ({
  duration = 3000,
  title = "",
  children,
  toastCloseEffect,
}) => {
  const closeHandler = () => {
    if (!open) toastCloseEffect();
  };

  return (
    <Toast.Provider label="Notification">
      <ToastRoot duration={duration} onOpenChange={toastCloseEffect}>
        {title && <Toast.Title> {title} </Toast.Title>}
        <Toast.Description>{children}</Toast.Description>
      </ToastRoot>

      <ToastViewport />
    </Toast.Provider>
  );
};

const fade = keyframes`
  from {opacity: 1;}
  to {opacity: 0;}
`;

const appear = keyframes`
  from { transform: translateX(calc(100% + var(--viewport-padding)));}
  to { transform: translateX(0);}
`;

const ToastViewport = styled(Toast.Viewport)`
  --viewport-padding: 24px;
  position: fixed;
  bottom: 0;
  right: 0;
  padding: var(--viewport-padding);
  list-style: none;
  overflow: hidden;
  z-index: 100;
`;

const ToastRoot = styled(Toast.Root)`
  display: block;
  background-color: ${COLORS.accent[2]};
  color: ${COLORS.accent[12]};
  border-radius: 4px;
  padding: 8px 12px;
  box-shadow: 2px 4px 8px ${COLORS.gray[8]};
  border: 1px solid black;
  font-size: 1.2rem;

  &[data-state="open"] {
    animation: ${appear} 200ms;
  }

  &[data-state="closed"] {
    animation: ${fade} 200ms ease-in;
  }
`;

export default ToastMessage;

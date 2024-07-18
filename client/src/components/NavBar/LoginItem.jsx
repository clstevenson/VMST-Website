// looks like a navlink but is actually a button to display the login modal
// modal removes scrollbar which causes a shift in backdrop. Radix bug?

import styled from "styled-components";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tooltip from "@radix-ui/react-tooltip";
import { User } from "react-feather";

import { LinkButton } from "./LinkButton";
import { TooltipContent } from "./NavItem";
import { QUERIES } from "../../utils/constants";
import LoginContent from "./LoginWindow";
import SignupContent from "./SignupWindow";
import * as ModalStyle from "./ModalStyles";

export default function LoginItem() {
  // login credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // does user want to log in (or sign up)?
  const [isLogin, setIsLogin] = useState(true);
  // control the state of the modal (Radix primitive Dialog)
  const [open, setOpen] = useState(false);
  // error message to display on modal
  const [message, setMessage] = useState("");

  // when user closes the modal, need to reset the state vars tied to the form
  const handleCLose = () => {
    const isOpen = open;
    setOpen(!open);
    if (isOpen) {
      setEmail("");
      setPassword("");
      setIsLogin(true);
      setMessage("");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleCLose}>
      <Tooltip.Root>
        {/* Navbar item is trigger for both tooltip and login modal */}
        <Tooltip.Trigger asChild>
          <Dialog.Trigger asChild>
            <li>
              <LinkButton>
                <User />
                <LabelWrapper>Log In</LabelWrapper>
              </LinkButton>
            </li>
          </Dialog.Trigger>
        </Tooltip.Trigger>
        <TooltipContent>Log In</TooltipContent>
      </Tooltip.Root>

      {/* Login/signup modal window is below */}
      <Dialog.Portal>
        <ModalStyle.DialogOverlay />
        {isLogin ? (
          <LoginContent
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            setIsLogin={setIsLogin}
            setOpen={setOpen}
            message={message}
            setMessage={setMessage}
          />
        ) : (
          <SignupContent
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            setIsLogin={setIsLogin}
            setOpen={setOpen}
            message={message}
            setMessage={setMessage}
          />
        )}
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Internal Styled Component
// Text next to nav icons disappears on smaller screens
const LabelWrapper = styled.span`
  @media ${QUERIES.tabletAndLess} {
    display: none;
  }
`;

// looks like a navlink but is actually a button to display the login modal
// modal removes scrollbar which causes a shift in backdrop. Radix bug?

import styled from "styled-components";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tooltip from "@radix-ui/react-tooltip";
import { User } from "react-feather";

import { LinkButton } from "./LinkButton";
import { TooltipContent } from "./NavItem";
import LoginWindow from "./LoginWindow";
import { QUERIES } from "../../utils/constants";

export default function LoginItem({
  email,
  password,
  setEmail,
  setPassword,
  isLogin,
  setIsLogin,
  open,
  setOpen,
  message,
  setMessage,
}) {
  // reset state after closing the modal
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

      {/* Login modal window is below */}
      <LoginWindow
        email={email}
        password={password}
        setEmail={setEmail}
        setPassword={setPassword}
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        open={open}
        setOpen={setOpen}
        message={message}
        setMessage={setMessage}
      />
    </Dialog.Root>
  );
};

/*
 * Internal Styled Components
 */

// Text next to nav icons disappears on smaller screens
const LabelWrapper = styled.span`
  @media ${QUERIES.tabletAndLess} {
    display: none;
  }
`;

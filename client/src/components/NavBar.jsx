/* eslint-disable react/prop-types */
/* 
 Component to display a horizontal list of navigational links.
 Input prop: array of navigation objects with the following fields: id, label, href.
 The id is unique UUID, the label is the text that is displayed, and the href is the link.

 Unfortunately the login modal logic needs to be contained in this component. This is
 mostly because I am compoosing two Radix primitives both of which are tied to the same
 nav element trigger; more generally the nav links, tooltips, and login modal are all
 interdependent and entwined with Radix. Once it is working we can try to chop it into
 smaller files.
 */

import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import { Image, Home, User, Info, Send } from "react-feather";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Dialog from "@radix-ui/react-dialog";

import auth from "../utils/auth";
import LoginWindow from "./LoginWindow";
import { COLORS, QUERIES } from "../utils/constants";

// TODO address accessibility concerns (possibly by using Radix navigation component if that is workable)
// - need spacebar to trigger page load on focus (currently only ENTER)
// - screenreader should only read off the item once
// - ESC to unselect/unfocus? (Is that needed for accessbility?)
export default function NavBar() {
  return (
    <Wrapper>
      <Tooltip.Provider delayDuration={0}>
        <NavItem href="/" label="Home" icon={Home} />
        <NavItem href="/about-us" label="About" icon={Info} />
        <NavItem href="/gallery" label="Photos" icon={Image} />
        <NavItem href="/contact" label="Contact" icon={Send} />
        {auth.loggedIn() ? (
          <NavItem href="/me" label="User" icon={User} />
        ) : (
          <LoginItem />
        )}
      </Tooltip.Provider>
    </Wrapper>
  );
}

// internal components for convenience
// NavItem is for client-side routing with tooltips
// TODO passing isCurrent as a prop causes warnings/errors; fix that
const NavItem = ({ href, label, icon: Icon }) => {
  // get the current page so we know which link to highlight
  const currentPage = useLocation().pathname;
  return (
    <Tooltip.Root>
      <TooltipTrigger tabIndex={-1}>
        <li>
          <NavLink to={href}>
            <LinkButton isCurrent={href === currentPage} tabIndex={-1}>
              <Icon />
              <LabelWrapper>{label}</LabelWrapper>
            </LinkButton>
          </NavLink>
        </li>
        <TooltipContent>{label}</TooltipContent>
      </TooltipTrigger>
    </Tooltip.Root>
  );
};

// looks like a navlink but is actually a button to display the login modal
// modal removes scrollbar which causes a shift in backdrop. Radix bug?
const LoginItem = ({ email, password, setEmail, setPassword }) => {
  return (
    <Dialog.Root>
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
      />
    </Dialog.Root>
  );
};

///////////////////////////////////////////////////////////////////////////////
//                             Styled Components                             //
///////////////////////////////////////////////////////////////////////////////

// For login modal (using Radix Dialog primitive)
// dialog (modal) window styling

// For the tooltips (on smaller screens) using Radix Tooltip primitive
const TooltipTrigger = styled(Tooltip.Trigger)`
  background-color: transparent;
  border: none;
  padding: 0;
`;

const TooltipContent = styled(Tooltip.Content)`
  display: none;
  background-color: ${COLORS.accent[1]};

  @media ${QUERIES.tabletAndLess} {
    display: revert;
  }
`;

// styled React Router link (essentially an anchor tag)
const NavLink = styled(Link)`
  outline: none;
`;

// the links wrap around the buttons, so they determine link appearance
const LinkButton = styled.button`
  border: none;
  /* uncomment line below if you want all tabs for links (not just current page) */
  /* border: 1px dotted ${COLORS.gray[9]}; */
  padding: 0 8px;
  padding-top: 2px;
  color: ${COLORS.accent[12]};
  border: ${({ isCurrent }) => {
    return isCurrent && `1px solid ${COLORS.gray[9]}`;
  }};
  border-bottom: none;
  background-color: ${({ isCurrent }) => {
    return isCurrent ? COLORS.secondary_light : "transparent";
  }};

  border-radius: 6px 6px 0 0;
  transition: transform 400ms;

  &:focus,
  ${NavLink}:focus & {
    outline: 2px solid ${COLORS.accent[9]};
    color: ${COLORS.accent[9]};
  }

  /* icon styling */
  & svg {
    transform: translateY(2px);
    margin-right: 2px;
  }

  &:hover {
    cursor: pointer;
    color: ${COLORS.accent[9]};
    transform-origin: 50% 100%;
    transform: scale(1.05);
    transition: transform 200ms;
  }

  /* larger icon targets for touchscreens */
  @media ${QUERIES.tabletAndLess} {
    & svg {
      width: 36px;
      height: 36px;
      stroke-width: 1.5;
    }
  }
`;

// Text next to nav icons disappears on smaller screens
const LabelWrapper = styled.span`
  @media ${QUERIES.tabletAndLess} {
    display: none;
  }
`;

// Wraps the whole navbar
const Wrapper = styled.ul`
  display: flex;
  position: relative;
  flex-direction: row;
  font-size: 1.15rem;
  list-style: none;
  padding: 0 3px;
  border-bottom: 1.5px solid ${COLORS.gray[9]};

  @media ${QUERIES.tabletAndLess} {
    font-size: 1rem;
  }
`;

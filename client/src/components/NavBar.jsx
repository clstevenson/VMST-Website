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

import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import { Image, Home, User, Info, Send, X } from "react-feather";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import * as Separator from "@radix-ui/react-separator";

import auth from "../utils/auth";
import { LOGIN_USER } from "../utils/mutations";
import { COLORS, QUERIES, WEIGHTS } from "../utils/constants";

// TODO Possibly use Radix navigation component/ but it must be coupled with client-side route serving
// (Another option: add accessibility elements myself)
export default function NavBar() {
  // tie form to state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // login checked on server
  const [login, { error, data }] = useMutation(LOGIN_USER);

  // will I need to useEffect to update a state variable to have NavBar re-rendederd?
  // for example, will the NavBar automatically re-render when the authorization expires?
  // I don't think so...
  // const [isLoggedIn, setIsLoggedIn] = useState(auth.loggedIn());

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
          <LoginItem
            email={email}
            password={password}
            setEmail={setEmail}
            setPassword={setPassword}
          />
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
        <ListItem>
          <Link to={href}>
            <LinkButton isCurrent={href === currentPage} tabIndex={-1}>
              <Icon />
              <LabelWrapper>{label}</LabelWrapper>
            </LinkButton>
          </Link>
        </ListItem>
        <TooltipContent>{label}</TooltipContent>
      </TooltipTrigger>
    </Tooltip.Root>
  );
};

// looks like a navlink but is actually a button to display the login modal
// modal removes scrollbar which causes a shift in backdrop. Radix bug?
const LoginItem = ({ email, password, setEmail, setPassword }) => {
  // email validation; this is the regex the HTML form uses for validation
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  const handleSubmit = (evt) => {
    evt.preventDefault();

    // attempt to log in

    // if successful, close modal, reset states, and go to User page

    // if not successful, display an error message on the modal (keeping info in input fields)
  };

  return (
    <Dialog.Root>
      <Tooltip.Root>
        {/* Navbar item is trigger for both tooltip and login modal */}
        <Tooltip.Trigger asChild>
          <Dialog.Trigger asChild>
            <ListItem>
              <LinkButton>
                <User />
                <LabelWrapper>Log In</LabelWrapper>
              </LinkButton>
            </ListItem>
          </Dialog.Trigger>
        </Tooltip.Trigger>
        <TooltipContent>Log In</TooltipContent>
      </Tooltip.Root>

      {/* Login modal window is below */}
      <Dialog.Portal>
        <DialogOverlay />
        <DialogContent>
          <Xclose asChild>
            <X />
          </Xclose>
          <DialogTitle>Login</DialogTitle>
          <VisuallyHidden.Root asChild>
            <Dialog.Description>
              Enter your login information.
            </Dialog.Description>
          </VisuallyHidden.Root>
          <Form onSubmit={handleSubmit}>
            <InputWrapper>
              {/* TODO: add valudation that field is not empty (onBlue) */}
              <label htmlFor="email">Email</label>
              <Input
                type="email"
                id="email"
                required
                value={email}
                tabIndex={1}
                onChange={(evt) => {
                  setEmail(evt.target.value);
                }}
              />
            </InputWrapper>
            <InputWrapper>
              {/* TODO: add valudation that field is not empty (onBlue) */}
              <label htmlFor="password">Password</label>
              <Input
                type="password"
                id="password"
                required
                value={password}
                tabIndex={2}
                onChange={(evt) => {
                  setPassword(evt.target.value);
                }}
              />
            </InputWrapper>
            <DialogButtonWrapper>
              <Dialog.Close asChild>
                <CloseButton tabIndex={3}>Close</CloseButton>
              </Dialog.Close>
              <SubmitButton type="submit" tabIndex={4}>
                Submit
              </SubmitButton>
            </DialogButtonWrapper>
          </Form>
          <SeparatorRoot />
          <SignupWrapper>
            <p>Don't have an account?</p>
            <Dialog.Close asChild>
              <CloseButton tabIndex={5}>Sign Up</CloseButton>
            </Dialog.Close>
          </SignupWrapper>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

/**********************************
 STYLED COMPONENTS
 **********************************/

// For login modal (using Radix Dialog primitive)
// dialog (modal) window styling
const DialogContent = styled(Dialog.Content)`
  color: ${COLORS.accent[12]};
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-size: 1.1rem;
  padding: 24px;
  border: 1px solid ${COLORS.accent[7]};
  border-radius: 8px;
  background-color: white;
  position: fixed;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: fit-content;
  height: fit-content;
  box-shadow: 2px 4px 8px ${COLORS.gray[9]};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// email label and input field
const InputWrapper = styled.fieldset`
  border: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Input = styled.input`
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

const CloseButton = styled.button`
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

const SubmitButton = styled(CloseButton)`
  background-color: ${COLORS.accent[12]};
  color: white;

  &:hover,
  &:focus {
    background-color: ${COLORS.accent[11]};
  }
`;

const DialogTitle = styled(Dialog.Title)`
  font-size: 1.3em;
  font-weight: ${WEIGHTS.medium};
  color: ${COLORS.accent[12]};
`;

const DialogButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  padding: 12px;
`;

const DialogOverlay = styled(Dialog.Overlay)`
  --filter-width: 4px;
  backdrop-filter: blur(var(--filter-width));
  -webkit-backdrop-filter: blur(var(--filter-width));
  background-color: ${COLORS.overlay};
  position: absolute;
  inset: 0;
`;

const Xclose = styled(Dialog.Close)`
  position: absolute;
  top: 3px;
  right: 3px;
`;

const SeparatorRoot = styled(Separator.Root)`
  background-color: ${COLORS.accent[7]};
  height: 1.5px;
  width: 90%;
  margin: 0 auto;
`;

const SignupWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

// For the tooltips (on smaller screens) using Radix Tooltip primitive
const TooltipTrigger = styled(Tooltip.Trigger)`
  background-color: transparent;
  border: none;
  padding: 0;
`;

const TooltipContent = styled(Tooltip.Content)`
  display: none;

  @media ${QUERIES.tabletAndLess} {
    display: revert;
  }
`;

// navigation link items, including animation
const ListItem = styled.li`
  transition: transform 400ms;

  & svg {
    transform: translateY(2px);
    margin-right: 2px;
  }

  &:hover {
    transform-origin: 50% 100%;
    transform: scale(1.05);
    transition: transform 200ms;
  }
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

  &:hover {
    cursor: pointer;
    color: ${COLORS.accent[9]};
  }

  &:focus {
    border-radius: 0;
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

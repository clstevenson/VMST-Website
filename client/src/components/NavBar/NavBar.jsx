/* eslint-disable react/prop-types */
/* 
 Components to display a styled (and hopefully accessible) horizontal list of navigational links.

 Here we are composing two Radix primitives both of which are tied to the same
 nav element trigger; more generally the nav links, tooltips, and login modal are all
 interdependent and entwined with Radix. They have been split up into smaller components
 for ease of debugging but they are probably not very re-usable.
 */

import { useState } from "react";
import styled from "styled-components";
import { Image, Home, Info, Send, User } from "react-feather";
import * as Tooltip from "@radix-ui/react-tooltip";

import { NavItem } from "./NavItem";
import LoginItem from "./LoginItem";
import Auth from "../../utils/auth";
import { COLORS, QUERIES } from "../../utils/constants";

// TODO address accessibility concerns (possibly by using Radix navigation component if that is workable)
// - need spacebar to trigger page load on focus (currently only ENTER)
// - screenreader should only read off the item once
// - ESC to unselect/unfocus? (Is that needed for accessbility?)
export default function NavBar() {
  // need to reset these here (on close of login modal) and pass as props to modal componnets
  // current state of the modal
  const [open, setOpen] = useState(false);
  // user info for login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // toggle between login or signup modals
  const [isLogin, setIsLogin] = useState(true);
  // notification messages on modal (eg input errors)
  const [message, setMessage] = useState("");

  return (
    <Wrapper>
      <Tooltip.Provider delayDuration={0}>
        <NavItem href="/" label="Home" icon={Home} />
        <NavItem href="/about-us" label="About" icon={Info} />
        <NavItem href="/gallery" label="Photos" icon={Image} />
        <NavItem href="/contact" label="Contact" icon={Send} />
        {Auth.loggedIn() ? (
          <NavItem href="/me" label="User" icon={User} />
        ) : (
          <LoginItem
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isLogin={isLogin}
            setIsLogin={setIsLogin}
            open={open}
            setOpen={setOpen}
            message={message}
            setMessage={setMessage}
          />
        )}
      </Tooltip.Provider>
    </Wrapper>
  );
}

/* Internal Styled Components */
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

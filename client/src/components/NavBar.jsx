/* eslint-disable react/prop-types */
/* 
 Component to display a horizontal list of navigational links.
 Input prop: array of navigation objects with the following fields: id, label, href.
 The id is unique UUID, the label is the text that is displayed, and the href is the link.
 */

import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import { COLORS, QUERIES } from "../utils/constants";
import { Image, Home, User, Info, Send } from "react-feather";
import * as Tooltip from "@radix-ui/react-tooltip";
import auth from "../utils/auth";

export default function NavBar() {
  // get the current page to indicate the current link

  // TODO Need some logic here: create a filtered array depending on login status
  // TODO Possibly use Radix navigation component but it must be coupled with client-side serving
  // (Another option: add accessibility elements myself)

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
const NavItem = ({ href, label, icon: Icon }) => {
  const currentPage = useLocation().pathname;
  return (
    <Tooltip.Root>
      <TooltipTrigger tabIndex={-1}>
        <ListItem>
          <NavLink to={href}>
            <Button isCurrent={href === currentPage} tabIndex={-1}>
              <Icon />
              <LabelWrapper>{label}</LabelWrapper>
            </Button>
          </NavLink>
        </ListItem>
        <TooltipContent aria-label={label}>{label}</TooltipContent>
      </TooltipTrigger>
    </Tooltip.Root>
  );
};

// looks like a navlink but is actually a trigger to display
// the login modal
const LoginItem = () => {
  return (
    <Tooltip.Root>
      <TooltipTrigger tabIndex={-1}>
        <ListItem>
          <Button onClick={() => alert("Logging in")}>
            <User />
            <LabelWrapper>Log In</LabelWrapper>
          </Button>
        </ListItem>
      </TooltipTrigger>
      <TooltipContent aria-label="Login">Log In</TooltipContent>
    </Tooltip.Root>
  );
};

// Styled components
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

const Wrapper = styled.ul`
  display: flex;
  position: relative;
  flex-direction: row;
  font-size: 1.15rem;
  list-style: none;
  padding: 0 3px;
  border-bottom: 1.5px solid ${COLORS.gray[500]};

  @media ${QUERIES.tabletAndLess} {
    font-size: 1rem;
  }
`;

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

const NavLink = styled(Link)`
  color: ${COLORS.primary};
  text-decoration: none;

  ${ListItem}:hover & {
    color: ${COLORS.primary_light};
  }
`;

const Button = styled.button`
  border: none;
  /* uncomment line below if you want all tabs for links (not just current page) */
  /* border: 1px dotted ${COLORS.gray[500]}; */
  padding: 0 8px;
  padding-top: 2px;
  color: ${COLORS.primary_dark};
  border: ${({ isCurrent }) => {
    return isCurrent && `1px solid ${COLORS.gray[500]}`;
  }};
  border-bottom: none;
  background-color: ${({ isCurrent }) => {
    return isCurrent ? COLORS.secondary_light : "transparent";
  }};

  border-radius: 6px 6px 0 0;

  &:hover {
    cursor: pointer;
    color: ${COLORS.primary_light};
  }

  &:focus {
    border-radius: 0;
  }
`;

const LabelWrapper = styled.span`
  @media ${QUERIES.tabletAndLess} {
    display: none;
  }
`;

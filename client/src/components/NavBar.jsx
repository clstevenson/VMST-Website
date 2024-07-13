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

export default function NavBar() {
  // get the current page to indicate the current link

  // TODO Need some logic here: create a filtered array depending on login status
  // TODO Use Radix navigation component but it must be coupled with client-side serving
  // (Another option: add accessibility elements myself)
  // Add tooltip to nav items (certainly when only icons shown)

  return (
    <Wrapper>
      <Tooltip.Provider delayDuration={0}>
        <NavItem href="/" label="Home" icon={Home} />
        <NavItem href="/about-us" label="About" icon={Info} />
        <NavItem href="/gallery" label="Photos" icon={Image} />
        <NavItem href="/contact" label="Contact" icon={Send} />
        <NavItem href="/me" label="User" icon={User} />
      </Tooltip.Provider>
    </Wrapper>
  );
}

// internal component for convenience
const NavItem = ({ href, label, icon: Icon }) => {
  const currentPage = useLocation().pathname;
  return (
    <Tooltip.Root>
      <TooltipTrigger>
        <ListItem>
          <NavLink to={href}>
            <Button isCurrent={href === currentPage}>
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
`;

const LabelWrapper = styled.span`
  @media ${QUERIES.tabletAndLess} {
    display: none;
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

/*
 This is a styled div that determines the appearance of the navigation links.

 The link corresponding to the current page is styled differently to indicate
 the current location to the user.
 */

import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";

import { COLORS, QUERIES } from "../../utils/constants";

// styled React Router link (essentially an anchor tag)
const NavLink = styled(Link)`
  outline: none;
`;

const LinkTab = styled.div`
  padding: 0 8px;
  padding-top: 2px;
  color: ${COLORS.accent[12]};
  border: none;
  /* uncomment line below if you want all tabs for links (not just current page) */
  /* border: 1px dotted ${COLORS.gray[9]}; */
  /* style the link corresponding to the current location differently */
  border: ${({ href }) =>
    useLocation().pathname === href && `1px solid ${COLORS.gray[9]}`};
  background-color: ${({ href }) =>
    useLocation().pathname === href ? COLORS.secondary_light : "transparent"};
  border-bottom: none;
  border-radius: var(--nav-border-radius);
  transition: transform 400ms;

  &:focus,
  ${NavLink}:focus & {
    outline: var(--nav-focus-outline);
    color: var(--nav-focus-color);
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

export { LinkTab, NavLink };

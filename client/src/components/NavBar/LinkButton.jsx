/*
 * This is a styled button. The navigation links wrap around this component,
 * so it determines the appearance of the nav links.
 */

import styled from "styled-components";
import { Link } from "react-router-dom";

import { COLORS, QUERIES } from "../../utils/constants";

// styled React Router link (essentially an anchor tag)
const NavLink = styled(Link)`
  outline: none;
`;

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

export { LinkButton, NavLink };

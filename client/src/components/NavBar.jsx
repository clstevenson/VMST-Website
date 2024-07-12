/* eslint-disable react/prop-types */
/* 
 Component to display a horizontal list of navigational links.
 Input prop: array of navigation objects with the following fields: id, label, href.
 The id is unique UUID, the label is the text that is displayed, and the href is the link.
 */

import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import { COLORS, QUERIES } from "../utils/constants";

export default function NavBar() {
  // get the current page to indicate the current link
  const currentPage = useLocation().pathname;

  const navLinks = [
    {
      id: crypto.randomUUID(),
      label: "Home",
      href: "/",
    },
    {
      id: crypto.randomUUID(),
      label: "About",
      href: "/about-us",
    },
    {
      id: crypto.randomUUID(),
      label: "Gallery",
      href: "/gallery",
    },
    {
      id: crypto.randomUUID(),
      label: "Contact",
      href: "/contact",
    },
    {
      id: crypto.randomUUID(),
      label: "Account",
      href: "/me",
    },
  ];

  // TODO Need some logic here: create a filtered array depending on login status
  // TODO Add appropiate icon to each array element, should be a separate property
  // TODO Add prop to component on whether to display text and icons or just icons
  // TODO Use Radix navigation component but it must be coupled with client-side serving
  // (Another option: add accessibility elements myself)

  return (
    <Wrapper>
      {navLinks.map((link) => (
        <ListItem key={link.id} isCurrent={link.href === currentPage}>
          <NavLink to={link.href}>{link.label}</NavLink>
        </ListItem>
      ))}
    </Wrapper>
  );
}

// Styled components
const Wrapper = styled.ul`
  display: flex;
  flex-direction: row;
  gap: 16px;
  font-size: 1.15rem;
  list-style: none;

  @media ${QUERIES.tabletAndLess} {
    gap: 10px;
    font-size: 1rem;
  }
`;

const ListItem = styled.li`
  padding: 0 4px;
  transition: transform 400ms;
  border-bottom: ${({ isCurrent }) => {
    return isCurrent && "2px solid " + COLORS.primary;
  }};

  &:hover {
    transform-origin: 50% 100%;
    transform: scale(1.1);
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

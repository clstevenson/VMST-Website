/* 
 Header for all the pages, containing VMST name and log and the navigation elements
 */

import styled from "styled-components";
import { COLORS, QUERIES } from "../utils/constants";
import NavBar from "./NavBar";
// context for all the state variables and setters of the navbar
import { NavProvider } from "./NavBar/NavContext";

export default function Header() {
  return (
    <Wrapper>
      {/* <Image src="/assets/VMST-logo-green.gif" alt="VMST logo" /> */}
      <Image src="/assets/VMST-logo-white.png" alt="VMST logo" />
      <Title>Virginia Masters Swim Team</Title>
      <ShortTitle>Virginia Masters</ShortTitle>
      <nav>
        <NavProvider>
          <NavBar />
        </NavProvider>
      </nav>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: transparent;
  padding: var(--content-padding);

  @media ${QUERIES.tabletAndLess} {
    gap: 12px;
  }
`;

const Title = styled.h1`
  margin-right: auto;
  font-size: 1.8em;
  color: ${COLORS.accent[9]};

  @media ${QUERIES.tabletAndLess} {
    display: none;
  }
`;

const ShortTitle = styled.h1`
  display: none;
  margin-right: auto;
  line-height: 1.3em;
  color: ${COLORS.accent[9]};

  @media ${QUERIES.tabletAndLess} {
    display: revert;
    font-size: 1.4rem;
  }

  @media ${QUERIES.mobile} {
    display: none;
  }
`;

const Image = styled.img`
  display: block;
  height: 64px;

  @media ${QUERIES.tabletAndLess} {
    height: 48px;
  }

  @media ${QUERIES.mobile} {
    margin-right: auto;
  }
`;

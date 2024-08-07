/* 
 Header for all the pages, containing VMST name and log and the navigation elements
 */

import styled from "styled-components";
import { COLORS, QUERIES } from "../utils/constants";
import NavBar from "./NavBar";

export default function Header() {
  return (
    <Wrapper>
      {/* <Image src="/assets/VMST-logo-green.gif" alt="VMST logo" /> */}
      <Image src="/assets/VMST-logo-white.png" alt="VMST logo" />
      <Title>Virginia Masters Swim Team</Title>
      <ShortTitle>Virginia Masters</ShortTitle>
      <Nav>
        <NavBar />
      </Nav>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: transparent;

  @media ${QUERIES.tabletAndLess} {
    gap: 12px;
    padding-bottom: 4px;
  }
`;

const Title = styled.h1`
  /* margin-right: auto; */
  font-size: 1.8em;
  color: ${COLORS.accent[9]};

  @media ${QUERIES.tabletAndLess} {
    display: none;
  }
`;

const ShortTitle = styled.h1`
  display: none;
  /* margin-right: auto; */
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

const Nav = styled.nav`
  margin-left: auto;
`

const Image = styled.img`
  display: block;
  height: 64px;

  @media ${QUERIES.tabletAndLess} {
    height: 48px;
  }

  @media ${QUERIES.mobile} {
    /* margin-right: auto; */
    height: 42px;
  }

  @media (max-width: 425px) {
    display: none;
  }
`;

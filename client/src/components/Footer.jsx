import styled from "styled-components";

import USMS from "/assets/USMS-logo-stacked.png";
import VMST from "/assets/VMST-logo-white.png";
import { QUERIES } from "../utils/constants";

export default function Footer() {
  return (
    <Wrapper>
      <Image src={VMST} alt="VMST Logo" />
      <Text>
        VMST is a member club of{" "}
        <a href="https://www.usms.org" target="_new">
          <LongUSMS>U.S. Masters Swimming</LongUSMS>
          <ShortUSMS>USMS</ShortUSMS>
        </a>
      </Text>
      <Link href="https://www.usms.org" target="_new">
        <Image src={USMS} alt="U.S. Masters Swimming Logo" />
      </Link>
    </Wrapper>
  );
}

const Wrapper = styled.footer`
  background-color: var(--content-bkd-color);
  width: 100%;
  height: 54px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 48px;
  padding: 4px 0 8px;
  margin-top: auto;
  /* zero out line height to get rid of scrollbar on short pages */
  line-height: 0;

  @media ${QUERIES.mobile} {
    justify-content: space-evenly;
  }
`;

const Link = styled.a`
  height: 100%;
`;

const Image = styled.img`
  height: 100%;
`;

const LongUSMS = styled.span`
  @media ${QUERIES.tabletAndLess} {
    display: none;
  }
`;

const ShortUSMS = styled.span`
  display: none;
  @media ${QUERIES.tabletAndLess} {
    display: revert;
  }
`;

const Text = styled.p`
  font-style: italic;

  & a {
    text-decoration: underline;
  }

  @media ${QUERIES.mobile} {
    display: none;
  }
`;

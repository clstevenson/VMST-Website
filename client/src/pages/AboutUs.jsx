import styled from "styled-components";
import * as Accordian from "@radix-ui/react-accordion";
import AccordianItem from "../components/AccordianItem";
import { COLORS, QUERIES, WEIGHTS } from "../utils/constants";

export default function AboutUs() {
  return (
    <Wrapper>
      <QuoteWrapper>
        <Quote>From the mountains to the sea...we are VMST!</Quote>
      </QuoteWrapper>

      <Paragraph>
        The Virginia Masters Swim Team is the largest masters swimming club in
        Virginia, with{" "}
        <a
          href="https://www.usms.org/reg/members/club.php?ClubAbbr=VMST"
          target="_new"
        >
          approximately 300 members
        </a>{" "}
        spread throughout the state. We are a member club of{" "}
        <a href="https://www.usms.org" target="_new">
          U.S. Masters Swimming
        </a>
        .
      </Paragraph>

      <Accordian.Root type="single" collapsible>
        <AccordianItem title="Where can I swim?">
          <Paragraph>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </Paragraph>
        </AccordianItem>

        <AccordianItem title="What are workout groups? Should we form one?">
          <Paragraph>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </Paragraph>
        </AccordianItem>

        <AccordianItem title="What is the difference between VMST and the Virginia LMSC?">
          <Paragraph>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </Paragraph>
        </AccordianItem>

        <AccordianItem title="Who are the current officers of VMST?">
          <ul>
            <li>President: Barbara Boslego</li>
            <li>Vice President: Jim Miller</li>
            <li>Secretary: Debbie Jaeger</li>
          </ul>
        </AccordianItem>

        <AccordianItem title="Are there any resources for hosting meets?">
          <Paragraph>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </Paragraph>
        </AccordianItem>

        <AccordianItem title="How long has VMST been around?">
          <Title>The History of VMST</Title>

          <Paragraph>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </Paragraph>

          <Paragraph>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </Paragraph>
        </AccordianItem>
      </Accordian.Root>
    </Wrapper>
  );
}

const Wrapper = styled.article`
  max-width: var(--max-prose-width);
  margin: 8px auto 32px;
  border: 1px solid ${COLORS.accent[12]};
  padding: 8px 24px 16px 48px;
  border-radius: 8px;
  box-shadow: var(--main-box-shadow);
  background-color: ${COLORS.accent[2]};
`;

const Quote = styled.blockquote`
  padding: 32px;
  box-shadow: 2px 2px 8px ${COLORS.gray[9]};
  color: black;
  font-style: italic;
  font-weight: ${WEIGHTS.bold};
  font-size: 1.2rem;
  /* background-color: ${COLORS.accent[9]}; */
  background: linear-gradient(
    to right,
    ${COLORS.accent[2]},
    ${COLORS.accent[8]}
  );

  @media ${QUERIES.tabletAndLess} {
    padding: 24px;
  }

  @media ${QUERIES.mobile} {
    padding: 16px;
  }
`;

// the inset shadow below gives a "moat" around the item
// adapted from JWC CSS course
const QuoteWrapper = styled.div`
  box-shadow: inset 2px 2px 8px ${COLORS.gray[9]};
  border: 1px solid ${COLORS.gray[7]};
  width: fit-content;
  overflow: hidden;
  padding: 8px;
  margin: 8px auto;
`;

const Paragraph = styled.p`
  /* spacing between all paragraphs */
  margin: 16px 0;
  /* make the prose a little more readable */
  font-family: var(--font-serif);
  text-align: justify;
  -webkit-hyphens: auto;
  hyphens: auto;
  overflow-wrap: break-word;
`;

const Title = styled.h3`
  font-size: 1rem;
`;

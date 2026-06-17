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
          approximately 250 members
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
            VMST currently has the following workout groups that are affiliated
            with specific locations and practice times (click the links for more
            info).
          </Paragraph>
          <ul>
            <li>
              <a
                href="https://www.usms.org/clubs/virginia-masters-swim-team-699/wo-group-folder/swimrva-hammerheads"
                target="_blank"
              >
                SwimRVA Hammerheads (SRVA)
              </a>{" "}
              (Richmond)
            </li>
            <li>
              <a
                href="https://www.usms.org/clubs/virginia-masters-swim-team-699/wo-group-folder/river-city-masters-1"
                target="_blank"
              >
                River City Masters (RVCM)
              </a>{" "}
              (Richmond)
            </li>
            <li>
              <a
                href="https://www.usms.org/clubs/virginia-masters-swim-team-699/wo-group-folder/stripers"
                target="_blank"
              >
                Northern Neck YMCA Stripers (NNYS)
              </a>{" "}
              (Kilmarnock)
            </li>
            <li>
              <a
                href="https://www.usms.org/clubs/virginia-masters-swim-team-699/wo-group-folder/quest-master-swim-team"
                target="_blank"
              >
                Quest Masters (QUEST)
              </a>{" "}
              (Richmond)
            </li>
          </ul>
          <Paragraph>
            But you can find VMST swimmers throughout the state! The club is not
            attached to a particular pool. Your best bet to find a
            USMS-affiliated workout near you is to try the{" "}
            <a href="https://www.usms.org/clubs">Club Finder</a> and input your
            city or zip code.
          </Paragraph>
        </AccordianItem>

        <AccordianItem title="What are workout groups? Should we form one?">
          <Paragraph>
            You can register workout group under the VMST umbrella. It is meant
            to represent a group of swimmers who swim together in one location.
            There are two main reasons you would choose to form a workout group:
          </Paragraph>
          <ul>
            <li>
              You want to register your group the{" "}
              <a href="https://www.usms.org/clubs">USMS Club Finder</a>{" "}
              functionality. When you register your group you specify its
              location and practice times so that visitors (and prospective
              members!) can find you. You would also specify phone and email
              contact informtion for your group.
            </li>
            <li>
              You want to compete as a separate entity (rather than for VMST)
              for meets{" "}
              <strong>
                <em>within our LMSC</em>
              </strong>
              . This is mostly for relays and meet point scoring.
            </li>
          </ul>
          {/* note that the link below will fail if you re-seed. Set your envmtl variable appropriately. */}
          <Paragraph>
            Workout groups are registered once a year in the same manner as
            regular LMSC clubs. In terms of USMS rules and procedures, workout
            groups are a little tricky. Please{" "}
            <a href={import.meta.env.VITE_BLOG_POST_URL}>
              check out this blog post
            </a>{" "}
            for more information.
          </Paragraph>
        </AccordianItem>

        <AccordianItem title="What is the difference between VMST and the Virginia LMSC?">
          <Paragraph>
            It is easy to confuse the two because they sound kind of similar!
            USMS is organized into 52 different LMSCs that correspond more or
            less to the 50 states. The Virginia LMSC{" "}
            <a href="https://www.vaswim.org/about/" target="_blank">
              includes most of Virginia and West Virginia
            </a>{" "}
            Within the LMSC there are about two dozen clubs, the largest of
            which is VMST.
          </Paragraph>
        </AccordianItem>

        <AccordianItem title="Who are the current officers of VMST?">
          <Paragraph>
            If you wish to email VMST leadership (or the webmaster, Chris
            Stevenson), please <a href="/contact">go to the contact page</a>. We
            would love to hear from you! Current board members are listed below.
          </Paragraph>
          <ul>
            <li>President: Barbara Boslego</li>
            <li>Vice President: Jim Miller</li>
            <li>Secretary: Tim Lecrone</li>
            <li>Treasurer: Susan Carter</li>
          </ul>
        </AccordianItem>

        {/*
        <AccordianItem title="Are there any resources for hosting meets or open water races?">
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
        */}
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

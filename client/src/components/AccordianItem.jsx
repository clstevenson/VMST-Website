/* 
 Component corresponding to a single Accordian.Item unit (of the Accordian Radix primitive)

 Props needed:
 - title: the "prompt" (header) of the closed accordian
 - titlePadding: a string value to give a left offset (including units) for the clickable accordian title. A value of zero (the default) has the chevron indicator in the margin and the title text aligned with the left of the container. A value of "24px" is appropriate to align the chevron with the left side.
 - children: the elements that are revealed when the accordian opens

 The title needs to be unique because it is used as the basis for the Accordian.Item value. The title is converted to lower case and then spaces are converted to dashes before using as the value. Any question marks are also stripped out. So for example, 'Who are we?' will become 'who-are-we'.
 */

import styled from "styled-components";
import * as Accordian from "@radix-ui/react-accordion";
import { ChevronRight } from "react-feather";
import { COLORS, WEIGHTS } from "../utils/constants";

export default function AccordianItem({ title, titlePadding = 0, children }) {
  // get a unique "value" string from the title prop
  const itemValue = title
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll("?", "");

  return (
    <Accordian.Item value={itemValue}>
      <Accordian.Header asChild>
        <AccordianTrigger asChild>
          <Title style={{ "--title-padding": titlePadding }}>
            <TriggerWrapper>
              <Chevron />
            </TriggerWrapper>
            {title}
          </Title>
        </AccordianTrigger>
      </Accordian.Header>
      <Accordian.Content>{children}</Accordian.Content>
    </Accordian.Item>
  );
}

const TriggerWrapper = styled.span`
  display: inline-block;
  position: absolute;
  transform: translate(calc(-100% - 4px), 0px);
  line-height: 0;
`;

const AccordianTrigger = styled(Accordian.Trigger)`
  margin: 16px 0;
`;

const Chevron = styled(ChevronRight)`
  ${AccordianTrigger}[data-state='open'] & {
    transform: rotate(90deg);
  }
`;

const Title = styled.button`
  text-align: left;
  font-size: 1rem;
  color: ${COLORS.accent[12]};
  font-weight: ${WEIGHTS.medium};
  position: relative;
  background-color: transparent;
  border: none;
  padding-left: var(--title-padding);

  /* indicate to user that the title is clickable */
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

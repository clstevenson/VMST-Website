/* 
 Component corresponding to a single Accordian.Item unit (of the Accordian Radix primitive)

 Props needed:
 - title: the "prompt" (header) of the closed accordian
 - children: the elements that are revealed when the accordian opens

 The title needs to be unique because it is used as the basis for the Accordian.Item value. The title is converted to lower case and then spaces are converted to dashes before using as the value. Any question marks are also stripped out. So for example, 'Who are we?' will become 'who-are-we'.
 */

import styled from "styled-components";
import * as Accordian from "@radix-ui/react-accordion";
import { ChevronRight } from "react-feather";
import { COLORS, WEIGHTS } from "../utils/constants";

export default function AccordianItem({ title, children }) {
  // get a unique "value" string from the title prop
  const itemValue = title
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll("?", "");

  return (
    <Accordian.Item value={itemValue}>
      <Accordian.Header asChild>
        <AccordianTrigger>
          <Title tabIndex={-1}>
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
  background-color: transparent;
  margin: 16px 0;
  border: none;
`;

const Chevron = styled(ChevronRight)`
  ${AccordianTrigger}[data-state='open'] & {
    transform: rotate(90deg);
  }
`;

const Title = styled.button`
  font-size: 1rem;
  color: ${COLORS.accent[12]};
  font-weight: ${WEIGHTS.medium};
  position: relative;
  background-color: transparent;
  border: none;

  /* indicate to user that the title is clickable */
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

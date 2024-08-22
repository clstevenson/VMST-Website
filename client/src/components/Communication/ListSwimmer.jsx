/* eslint-disable react/prop-types */
/* 
 This is a single entry in the list of swimmers (ie potential recipients) in the popover.
 */

import styled from "styled-components";
import { Check } from "react-feather";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as Label from "@radix-ui/react-label";

import { CheckboxRoot } from "../Styled/Checkbox";
import { COLORS } from "../../utils/constants";
import { useCallback, useEffect, useRef } from "react";

export default function ListSwimmer({
  swimmer,
  recipients,
  setRecipients,
  index,
  focus,
  setFocus,
  inputRef,
}) {
  const swimmerRef = useRef(null);

  useEffect(() => {
    // focus on current element, a value of -1 means focus on input
    if (focus === -1) inputRef.current.focus();
    else if (focus === index) {
      swimmerRef.current.focus();
    }
  }, [focus, index, inputRef]);

  const handleSelect = useCallback(() => {
    // setting focus to a name when it is selected by mouse or keyboard
    setFocus(index);
  }, [index, setFocus]);

  return (
    <li>
      <SelectCheckboxRoot
        key={swimmer._id}
        id={swimmer._id}
        ref={swimmerRef}
        onClick={handleSelect}
        onKeyDown={handleSelect}
        checked={
          recipients.findIndex((recipient) => recipient._id === swimmer._id) !==
          -1
        }
        onCheckedChange={(checked) => {
          if (checked) {
            // add this swimmer to the recipients list
            setRecipients([...recipients, swimmer]);
          } else if (!checked) {
            // filter out this swimmer from the recipients list
            const newRecipients = recipients.filter(
              ({ _id }) => _id !== swimmer._id
            );
            setRecipients([...newRecipients]);
          }
        }}
      >
        <CheckboxIndicator>
          <Check />
        </CheckboxIndicator>
        <Label.Root htmlFor={swimmer._id}>
          {swimmer.name} {swimmer.workoutGroup && `(${swimmer.workoutGroup})`}
        </Label.Root>
      </SelectCheckboxRoot>
    </li>
  );
}

const SelectCheckboxRoot = styled(CheckboxRoot)`
  position: relative;
  background-color: white;
  height: 25px;
  width: 100%;
  text-align: left;
  border: none;
  border-radius: 0;
  box-shadow: none;
  padding: 4px 30px;

  &:hover {
    background-color: ${COLORS.accent[3]};
    outline: 1px solid black;
  }

  & *:hover {
    cursor: pointer;
  }

  &:focus {
    outline: 1px solid black;
    background-color: ${COLORS.accent[3]};
  }
`;

const CheckboxIndicator = styled(Checkbox.Indicator)`
  position: absolute;
  transform: translateX(-100%);
`;

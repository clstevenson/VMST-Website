/* eslint-disable react/prop-types */
/* 
 Constructs a combobox for choosing individual recipients. I had to make this from scratch so need to pay attention closely to the WAI ARIA guide:
 https://www.w3.org/WAI/ARIA/apg/patterns/combobox/

 Navigation of popup items with arrow keys was inspired by:
 https://dev.to/rafi993/roving-focus-in-react-with-custom-hooks-1ln 
 */

import styled from "styled-components";
import { useState, useRef, useCallback, useEffect } from "react";

import { COLORS } from "../../utils/constants";
import ListSwimmer from "./ListSwimmer";
import InputSwimmer from "./InputSwimmer";

export default function RecipientsCombobox({
  recipients,
  setRecipients,
  swimmers,
}) {
  // controlled state of "select recipients" popover
  const [openPopover, setOpenPopover] = useState(false);
  // controlled value of swimmer search (to add recipients)
  const [searchSwimmers, setSearchSwimmers] = useState("");
  // ref for container of popup (containing list of swimmers)
  const popoverRef = useRef(null);
  // ref for the text input
  const inputRef = useRef(null);
  // use the Rove Focus hook for keyboard nav of the names in the popup
  const [focus, setFocus] = useState(-1);

  // up/down arrows decrement or increment the value of the focus state
  // only take action if popup is open
  const handleKeyDown = useCallback(
    (evt) => {
      if (openPopover) {
        if (evt.key === "ArrowDown") {
          evt.preventDefault();
          setFocus((prev) => prev + 1);
        } else if (evt.key === "ArrowUp") {
          evt.preventDefault();
          if (focus > -1) setFocus((prev) => prev - 1);
        } else if (
          evt.key === "ArrowLeft" ||
          evt.key === "ArrowRight" ||
          evt.key === "Home" ||
          evt.key === "End"
        ) {
          inputRef.current.focus();
        }
      }
    },
    [focus, openPopover]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Wrapper>
      {/* input textbox to search and button to trigger popup */}
      <InputSwimmer
        searchSwimmers={searchSwimmers}
        setSearchSwimmers={setSearchSwimmers}
        openPopover={openPopover}
        setOpenPopover={setOpenPopover}
        popoverRef={popoverRef}
        focus={focus}
        setFocus={setFocus}
        inputRef={inputRef}
      />
      {/* conditional render of popup */}
      {openPopover && (
        <RecipientsPopover
          id="cb1-listbox"
          ref={popoverRef}
          role="listbox"
          aria-label="Swimmers to Email"
        >
          {swimmers
            // don't include opt-outs
            .filter(({ emailExclude }) => !emailExclude)
            // filter by input against both name or WO group (if there is one)
            .filter(({ name, workoutGroup }) => {
              if (name.toLowerCase().includes(searchSwimmers.toLowerCase()))
                return true;
              else if (workoutGroup) {
                // might be null
                return workoutGroup
                  .toLowerCase()
                  .includes(searchSwimmers.toLocaleLowerCase());
              }
            })
            .map((swimmer, index) => {
              return (
                <ListSwimmer
                  key={swimmer._id}
                  swimmer={swimmer}
                  recipients={recipients}
                  setRecipients={setRecipients}
                  index={index}
                  setFocus={setFocus}
                  focus={focus}
                  inputRef={inputRef}
                />
              );
            })}
        </RecipientsPopover>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
`;

const RecipientsPopover = styled.ul`
  list-style-type: none;
  padding-left: 0;
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background-color: white;
  height: fit-content;
  max-height: 25pc;
  width: fit-content;
  z-index: 99;
  border-radius: 4px;
  border: 1px solid ${COLORS.accent[12]};
  box-shadow: 2px 4px 8px black;
  /* allow scrolling */
  overflow: auto;
  /* but hide the scrhollbars */
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

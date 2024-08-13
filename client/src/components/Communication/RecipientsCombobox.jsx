/* eslint-disable react/prop-types */
/* 
 Constructs a combobox for choosing individual recipients. I had to make this from scratch so need to pay attention closely to the WAI ARIA guide:

 https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
 */

import styled from "styled-components";
import { useState, useRef } from "react";

import { COLORS } from "../../utils/constants";
import ListSwimmer from "./ListSwimmer";
import InputSwimmer from "./InputSwimmer";

export default function Combobox({ recipients, setRecipients, swimmers }) {
  // controlled state of "select recipients" popover
  const [openPopover, setOpenPopover] = useState(false);
  // controlled value of swimmer search (to add recipients)
  const [searchSwimmers, setSearchSwimmers] = useState("");
  // ref for container of popup (containing list of swimmers)
  const popoverRef = useRef(null);

  return (
    <Wrapper>
      {/* input textbox to search and button to trigger popup */}
      <InputSwimmer
        searchSwimmers={searchSwimmers}
        setSearchSwimmers={setSearchSwimmers}
        openPopover={openPopover}
        setOpenPopover={setOpenPopover}
        popoverRef={popoverRef}
      />
      {/* conditional render of popup */}
      {openPopover && (
        <RecipientsPopover ref={popoverRef}>
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
            .map((swimmer) => {
              return (
                <ListSwimmer
                  key={swimmer._id}
                  swimmer={swimmer}
                  recipients={recipients}
                  setRecipients={setRecipients}
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

const RecipientsPopover = styled.div`
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

/* eslint-disable react/prop-types */
/* 
 Component contains two elements: text input (to search swimmer names)
 and a button to open/close the popup. The text input will filter the list
 of names in the popup. Pressing ESC in the text input or clicking outside of the popup
 will close the popup (those event listeners are set here)
 */

import styled from "styled-components";
import { useEffect, useRef } from "react";
import * as Select from "@radix-ui/react-select";

import { COLORS } from "../../utils/constants";

export default function InputSwimmer({
  searchSwimmers,
  setSearchSwimmers,
  openPopover,
  setOpenPopover,
  popoverRef,
  setFocus,
  inputRef,
}) {
  const popoverButtonRef = useRef(null);

  useEffect(() => {
    // press Esc key
    const handleKeyDown = (evt) => {
      if (evt.key === "Escape") {
        setOpenPopover(false);
        setSearchSwimmers("");
      }
    };
    // click outside of popover
    const handleMouseClick = (evt) => {
      // But first need to check that the popover is actually being rendered
      if (popoverRef.current) {
        if (
          !popoverRef.current.contains(evt.target) &&
          !popoverButtonRef.current.contains(evt.target)
        ) {
          setOpenPopover(false);
          setSearchSwimmers("");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleMouseClick);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleMouseClick);
    };
  }, [popoverRef, setOpenPopover, setSearchSwimmers]);

  return (
    <SelectInputWrapper>
      {/* text input to filter names */}
      <InputSearch
        type="text"
        id="search"
        ref={inputRef}
        role="combobox"
        aria-haspopup={openPopover}
        aria-autocomplete="list"
        aria-controls="cb1-listbox"
        aria-expanded={openPopover}
        placeholder="Find recipients..."
        value={searchSwimmers}
        onChange={(evt) => {
          setSearchSwimmers(evt.target.value);
          if (!openPopover) setOpenPopover(true);
        }}
        onFocus={() => {
          setOpenPopover(true);
          // keep focus on input box
          setFocus(-1);
        }}
      />
      {/* Button to trigger popup */}
      <button
        type="button"
        aria-controls="cb1-listbox"
        aria-expanded={openPopover}
        onClick={() => {
          setOpenPopover((prev) => !prev);
        }}
      >
        <Select.Icon ref={popoverButtonRef} />
      </button>
    </SelectInputWrapper>
  );
}

const InputSearch = styled.input`
  background-image: url("/assets/search.svg");
  background-repeat: no-repeat;
  padding-left: 30px;
  width: 300px;
`;

const SelectInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  & button {
    padding: 4px 8px;
    margin-left: 2px;
    line-height: 1;
    background-color: transparent;
    border: none;
    border-radius: 100%;
    &:hover {
      background-color: ${COLORS.accent[3]};
      cursor: pointer;
    }
  }
`;

import { forwardRef } from "react";
import styled from "styled-components";
import * as Select from "@radix-ui/react-select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "react-feather";
import { COLORS } from "../../utils/constants";
import range from "../../utils/range";

export default function NavPhotos({
  page,
  setPage,
  maxPages,
  displaySelect = true,
}) {
  const nextPage = () => {
    if (page === maxPages) setPage(maxPages);
    else setPage(page + 1);
  };
  const previousPage = () => {
    if (page === 1) setPage(maxPages);
    else setPage(page - 1);
  };

  const jumpForward = () => {
    const newPage = page + 5;
    if (newPage > maxPages) setPage(maxPages);
    else setPage(newPage);
  };
  const jumpBack = () => {
    const newPage = page - 5;
    if (newPage < 1) setPage(1);
    else setPage(newPage);
  };

  return (
    <Wrapper>
      <NavArrow onClick={jumpBack} disabled={page === 1}>
        <ChevronsLeft style={{ display: "block" }} />
      </NavArrow>
      <NavArrow onClick={previousPage} disabled={page === 1}>
        <ChevronLeft style={{ display: "block" }} />
      </NavArrow>
      {displaySelect ? (
        <Select.Root
          defaultValue={page}
          value={page}
          onValueChange={(val) => {
            setPage(val);
          }}
        >
          <SelectTrigger>
            Page {page} of {maxPages}
          </SelectTrigger>
          <SelectContent>
            <Select.ScrollUpButton />
            <SelectViewport>
              {range(maxPages).map((page) => {
                return (
                  <SelectItem key={page} value={page}>
                    Page {page}
                  </SelectItem>
                );
              })}
            </SelectViewport>
            <Select.ScrollDownButton />
          </SelectContent>
        </Select.Root>
      ) : (
        <span style={{ fontStyle: "italic" }}>page {page}</span>
      )}
      <NavArrow onClick={nextPage} disabled={page === maxPages}>
        <ChevronRight style={{ display: "block" }} />
      </NavArrow>
      <NavArrow onClick={jumpForward} disabled={page === maxPages}>
        <ChevronsRight style={{ display: "block" }} />
      </NavArrow>
    </Wrapper>
  );
}

// eslint-disable-next-line react/display-name
const SelectItem = forwardRef(({ children, ...props }, forwardedRef) => {
  return (
    <StyledItem {...props} ref={forwardedRef}>
      <Select.ItemText>{children}</Select.ItemText>
    </StyledItem>
  );
});

const Wrapper = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;
  /* gap: 16px; */
  margin: 4px 0;

  & svg {
    width: 34px;
    height: 34px;
  }
`;

const NavArrow = styled.button`
  background-color: transparent;
  border: none;
  border-radius: 50%;

  &:hover:not([disabled]) {
    background-color: ${COLORS.accent[3]};
    cursor: pointer;
    transform: scale(1.3);
  }
`;

const SelectTrigger = styled(Select.Trigger)`
  width: fit-content;
  padding: 0 16px;

  &:hover {
    cursor: pointer;
    background-color: ${COLORS.accent[5]};
    /* outline: 2px solid ${COLORS.accent[9]}; */
    border-color: transparent;
  }
`;

const StyledItem = styled(Select.Item)`
  padding: 4px 8px;
  text-align: center;
  &[data-highlighted] {
    background-color: ${COLORS.accent[5]};
    outline: none;
  }
`;

const SelectViewport = styled(Select.Viewport)`
  --radix-select-content-available-height: 25pc;
  max-height: var(--radix-select-content-available-height);
`;

const SelectContent = styled(Select.Content)`
  background-color: white;
  border-radius: 4px;
  border: 1px solid ${COLORS.accent[12]};
  box-shadow: 2px 4px 8px black;
  cursor: pointer;
  width: max-content;
  max-height: var(--radix-select-content-available-height);
`;

import { forwardRef } from "react";
import styled from "styled-components";
import * as Select from "@radix-ui/react-select";
import { COLORS } from "../../utils/constants";

export default function MembersPerPage({ perPage, setPerPage, setPage }) {
  return (
    <Select.Root
      defaultValue={perPage}
      value={perPage}
      onValueChange={(val) => {
        setPerPage(parseInt(val));
        // go to the first page after changing the per-page value
        setPage(1);
      }}
    >
      <SelectTrigger aria-label="members per page" asChild>
        <button>{perPage} per page</button>
      </SelectTrigger>
      <SelectContent position="popper" align="center">
        <Select.Viewport>
          <SelectItem value="50">50 per page</SelectItem>
          <SelectItem value="100">100 per page</SelectItem>
          <SelectItem value="200">200 per page</SelectItem>
          <SelectItem value="500">500 per page</SelectItem>
        </Select.Viewport>
      </SelectContent>
    </Select.Root>
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

const StyledItem = styled(Select.Item)`
  padding: 4px 8px;
  text-align: center;
  &[data-highlighted] {
    background-color: ${COLORS.accent[5]};
    outline: none;
  }
`;

const SelectTrigger = styled(Select.Trigger)`
  width: fit-content;
  padding: 1px 8px;

  &:hover {
    cursor: pointer;
    background-color: ${COLORS.accent[5]};
    border: none;
    border-radius: 4px;
  }
`;

const SelectContent = styled(Select.Content)`
  background-color: white;
  border-radius: 4px;
  border: 1px solid ${COLORS.accent[12]};
  box-shadow: 2px 4px 8px black;
  cursor: pointer;
  width: max-content;
`;

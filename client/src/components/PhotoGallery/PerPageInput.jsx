import { forwardRef } from "react";
import styled from "styled-components";
import * as Select from "@radix-ui/react-select";
import { COLORS, QUERIES } from "../../utils/constants";

export default function PhotosPerPage({ perPage, setPerPage, numPhotos }) {
  return (
    <Wrapper>
      <Select.Root
        defaultValue={perPage}
        value={perPage}
        onValueChange={(val) => {
          setPerPage(parseInt(val));
        }}
      >
        <SelectTrigger aria-label="photos per page" asChild>
          <button>{perPage} photos per page</button>
        </SelectTrigger>
        <SelectContent position="popper" align="end">
          <Select.Viewport>
            <SelectItem value="5">5 photos</SelectItem>
            <SelectItem value="10">10 photos</SelectItem>
            <SelectItem value="15">15 photos</SelectItem>
            <SelectItem value="20">20 photos</SelectItem>
            <SelectItem value="30">30 photos</SelectItem>
            <SelectItem value="50">50 photos</SelectItem>
          </Select.Viewport>
        </SelectContent>
      </Select.Root>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  @media ${QUERIES.mobile} {
    display: none;
  }
`;

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

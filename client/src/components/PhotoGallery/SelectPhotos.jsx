import styled from "styled-components";
import * as Select from "@radix-ui/react-select";
import { COLORS, QUERIES } from "../../utils/constants";

export default function SelectPhotos({
  photoset,
  setPhotoset,
  numPhotos,
  setPage,
}) {
  return (
    <SelectWrapper>
      <Select.Root
        defaultValue={photoset}
        value={photoset}
        onValueChange={(val) => {
          setPhotoset(val);
          setPage(1);
        }}
      >
        <SelectTrigger>
          <Select.Value />
          <Select.Icon style={{ margin: "0 8px" }} />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectViewport>
            <SelectItem value="featured">
              <Select.ItemText>Featured</Select.ItemText>
            </SelectItem>
            <SelectItem value="albums">
              <Select.ItemText>Albums</Select.ItemText>
            </SelectItem>
            <SelectItem value="all">
              <Select.ItemText>All</Select.ItemText>
            </SelectItem>
          </SelectViewport>
        </SelectContent>
      </Select.Root>
      <span>
        ({numPhotos} {photoset === "albums" ? "albums" : "photos"})
      </span>
    </SelectWrapper>
  );
}

const SelectWrapper = styled.div`
  @media ${QUERIES.mobile} {
    & > span {
      display: none;
    }
  }
`;

const SelectTrigger = styled(Select.Trigger)`
  --radix-select-trigger-width: 12ch;
  width: var(--radix-select-trigger-width);
  display: inline-flex;
  justify-content: space-between;
  margin-right: 6px;
  padding-left: 8px;
  font-size: 1.1rem;
`;

const SelectContent = styled(Select.Content)`
  background-color: white;
  border-radius: 4px;
  border: 1px solid ${COLORS.accent[12]};
  box-shadow: 2px 4px 8px black;
  cursor: pointer;
  /* width: var(--radix-select-trigger-width); */
`;

const SelectViewport = styled(Select.Viewport)``;

const SelectItem = styled(Select.Item)`
  width: var(--radix-select-trigger-width);
  padding-left: 8px;
  margin: 8px 0;
  font-size: 1.1rem;
  &[data-highlighted] {
    background-color: ${COLORS.accent[5]};
    outline: none;
  }
`;

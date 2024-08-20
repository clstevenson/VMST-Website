/* eslint-disable react/prop-types */
import styled from "styled-components";
import * as Select from "@radix-ui/react-select";
import * as Label from "@radix-ui/react-label";
import dayjs from "dayjs";

import RosterTable from "./RosterTable";
import ErrorMessage from "../Styled/ErrorMessage";
import { FieldSet } from "../Styled/FieldSet";
import { COLORS } from "../../utils/constants";

export default function MeetInfo({
  competitors,
  setCompetitors,
  errors,
  clearErrors,
  course,
  setCourse,
  meetName,
  setMeetName,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) {
  return (
    <Wrapper>
      <legend>Meet Information</legend>

      <MeetNameDate>
        <InputWrapper style={{ gridArea: "name" }}>
          <LabelRoot htmlFor="meet-name">Meet Name</LabelRoot>
          <input
            type="text"
            id="meet-name"
            required
            value={meetName}
            onChange={(evt) => setMeetName(evt.target.value)}
          />
        </InputWrapper>
        {/* user selects course */}
        <InputWrapper style={{ gridArea: "course" }}>
          <LabelRoot htmlFor="course">Course</LabelRoot>
          <Select.Root
            required
            value={course}
            onValueChange={(val) => {
              if (val) {
                setCourse(val);
              }
            }}
          >
            <SelectTrigger id="course">
              <Select.Value placeholder="Select" />
              <Select.Icon />
            </SelectTrigger>
            <SelectContent position="popper">
              <Select.Viewport>
                <SelectItem value="SCY">
                  <Select.ItemText>SCY</Select.ItemText>
                </SelectItem>
                <SelectItem value="SCM">
                  <Select.ItemText>SCM</Select.ItemText>
                </SelectItem>
                <SelectItem value="LCM">
                  <Select.ItemText>LCM</Select.ItemText>
                </SelectItem>
              </Select.Viewport>
            </SelectContent>
          </Select.Root>
        </InputWrapper>

        <StartDate>
          <LabelRoot htmlFor="start-date">Start date</LabelRoot>
          <input
            type="date"
            id="start-date"
            required
            value={startDate}
            onChange={(evt) => setStartDate(evt.target.value)}
          />
        </StartDate>
        <EndDate>
          <LabelRoot htmlFor="end-date">End date (optional)</LabelRoot>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(evt) => {
              setEndDate(evt.target.value);
              clearErrors("endDate");
            }}
          />
          {errors.endDate && (
            <ErrorMessage>{errors.endDate.message}</ErrorMessage>
          )}
        </EndDate>
      </MeetNameDate>

      {/* Display roster of swimmers at meet */}
      {competitors.length > 0 && (
        <RosterTable
          competitors={competitors}
          setCompetitors={setCompetitors}
        />
      )}
    </Wrapper>
  );
}

const Wrapper = styled(FieldSet)`
  grid-area: info;
`;

const MeetNameDate = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  grid-template-areas: "name course start end";
  gap: 12px;
  align-items: start;

  @media (max-width: 800px) {
    grid-template-columns: 1fr auto;
    grid-template-areas: "name course" "start end";
  }
`;

const LabelRoot = styled(Label.Root)`
  all: unset;
  padding: 0 4px;
  margin: 0;
  width: max-content;
  font-size: 1.05rem;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;

  & input[type="text"] {
    flex: 1;
    min-width: 25ch;
  }
`;

const SelectTrigger = styled(Select.Trigger)`
  width: 8ch;
  margin-right: 6px;
  padding-left: 8px;
  display: inline-flex;
  justify-content: space-between;
`;
const SelectContent = styled(Select.Content)`
  background-color: white;
  border-radius: 4px;
  border: 1px solid ${COLORS.accent[12]};
  box-shadow: 2px 4px 8px black;
  cursor: pointer;
  width: var(--radix-select-trigger-width);
`;
const SelectItem = styled(Select.Item)`
  width: var(--radix-select-trigger-width);
  padding-left: 8px;
  margin: 2px 0;
  font-size: 1.1rem;
  &[data-highlighted] {
    background-color: ${COLORS.accent[5]};
    outline: none;
  }
`;

const StartDate = styled.div`
  min-width: max-content;
  grid-area: start;
  display: flex;
  flex-direction: column;
  & input {
    border: none;
    border-bottom: 1px solid black;
  }
`;

const EndDate = styled(StartDate)`
  grid-area: end;
`;

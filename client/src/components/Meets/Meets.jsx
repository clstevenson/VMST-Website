import { useState } from "react";
import styled from "styled-components";
import * as Label from "@radix-ui/react-label";
import * as Accordian from "@radix-ui/react-accordion";
import * as Separator from "@radix-ui/react-separator";
import * as Select from "@radix-ui/react-select";
import papa from "papaparse";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@apollo/client";
import { Check } from "react-feather";

import { QUERY_VMST } from "../../utils/queries";
import FileUploader from "../FileUploader";
import AccordianItem from "../AccordianItem";
import { FieldSet } from "../Styled/FieldSet";
import Table from "../Styled/Table";
import { COLORS, QUERIES, WEIGHTS } from "../../utils/constants";
import ErrorMessage from "../../components/Styled/ErrorMessage";
import SubmitButton from "../Styled/SubmiButton";
import MinorButton from "../Styled/MinorButton";
import matchUSMS from "../../utils/matchUSMS";
import { CheckboxRoot, CheckboxIndicator } from "../Styled/Checkbox";

export default function Meets() {
  // array of objects containing competitors in the meet being displayed
  const [competitors, setCompetitors] = useState([]);
  // array of relay event numbers for user to assign actual events
  const [relayEventNumbers, setRelayEventNumbers] = useState([]);
  // list of all VMST team members (array of member objects) obtained on initial render
  const [members, setMembers] = useState([]);
  // controlled state of "course" selector
  const [course, setCourse] = useState("");

  //set up for react-hook-form
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm();

  useQuery(QUERY_VMST, {
    onCompleted: (data) => {
      setMembers([...data.vmstMembers]);
    },
  });

  // file input onchange event handler, which parses the CSV file
  const handleFile = async (e) => {
    let reader = new FileReader();
    reader.readAsText(e.target.files[0]);

    // use react-hook-form to display any file read errors
    clearErrors("file");
    reader.onerror = () => {
      console.log(reader.error);
      setError("file", {
        type: "custom",
        message: `File read error: ${reader.error}`,
      });
    };

    // parsing file and setting connected variables
    reader.onload = () => {
      const results = papa.parse(reader.result, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      });

      // obtain an array of relay events (array of strings)
      const relayEvents = Object.keys(results.data[0]).filter((prop) =>
        /R\d+/.test(prop)
      );

      // the "Meet Age" property has a lot of tabs and spaces between the words
      // retrieve it for later use in extracting its value
      const ageProp = Object.keys(results.data[0]).filter(
        (prop) => prop.includes("Meet") && prop.includes("Age")
      );

      const meetSwimmers = results.data
        // filter by club (VMST only)
        .filter(({ Club }) => Club === "VMST")
        // return object subset
        .map((swimmer) => {
          return {
            _id: crypto.randomUUID(),
            firstName: swimmer.First,
            lastName: swimmer.Last,
            meetAge: swimmer[ageProp],
            gender: swimmer.Sex,
            relays: relayEvents
              .map((relay) => swimmer[relay])
              .filter((number) => number !== null),
          };
        });

      // for each competitor, find the best match among the registered members
      const matchedCompetitors = meetSwimmers.map((swimmer) => {
        // required to be the same gender
        const filteredMembers = members.filter(
          ({ gender }) => gender === swimmer.gender
        );
        const match = matchUSMS(swimmer, filteredMembers);
        // by default include in email messages
        match[0].include = true;
        // add the top match to the swimmer object (want permanent rec)
        return { ...swimmer, member: match[0] };
      });

      setRelayEventNumbers([...relayEvents]);
      setCompetitors([...matchedCompetitors]);
      // roster is in memory now, can clear that error
      clearErrors("roster");
    };
  };

  const onSubmit = async ({ meetName, startDate, endDate }) => {
    // use react-hook-form for some errors, early return if any found
    if (competitors.length === 0 || !course) {
      if (competitors.length === 0)
        setError("roster", {
          type: "custom",
          message: "No meet roster found in memory",
        });

      if (!course)
        setError("course", { type: "custom", message: "Course required" });

      return;
    }

    // let's trim the fat a bit
    const meetSwimmers = competitors.map((swimmer) => {
      const { _id: memberId, include: includeEmail } = swimmer.member;
      const savedSwimmer = { ...swimmer };
      delete savedSwimmer._id; // saving in DB will generate a unique ID, no longer need this
      delete savedSwimmer.member;
      return {
        ...savedSwimmer,
        memberId,
        includeEmail,
      };
    });

    // object to save in DB
    const meet = {
      meetName,
      course,
      startDate,
      endDate,
      relayEventNumbers,
      meetSwimmers,
    };
    // save in DB
    console.log(meet);
    /*
    Array of objects with the following properties
    - meetName: string
    - course: string
    - startDate: string
    - endDate: string
    - relayEventNumbers: array of strings with pattern "R##"
    - meetSwimmers: array of objects with properties firstName, lastName, gender, meetAge, relays (array of numbers), memberId (for reference to the Members table for later lookup as needed), and includeEmail (a boolean on whether to include the person on email messages)
    */

    // Toast success

    // cleanup; eventually will be passed to ToastMessage component
    resetForm();
  };

  const resetForm = () => {
    reset();
    clearErrors();
    setCourse("");
    setCompetitors([]);
    setRelayEventNumbers([]);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <MeetUpload>
        <legend>Upload Roster for New Meet</legend>
        <ButtonWrapper>
          <FileUploader handleFile={handleFile} filetype="csv">
            Choose file
          </FileUploader>
          <p>
            After the entry deadline, generate a CSV file of participants; see
            instructions below for details. Then click the button to upload.
          </p>
          {/* Once file is uploaded and parsed, another button should appear (?) */}
        </ButtonWrapper>
        {/* any errors from file upload? */}
        {errors.file && <ErrorMessage>{errors.file.message}</ErrorMessage>}
        <Accordian.Root collapsible>
          <AccordianItem
            title="Instructions: generating a meet roster file"
            titlePadding="24px"
          >
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </AccordianItem>
        </Accordian.Root>
      </MeetUpload>
      <MeetSaved>
        <legend>Saved Meets</legend>
        <ul>
          <li>list of meets (title and date)</li>
          <li>each meet has a button to delete</li>
          <li>each meet has a button to display its data</li>
        </ul>
      </MeetSaved>
      <MeetInfo>
        <legend>Meet Information</legend>

        <MeetNameDate>
          <InputWrapper style={{ gridArea: "name" }}>
            <LabelRoot htmlFor="meet-name">Meet Name</LabelRoot>

            <input
              type="text"
              id="meet-name"
              {...register("meetName", {
                required: "Meet name required",
              })}
            />
            {errors.meetName && (
              <ErrorMessage>{errors.meetName.message}</ErrorMessage>
            )}
          </InputWrapper>
          {/* user selects course */}
          <InputWrapper style={{ gridArea: "course" }}>
            <LabelRoot htmlFor="course">Course</LabelRoot>
            <Select.Root
              value={course}
              onValueChange={(val) => {
                if (val) {
                  setCourse(val);
                  clearErrors("course");
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
            {errors.course && (
              <ErrorMessage>{errors.course.message}</ErrorMessage>
            )}
          </InputWrapper>

          <StartDate>
            <LabelRoot htmlFor="start-date">Start date</LabelRoot>
            <input
              type="date"
              id="start-date"
              {...register("startDate", {
                required: "Start date required",
              })}
            />
            {errors.startDate && (
              <ErrorMessage>{errors.startDate.message}</ErrorMessage>
            )}
          </StartDate>
          <EndDate>
            <LabelRoot htmlFor="end-date">End date (optional)</LabelRoot>
            <input
              id="end-date"
              type="date"
              {...register("endDate", {
                validate: (val) => {
                  if (val && val < getValues("startDate"))
                    return "End must be after start";
                  return true;
                },
              })}
            />
            {errors.endDate && (
              <ErrorMessage>{errors.endDate.message}</ErrorMessage>
            )}
          </EndDate>
        </MeetNameDate>

        {/*
          TODO: This table causes responsiveness headaches on phones and small tablets.
          Need to figure out a way to gracefully display this info on small screens,
          maybe by having two rows per swimmer (one for roster upload one for USMS match)
        */}
        {competitors.length > 0 && (
          <TableWrap>
            <p>
              In order to email the competitors, we must match them with their
              USMS registration. Please review the matches in the table below
              for accuracy; clicking the USMS ID to view the member&apos;s
              public profile can help. If there is a descrepancy, uncheck the
              box (so the person is not included in emails) and{" "}
              <a href="mailto:VAmembership@usms.org">
                contact the membership coordinator
              </a>
              . Note that the results page on the public profile can also be
              useful in constructing relays.
            </p>
            <SwimmerTable>
              <thead>
                <tr>
                  <th colSpan="4" scope="col" style={{ textAlign: "center" }}>
                    Roster
                  </th>
                  <th colSpan="3" scope="col" style={{ textAlign: "center" }}>
                    USMS match
                  </th>
                </tr>
                <tr>
                  <th colSpan="4" style={{ padding: "0" }}>
                    <SeparatorRoot decorative />
                  </th>
                  <th colSpan="3" style={{ padding: "0" }}>
                    <SeparatorRoot decorative />
                  </th>
                </tr>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Gender</th>
                  <th scope="col">Age</th>
                  <th scope="col">Relays</th>
                  <th scope="col">Name</th>
                  <th scope="col">USMS ID</th>
                  <th scope="col">Include</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((swimmer, index) => {
                  return (
                    <tr key={swimmer._id}>
                      {/* Roster upload data */}
                      <th scope="row">
                        {swimmer.firstName} {swimmer.lastName}
                      </th>
                      <td style={{ textAlign: "center" }}>{swimmer.gender}</td>
                      <td style={{ textAlign: "center" }}>{swimmer.meetAge}</td>
                      <td>
                        {swimmer.relays.map((eventNum) => eventNum).join(", ")}
                      </td>
                      {/* USMS match placeholders */}
                      <td>
                        {swimmer.member.firstName} {swimmer.member.lastName}
                      </td>
                      <td>
                        <a
                          href={`https://www.usms.org/people/${swimmer.member.usmsId}`}
                          target="_new"
                        >
                          {swimmer.member.usmsId}
                        </a>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <Checkbox
                          checked={swimmer.member.include}
                          onCheckedChange={(checked) => {
                            // toggle the "member.include" property for this swimmer
                            const allCompetitors = competitors;
                            allCompetitors[index].member.include = checked;
                            setCompetitors([...allCompetitors]);
                          }}
                        >
                          <CheckboxIndicator>
                            <Check strokeWidth={3} />
                          </CheckboxIndicator>
                        </Checkbox>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </SwimmerTable>
          </TableWrap>
        )}
      </MeetInfo>
      {errors.roster && (
        <ErrorMessage style={{ gridArea: "message", justifySelf: "center" }}>
          {errors.roster.message}
        </ErrorMessage>
      )}
      <SubmitButtonWrapper>
        <SubmitButton>Save Meet</SubmitButton>
        <Button type="button" onClick={resetForm}>
          Reset Info
        </Button>
      </SubmitButtonWrapper>
    </Form>
  );
}

const Form = styled.form`
  padding: 16px 8px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    "upload saved"
    "info info"
    "message message"
    "button button";
  gap: 8px;
  // all inputs have some padding
  & input {
    padding: 4px;
  }

  @media ${QUERIES.mobile} {
    grid-template-columns: 1fr;
    grid-template-areas:
      "upload"
      "saved"
      "info"
      "button";
  }
`;

const SubmitButtonWrapper = styled.div`
  grid-area: button;
  display: flex;
  gap: 16px;
  justify-content: center;
`;

const Button = styled(MinorButton)`
  padding: 4px 24px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;

  & button {
    max-width: fit-content;
    flex: 0 0 auto;
  }

  @media (max-width: 800px) {
    flex-direction: column-reverse;
    align-items: flex-start;
  }
`;

const MeetUpload = styled(FieldSet)`
  grid-area: upload;
  display: flex;
  gap: 8px;
  flex-direction: column;

  & p {
    max-width: var(--max-prose-width);
    hyphens: auto;
    -webkit-hyphens: auto;
    overflow-wrap: break-word;
  }
`;

const MeetSaved = styled(FieldSet)`
  grid-area: saved;
`;

const MeetInfo = styled(FieldSet)`
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

const SeparatorRoot = styled(Separator.Root)`
  height: 1px;
  width: 95%;
  background-color: ${COLORS.gray[9]};
  margin: 0 auto;
`;

const SwimmerTable = styled(Table)`
  /* button to change USMS match */
  & button {
    background-color: var(--change-background-color);
    border: 1px solid ${COLORS.accent[12]};
    border-radius: 6px;
    box-shadow: 1px 2px 2px ${COLORS.gray[9]};
    padding: 2px 6px;
    line-height: 1;
  }
  & button:hover {
    background-color: ${COLORS.accent[5]};
  }

  & button:active {
    box-shadow: none;
  }

  & th[scope="row"] {
    font-weight: ${WEIGHTS.normal};
  }
`;

const TableWrap = styled.div`
  margin: 12px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  & p {
    margin: 12px 0;
    max-width: var(--max-prose-width);
  }
`;

const Checkbox = styled(CheckboxRoot)`
  width: 28px;
  height: 28px;
`;

import { useState } from "react";
import styled from "styled-components";
import * as Label from "@radix-ui/react-label";
import * as Accordian from "@radix-ui/react-accordion";
import * as Separator from "@radix-ui/react-separator";
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
  // state used to pass messages to user (sometimes errors)
  const [message, setMessage] = useState("");
  // array of objects containing competitors in the meet being displayed
  const [competitors, setCompetitors] = useState([]);
  // array of relay event numbers for user to assign actual events
  const [relayEventNumbers, setRelayEventNumbers] = useState([]);
  // list of all VMST team members (array of member objects) obtained on initial render
  const [members, setMembers] = useState([]);

  //set up for react-hook-form
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useQuery(QUERY_VMST, {
    onCompleted: (data) => {
      setMembers([...data.vmstMembers]);
    },
  });

  // file input onchange event handler, which parses the CSV file
  const handleFile = async (e) => {
    setMessage("");
    let reader = new FileReader();
    reader.readAsText(e.target.files[0]);
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
            id: crypto.randomUUID(),
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
    };
    reader.onerror = () => {
      console.log(reader.error);
      setMessage(`File read error: ${reader.error}`);
    };
  };

  const onSubmit = async ({ meetName, startDate, endDate }) => {
    // let's trim the fat a bit
    const meetSwimmers = competitors.map((swimmer) => {
      const { _id: memberId, include: includeEmail } = swimmer.member;
      const savedSwimmer = { ...swimmer };
      delete savedSwimmer.id; // saving in DB will generate a unique ID, don't need this one
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
    setMessage("");
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
        {message && <ErrorMessage>{message}</ErrorMessage>}
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
                required: "Meet name is required",
              })}
            />
          </InputWrapper>
          {errors.meetName?.message && (
            <ErrorMessage style={{ gridArea: "errorName" }}>
              {errors.meetName.message}
            </ErrorMessage>
          )}
          <InputWrapper style={{ gridArea: "start" }}>
            <LabelRoot htmlFor="start-date">Start date</LabelRoot>
            <input
              type="date"
              id="start-date"
              {...register("startDate", {
                required: "Start date is required",
              })}
            />
          </InputWrapper>
          {errors.startDate?.message && (
            <ErrorMessage style={{ gridArea: "errorStart" }}>
              {errors.startDate.message}
            </ErrorMessage>
          )}
          <InputWrapper style={{ gridArea: "end" }}>
            <LabelRoot htmlFor="end-date">End date (optional)</LabelRoot>
            <input
              type="date"
              id="end-date"
              {...register("endDate", {
                validate: (val) => {
                  if (val && val < getValues("startDate"))
                    return "End date must be after start date";
                  return true;
                },
              })}
            />
          </InputWrapper>
          {errors.endDate?.message && (
            <ErrorMessage style={{ gridArea: "errorEnd" }}>
              {errors.endDate.message}
            </ErrorMessage>
          )}
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
                    <tr key={swimmer.id}>
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
  & input {
    border: none;
    border-bottom: 1px solid ${COLORS.accent[12]};
  }
`;

const MeetNameDate = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  grid-template-areas:
    "name start end"
    "errorName errorStart errorEnd";
  gap: 6px;

  & ${ErrorMessage} {
    justify-self: center;
    margin-top: -6px;
  }

  @media (max-width: 800px) {
  }
`;

const InputWrapper = styled.div`
  width: 100%;
  display: flex;
  gap: 6px;
  align-items: center;

  & input[type="text"] {
    flex: 1;
    min-width: 15ch;
  }
`;

const LabelRoot = styled(Label.Root)`
  all: unset;
  padding: 0;
  margin: 0;
  width: max-content;

  @media ${QUERIES.tabletAndLess} {
    width: min-content;
  }

  @media (max-width: 800px) {
    /* switches to flex-column */
    width: max-content;
  }
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

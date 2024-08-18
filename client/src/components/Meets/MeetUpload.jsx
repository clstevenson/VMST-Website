/* eslint-disable react/prop-types */
import styled from "styled-components";
import papa from "papaparse";
import * as Accordian from "@radix-ui/react-accordion";

import { FieldSet } from "../Styled/FieldSet";
import FileUploader from "../FileUploader";
import AccordianItem from "../AccordianItem";
import matchUSMS from "../../utils/matchUSMS";
import ErrorMessage from "../Styled/ErrorMessage";

export default function MeetUpload({
  errors,
  setError,
  clearErrors,
  members,
  setRelayEventNumbers,
  setCompetitors,
}) {
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

  return (
    <Wrapper>
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
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </AccordianItem>
      </Accordian.Root>
    </Wrapper>
  );
}

const Wrapper = styled(FieldSet)`
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

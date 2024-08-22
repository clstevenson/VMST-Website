/* eslint-disable react/prop-types */
/* 
 This component enables the upload of a CSV file containing meet rosters and their relay availability. The component also includes (as an accordian) instructions to generate that CSV file.
 */
import styled from "styled-components";
import papa from "papaparse";
import * as Accordian from "@radix-ui/react-accordion";

import { FieldSet } from "../Styled/FieldSet";
import FileUploader from "../FileUploader";
import AccordianItem from "../AccordianItem";
import matchUSMS from "../../utils/matchUSMS";
import ErrorMessage from "../Styled/ErrorMessage";
import { COLORS } from "../../utils/constants";

export default function MeetUpload({
  errors,
  setError,
  clearErrors,
  members,
  setRelayEventNumbers,
  setCompetitors,
  uploadCloseEffect,
}) {
  // file input onchange event handler, which parses the CSV file
  const handleFile = async (e) => {
    let reader = new FileReader();
    reader.readAsText(e.target.files[0]);

    // use react-hook-form to display any file read errors
    clearErrors("file");
    reader.onerror = () => {
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
            includeEmail: true, // by default
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
        // add the top match to the swimmer object (want permanent rec)
        return { ...swimmer, member: match[0] };
      });

      setRelayEventNumbers([...relayEvents]);
      setCompetitors([...matchedCompetitors]);
      // reset form and errors
      clearErrors("roster");
      uploadCloseEffect();
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
          <p>
            To generate the CSV file of VMST meet participants, some time after
            the entry deadline you will need to navigate to the appropriate Club
            Assistant page. Probably there is a way to do this from the entry
            web site, but one way that should always work is to go to the Club
            Assistant web site and click the link to show the upcoming USMS swim
            meets, as shown in the figure below.
          </p>
          <Figure>
            <img
              src="/assets/Meet1.png"
              alt="list upcoming masters swim meets"
            />
            <figcaption>
              Go to the Club Assistant web site to list the upcoming USMS swim
              meets
            </figcaption>
          </Figure>
          Once you see the listing of meets, click the name of the meet you are
          interested in.
          <Figure>
            <img src="/assets/Meet2.png" alt="click the meet name" />
            <figcaption>
              Click the name of the meet you wish to upload.
            </figcaption>
          </Figure>
          Then in the resulting page you will click on the Club Entry Rosters
          link.
          <Figure>
            <img src="/assets/Meet3.png" alt="club entry rosters link" />
            <figcaption>Click the Club Entry Rosters link.</figcaption>
          </Figure>
          Once you do this, you will be presented with a listing of all
          competitors. This list can be filtered by club. Use this to list all
          the VMST competitors in the meet, as shown in the figure below.
          <Figure>
            <img src="/assets/Meet4.png" alt="list VMST meet roster" />
            <figcaption>Use the filter to list the VMST meet roster</figcaption>
          </Figure>
          Now you can download this list as a CSV file that can be uploaded to
          the website for meet-related communications and to construct relays.
          <Figure>
            <img src="/assets/Meet5.png" alt="download the CSV file" />
            <figcaption>
              Download the VMST meet roster as a CSV file. This is the file that
              will be uploaded to this website.
            </figcaption>
          </Figure>
          While normally you will want to do this process after the meet entry
          deadline has passed (and thus the meet rosters are set), you can
          generate preliminary meet rosters if you wish to start meet
          communications with participants who have registered before the
          deadline. You can update the meet roster (not forgetting to save the
          changes!) once the deadline has passed.
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

const Figure = styled.figure`
  margin: 16px 0;
  background-color: transparent;
  border: 1px solid ${COLORS.gray[8]};
  padding: 2px;

  & img {
    max-width: 100%;
  }

  & figcaption {
    font-style: italic;
    border-top: 1px dotted ${COLORS.gray[7]};
  }
`;

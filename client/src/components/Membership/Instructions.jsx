/* 
 Pretty simple component: provide instructions (as acccordian) for generation of CSV membership file to upload.
 */

import styled from "styled-components";
import * as Accordian from "@radix-ui/react-accordion";

import AccordianItem from "../AccordianItem";
import { COLORS } from "../../utils/constants";

export default function Instructions() {
  return (
    <InstructionsWrapper>
      <AccordianRoot collapsible>
        <AccordianItem title="Instructions on generating membership CSV file">
          <p>The steps are shown in the following figure.</p>
          <Figure>
            <Image
              src="./assets/MemberReportGeneration1.png"
              alt="generate HTML report screenshot"
            />
            <figcaption>
              Steps to generate an HTML report of all current members and that
              contains all possible record fields.
            </figcaption>
          </Figure>

          <ol>
            <li>
              After logging into the Registration section of the USMS
              Site/Database Administration, click the &quot;Member Report&quot;
              item on the &quot;Report&quot; drop-down menu.
            </li>
            <li>
              Click on &quot;Select all&quot; to display all available fields in
              the report.
            </li>
            <li>
              Choose the years to generate all current members. That will always
              involve checking the current year; in the months of Nov and Dec
              you will also need to check the next calendar year.
            </li>
            <li>Choose the &quot;HTML&quot; report type.</li>
            <li>Click on the button to generate the report.</li>
          </ol>

          <p>
            After the report appears you will get a display like the one shown
            in the figure below. Check to make sure that all members seem to be
            included in the report and that all fields were generated (you will
            have to scroll horizontally to verify). Then click on the CSV button
            to download the report as a text file with Comma Separated Values.
            This is the file you will import.
          </p>

          <Figure>
            <Image
              src="./assets/MemberReportGeneration2.png"
              alt="download member report as a file"
            />
            <figcaption>
              Click the CSV button to download the generated report in the CSV
              file format suitable for import.
            </figcaption>
          </Figure>
        </AccordianItem>
      </AccordianRoot>
    </InstructionsWrapper>
  );
}

const AccordianRoot = styled(Accordian.Root)`
  margin: 0 32px;
`;

const InstructionsWrapper = styled.div`
  border: 1px solid ${COLORS.accent[10]};
  border-radius: 8px;
  background-color: ${COLORS.accent[2]};
  margin: 16px 0;

  & p {
    margin: 16px 0;
  }
`;

const Image = styled.img`
  width: 100%;
`;

const Figure = styled.figure`
  margin: 16px 0;
  background-color: transparent;

  & figcaption {
    font-style: italic;
    border-top: 1px dotted ${COLORS.gray[7]};
  }
`;

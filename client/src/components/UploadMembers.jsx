import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import * as Accordian from "@radix-ui/react-accordion";

import AccordianItem from "./AccordianItem";
import FileUploader from "./FileUploader";
import Auth from "../utils/auth";
import { useQuery, useMutation } from "@apollo/client";
import { UPLOAD_MEMBERS } from "../utils/mutations";
import { QUERY_MEMBERS } from "../utils/queries";
import papa from "papaparse";
import getGroups from "../utils/getGroups";
import { COLORS, QUERIES, WEIGHTS } from "../utils/constants";
import SubmitButton from "./Styled/SubmiButton";

// global variable representing the members in the DB
let currentMembers = [];

export default function UploadMembers() {
  // state representing new members data uploaded from user
  const [members, setMembers] = useState([]);
  // state representing member information in DB to be displayed in the table
  // (may be filtered and/or paginated version of DB membership data)
  const [display, setDisplay] = useState([]);
  // feedback to the user in an alert
  const [message, setMessage] = useState("");
  // state representing currently selected file
  const [file, setFile] = useState("");
  // summary stats of memberhip currently in DB
  const [numMembers, setNumMembers] = useState(0);
  const [numVMST, setNumVMST] = useState(0);
  const [groups, setGroups] = useState([]);
  // states for filtering the members table
  const [name, setName] = useState("");
  const [clubGroup, setClubGroup] = useState("");
  // mutation to update the Members collection in the CB
  // (used in form onSubmit event handler)
  const [upload, { error }] = useMutation(UPLOAD_MEMBERS);

  // retrieve DB membership info
  const { loading, data } = useQuery(QUERY_MEMBERS);

  // function to extract data to display in members table
  const displayMembers = (members) => {
    const displayData = members.map((member) => {
      return {
        usmsRegNo: member.usmsRegNo,
        fullName: member.firstName + " " + member.lastName,
        club: member.club,
        usmsId: member.usmsId,
        workoutGroup: member.workoutGroup,
        regYear: member.regYear,
      };
    });
    setDisplay(displayData);
  };

  // this variable will contain the content of the DB for the function
  // initially it is set from the DB query
  currentMembers = data?.members || [];

  useEffect(() => {
    if (currentMembers.length > 0) {
      setNumMembers(currentMembers.length);
      setNumVMST(
        currentMembers.filter((member) => member.club === "VMST").length
      );
      setGroups(getGroups(currentMembers));
      displayMembers(currentMembers);
    }
  }, [data]);

  // file input onchange event handler, which parses the CSV file
  const handleFile = (e) => {
    setFile(e.target.value);
    setMessage("");
    let reader = new FileReader();
    reader.readAsText(e.target.files[0]);
    reader.onload = async () => {
      const results = await papa.parse(reader.result, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      });
      setMembers([...results.data]);
    };
    reader.onerror = () => console.log(reader.error);
  };

  // form submit event handler extracts the good parts of the data
  // and uploads to the Members collection of the DB, replacing those contents
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    // if no file has been chosen then don't do anything
    if (file === "") return;
    // extract the parts that we need
    const memberData = members.map((member) => {
      const obj = {};
      obj.usmsRegNo = member["USMS Number"];
      obj.firstName = member["First Name"];
      obj.lastName = member["Last Name"];
      obj.gender = member.Gender;
      obj.club = member.Club.toString();
      obj.workoutGroup = member["WO Group"];
      obj.regYear = member["Reg. Year"];
      obj.emails = [];
      if (member["(P) Email Address"])
        obj.emails.push(member["(P) Email Address"]);
      if (member["(S) Email Address"])
        obj.emails.push(member["(S) Email Address"]);
      obj.emailExclude = member["Exclude LMSC Group Email"] === "Y";
      return obj;
    });

    // update the DB
    const { data } = await upload({ variables: { memberData } });

    if (data.uploadMembers.length === 0) {
      setMessage(`There was a problem: ${error}`);
    } else {
      // update the variable representing members in DB
      currentMembers = data.uploadMembers;
      // update some state vars: members, member stats
      // these will trigger update of the member table (should that be a spearate component?)
      setNumMembers(currentMembers.length);
      setNumVMST(
        currentMembers.filter((member) => member.club === "VMST").length
      );
      setGroups(getGroups(currentMembers));

      // display the new data
      displayMembers(currentMembers);
    }

    //reset state variables
    setMembers([]);
    setFile("");
    setName("");
    setClubGroup("");
  };

  // case-insensitive search/filter for name (first or last), respecting
  // any term in the club/group search field
  // maybe eventually make the search smarter (eg space separated terms or regex)
  const handleNameChange = async (e) => {
    let filteredMembers;
    if (e.target.value.length > 0) {
      // update displayed value
      setName(e.target.value);
      const filterTerm = e.target.value.toLowerCase();
      filteredMembers = currentMembers.filter((member) => {
        const fullName = [member.firstName, member.lastName]
          .join("")
          .toLowerCase();
        const clubAndGroup = [member.club, member.workoutGroup]
          .join("")
          .toLowerCase();
        return (
          fullName.includes(filterTerm) &&
          clubAndGroup.includes(clubGroup.toLowerCase())
        );
      });
      displayMembers(filteredMembers);
    } else if (clubGroup) {
      setName("");
      // need to filter based on club/group search term, which is not empty
      filteredMembers = currentMembers.filter((member) => {
        const clubAndGroup = [member.club, member.workoutGroup]
          .join("")
          .toLowerCase();
        return clubAndGroup.includes(clubGroup.toLowerCase());
      });
      displayMembers(filteredMembers);
    } else {
      // both search terms empty, reset display
      setName("");
      displayMembers(currentMembers);
    }
  };

  // case-insensitive search/filter for club or group, respecting
  // any term in the name search field
  // maybe eventually make the search smarter (eg space separated terms or regex)
  const handleGroupChange = async (e) => {
    let filteredMembers;
    if (e.target.value.length > 0) {
      // update displayed value
      setClubGroup(e.target.value);
      const filterTerm = e.target.value.toLowerCase();
      filteredMembers = currentMembers.filter((member) => {
        const fullName = [member.firstName, member.lastName]
          .join("")
          .toLowerCase();
        const clubAndGroup = [member.club, member.workoutGroup]
          .join("")
          .toLowerCase();
        return (
          clubAndGroup.includes(filterTerm) &&
          fullName.includes(name.toLowerCase())
        );
      });
      displayMembers(filteredMembers);
    } else if (name) {
      setClubGroup("");
      // need to filter based on name search term, which is not empty
      filteredMembers = currentMembers.filter((member) => {
        const fullName = [member.firstName, member.lastName]
          .join("")
          .toLowerCase();
        return fullName.includes(name.toLowerCase());
      });
      displayMembers(filteredMembers);
    } else {
      // reset display and name state variable
      setClubGroup("");
      displayMembers(currentMembers);
    }
  };

  // find out role
  let role;
  Auth.loggedIn() ? (role = Auth.getProfile().data.role) : (role = "");
  // only the membership coordinator has access to this page
  if (role !== "membership") {
    throw new Error("Not authorized to view this page");
  }

  return (
    <Wrapper>
      <Form onSubmit={handleFormSubmit}>
        <FileWrapper>
          <FileUploader
            style={{ width: "160px", flex: "0 0 auto" }}
            handleFile={handleFile}
            filetype="csv"
          >
            {/* want buttons the same size */}
            Choose CSV file
          </FileUploader>
          <FileUploadInstructions>
            {file === ""
              ? "Click to upload membership file"
              : "Upload a different membership file"}
          </FileUploadInstructions>
        </FileWrapper>

        {/* After file chosen display message and update button */}
        {file && (
          <>
            <p>
              <span style={{ fontFamily: "monospace" }}>
                {file.substring(file.lastIndexOf("\\") + 1)}
              </span>{" "}
              uploaded with {members.length} members
            </p>
            <FileWrapper>
              <UpdateButton type="submit" disabled={file === ""}>
                Update members
              </UpdateButton>
              <FileUploadInstructions>
                Click to update database with uploaded file
              </FileUploadInstructions>
            </FileWrapper>
          </>
        )}
      </Form>

      {/* when message is not an empty string, it is displayed */}
      {message && <p> {message} </p>}

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
                Figuring outlinining steps to generate an HTML report of all
                current members, containing all record fields.
              </figcaption>
            </Figure>

            <ol>
              <li>
                After logging into the Registration section of the USMS
                Site/Database Administration, click the "Member Report" item on
                the "Report" drop-down menu.
              </li>
              <li>
                Click on "Select all" to display all available fields in the
                report.
              </li>
              <li>
                Choose the years to generate all current members. That will
                always involve checking the current year; in the months of Nov
                and Dec you will also need to check the next calendar year.
              </li>
              <li>Choose the "HTML" report type.</li>
              <li>Click on the button to generate the report.</li>
            </ol>

            <p>
              After the report appears you will get a display like the one shown
              in the figure below. Check to make sure that all members seem to
              be included in the report and that all fields were generated (you
              will have to scroll horizontally to verify). Then click on the CSV
              button to download the report as a text file with Comma Separated
              Values. This is the file you will import.
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

      <p>
        There are currently {numMembers} members in the LMSC, {numVMST} of whom
        are in VMST.
        <br />
        VMST workout groups: {groups.join(", ")}.
      </p>

      {/* filter the table by name or club/group */}
      <form>
        <SearchWrapper>
          <InputWrapper>
            <label htmlFor="name">Search by name: </label>
            <input
              type="text"
              id="name"
              placeholder="First or Last Name"
              value={name}
              onChange={handleNameChange}
            ></input>
          </InputWrapper>

          <InputWrapper>
            <label htmlFor="club">Search by club/group: </label>
            <input
              id="club"
              type="text"
              placeholder="Club or WO group"
              value={clubGroup}
              onChange={handleGroupChange}
            ></input>
          </InputWrapper>

          <ClearSearchButton
            onClick={(evt) => {
              evt.preventDefault();
              setClubGroup("");
              setName("");
              displayMembers(currentMembers);
            }}
          >
            Clear All
          </ClearSearchButton>
        </SearchWrapper>

        {/* Would be nice to have a small "clear all" button but styling... */}
        {/* <Col> */}
        {/*   <Button variant="warning">Clear All</Button> */}
        {/* </Col> */}
      </form>

      <MemberTable>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Reg num</th>
            <th scope="col">Club</th>
            <th scope="col">WO grp</th>
            <th scope="col">Reg yr</th>
          </tr>
        </thead>
        <tbody>
          {display?.map((member) => (
            <tr key={member.usmsRegNo}>
              <th scope="row">{member.fullName}</th>
              <td>
                <a
                  href={`https://www.usms.org/people/${member.usmsId}`}
                  target="_new"
                >
                  {member.usmsRegNo}
                </a>
              </td>
              <td>{member.club}</td>
              <td>{member.workoutGroup}</td>
              <td>{member.regYear}</td>
            </tr>
          ))}
        </tbody>
      </MemberTable>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: min(1200px, 100%);
  /* margin: 16px auto; */
  /* border: 1px solid ${COLORS.accent[12]}; */
  /* border-radius: 8px; */
  padding: 16px;
`;

const Image = styled.img`
  width: 100%;
`;

const FileUploadInstructions = styled.span`
  padding: 8px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px;
  margin: 16px 0;
  margin-left: -4px;
`;

const UpdateButton = styled(SubmitButton)`
  display: inline-block;
  padding: 4px 8px;
  margin: 8px 0;
  flex: 0 0 auto;
  flex-basis: 160px;
  box-shadow: 1px 2px 4px ${COLORS.gray[10]};

  &:disabled {
    background-color: ${COLORS.gray[10]};
    border: none;
  }
`;

const FileWrapper = styled.div`
  display: flex;
  align-items: center;
`;

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

const Figure = styled.figure`
  margin: 16px 0;
  background-color: white;

  & figcaption {
    font-style: italic;
    border-top: 1px dotted ${COLORS.gray[7]};
  }
`;

const SearchWrapper = styled.div`
  padding: 12px 4px;
  display: flex;
  gap: 2px;
  width: 100%;
  align-items: flex-end;

  @media ${QUERIES.mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const ClearSearchButton = styled.button`
  border: 1px solid ${COLORS.accent[12]};
  box-shadow: 1px 2px 4px ${COLORS.gray[10]};
  border-radius: 4px;
  min-width: 44px;
  height: fit-content;
  padding: 4px 12px;
  background-color: ${COLORS.accent[3]};
  margin-left: 4px;
  font-weight: ${WEIGHTS.medium};

  @media ${QUERIES.mobile} {
    width: fit-content;
    min-height: 44px;
    margin-left: 0;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;

  @media ${QUERIES.mobile} {
    width: 100%;
  }

  & input {
    border: 1px solid ${COLORS.gray[8]};
    background-color: ${COLORS.accent[2]};
    padding: 4px;
  }
`;

// all children elements/nodes of the table are styled here as well
const MemberTable = styled.table`
  margin: 6px auto;
  table-layout: fixed;
  border-collapse: collapse;

  // default is left-aligned
  & * {
    text-align: left;
  }

  & thead {
    border-top: 2px solid ${COLORS.accent[12]};
    border-bottom: 2px solid ${COLORS.accent[12]};
    background-color: ${COLORS.accent[4]};
  }

  & th,
  & td {
    padding: 4px 8px;

    @media ${QUERIES.mobile} {
      padding: 4px 6px;
    }
  }

  // zebra-stripes
  & tbody tr:nth-child(even) {
    background-color: ${COLORS.accent[3]};
  }

  & tbody {
    border-bottom: 2px solid ${COLORS.accent[12]};
  }
`;

import { useState } from "react";
import styled from "styled-components";

import Auth from "../../utils/auth";
import { useQuery, useMutation } from "@apollo/client";
import { UPLOAD_MEMBERS } from "../../utils/mutations";
import { QUERY_MEMBERS } from "../../utils/queries";
import papa from "papaparse";

import FileUploader from "../FileUploader";
import getGroups from "../../utils/getGroups";
import { COLORS, QUERIES, WEIGHTS } from "../../utils/constants";
import SubmitButton from "../Styled/SubmiButton";
import Table from "../Styled/Table";
import ToastMessage from "../ToastMessage";
import Instructions from "./Instructions";

export default function UploadMembers() {
  // state representing new members data uploaded from user
  const [members, setMembers] = useState([]);
  // state representing the DB (and what is displayed in the table)
  const [currentMembers, setCurrentMembers] = useState([]);
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
  // state representing success of DB update
  const [updated, setUpdated] = useState(false);

  // retrieve DB membership info
  useQuery(QUERY_MEMBERS, {
    onCompleted: (data) => {
      setCurrentMembers(data.members);
      setNumMembers(data.members.length);
      setNumVMST(
        data.members.filter((member) => member.club === "VMST").length
      );
      setGroups(getGroups(data.members));
      displayMembers(data.members);
    },
  });

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

  // file input onchange event handler, which parses the CSV file
  const handleFile = async (e) => {
    setFile(e.target.value);
    setMessage("");
    let reader = new FileReader();
    reader.readAsText(e.target.files[0]);
    reader.onload = () => {
      const results = papa.parse(reader.result, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      });
      setMembers([...results.data]);
    };
    reader.onerror = () => {
      console.log(reader.error);
      setMessage(`File read error: ${reader.error}`);
    };
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
      setCurrentMembers(data.uploadMembers);
      // update some state vars: members, member stats
      // these will trigger update of the member table (should that be a spearate component?)
      setNumMembers(data.uploadMembers.length);
      setNumVMST(
        data.uploadMembers.filter((member) => member.club === "VMST").length
      );
      setGroups(getGroups(data.uploadMembers));

      // display the new data
      displayMembers(data.uploadMembers);

      // show Toast Message
      setUpdated(true);
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

      <Instructions />

      <p>
        There are currently {numMembers} members in the LMSC, {numVMST} of whom
        are in VMST.
        <br />
        VMST workout groups: {groups.map(({ name }) => name).join(", ")}.
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

      <Table>
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
                  href={`https://www.usms.org/people/${member.usmsRegNo.slice(-5)}`}
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
      </Table>
      {updated && (
        <ToastMessage toastCloseEffect={() => setUpdated(false)}>
          The membership database has been updated!
        </ToastMessage>
      )}
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

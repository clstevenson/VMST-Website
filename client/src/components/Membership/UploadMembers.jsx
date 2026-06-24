import { useState } from "react";
import styled from "styled-components";

import { useAuth } from "../../context/AuthContext";
import { useQuery, useMutation } from "@apollo/client";
import { UPLOAD_MEMBERS, UPDATE_EMAIL_DELIVERABILITY } from "../../utils/mutations";
import { QUERY_MEMBERS } from "../../utils/queries";
import papa from "papaparse";
import { Check } from "react-feather";
import * as ToggleGroup from "@radix-ui/react-toggle-group";

import FileUploader from "../FileUploader";
import getGroups from "../../utils/getGroups";
import { COLORS, QUERIES, WEIGHTS } from "../../utils/constants";
import SubmitButton from "../Styled/SubmiButton";
import Table from "../Styled/Table";
import ToastMessage from "../ToastMessage";
import Instructions from "./Instructions";
import PaginationNav from "../PaginationNav";
import MembersPerPage from "./MembersPerPage";
import { CheckboxRoot, CheckboxIndicator } from "../Styled/Checkbox";

// graphql-js's own (stable, version-pinned) wording for a missing required
// input field, eg:
// Variable "$memberData" got invalid value {...} at "memberData[3]"; Field
// "gender" of required type "String!" was not provided.
// A CSV missing a column (eg a skipped export step) produces one of these
// per missing field per row -- which Apollo concatenates into one wall of
// near-identical paragraphs. If every error in the response matches this
// shape, summarize by field/row count instead of dumping all of them; if
// even one doesn't match (eg a wrong-type value, not just a missing one),
// bail out to the raw message rather than risk hiding something different.
const MISSING_FIELD_PATTERN =
  /at "memberData\[(\d+)\]"; Field "([^"]+)" of required type "[^"]+!" was not provided\./;

// graphql-js caps variable-coercion errors at 50 and appends one final,
// differently-shaped error announcing the cutoff -- routine for any CSV
// missing more than ~25 required-field rows (2 errors/row), not a sign that
// something unexpected happened, so it's stripped out before the "did every
// error match the expected shape" check rather than causing a bail-out
const ERROR_LIMIT_PATTERN = /error limit reached/;

function summarizeMissingFieldErrors(err, members) {
  const allErrors = err.graphQLErrors ?? [];
  const truncated = allErrors.some((e) => ERROR_LIMIT_PATTERN.test(e.message));
  const relevantErrors = truncated
    ? allErrors.filter((e) => !ERROR_LIMIT_PATTERN.test(e.message))
    : allErrors;

  const badInputErrors = relevantErrors.filter(
    (gqlError) => gqlError.extensions?.code === "BAD_USER_INPUT"
  );
  if (!badInputErrors.length || badInputErrors.length !== relevantErrors.length) {
    return null;
  }

  const rowsByField = {};
  for (const gqlError of badInputErrors) {
    const match = gqlError.message.match(MISSING_FIELD_PATTERN);
    if (!match) return null;
    const [, indexStr, field] = match;
    (rowsByField[field] ??= new Set()).add(Number(indexStr));
  }

  const affectedRows = new Set(
    Object.values(rowsByField).flatMap((rows) => [...rows])
  );
  const fieldSummary = Object.entries(rowsByField)
    .map(([field, rows]) => `${field} (${rows.size} row${rows.size === 1 ? "" : "s"})`)
    .join(", ");
  const firstRow = members[Math.min(...affectedRows)];
  const example = firstRow
    ? ` First problem row: ${firstRow["First Name"]} ${firstRow["Last Name"]} (USMS # ${firstRow["USMS Number"]}).`
    : "";
  const countLabel = truncated ? `${affectedRows.size}+` : `${affectedRows.size}`;
  const truncatedNote = truncated
    ? " (the server stopped counting after 50 problems -- there may be more than shown)"
    : "";

  return (
    `${countLabel} row(s) are missing required field(s): ${fieldSummary}${truncatedNote}. ` +
    `This usually means a column was blank or the export skipped a step -- ` +
    `check the upload instructions and re-upload.${example}`
  );
}

export default function UploadMembers() {
  const { user } = useAuth();
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
  const [numReachable, setNumReachable] = useState(0);
  const [numReachableVMST, setNumReachableVMST] = useState(0);
  const [groups, setGroups] = useState([]);
  // states for filtering the members table
  const [name, setName] = useState("");
  const [clubGroup, setClubGroup] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  // "noEmail" | "optedOut" | "nonDeliverable", OR'd together, then AND'd
  // with the name/club/email text filters
  const [quickFilters, setQuickFilters] = useState([]);
  // states for paginating the members table
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(100);
  // mutation to update the Members collection in the CB
  // (used in form onSubmit event handler)
  const [upload] = useMutation(UPLOAD_MEMBERS);
  // state representing success of DB update
  const [updated, setUpdated] = useState(false);

  // unsaved deliverable toggles, keyed by "usmsId|address", flushed together
  // by the Save Changes button rather than writing the DB on every click
  const [pendingChanges, setPendingChanges] = useState({});
  const [saveDeliverability] = useMutation(UPDATE_EMAIL_DELIVERABILITY);
  const [savedChanges, setSavedChanges] = useState(false);

  // retrieve DB membership info. cache-and-network (not the default
  // cache-first) because this page's own mutations write the DB directly
  // without going through Apollo's normalized cache for this query -- without
  // it, navigating away and back via client-side routing shows stale data
  // until a full reload
  const { refetch: refetchMembers } = useQuery(QUERY_MEMBERS, {
    fetchPolicy: "cache-and-network",
    onCompleted: (data) => applyMemberList(data.members),
  });

  // a member is reachable by email if they haven't opted out and have at
  // least one well-formed, deliverable email address
  const isReachable = (member) =>
    !member.emailExclude &&
    member.emails.some((email) => email.formatValid && email.deliverable);

  // shared by the initial query, a full upload success, and a refetch after
  // a partial upload failure -- all three need to push a fresh member list
  // into every derived piece of state the same way
  const applyMemberList = (members) => {
    setCurrentMembers(members);
    setNumMembers(members.length);
    setNumVMST(members.filter((member) => member.club === "VMST").length);
    setNumReachable(members.filter(isReachable).length);
    setNumReachableVMST(
      members.filter(
        (member) => member.club === "VMST" && isReachable(member)
      ).length
    );
    setGroups(getGroups(members));
    displayMembers(members);
  };

  // function to extract data to display in members table
  const displayMembers = (members) => {
    const displayData = members.map((member) => {
      return {
        usmsRegNo: member.usmsRegNo,
        fullName: member.firstName + " " + member.lastName,
        club: member.club,
        usmsId: member.usmsId,
        workoutGroup: member.workoutGroup,
        emails: member.emails,
        emailExclude: member.emailExclude,
      };
    });
    setDisplay(displayData);
    // any time the displayed set changes (filtering, upload, clear) start
    // back on page 1, since the old page number may no longer be valid
    setPage(1);
  };

  const maxPages = Math.max(1, Math.ceil(display.length / perPage));
  const pagedMembers = display.slice((page - 1) * perPage, page * perPage);

  // toggle a single email's deliverable status locally (queued for the Save
  // Changes button); updates currentMembers and display in parallel so a
  // later filter change doesn't re-derive display from a stale currentMembers
  // and silently drop the unsaved edit. Doesn't touch pagination/page.
  const toggleDeliverable = (usmsId, address, checked) => {
    const applyToggle = (members) =>
      members.map((member) =>
        member.usmsId === usmsId
          ? {
              ...member,
              emails: member.emails.map((email) =>
                email.address === address
                  ? { ...email, deliverable: checked }
                  : email
              ),
            }
          : member
      );
    setCurrentMembers(applyToggle);
    setDisplay(applyToggle);

    const key = `${usmsId}|${address}`;
    setPendingChanges((prev) => {
      // the DB-persisted value, untouched by any pending edit: captured the
      // first time this address is toggled, then carried forward unchanged
      // across further toggles of the same address
      const original =
        prev[key]?.original ??
        currentMembers
          .find((member) => member.usmsId === usmsId)
          ?.emails.find((email) => email.address === address)?.deliverable;

      if (checked === original) {
        // back to the original value -- no longer a pending change
        const rest = { ...prev };
        delete rest[key];
        return rest;
      }
      return {
        ...prev,
        [key]: { usmsId, address, deliverable: checked, original },
      };
    });
  };

  const handleSaveChanges = async () => {
    const updates = Object.values(pendingChanges).map(
      ({ usmsId, address, deliverable }) => ({ usmsId, address, deliverable })
    );
    if (updates.length === 0) return;
    await saveDeliverability({ variables: { updates } });
    setPendingChanges({});
    setSavedChanges(true);
  };

  // discard unsaved toggles, reverting currentMembers/display to the
  // DB-persisted values recorded when each pending edit started
  const handleClearChanges = () => {
    const revert = (members) =>
      members.map((member) => {
        const memberPending = Object.values(pendingChanges).filter(
          (change) => change.usmsId === member.usmsId
        );
        if (memberPending.length === 0) return member;
        return {
          ...member,
          emails: member.emails.map((email) => {
            const pending = memberPending.find(
              (change) => change.address === email.address
            );
            return pending
              ? { ...email, deliverable: pending.original }
              : email;
          }),
        };
      });
    setCurrentMembers(revert);
    setDisplay(revert);
    setPendingChanges({});
  };

  // render the address + deliverable checkbox for one of a member's emails,
  // or nothing if that email slot is blank
  const renderEmailCell = (member, index) => {
    const email = member.emails?.[index];
    if (!email || !email.address) return null;
    const inactive = !email.formatValid || member.emailExclude;
    return (
      <EmailCell>
        <EmailCheckbox
          checked={email.deliverable}
          disabled={inactive}
          onCheckedChange={(checked) =>
            toggleDeliverable(member.usmsId, email.address, checked)
          }
        >
          <CheckboxIndicator>
            <Check strokeWidth={3} />
          </CheckboxIndicator>
        </EmailCheckbox>
        <EmailAddress $inactive={inactive}>{email.address}</EmailAddress>
      </EmailCell>
    );
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
      obj.usmsId = member["USMS Number"].slice(-5);
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
    let data;
    try {
      ({ data } = await upload({ variables: { memberData } }));
    } catch (err) {
      const partialFailure = err.graphQLErrors?.find(
        (gqlError) => gqlError.extensions?.code === "UPLOAD_PARTIAL_FAILURE"
      );
      if (partialFailure) {
        // the rows that didn't collide are already persisted -- refresh the
        // table from the DB rather than leaving it showing pre-upload data
        const { succeededCount, failedCount, failures } =
          partialFailure.extensions;
        const failedList = failures
          .map((f) => `${f.name ?? "unknown"} (USMS ID ${f.usmsId ?? "?"})`)
          .join(", ");
        setMessage(
          `Uploaded ${succeededCount} member(s), but ${failedCount} failed and were NOT updated: ${failedList}. Fix those rows and re-upload.`
        );
        const refreshed = await refetchMembers();
        applyMemberList(refreshed.data.members);
      } else {
        const summary = summarizeMissingFieldErrors(err, members);
        setMessage(summary ?? `Upload failed: ${err.message}. Please try again.`);
      }
      // leave file/members alone on failure so the coordinator can retry
      // without re-choosing the file
      return;
    }

    if (data.uploadMembers.length === 0) {
      setMessage("There was a problem: no members were uploaded.");
    } else {
      applyMemberList(data.uploadMembers);
      // show Toast Message
      setUpdated(true);
    }

    //reset state variables
    setMembers([]);
    setFile("");
    setName("");
    setClubGroup("");
    // a fresh upload replaces the roster, so any unsaved deliverable
    // toggles from before it no longer refer to current data
    setPendingChanges({});
  };

  // case-insensitive recompute of display from every current filter
  // criterion (name, club/group, email substring, quick filters). Accepts
  // overrides for whichever field just changed, since the corresponding
  // setState call hasn't landed yet when this runs in the same handler.
  // maybe eventually make the name/club search smarter (eg regex)
  const applyFilters = (overrides = {}) => {
    const nameTerm = (overrides.name ?? name).toLowerCase();
    const clubTerm = (overrides.clubGroup ?? clubGroup).toLowerCase();
    const emailTerm = (overrides.emailFilter ?? emailFilter).toLowerCase();
    const activeQuickFilters = overrides.quickFilters ?? quickFilters;

    const filteredMembers = currentMembers.filter((member) => {
      const fullName = [member.firstName, member.lastName]
        .join("")
        .toLowerCase();
      const clubAndGroup = [member.club, member.workoutGroup]
        .join("")
        .toLowerCase();
      const emails = member.emails ?? [];

      if (!fullName.includes(nameTerm)) return false;
      if (!clubAndGroup.includes(clubTerm)) return false;
      if (
        emailTerm &&
        !emails.some((email) => email.address.toLowerCase().includes(emailTerm))
      )
        return false;

      if (activeQuickFilters.length > 0) {
        const matchesAny = activeQuickFilters.some((filterName) => {
          if (filterName === "noEmail") return emails.length === 0;
          if (filterName === "optedOut") return member.emailExclude;
          if (filterName === "nonDeliverable")
            return emails.some((email) => !email.deliverable);
          return false;
        });
        if (!matchesAny) return false;
      }

      return true;
    });

    displayMembers(filteredMembers);
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    applyFilters({ name: value });
  };

  const handleGroupChange = (e) => {
    const value = e.target.value;
    setClubGroup(value);
    applyFilters({ clubGroup: value });
  };

  const handleEmailFilterChange = (e) => {
    const value = e.target.value;
    setEmailFilter(value);
    applyFilters({ emailFilter: value });
  };

  const handleQuickFiltersChange = (value) => {
    setQuickFilters(value);
    applyFilters({ quickFilters: value });
  };

  // only the membership coordinator has access to this page
  if (user?.role !== "membership") {
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
        {numReachable} members are reachable by email, {numReachableVMST} of
        whom are in VMST.
        <br />
        VMST workout groups: {groups.map(({ name }) => name).join(", ")}.
      </p>

      {/* filter the table by name, club/group, or email */}
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

          <InputWrapper>
            <label htmlFor="email-filter">Search by email: </label>
            <input
              id="email-filter"
              type="text"
              placeholder="Email address"
              value={emailFilter}
              onChange={handleEmailFilterChange}
            ></input>
          </InputWrapper>

          <ClearSearchButton
            onClick={(evt) => {
              evt.preventDefault();
              setClubGroup("");
              setName("");
              setEmailFilter("");
              setQuickFilters([]);
              displayMembers(currentMembers);
            }}
          >
            Clear All
          </ClearSearchButton>
        </SearchWrapper>

        <QuickFilterRow>
          <QuickFilterGroup
            type="multiple"
            value={quickFilters}
            onValueChange={handleQuickFiltersChange}
            aria-label="quick filters"
          >
            <QuickFilterItem value="noEmail">No email</QuickFilterItem>
            <QuickFilterItem value="optedOut">Opted out</QuickFilterItem>
            <QuickFilterItem value="nonDeliverable">
              Non-deliverable
            </QuickFilterItem>
          </QuickFilterGroup>
          <FileUploadInstructions>
            Uncheck the box next to an email address to mark it
            non-deliverable.
          </FileUploadInstructions>
        </QuickFilterRow>
      </form>

      <SaveChangesRow>
        {Object.keys(pendingChanges).length > 0 && (
          <>
            <SaveChangesButton onClick={handleSaveChanges}>
              Save Changes ({Object.keys(pendingChanges).length})
            </SaveChangesButton>
            <ClearSearchButton onClick={handleClearChanges}>
              Clear Changes
            </ClearSearchButton>
          </>
        )}
      </SaveChangesRow>

      <PaginationRow>
        <PaginationNav
          page={page}
          setPage={setPage}
          maxPages={maxPages}
          displayJump={false}
        />
        <MembersPerPage
          perPage={perPage}
          setPerPage={setPerPage}
          setPage={setPage}
        />
      </PaginationRow>

      <TableScroll>
        <Table>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Reg num</th>
              <th scope="col">Club</th>
              <th scope="col">WO grp</th>
              <th scope="col">Primary email</th>
              <th scope="col">Secondary email</th>
              <th scope="col">Opt out</th>
            </tr>
          </thead>
          <tbody>
            {pagedMembers?.map((member) => (
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
                <td>{renderEmailCell(member, 0)}</td>
                <td>{renderEmailCell(member, 1)}</td>
                <td style={{ textAlign: "center" }}>
                  <EmailCheckbox
                    checked={member.emailExclude}
                    disabled
                    aria-label="opted out of emails"
                  >
                    <CheckboxIndicator>
                      <Check strokeWidth={3} />
                    </CheckboxIndicator>
                  </EmailCheckbox>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableScroll>

      <PaginationRow>
        <PaginationNav
          page={page}
          setPage={setPage}
          maxPages={maxPages}
          displaySelect={false}
          displayJump={false}
        />
      </PaginationRow>
      {updated && (
        <ToastMessage toastCloseEffect={() => setUpdated(false)}>
          The membership database has been updated!
        </ToastMessage>
      )}
      {savedChanges && (
        <ToastMessage toastCloseEffect={() => setSavedChanges(false)}>
          Email deliverability changes saved!
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
  margin: 0 auto;
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

const SaveChangesRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
  /* reserve the buttons' height even when empty, so the table below doesn't
     jump when they appear */
  min-height: 44px;
`;

const SaveChangesButton = styled(SubmitButton)`
  display: inline-block;
  padding: 4px 16px;
  box-shadow: 1px 2px 4px ${COLORS.gray[10]};
`;

const EmailCell = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const EmailAddress = styled.span`
  ${({ $inactive }) => $inactive && `color: ${COLORS.gray[9]};`}
`;

const EmailCheckbox = styled(CheckboxRoot)`
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
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

const QuickFilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const QuickFilterGroup = styled(ToggleGroup.Root)`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px;
`;

const QuickFilterItem = styled(ToggleGroup.Item)`
  border: 1px solid ${COLORS.accent[12]};
  border-radius: 999px;
  min-height: 36px;
  padding: 4px 14px;
  background-color: ${COLORS.accent[2]};
  font-weight: ${WEIGHTS.medium};

  &[data-state="on"] {
    background-color: ${COLORS.accent[9]};
    color: white;
  }

  &:hover {
    cursor: pointer;
    background-color: ${COLORS.accent[5]};
  }

  &[data-state="on"]:hover {
    background-color: ${COLORS.accent[10]};
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

const PaginationRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin: 4px 0;
`;

const TableScroll = styled.div`
  width: 100%;
  min-width: 0;
  overflow-x: auto;
  contain: layout;
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

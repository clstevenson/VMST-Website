/* eslint-disable react/prop-types */
/* 
  This component is displayed in the "Meets" tab for leaders. It allows them to upload meet rosters and save Meets to the database. It finds matches between meet rosters and VMST members, allowing for email communication. It also includes information about relay availability, informing communciations and setting up the potential for an eventual Relay Build tool.
 */

import { useState } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@apollo/client";

import { QUERY_VMST, QUERY_MEETS } from "../../utils/queries";
import { ADD_MEET, DELETE_MEET, EDIT_MEET } from "../../utils/mutations";
import { QUERIES } from "../../utils/constants";
import ErrorMessage from "../../components/Styled/ErrorMessage";
import MeetUpload from "./MeetUpload";
import MeetInfo from "./MeetInfo";
import { MeetButtons } from "./MeetFormButtons";
import { SavedMeets } from "./SavedMeets";
import ToastMessage from "../ToastMessage";

export default function Meets({ setTab }) {
  // array of objects containing competitors in the meet being displayed
  const [competitors, setCompetitors] = useState([]);
  // array of relay event numbers for user to assign actual events
  const [relayEventNumbers, setRelayEventNumbers] = useState([]);
  // list of all VMST team members (array of member objects) obtained on initial render
  const [members, setMembers] = useState([]);
  // controlled state of "course" selector
  const [course, setCourse] = useState("");
  // mutations to add/edit/delete meets
  const [addMeet] = useMutation(ADD_MEET);
  const [deleteMeet] = useMutation(DELETE_MEET);
  const [editMeet] = useMutation(EDIT_MEET);
  // trigger to show Toast
  const [showToast, setShowToast] = useState(false);
  // status of meet in memory
  const [saved, setSaved] = useState(false);
  const [deleted, setDeleted] = useState(false);
  // results of meet query
  const [allMeets, setAllMeets] = useState([]);
  // (saved) meet whose info is currently displayed
  const [currentMeetId, setCurrentMeetId] = useState("");
  // controlled form inputs
  const [meetName, setMeetName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // displaying/editing an existing meet?
  const [isEditing, setIsEditing] = useState(false);

  //set up for react-hook-form
  const {
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  // get all VMST members on initial render
  useQuery(QUERY_VMST, {
    onCompleted: (data) => {
      setMembers([...data.vmstMembers]);
    },
  });

  // retrieve all stored meets on initial render
  const { refetch } = useQuery(QUERY_MEETS, {
    onCompleted: (data) => {
      // need to strip out the __typenames. The "delete" method doesn't work, need to find a better way
      // https://www.apollographql.com/docs/react/api/link/apollo-link-remove-typename/
      // https://stackoverflow.com/questions/52786220/how-to-fix-graphql-mutations-typename-errors
      // Another option is to leave the typename in and only update the fields that have changed, which seems better to me (less bandwidth for one thing)
      const meets = data.meets.map(
        ({
          _id,
          meetName,
          course,
          startDate,
          endDate,
          meetSwimmers: swimmers,
          relays: meetRelays,
        }) => {
          const meetSwimmers = swimmers.map(
            ({
              firstName,
              lastName,
              gender,
              meetAge,
              relays,
              usmsId,
              includeEmail,
            }) => {
              return {
                firstName,
                lastName,
                gender,
                meetAge,
                relays,
                usmsId,
                includeEmail,
              };
            }
          );
          const relays = meetRelays.map(({ eventNum }) => {
            return { eventNum };
          });
          return {
            _id,
            meetName,
            course,
            startDate,
            endDate,
            meetSwimmers,
            relays,
          };
        }
      );
      console.log(meets);
      setAllMeets([...meets]);
    },
  });

  const onSubmit = async () => {
    // use react-hook-form for some errors, early return if any found
    if (competitors.length === 0 || (endDate && endDate < startDate)) {
      if (competitors.length === 0)
        setError("roster", {
          type: "custom",
          message: "No meet roster found in memory",
        });

      if (endDate < startDate) {
        setError("endDate", {
          type: "custom",
          message: "End date must be after start date",
        });
      }

      return;
    }

    // let's trim the fat a bit
    const meetSwimmers = competitors.map((swimmer) => {
      const { usmsId } = swimmer.member;
      const savedSwimmer = { ...swimmer };
      delete savedSwimmer._id; // saving in DB will generate a unique ID, no longer need this
      delete savedSwimmer.member;
      return {
        ...savedSwimmer,
        usmsId,
      };
    });

    // object to save in DB
    const meet = {
      meetName,
      course,
      startDate,
      endDate,
    };
    const relays = relayEventNumbers.map((relayNum) => {
      return { eventNum: relayNum };
    });
    // save in DB
    try {
      if (isEditing) {
        const changedMeet = { id: currentMeetId, meet, meetSwimmers, relays };
        console.log({ changedMeet });
        await editMeet({ variables: changedMeet });
      } else {
        const newMeet = { meet, meetSwimmers, relays };
        console.log(newMeet);
        await addMeet({ variables: newMeet });
      }
      // trigger Toast message of success
      setShowToast(true);
      setSaved(true);
      // update state variable from DB to include the new/updated meet
      refetch();
    } catch (error) {
      // use react-hook-form to display message
      setError("save", {
        type: "custom",
        message: `Error saving meet: ${error.message}`,
      });
    }
  };

  const resetForm = () => {
    clearErrors();
    setMeetName("");
    setCourse("");
    setStartDate("");
    setEndDate("");
    setCompetitors([]);
    setRelayEventNumbers([]);
    setSaved(false);
    setDeleted(false);
    setShowToast(false);
    setIsEditing(false);
    setCurrentMeetId("");
  };

  const loadMeet = (meet) => {
    setCourse(meet.course);
    setMeetName(meet.meetName);
    setStartDate(meet.startDate);
    if (meet.endDate) setEndDate(meet.endDate);
    // use the USMS ID to add the member info for each meet swimmer
    // note that if the meet was from a different registration year then there
    // could be problems (like not finding a match)
    const meetSwimmers = meet.meetSwimmers.map((swimmer) => {
      // match on USMS ID, only take first match ()
      let member;
      const results = members.filter(({ usmsId }) => usmsId === swimmer.usmsId);
      if (results.length > 0) member = results[0];
      else
        member = {
          usmsId: swimmer.usmsId,
          firstName: "",
          lastName: "",
          gender: "",
        };
      return { ...swimmer, member };
    });
    setCompetitors([...meetSwimmers]);
    setCurrentMeetId(meet._id);
    // toggle editing switch
    setIsEditing(true);
  };

  const handleDeleteMeet = async () => {
    // callback function to delete a meet
    try {
      await deleteMeet({ variables: { id: currentMeetId } });
      // refresh list of meets from DB
      refetch();
      // trigger a Toast Message
      setShowToast(true);
      setDeleted(true);
    } catch (error) {
      console.log(error);
      // display error to user
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {/* Upload meet roster from CSV file */}
      <MeetUpload
        clearErrors={clearErrors}
        setError={setError}
        errors={errors}
        members={members}
        setRelayEventNumbers={setRelayEventNumbers}
        setCompetitors={setCompetitors}
      />

      {/* 
       Display previously saved meets (retrieved from DB) as buttons that can be clicked to show their info
       */}
      <SavedMeets allMeets={allMeets} loadMeet={loadMeet} />

      {/* 
        Display meet information and roster, allowing user to modify aspects of them (and save changes).
       */}
      <MeetInfo
        competitors={competitors}
        setCompetitors={setCompetitors}
        course={course}
        setCourse={setCourse}
        errors={errors}
        clearErrors={clearErrors}
        meetName={meetName}
        setMeetName={setMeetName}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      {errors.roster && (
        <ErrorMessage style={{ gridArea: "message", justifySelf: "center" }}>
          {errors.roster.message}
        </ErrorMessage>
      )}
      {errors.save && (
        <ErrorMessage style={{ gridArea: "message", justifySelf: "center" }}>
          {errors.save.message}
        </ErrorMessage>
      )}

      {/*
        Displayed buttons allow CRUD operations for the Meets database
      */}
      <MeetButtons
        isEditing={isEditing}
        handleDeleteMeet={handleDeleteMeet}
        resetForm={resetForm}
      />

      {showToast && (
        <ToastMessage
          toastCloseEffect={() => {
            resetForm();
            // unfortunately stale data in "Saved Meets" necessitates switching tabs
            setTab("user");
          }}
          duration={2000}
        >
          {saved && "Meet has been saved!"}
          {deleted && "Meet has been deleted!"}
        </ToastMessage>
      )}
    </Form>
  );
}

const Form = styled.form`
  padding: 16px 8px;
  display: grid;
  grid-template-columns: 5fr 4fr;
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

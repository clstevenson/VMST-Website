import { useState } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@apollo/client";
import dayjs from "dayjs";

import { QUERY_VMST, QUERY_MEETS } from "../../utils/queries";
import { ADD_MEET, DELETE_MEET } from "../../utils/mutations";
import { FieldSet } from "../Styled/FieldSet";
import { COLORS, QUERIES } from "../../utils/constants";
import ErrorMessage from "../../components/Styled/ErrorMessage";
import SubmitButton from "../Styled/SubmiButton";
import MinorButton from "../Styled/MinorButton";
import MeetUpload from "./MeetUpload";
import MeetInfo from "./MeetInfo";
import ToastMessage from "../ToastMessage";
import Alert from "../Alert";

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
  // state controlling the Alert dialog box
  const [alertOpen, setAlertOpen] = useState(false);

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
      setAllMeets([...data.meets]);
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
    const newMeet = { meet, meetSwimmers, relays };
    try {
      await addMeet({ variables: newMeet });
      // trigger Toast message of success
      setShowToast(true);
      setSaved(true);
      // update state variable from DB to include this meet
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
      {/* upload meet roster from CSV file */}
      <MeetUpload
        clearErrors={clearErrors}
        setError={setError}
        errors={errors}
        members={members}
        setRelayEventNumbers={setRelayEventNumbers}
        setCompetitors={setCompetitors}
        uploadCloseEffect={() => {
          setCourse("");
          setMeetName("");
          setStartDate("");
          setEndDate("");
        }}
      />

      <MeetSaved>
        <legend>Saved Meets</legend>
        {allMeets.length === 0 ? (
          <p>No meets in database</p>
        ) : (
          <>
            <p>
              Saved meets with start dates are shown below. Click the meet to
              load its information (with option to edit or delete).
            </p>

            <MeetGrid>
              {allMeets.map((meet) => {
                return (
                  <MinorButton
                    onClick={() => loadMeet(meet)}
                    type="button"
                    key={meet._id}
                  >
                    <p>{meet.meetName}</p>
                    <p>{dayjs(meet.startDate).format("M/D/YY")} </p>
                  </MinorButton>
                );
              })}
            </MeetGrid>
          </>
        )}
      </MeetSaved>

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
      <SubmitButtonWrapper>
        <SubmitButton>{isEditing ? "Save Changes" : "Save Meet"}</SubmitButton>
        <Button type="button" onClick={resetForm}>
          Reset Form
        </Button>
        {isEditing && (
          <Alert
            title="Delete Meet"
            description="Are you sure? This action cannot be undone."
            confirmAction={() => {
              setAlertOpen(false);
              handleDeleteMeet();
            }}
            cancelAction={() => setAlertOpen(false)}
            actionText="Delete"
            onOpenChange={setAlertOpen}
            open={alertOpen}
          >
            <DeleteButton type="button">Delete Meet</DeleteButton>
          </Alert>
        )}
      </SubmitButtonWrapper>
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

const SubmitButtonWrapper = styled.div`
  grid-area: button;
  display: flex;
  gap: 16px;
  justify-content: center;

  & button {
    max-width: 200px;
    flex: 1;
  }
`;

const Button = styled(MinorButton)`
  padding: 4px 24px;
`;

const DeleteButton = styled(SubmitButton)`
  background-color: ${COLORS.urgent_light};
  color: ${COLORS.urgent_text};
  border-color: ${COLORS.urgent};

  &:hover:not(:disabled),
  &:active:not(:disabled),
  &:focus:not(:disabled) {
    background-color: ${COLORS.urgent};
  }
`;

const MeetSaved = styled(FieldSet)`
  grid-area: saved;

  & p {
    margin: 4px 0;
  }
`;

const MeetGrid = styled.div`
  display: grid;
  gap: 4px;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));

  & ${MinorButton} {
    width: auto;
    position: relative;
  }
`;

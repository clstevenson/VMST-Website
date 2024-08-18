import { useState } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@apollo/client";

import { QUERY_VMST } from "../../utils/queries";
import { FieldSet } from "../Styled/FieldSet";
import { QUERIES } from "../../utils/constants";
import ErrorMessage from "../../components/Styled/ErrorMessage";
import SubmitButton from "../Styled/SubmiButton";
import MinorButton from "../Styled/MinorButton";
import MeetUpload from "./MeetUpload";
import MeetInfo from "./MeetInfo";

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
      {/* upload meet roster from CSV file */}
      <MeetUpload
        clearErrors={clearErrors}
        setError={setError}
        errors={errors}
        members={members}
        setRelayEventNumbers={setRelayEventNumbers}
        setCompetitors={setCompetitors}
      />

      <MeetSaved>
        <legend>Saved Meets</legend>
        <ul>
          <li>list of meets (title and date)</li>
          <li>each meet has a button to delete</li>
          <li>each meet has a button to display its data</li>
        </ul>
      </MeetSaved>

      <MeetInfo
        competitors={competitors}
        setCompetitors={setCompetitors}
        register={register}
        errors={errors}
        clearErrors={clearErrors}
        course={course}
        setCourse={setCourse}
      />

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

const MeetSaved = styled(FieldSet)`
  grid-area: saved;
`;

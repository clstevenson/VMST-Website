/* eslint-disable react/prop-types */
/* 
 Display the main buttons for the Meet form, enabling the user to save a new meet, delete an existing meet, or make changes to a meet
 */

import styled from "styled-components";
import { useState } from "react";
import { COLORS } from "../../utils/constants";
import SubmitButton from "../Styled/SubmiButton";
import MinorButton from "../Styled/MinorButton";
import Alert from "../Alert";

export function MeetButtons({ isEditing, handleDeleteMeet, resetForm }) {
  // state controlling the Alert dialog box
  const [alertOpen, setAlertOpen] = useState(false);

  return (
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
  );
}

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

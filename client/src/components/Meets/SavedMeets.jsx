/* eslint-disable react/prop-types */
/* 
 Display previously saved meets as buttons that can be clicked to display their information. From that point the meet info can be edited.
 */

import styled from "styled-components";
import dayjs from "dayjs";
import MinorButton from "../Styled/MinorButton";
import { FieldSet } from "../Styled/FieldSet";

export function SavedMeets({ allMeets, loadMeet }) {
  return (
    <MeetSaved>
      <legend>Saved Meets</legend>
      {allMeets.length === 0 ? (
        <p>No meets in database</p>
      ) : (
        <>
          <p>
            Saved meets with start dates are shown below. Click the meet to load
            its information (with option to edit or delete).
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
  );
}

const MeetSaved = styled(FieldSet)`
  grid-area: saved;

  & p {
    margin: 4px 0;
  }
`;

const MeetGrid = styled.div`
  display: grid;
  gap: 4px;
  grid-template-columns: repeat(auto-fit, minmax(125px, 1fr));

  & ${MinorButton} {
    width: auto;
    position: relative;
  }
`;

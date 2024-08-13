import styled from "styled-components";
import { Description } from "../Styled/Description";
import { COLORS } from "../../utils/constants";

export default function RecipientsDisplay({ recipients }) {
  return (
    <Wrapper>
      <NumRecipients color={recipients.length}>
        Recipients: {recipients.length} selected{" "}
        {recipients.length === 0 && "(at least 1 is needed)"}
      </NumRecipients>
      {recipients.length > 100 && (
        <Description style={{ fontSize: "0.9rem", color: `${COLORS.urgent}` }}>
          Sending limits: 100 recipients/email, 500 recipients in a 24h period.
          It is best not to approach these limits.
        </Description>
      )}
      {/* <MinorButton type="button" onClick={() => setRecipients([])}>
              Clear Recipients List
            </MinorButton> */}
      {/* Display recipients */}
      <p key="recipients" style={{ minHeight: "2pc" }}>
        {recipients
          .map((member) => {
            return `${member.firstName} ${member.lastName}`;
          })
          .join(", ")}
      </p>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NumRecipients = styled.p`
  color: ${({ color }) => {
    if (color === 0 || color > 100) return `${COLORS.urgent}`;
  }};
`;

import styled from "styled-components";
import { COLORS } from "../../utils/constants";

const MinorButton = styled.button`
  width: fit-content;
  background-color: var(--change-background-color);
  border-radius: 4px;
  border: 1px solid ${COLORS.accent[11]};
  padding: 2px 6px;

  &:hover:not(:disabled) {
    background-color: ${COLORS.accent[4]};
    transform: scale(1.05);
  }

  &:disabled {
    background-color: ${COLORS.gray[9]};
    color: white;
  }
`;

export default MinorButton;

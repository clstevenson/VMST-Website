import styled from "styled-components";
import { COLORS } from "../../utils/constants";

const MinorButton = styled.button`
  width: fit-content;
  background-color: var(--change-background-color);
  border-radius: 4px;
  border: 1px solid ${COLORS.accent[11]};
  padding: 2px 6px;
  box-shadow: 2px 4px 6px ${COLORS.gray[10]};

  &:hover:not(:disabled),
  &:focus:not(:disabled) {
    background-color: ${COLORS.accent[5]};
    border-color: ${COLORS.accent[8]};
    cursor: pointer;
  }

  &:active:not(:disabled) {
    box-shadow: 1px 2px 2px ${COLORS.gray[10]};
    transform: translateY(1px);
  }

  &:disabled {
    background-color: ${COLORS.gray[9]};
    color: white;
  }
`;

export default MinorButton;

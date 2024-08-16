// A styled component
// TODO: Add animation to achieve 3-d effect

import styled from "styled-components";
import { COLORS, WEIGHTS, QUERIES } from "../../utils/constants";

const SubmitButton = styled.button`
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  padding: 4px 24px;
  font: inherit;
  font-weight: ${WEIGHTS.medium};
  background-color: ${COLORS.accent[10]};
  border: 1px solid ${COLORS.accent[9]};
  border-radius: 4px;
  outline-offset: 0;
  color: white;
  box-shadow: 2px 4px 6px ${COLORS.gray[10]};
  min-height: 44px;
  min-width: 44px;

  @media ${QUERIES.tabletAndLess} {
    padding: 4px 16px;
  }

  &:hover:not(:disabled),
  &:focus:not(:disabled) {
    background-color: ${COLORS.accent[11]};
    cursor: pointer;
  }

  &:active:not(:disabled) {
    background-color: ${COLORS.accent[10]};
    box-shadow: 1px 2px 2px ${COLORS.gray[10]};
    transform: translateY(2px);
  }

  &:disabled {
    background-color: ${COLORS.gray[9]};
    border-color: ${COLORS.gray[11]};
  }
`;

export default SubmitButton;

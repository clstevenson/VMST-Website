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
  /* Make the button easy for touchscreen users to tap */
  min-height: 44px;
  min-width: 44px;

  @media ${QUERIES.tabletAndLess} {
    padding: 4px 16px;
  }

  &:hover,
  &:focus {
    background-color: ${COLORS.accent[11]};
    transform: scale(1.05);
  }
`;

export default SubmitButton;

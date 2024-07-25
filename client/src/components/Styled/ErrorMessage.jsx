// A styled component used in most forms

import styled from "styled-components";
import { COLORS } from "../../utils/constants";

const ErrorMessage = styled.p`
  color: ${COLORS.urgent_text};
  font-size: 0.9em;
  font-style: italic;
`;

export default ErrorMessage;

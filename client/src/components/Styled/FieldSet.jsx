/* 
 Styled fieldset element
 */

import styled from "styled-components";
import { COLORS } from "../../utils/constants";

export const FieldSet = styled.fieldset`
  padding: 8px;
  border-radius: 4px;
  border: 1px dotted ${COLORS.gray[9]};

  & legend {
    border-radius: 4px;
    display: inline-block;
    background-color: ${COLORS.accent[12]};
    color: ${COLORS.accent[2]};
    padding: 3px 6px;
    width: max-content;
  }

  & input[type="text"] {
    background-color: var(--change-background-color);
    padding: 0 4px;
    border: none;
    width: 100%;
  }

  & input[type="text"]:hover {
    background-color: ${COLORS.accent[4]};
    outline: auto;
  }
`;

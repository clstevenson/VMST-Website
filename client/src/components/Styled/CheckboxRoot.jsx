/* 
 Styling for Checkbox.Root from Radix
 */

import styled from "styled-components";
import * as Checkbox from "@radix-ui/react-checkbox";
import { COLORS } from "../../utils/constants";

export const CheckboxRoot = styled(Checkbox.Root)`
  all: "unset";
  background-color: transparent;
  border: 1px solid ${COLORS.gray[11]};
  width: 25px;
  height: 25px;
  border-radius: 4px;
  box-shadow: 1px 2px 4px ${COLORS.gray[8]};

  &[data-disabled] {
    border: 1px solid ${COLORS.gray[8]};
  }
`;

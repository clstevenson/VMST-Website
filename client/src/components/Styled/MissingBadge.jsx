// Flags a falsy required field directly in a preview table cell (eg a CSV
// column that was blank or missing), so the problem is visible before the
// leader/coordinator even attempts to save.
// Usage: {row.field || <MissingBadge>missing</MissingBadge>}

import styled from "styled-components";
import { COLORS } from "../../utils/constants";

const MissingBadge = styled.span`
  color: ${COLORS.urgent_text};
  background-color: ${COLORS.urgent_light};
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 0.85em;
`;

export default MissingBadge;

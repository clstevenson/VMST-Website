/* 
 Default stylings for tables
 */

import styled from "styled-components";
import { COLORS, QUERIES } from "../../utils/constants";

const Table = styled.table`
  margin: 6px auto;
  table-layout: fixed;
  border-collapse: collapse;

  // default is left-aligned
  & * {
    text-align: left;
  }

  & thead {
    border-top: 2px solid ${COLORS.accent[12]};
    border-bottom: 2px solid ${COLORS.accent[12]};
    background-color: ${COLORS.accent[4]};
  }

  & th,
  & td {
    padding: 4px 8px;

    @media ${QUERIES.mobile} {
      padding: 4px 6px;
    }
  }

  // zebra-stripes
  & tbody tr:nth-child(even) {
    background-color: ${COLORS.accent[3]};
  }

  & tbody {
    border-bottom: 2px solid ${COLORS.accent[12]};
  }
`;

export default Table;

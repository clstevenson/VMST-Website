/* eslint-disable react/prop-types */
/* 
 Displays a roster of swimmers that are signed up for a specific meet.
 TODO: This table causes responsiveness headaches on phones and small tablets.
 Need to figure out a way to gracefully display this info on small screens,
 maybe by having two rows per swimmer (one for roster upload one for USMS match)
 */

import styled from "styled-components";
import * as Separator from "@radix-ui/react-separator";
import { Check } from "react-feather";

import { COLORS, WEIGHTS } from "../../utils/constants";
import Table from "../Styled/Table";
import { CheckboxRoot, CheckboxIndicator } from "../Styled/Checkbox";

export default function RosterTable({ competitors, setCompetitors }) {
  return (
    <Wrapper>
      <p>
        In order to email the competitors, we must match them with their USMS
        registration. Please review the matches in the table below for accuracy;
        clicking the USMS ID to view the member&apos;s public profile can help.
        If there is a descrepancy, uncheck the box (so the person is not
        included in emails) and{" "}
        <a href="mailto:VAmembership@usms.org">
          contact the membership coordinator
        </a>
        . Note that the results page on the public profile can also be useful in
        constructing relays.
      </p>
      <SwimmerTable>
        <thead>
          <tr>
            <th colSpan="4" scope="col" style={{ textAlign: "center" }}>
              Roster
            </th>
            <th colSpan="3" scope="col" style={{ textAlign: "center" }}>
              USMS match
            </th>
          </tr>
          <tr>
            <th colSpan="4" style={{ padding: "0" }}>
              <SeparatorRoot decorative />
            </th>
            <th colSpan="3" style={{ padding: "0" }}>
              <SeparatorRoot decorative />
            </th>
          </tr>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Gender</th>
            <th scope="col">Age</th>
            <th scope="col">Relays</th>
            <th scope="col">Name</th>
            <th scope="col">USMS ID</th>
            <th scope="col">Include</th>
          </tr>
        </thead>
        <tbody>
          {competitors.map((swimmer, index) => {
            return (
              <tr key={swimmer._id}>
                {/* Roster upload data */}
                <th scope="row">
                  {swimmer.firstName} {swimmer.lastName}
                </th>
                <td style={{ textAlign: "center" }}>{swimmer.gender}</td>
                <td style={{ textAlign: "center" }}>{swimmer.meetAge}</td>
                <td>{swimmer.relays.map((eventNum) => eventNum).join(", ")}</td>
                {/* USMS match placeholders */}
                <td>
                  {swimmer.member.firstName} {swimmer.member.lastName}
                </td>
                <td>
                  <a
                    href={`https://www.usms.org/people/${swimmer.member.usmsId}`}
                    target="_new"
                  >
                    {swimmer.member.usmsId}
                  </a>
                </td>
                <td style={{ textAlign: "center" }}>
                  <Checkbox
                    checked={swimmer.member.include}
                    onCheckedChange={(checked) => {
                      // toggle the "member.include" property for this swimmer
                      const allCompetitors = competitors;
                      allCompetitors[index].member.include = checked;
                      setCompetitors([...allCompetitors]);
                    }}
                  >
                    <CheckboxIndicator>
                      <Check strokeWidth={3} />
                    </CheckboxIndicator>
                  </Checkbox>
                </td>
              </tr>
            );
          })}
        </tbody>
      </SwimmerTable>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin: 12px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  & p {
    margin: 12px 0;
    max-width: var(--max-prose-width);
  }
`;

const Checkbox = styled(CheckboxRoot)`
  width: 28px;
  height: 28px;
`;

const SeparatorRoot = styled(Separator.Root)`
  height: 1px;
  width: 95%;
  background-color: ${COLORS.gray[9]};
  margin: 0 auto;
`;

const SwimmerTable = styled(Table)`
  /* button to change USMS match */
  & button {
    background-color: var(--change-background-color);
    border: 1px solid ${COLORS.accent[12]};
    border-radius: 6px;
    box-shadow: 1px 2px 2px ${COLORS.gray[9]};
    padding: 2px 6px;
    line-height: 1;
  }
  & button:hover {
    background-color: ${COLORS.accent[5]};
  }

  & button:active {
    box-shadow: none;
  }

  & th[scope="row"] {
    font-weight: ${WEIGHTS.normal};
  }
`;

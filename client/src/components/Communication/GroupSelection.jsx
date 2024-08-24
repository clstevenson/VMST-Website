/* eslint-disable react/prop-types */
/* 
 Accordian items allowing user to select entire groups, such as workout groups, competitors, and (eventually) saved groups. Also displays the names of the swimmers who have opted out of receiving team emails (so users know who will not receive the message).
 */

import styled from "styled-components";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as Accordian from "@radix-ui/react-accordion";
import { Check } from "react-feather";
import dayjs from "dayjs";

import AccordianItem from "../AccordianItem";
import { Description } from "../Styled/Description";
import { CheckboxRoot, CheckboxIndicator } from "../Styled/Checkbox";
import { COLORS } from "../../utils/constants";

export default function GroupSelection({
  recipients,
  setRecipients,
  userProfile,
  groups,
  swimmers,
  optOut,
  meets,
}) {
  return (
    <Accordian.Root type="multiple">
      {/* Select entire workout groups */}
      <AccordianItem title="Email Entire Workout Groups" titlePadding="24px">
        <GroupWrapper>
          {groups.map((group) => {
            return (
              <CheckboxWrapper key={group.name}>
                <CheckboxRoot
                  id={group.name}
                  name={group.name}
                  disabled={
                    userProfile.role !== "leader" &&
                    userProfile.group !== group.name
                  }
                  onCheckedChange={(checked) => {
                    // get current recipients
                    const currentRecipients = recipients;
                    if (checked) {
                      // add group members who have not opted out of emails
                      const groupMembers = swimmers.filter(
                        (swimmer) =>
                          swimmer.workoutGroup === group.name &&
                          !swimmer.emailExclude
                      );
                      // add group to the rec
                      const newRecipients = [
                        ...currentRecipients,
                        ...groupMembers,
                      ];
                      // upudate state
                      setRecipients([...newRecipients]);
                    } else if (!checked) {
                      // remove group members from current list
                      const newRecipients = currentRecipients.filter(
                        ({ workoutGroup }) => workoutGroup !== group.name
                      );
                      setRecipients([...newRecipients]);
                    }
                  }}
                >
                  <CheckboxIndicator>
                    <Check />
                  </CheckboxIndicator>
                </CheckboxRoot>
                <GroupLabel
                  htmlFor={group.name}
                  style={{
                    "--groupColor":
                      userProfile.role === "leader" ||
                      userProfile.group === group.name
                        ? "black"
                        : `${COLORS.gray[8]}`,
                  }}
                >
                  {group.name} ({group.count})
                </GroupLabel>
              </CheckboxWrapper>
            );
          })}
        </GroupWrapper>
      </AccordianItem>
      {/*
        Communicate with competitors in meets: list all meets in DB and allow user to check or uncheck them to email the competitors. Coaches can only add swimmers in their group.
      */}
      <AccordianItem title="Email Swimmers in Meets" titlePadding="24px">
        <MeetWrapper>
          {meets.map((meet) => {
            return (
              <CheckboxWrapper key={meet._id}>
                <CheckboxRoot
                  id={meet._id}
                  name={meet._id}
                  onCheckedChange={(checked) => {
                    // get current recipients
                    const currentRecipients = recipients;
                    if (checked) {
                      const competitors = meet.meetSwimmers
                        // only competitors whose matches are positive
                        .filter(({ includeEmail }) => includeEmail)
                        .map(({ usmsId }) => {
                          // return membership object matched on USMS ID
                          const member = swimmers.filter(
                            (member) => member.usmsId === usmsId
                          );
                          if (member) return member[0];
                        })
                        // omit opt-outs
                        .filter((member) => {
                          if (member) return !member.emailExclude;
                        });
                      // then create a new recipients variable that combines current and the meet swimmers
                      setRecipients([...currentRecipients, ...competitors]);
                    } else if (!checked) {
                      // create function that returns true if the input USMS ID belongs to
                      // one of the competitors
                      const isCompetitor = (usmsId) => {
                        return meet.meetSwimmers.some(
                          (competitor) => competitor.usmsId === usmsId
                        );
                      };
                      // only return recipients who are NOT competitors
                      // (ie remove competitors from current recipients list)
                      const newRecipients = currentRecipients.filter(
                        (recipient) => !isCompetitor(recipient.usmsId)
                      );
                      // update the recipients
                      setRecipients([...newRecipients]);
                    }
                  }}
                >
                  <Checkbox.Indicator>
                    <Check />
                  </Checkbox.Indicator>
                </CheckboxRoot>
                <label htmlFor={meet._id}>
                  {meet.meetName}&mdash;{dayjs(meet.startDate).format("M/D/YY")}{" "}
                  ({meet.meetSwimmers.length})
                </label>
              </CheckboxWrapper>
            );
          })}
          {userProfile.role === "coach" && (
            <Description>
              Note: only competitors from {userProfile.group} are added when a
              meet is selected.
            </Description>
          )}
        </MeetWrapper>
      </AccordianItem>
      {/* List the folks who won't receive emails */}
      <AccordianItem title="Swimmers Who Have Opted Out" titlePadding="24px">
        <Description style={{ marginBottom: "6px" }}>
          The following VMST members will NOT receive messages sent from here:
        </Description>
        {optOut.map((member) => {
          return (
            <p
              key={member._id}
              style={{ fontSize: "0.8rem", fontStyle: "italic" }}
            >
              {member.firstName} {member.lastName}{" "}
              {member.workoutGroup && `(${member.workoutGroup})`}
            </p>
          );
        })}
      </AccordianItem>
    </Accordian.Root>
  );
}

const CheckboxWrapper = styled.div`
  all: "unset";
  display: flex;
  gap: 8px;
`;

const GroupLabel = styled.label`
  color: var(--groupColor);
`;

const GroupWrapper = styled.div`
  display: grid;
  /* grid-template-columns: 1fr 1fr; */
  grid-template-columns: repeat(2, minmax(130px, 1fr));
  gap: 4px;
`;

const MeetWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

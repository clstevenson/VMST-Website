/* eslint-disable react/prop-types */
/* 
 Accordian items allowing user to select entire groups, such as workout groups, competitors, and (eventually) saved groups. Also displays the names of the swimmers who have opted out of receiving team emails (so users know who will not receive the message).
 */

import { useRef } from "react";
import styled from "styled-components";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as Accordian from "@radix-ui/react-accordion";
import { useLazyQuery } from "@apollo/client";
import { Check } from "react-feather";
import dayjs from "dayjs";

import AccordianItem, { accordianItemValue } from "../AccordianItem";
import { Description } from "../Styled/Description";
import { CheckboxRoot, CheckboxIndicator } from "../Styled/Checkbox";
import { COLORS } from "../../utils/constants";
import { QUERY_VMST_EMAIL_STATUS } from "../../utils/queries";

// single source of truth for this accordion's title -- used both as the
// AccordianItem's title prop and (via accordianItemValue) to recognize its
// open/close state, so the two can never drift out of sync
const NO_VALID_EMAIL_TITLE = "Swimmers Not Reachable";
const NO_VALID_EMAIL_ITEM = accordianItemValue(NO_VALID_EMAIL_TITLE);

export default function GroupSelection({
  recipients,
  setRecipients,
  userProfile,
  groups,
  swimmers,
  optOut,
  meets,
  meetMembers,
  setAnySelected,
}) {
  // fetched fresh (network-only) every time the "Swimmers Who Cannot Be
  // Emailed" accordion is opened, rather than once on page load, so it
  // reflects the current member list
  const [fetchEmailStatus, { data: emailStatusData }] = useLazyQuery(
    QUERY_VMST_EMAIL_STATUS,
    { fetchPolicy: "network-only" },
  );
  // Radix fires onValueChange with the whole open-item set on every
  // accordion change, not just for the item that changed -- track the
  // previous set so we only fetch on the closed-to-open transition, not
  // every time some other section is toggled while this one stays open
  const previousOpenRef = useRef([]);

  // members with no usable email address at all -- every address is either
  // malformed or marked undeliverable, or they have none on file. Scoped to
  // vmstMembers (current VMST roster), so anyone who's left the LMSC or
  // switched to another club is already excluded by that query, not by this
  // check -- deliberately not trying to catch that separate case here.
  let noValidEmail = [];
  if (emailStatusData) {
    noValidEmail = emailStatusData.vmstMembers.filter(
      (member) =>
        member.emails.length === 0 ||
        member.emails.every(
          (email) => !email.formatValid || !email.deliverable,
        ),
    );
    if (userProfile.role === "coach") {
      noValidEmail = noValidEmail.filter(
        (member) => member.workoutGroup === userProfile.group,
      );
    }
  }

  return (
    <Accordian.Root
      type="multiple"
      onValueChange={(openValues) => {
        const wasOpen = previousOpenRef.current.includes(NO_VALID_EMAIL_ITEM);
        const isOpen = openValues.includes(NO_VALID_EMAIL_ITEM);
        if (isOpen && !wasOpen) fetchEmailStatus();
        previousOpenRef.current = openValues;
      }}
    >
      {/* Select entire workout groups */}
      <AccordianItem title="Email Workout Groups" titlePadding="24px">
        <GroupWrapper>
          {groups.map((group) => {
            // group is "checked" only if all of its (email-eligible) members
            // are currently in the recipients list
            const groupMembers = swimmers.filter(
              (swimmer) =>
                swimmer.workoutGroup === group.name && !swimmer.emailExclude,
            );
            const checked =
              groupMembers.length > 0 &&
              groupMembers.every((member) =>
                recipients.some((recipient) => recipient._id === member._id),
              );
            return (
              <CheckboxWrapper key={group.name}>
                <CheckboxRoot
                  id={group.name}
                  name={group.name}
                  checked={checked}
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
                          !swimmer.emailExclude,
                      );
                      // add group to the rec
                      const newRecipients = [
                        ...currentRecipients,
                        ...groupMembers,
                      ];
                      // upudate state
                      setRecipients([...newRecipients]);
                      setAnySelected(true);
                    } else if (!checked) {
                      // remove group members from current list
                      const newRecipients = currentRecipients.filter(
                        ({ workoutGroup }) => workoutGroup !== group.name,
                      );
                      setRecipients([...newRecipients]);
                      // toggle Select All/None as appropriate
                      if (newRecipients.length > 0) {
                        setAnySelected(true);
                      } else {
                        setAnySelected(false);
                      }
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
            // meet is "checked" only if all of its (email-eligible) matched
            // competitors are currently in the recipients list. Matched
            // against meetMembers (looked up by USMS ID, any club)
            // someone who has since switched clubs is still found.
            const eligibleCompetitors = meet.meetSwimmers
              .filter(({ includeEmail }) => includeEmail)
              .map(({ usmsId }) =>
                meetMembers.find((member) => member.usmsId === usmsId),
              )
              .filter((member) => member && !member.emailExclude);
            const checked =
              eligibleCompetitors.length > 0 &&
              eligibleCompetitors.every((member) =>
                recipients.some((recipient) => recipient._id === member._id),
              );
            return (
              <CheckboxWrapper key={meet._id}>
                <CheckboxRoot
                  id={meet._id}
                  name={meet._id}
                  checked={checked}
                  onCheckedChange={(checked) => {
                    // get current recipients
                    const currentRecipients = recipients;
                    if (checked) {
                      const competitors = meet.meetSwimmers
                        // only competitors whose matches are positive
                        .filter(({ includeEmail }) => includeEmail)
                        .map(({ usmsId }) => {
                          // return membership object matched on USMS ID
                          // (any club -- see meetMembers comment above)
                          const member = meetMembers.filter(
                            (member) => member.usmsId === usmsId,
                          );
                          if (member) return member[0];
                        })
                        // omit opt-outs
                        .filter((member) => {
                          if (member) return !member.emailExclude;
                        });
                      // then create a new recipients variable that combines current and the meet swimmers
                      setRecipients([...currentRecipients, ...competitors]);
                      setAnySelected(true);
                    } else if (!checked) {
                      // create function that returns true if the input USMS ID belongs to
                      // one of the competitors
                      const isCompetitor = (usmsId) => {
                        return meet.meetSwimmers.some(
                          (competitor) => competitor.usmsId === usmsId,
                        );
                      };
                      // only return recipients who are NOT competitors
                      // (ie remove competitors from current recipients list)
                      const newRecipients = currentRecipients.filter(
                        (recipient) => !isCompetitor(recipient.usmsId),
                      );
                      // update the recipients
                      setRecipients([...newRecipients]);
                      // toggle Select All/None as appropriate
                      if (newRecipients.length > 0) {
                        setAnySelected(true);
                      } else {
                        setAnySelected(false);
                      }
                    }
                  }}
                >
                  <Checkbox.Indicator>
                    <Check />
                  </Checkbox.Indicator>
                </CheckboxRoot>
                <label htmlFor={meet._id}>
                  {meet.meetName}&mdash;
                  {dayjs(meet.startDate).format("M/D/YY")} (
                  {meet.meetSwimmers.length})
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
      {/* List members with no usable email address on file */}
      <AccordianItem title={NO_VALID_EMAIL_TITLE} titlePadding="24px">
        <Description style={{ marginBottom: "6px" }}>
          The following swimmers cannot receive messages because they have no
          usable email address, either because of an invalid format or because
          it has been marked undeliverable:
        </Description>
        {noValidEmail.map((member) => (
          <p
            key={member.usmsId}
            style={{ fontSize: "0.8rem", fontStyle: "italic" }}
          >
            {member.firstName} {member.lastName}{" "}
            {member.workoutGroup && `(${member.workoutGroup})`}
          </p>
        ))}
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

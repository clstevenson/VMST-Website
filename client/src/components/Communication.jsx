/* 
 Component for the "Communication" tab for Leaders and Coaches
 A form that allows the user to compose emails (in a rich text editor) for members of VMST subgroups.

 - coaches can email members of their WO group
 - leaders can email any VMST member (up to gmail limit)

 The main part of the content will contain the message composing editor (using Quill).  Recipients (and their count) will be listed on the form. There will also be (in the sidebar) a text input that can be used to search/filter/select recipients. This sidebar will be hidden for smaller screens but can slide out when clicked.
 */

import styled from "styled-components";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { useForm } from "react-hook-form";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check, ChevronDown, ChevronRight } from "react-feather";
import * as Accordian from "@radix-ui/react-accordion";
import AccordianItem from "../components/AccordianItem";

// TODO: Need query for VMST members only, maybe "QUERY_CLUB" with
// an argument of "VMST"
import { QUERY_VMST } from "../utils/queries";
import { EMAIL_GROUP } from "../utils/mutations";
import { COLORS, QUERIES, WEIGHTS } from "../utils/constants";
import SubmitButton from "../components/Styled/SubmiButton";
import ErrorMessage from "../components/Styled/ErrorMessage";
import ToastMessage from "../components/ToastMessage";
import Spinner from "../components/Spinner";
import { useState } from "react";

// from the list of (VMST) members return the list of distinct WO groups
// (using this utility means avoiding a DB query)
import getGroups from "../utils/getGroups";

export default function Communication() {
  // list of people receiving emails (array of member objects)
  const [recipients, setRecipients] = useState([]);
  // list of all VMST swimmers (array of member objects)
  const [swimmers, setSwimmers] = useState([]);
  // list of unique VMST workout groups
  const [groups, setGroups] = useState([]);
  // list of members who have opted out of emails (array of member objects)
  const [optOut, setOptOut] = useState([]);
  // HTML-formatted content of Quill editory
  const [emailContent, setEmailContent] = useState("");
  // (error) message to display under the editor
  const [message, setMessage] = useState("");

  useQuery(QUERY_VMST, {
    onCompleted: (data) => {
      const members = data.vmstMembers;
      setSwimmers([...members]);
      // retrieve wo group names and tallies
      const woGroups = getGroups(data.vmstMembers);
      setGroups([...woGroups]);
      // determine which members have opted out of emails
      const excluded = members.filter((member) => member.emailExclude);
      setOptOut([...excluded]);
    },
  });

  // Quill text editor options/modules (note: no images allowed in emails)
  const modules = {
    toolbar: [
      ["bold", "italic", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      [{ header: 1 }, { header: 2 }],
      [{ header: [1, 2, 3, 4, false] }],
      ["link"],
    ],
  };

  return (
    <Form>
      <Wrapper>
        <MessageWrapper>
          <Title>Email VMST Members</Title>
          <RecipientsDisplayWrapper>
            <NumRecipients color={recipients.length}>
              Recipients: {recipients.length} selected
            </NumRecipients>
            {recipients.length > 100 && (
              <Description style={{ fontSize: "0.9rem" }}>
                Sending limits: 100 recipients/email, 500 recipients in a 24h
                period. It is best not to approach these limits.
              </Description>
            )}
            <p>
              {recipients
                .map(({ firstName, lastName }) => {
                  return `${firstName} ${lastName}`;
                })
                .join(", ")}
            </p>
          </RecipientsDisplayWrapper>

          <SubjectWrapper>
            <label htmlFor="subject">Subject: </label>
            <input type="text" id="subject" />
          </SubjectWrapper>
          <QuillWrapper>
            <label htmlFor="email">Content</label>
            <ReactQuill
              id="email"
              theme="snow"
              placeholder="Enter email message here"
              modules={modules}
              value={emailContent}
              onChange={setEmailContent}
            />
          </QuillWrapper>
          {/* error message to display */}
          {message && <ErrorMessage>{message}</ErrorMessage>}
        </MessageWrapper>
        <RecipientSelectionWrapper>
          <Title>Select recipients</Title>
          <h4>By workout group</h4>
          <GroupWrapper>
            {groups.map((group) => {
              return (
                <CheckboxWrapper key={group.name} id={group.name}>
                  <CheckboxRoot
                    onCheckedChange={(checked) => {
                      const currentRecipients = recipients;
                      if (checked) {
                        // add group members who have not opted out of emails
                        const groupMembers = swimmers.filter(
                          (swimmer) =>
                            swimmer.workoutGroup === group.name &&
                            !swimmer.emailExclude
                        );
                        const newRecipients = [
                          ...currentRecipients,
                          ...groupMembers,
                        ];
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
                    <Checkbox.Indicator>
                      <Check />
                    </Checkbox.Indicator>
                  </CheckboxRoot>
                  <label htmlFor={group.name}>
                    {group.name} ({group.count})
                  </label>
                </CheckboxWrapper>
              );
            })}
          </GroupWrapper>
          <Accordian.Root type="single" collapsible>
            <Accordian.Item value="opt-out">
              <Accordian.AccordionHeader asChild>
                <AccordianTrigger>
                  <p>
                    <TriggerWrapper>
                      <Chevron />
                    </TriggerWrapper>
                    Opted out of emails
                  </p>
                </AccordianTrigger>
              </Accordian.AccordionHeader>
              <Accordian.Content>
                <Description>
                  The following VMST members will NOT receive messages sent from
                  here:
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
              </Accordian.Content>
            </Accordian.Item>
          </Accordian.Root>
        </RecipientSelectionWrapper>
        <ButtonWrapper>
          <Button type="button">Cancel</Button>
          <SubmitButton
            type="submit"
            disabled={recipients.length === 0 || recipients.length > 100}
          >
            Submit
          </SubmitButton>
        </ButtonWrapper>
      </Wrapper>
    </Form>
  );
}

const Form = styled.form``;

const Wrapper = styled.div`
  display: grid;
  gap: 16px;
  justify-items: center;
  grid-template-columns: minmax(300px, 2fr) minmax(150px, 1fr);
  grid-template-areas:
    "message recipients"
    "button button";
`;

const MessageWrapper = styled.div`
  max-width: var(--max-prose-width);
  grid-area: message;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RecipientSelectionWrapper = styled.div`
  grid-area: recipients;
  width: 100%;
`;

const Title = styled.h2`
  font-size: var(--subheading-size);
  color: ${COLORS.accent[12]};
  margin: 16px 0;
  /* text-align: center; */
`;

// Used to style the contents of the Quill editor
const QuillWrapper = styled.div`
  padding: 0;

  & * {
    background-color: white;
  }

  & label {
    background-color: revert;
  }

  & p {
    font-size: 1.05rem;
  }
`;

const Description = styled.p`
  font-size: 0.8rem;
`;

const SubjectWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  & input {
    flex: 1;
    border: none;
    border-bottom: 1px solid ${COLORS.gray[9]};
  }
`;

const RecipientsDisplayWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NumRecipients = styled.p`
  color: ${({ color }) => {
    if (color === 0 || color > 100) return `${COLORS.urgent}`;
  }};
`;

const ButtonWrapper = styled.div`
  padding: 16px;
  grid-area: button;
  display: flex;
  gap: 24px;
`;

const Button = styled(SubmitButton)`
  background-color: ${COLORS.accent[3]};
  color: black;
`;

const CheckboxWrapper = styled.div`
  all: "unset";
  display: flex;
  gap: 8px;
`;

const CheckboxRoot = styled(Checkbox.Root)`
  all: "unset";
  background-color: transparent;
  border: 1px solid ${COLORS.gray[8]};
  width: 25px;
  height: 25px;
  border-radius: 4px;
  box-shadow: 1px 2px 4px ${COLORS.gray[8]};
`;

const GroupWrapper = styled.div`
  display: grid;
  /* grid-template-columns: 1fr 1fr; */
  grid-template-columns: repeat(2, minmax(130px, 1fr));
  gap: 4px;
`;

const TriggerWrapper = styled.span`
  display: inline-block;
  position: absolute;
  transform: translate(calc(-100% - 4px), 0px);
  line-height: 0;
`;

const AccordianTrigger = styled(Accordian.Trigger)`
  background-color: transparent;
  margin: 8px 0;
  padding-left: 22px;
  border: none;
`;

const Chevron = styled(ChevronRight)`
  ${AccordianTrigger}[data-state='open'] & {
    transform: rotate(90deg);
  }
`;

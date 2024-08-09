/* eslint-disable react/prop-types */
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
import { Check, ChevronRight } from "react-feather";
import * as Accordian from "@radix-ui/react-accordion";

import { QUERY_VMST } from "../utils/queries";
import { EMAIL_GROUP } from "../utils/mutations";
import { COLORS, QUERIES, WEIGHTS } from "../utils/constants";
import SubmitButton from "../components/Styled/SubmiButton";
import ErrorMessage from "../components/Styled/ErrorMessage";
import ToastMessage from "../components/ToastMessage";
import { useRef, useState } from "react";

// from the list of (VMST) members return the list of distinct WO groups
// (using this utility means avoiding a DB query)
import getGroups from "../utils/getGroups";
import AccordianItem from "./AccordianItem";

export default function Communication({ setTab, userProfile }) {
  // list of all VMST swimmers (array of member objects)
  const [swimmers, setSwimmers] = useState([]);
  // list of unique VMST workout groups
  const [groups, setGroups] = useState([]);
  // list of members who have opted out of emails (array of member objects)
  const [optOut, setOptOut] = useState([]);
  // list of recipients chosen by the user
  const [recipients, setRecipients] = useState([]);
  // HTML-formatted content of Quill editory
  const [emailContent, setEmailContent] = useState("");
  // (error) message to display under the editor
  const [message, setMessage] = useState("");
  // ref for quill editor
  const quillRef = useRef(null);
  // status for Toast message
  const [sent, setSent] = useState(false);

  //set up for react-hook-form
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

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

  const [emailGroup] = useMutation(EMAIL_GROUP);

  // Quill text editor options/modules (note: no images allowed in emails)
  const quillModules = {
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
    keyboard: { bindings: { tab: false } },
  };

  //submission handler (to send email)
  const onSubmit = async ({ subject }) => {
    // need recipients, subject, and content in both HTML and text formats
    if (!emailContent) {
      setMessage("Email message cannot be empty.");
      return;
    } else {
      try {
        const quill = quillRef.current.getEditor();
        const plainText = quill.getText();
        console.log(htmlText);
        const emailData = {
          id: recipients.map((member) => member._id),
          subject,
          // need to eliminate extra whitespace between paragraphs
          html: emailContent.replaceAll("<p><br></p>", ""),
          plainText,
        };
        // send email to recipients
        await emailGroup({ variables: { emailData } });
        // trigger toast if successful
        setSent(true);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const cleanup = () => {
    // cleanup after sending an email
    reset();
    setEmailContent("");
    setMessage("");
    setRecipients([]);
    // I don't know why but I seem to need to force a re-render to fully reset recipients
    // switching tabs seems to work; forceupdate does not
    // This is only an issue after submitting the form; clicking Cancel works just fine
    setTab("user");
  };

  if (userProfile.role === "coach" && !userProfile.group) {
    // coach needs to have a group specified
    return (
      <NoGroupWrapper>
        <p>
          You have the role of coach but you do not have an affiliated workout
          group, which is not allowed. Please contact the webmaster.
        </p>
        <Button onClick={() => setTab("user")}>Back</Button>
      </NoGroupWrapper>
    );
  }

  return (
    <Form aria-label="send email" onSubmit={handleSubmit(onSubmit)}>
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
            {/* Display recipients */}
            <p key="recipients">
              {recipients
                .map((member) => {
                  return `${member.firstName} ${member.lastName}`;
                })
                .join(", ")}
            </p>
          </RecipientsDisplayWrapper>

          <SubjectWrapper>
            <label htmlFor="subject">Subject: </label>
            <input
              type="text"
              id="subject"
              {...register("subject", {
                required: "Subject is required",
              })}
            />
            {errors.subject?.message && (
              <ErrorMessage>{errors.subject.message}</ErrorMessage>
            )}
          </SubjectWrapper>
          <QuillWrapper>
            <label htmlFor="email">
              Compose your message in the editor below
            </label>
            <ReactQuill
              id="email"
              theme="snow"
              placeholder="Enter email message here"
              modules={quillModules}
              value={emailContent}
              onChange={setEmailContent}
              ref={quillRef}
            />
          </QuillWrapper>
          <Description style={{ marginTop: "-12px" }}>
            Note that your email will be visible to the recipients.
          </Description>
          {/* error message to display */}
          {message && <ErrorMessage>{message}</ErrorMessage>}
        </MessageWrapper>
        <RecipientSelectionWrapper>
          <Title>Select Recipients</Title>

          <Accordian.Root type="single" collapsible>
            {/* Select entire workout groups */}
            <AccordianItem title="Workout Groups">
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
                        <Checkbox.Indicator>
                          <Check />
                        </Checkbox.Indicator>
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
            {/* List the folks who won't receive emails */}
            <AccordianItem title="Opted Out">
              <Description style={{ marginBottom: "6px" }}>
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
            </AccordianItem>
          </Accordian.Root>
        </RecipientSelectionWrapper>
        <ButtonWrapper>
          <Button
            type="button"
            onClick={() => {
              reset();
              setEmailContent("");
              setMessage("");
              setRecipients([]);
            }}
          >
            Cancel
          </Button>
          <SubmitButton
            type="submit"
            disabled={recipients.length === 0 || recipients.length > 100}
          >
            {isSubmitting ? "sending..." : "Submit"}
          </SubmitButton>
        </ButtonWrapper>
      </Wrapper>
      {sent && (
        <ToastMessage duration={1500} toastCloseEffect={cleanup}>
          Success! Your email was sent.
        </ToastMessage>
      )}
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
  width: 100%;
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

const GroupLabel = styled.label`
  color: var(--groupColor);
`;

const CheckboxRoot = styled(Checkbox.Root)`
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

const GroupWrapper = styled.div`
  display: grid;
  /* grid-template-columns: 1fr 1fr; */
  grid-template-columns: repeat(2, minmax(130px, 1fr));
  gap: 4px;
`;

const NoGroupWrapper = styled.div`
  width: min(100%, var(--max-prose-width));
  margin: 24px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;

  & p {
    font-size: 1.1rem;
  }
`;

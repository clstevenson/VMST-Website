/* eslint-disable react/prop-types */
/* 
 Component for the "Communication" tab for Leaders and Coaches
 A form that allows the user to compose emails (in a rich text editor) for members of VMST subgroups.

 - coaches can email members of their WO group
 - leaders can email any VMST member

 The main part of the content will contain the message composing editor (using Quill).  Recipients (and their count) will be listed on the form. There will also be (in the sidebar) a text input that can be used to search/filter/select recipients. This sidebar will be hidden for smaller screens but can slide out when clicked.

 Input props:
 - setTab in order to activate a different tab
 - userProfile, the data payload from the stored token
 */

import styled from "styled-components";
import { useRef, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";

import {
  QUERY_VMST,
  QUERY_MEETS,
  QUERY_MEMBERS_BY_USMS_ID,
  QUERY_EMAIL_USAGE,
} from "../../utils/queries";
import { EMAIL_GROUP } from "../../utils/mutations";
import { COLORS, QUERIES } from "../../utils/constants";
import ToastMessage from "../ToastMessage";
import SubmitButton from "../Styled/SubmiButton";
import ErrorMessage from "../Styled/ErrorMessage";
import Editor from "../Editor";
import RecipientsDisplay from "./RecipientsDisplay";
import RecipientsCombobox from "./RecipientsCombobox";
import GroupSelection from "./GroupSelection";
import { selectOptedOut, isReachable } from "./memberFilters";

// from the list of (VMST) members return the list of distinct WO groups
// (using this utility means avoiding a DB query)
import getGroups from "../../utils/getGroups";
import MinorButton from "../Styled/MinorButton";
import useMediaQuery from "../../utils/useMediaQuery";

export default function Communication({ setTab, userProfile }) {
  // list of all VMST swimmers (array of member objects)
  const [swimmers, setSwimmers] = useState([]);
  // list of unique VMST workout groups
  const [groups, setGroups] = useState([]);
  // list of members who have opted out of emails (array of member objects)
  const [optOut, setOptOut] = useState([]);
  // list of recipients chosen by the user (array of member objects)
  const [recipients, setRecipients] = useState([]);
  // HTML-formatted content of Quill editor
  const [emailContent, setEmailContent] = useState("");
  // (error) message to display under the editor
  const [message, setMessage] = useState("");
  // ref for quill editor
  const quillRef = useRef(null);
  // status for Toast message
  const [sent, setSent] = useState(false);
  // list of meets from database
  const [meets, setMeets] = useState([]);
  // USMS IDs of matched meet participants, used to look up their current
  // member record regardless of which club they're presently with
  const [usmsIds, setUsmsIds] = useState([]);
  // current member records for the above, keyed for use in GroupSelection
  const [meetMembers, setMeetMembers] = useState([]);
  // boolean for (de)select all button toggle
  const [anySelected, setAnySelected] = useState(false);

  //set up for react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const { loading } = useQuery(QUERY_VMST, {
    // Member data is written exclusively by the membership role, in a
    // different session entirely -- this tab needs to re-check the
    // network on every remount (eg switching tabs and back) rather than
    // serve a stale roster. See notes/stale-cache-audit.org.
    fetchPolicy: "cache-and-network",
    onCompleted: (data) => {
      let members = data.vmstMembers;
      // if a WO-group coach (not a VMST-wide coach), limit to members of
      // their group
      if (userProfile.role === "coach" && userProfile.group !== "VMST") {
        members = members.filter(
          ({ workoutGroup }) => workoutGroup === userProfile.group,
        );
      }

      members = members.map((member) => {
        return {
          name: `${member.firstName} ${member.lastName}`,
          ...member,
        };
      });

      setSwimmers([...members]);
      // retrieve WO group names and tallies
      const woGroups = getGroups(data.vmstMembers);
      setGroups([...woGroups]);
      // determine which members have opted out of emails
      setOptOut(selectOptedOut(members));
    },
  });

  // rolling 24h recipient count against the daily Gmail limit -- fetched on
  // open and re-fetched after a send (not polled continuously, since the
  // number only meaningfully changes when a batch actually goes out).
  // cache-first would otherwise serve a stale count on every later remount
  // of this tab within the same session (eg navigating away and back) --
  // same staleness class as the earlier User.jsx/QUERY_USER bug, and here
  // it especially matters since someone else's send between visits is a
  // real, likely case, not just a hypothetical one
  const { data: usageData, refetch: refetchUsage } = useQuery(
    QUERY_EMAIL_USAGE,
    { fetchPolicy: "cache-and-network" },
  );
  const emailUsage = usageData?.emailUsage ?? { count: 0, limit: 500 };
  const projectedUsage = emailUsage.count + recipients.length;
  const overLimitOnSend = projectedUsage > emailUsage.limit;

  useQuery(QUERY_MEETS, {
    onCompleted: (data) => {
      // retrieve the meets to a state variable
      const allMeets = data.meets.map(
        ({ _id, meetName, startDate, meetSwimmers: swimmers }) => {
          const meetSwimmers = swimmers.map(
            ({ firstName, lastName, usmsId, includeEmail }) => {
              return { firstName, lastName, usmsId, includeEmail };
            },
          );
          return { _id, meetName, startDate, meetSwimmers };
        },
      );
      setMeets([...allMeets]);

      // gather the USMS IDs of matched participants across all meets
      const matchedIds = allMeets.flatMap((meet) =>
        meet.meetSwimmers
          .filter(({ includeEmail }) => includeEmail)
          .map(({ usmsId }) => usmsId),
      );
      setUsmsIds([...new Set(matchedIds)]);
    },
  });

  useQuery(QUERY_MEMBERS_BY_USMS_ID, {
    variables: { usmsIds },
    skip: usmsIds.length === 0,
    // same cross-session Member-data staleness as QUERY_VMST above --
    // see notes/stale-cache-audit.org
    fetchPolicy: "cache-and-network",
    onCompleted: (data) => {
      const members = data.membersByUsmsId.map((member) => ({
        name: `${member.firstName} ${member.lastName}`,
        ...member,
      }));
      setMeetMembers([...members]);
    },
  });

  const [emailGroup] = useMutation(EMAIL_GROUP);

  // simplify the toolbar on phones, where the full set of tools doesn't fit
  const isMobile = useMediaQuery(QUERIES.mobile);

  // Quill text editor options/modules (note: no images allowed in emails)
  const quillModules = {
    toolbar: isMobile
      ? [
          ["bold", "italic"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ header: [1, 2, 3, 4, false] }],
          ["link"],
        ]
      : [
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

  // submission handler (to send email)
  const onSubmit = async ({ subject }) => {
    // need recipients, subject, and content in both HTML and text formats
    if (!emailContent) {
      setMessage("Email message cannot be empty.");
      return;
    } else {
      try {
        const plainText = quillRef.current.getText();
        const emailData = {
          id: recipients.map((member) => member._id),
          subject,
          // need to eliminate extra whitespace between paragraphs
          html: emailContent.replaceAll("<p><br></p>", ""),
          plainText,
        };
        // send email to recipients
        const { data } = await emailGroup({ variables: { emailData } });
        // trigger toast if successful
        if (data?.emailGroup) {
          setSent(true);
          // reflect the just-sent batch in the counter right away, rather
          // than waiting for the next time the page happens to be opened
          refetchUsage();
        } else {
          setMessage(
            "Something went wrong sending the email. Please try again later.",
          );
        }
      } catch (error) {
        const limitError = error.graphQLErrors?.find(
          (e) => e.extensions?.code === "EMAIL_LIMIT_EXCEEDED",
        );
        if (limitError) {
          const nextAvailable = new Date(
            limitError.extensions.nextAvailable,
          ).toLocaleString();
          setMessage(
            `${limitError.message} The next available time to send this batch is ${nextAvailable}.`,
          );
          return;
        }
        const noRecipientsError = error.graphQLErrors?.find(
          (e) => e.extensions?.code === "NO_RECIPIENTS",
        );
        if (noRecipientsError) {
          setMessage(noRecipientsError.message);
          return;
        }
        console.log(error);
        setMessage(
          "Something went wrong sending the email. Please try again later.",
        );
      }
    }
  };

  // Toggle between selecting all or selecting nonee
  const toggleSelectAll = () => {
    if (anySelected) {
      // remove all recepients
      setRecipients([]);
      setAnySelected(false);
    } else {
      // select all recipients with a deliverable address
      setAnySelected(true);
      const members = swimmers.filter(isReachable);
      setRecipients(members);
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
    setAnySelected(false);
  };

  // coach needs to have a group specified to access this tab
  if (userProfile.role === "coach" && !userProfile.group) {
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
          {userProfile.role === "coach" && userProfile.group !== "VMST" ? (
            <Title>Email {userProfile.group} Members</Title>
          ) : (
            <Title>Email VMST Members</Title>
          )}

          {/*
            Display people who will be receiving this email, with warnings as appropriate
          */}
          <RecipientsDisplay recipients={recipients} />

          <SelectionWrapper>
            {/* Select/search for individual recipients */}
            {!loading && (
              <RecipientsCombobox
                recipients={recipients}
                setRecipients={setRecipients}
                swimmers={swimmers}
              />
            )}

            {/* Toggle select or deselect all recipients. */}
            <SelectButton
              type="button"
              onClick={() => {
                toggleSelectAll();
              }}
            >
              {anySelected ? "Deselect All" : "Select All"}
            </SelectButton>

            <EmailCounter $urgent={emailUsage.count >= emailUsage.limit * 0.9}>
              {emailUsage.count} / {emailUsage.limit} emails sent today
            </EmailCounter>
          </SelectionWrapper>

          {overLimitOnSend && (
            <ErrorMessage>
              Sending to all {recipients.length} selected recipients would
              put today&apos;s total at {projectedUsage}, over the daily
              limit of {emailUsage.limit}. Trim the recipient list, or wait
              until more room frees up.
            </ErrorMessage>
          )}

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
            <Editor
              // Quill builds its toolbar once at mount and won't rebuild it from
              // a changed `modules` prop; force a remount when the breakpoint is
              // crossed so the simplified mobile toolbar actually takes effect
              key={isMobile ? "mobile" : "desktop"}
              id="email"
              placeholder="Enter email message here"
              modules={quillModules}
              defaultValue={emailContent}
              onTextChange={setEmailContent}
              ref={quillRef}
            />
          </QuillWrapper>

          {/* error message to display */}
          {message && <ErrorMessage>{message}</ErrorMessage>}
        </MessageWrapper>

        <RecipientSelectionWrapper>
          <GroupSelection
            recipients={recipients}
            setRecipients={setRecipients}
            userProfile={userProfile}
            groups={groups}
            swimmers={swimmers}
            meets={meets}
            meetMembers={meetMembers}
            optOut={optOut}
            setAnySelected={setAnySelected}
          />
        </RecipientSelectionWrapper>

        <ButtonWrapper>
          <Button
            type="button"
            onClick={() => {
              reset();
              // the editor is uncontrolled, so clearing emailContent alone
              // won't clear the visible editor -- clear it imperatively too
              quillRef.current?.setText("");
              setEmailContent("");
              setMessage("");
              setRecipients([]);
            }}
          >
            Cancel
          </Button>
          <SubmitButton
            type="submit"
            disabled={recipients.length === 0 || recipients.length > 500}
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

  @media ${QUERIES.tabletAndLess} {
    grid-template-columns: 1fr;
    grid-template-areas:
      "message"
      "recipients"
      "button";
  }
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
  max-width: var(--max-prose-width);
  grid-area: recipients;
  width: 100%;
`;

const SelectionWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  gap: 12px;
  max-width: var(--max-prose-width);
  width: 100%;

  @media ${QUERIES.mobile} {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
`;

const EmailCounter = styled.span`
  margin-left: auto;
  font-size: 0.9rem;
  white-space: nowrap;
  ${(props) =>
    props.$urgent &&
    `
      background-color: ${COLORS.urgent_light};
      color: ${COLORS.urgent_text};
      padding: 2px 8px;
      border-radius: 4px;
    `}

  @media ${QUERIES.mobile} {
    margin-left: 0;
  }
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

const SelectButton = styled(MinorButton)`
  margin: 0px auto 0px 36px;
  padding: 4px 24px;
  color: black;

  @media ${QUERIES.mobile} {
    margin: 0 auto;
  }
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

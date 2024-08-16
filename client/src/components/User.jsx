///////////////////////////////////////////////////////////////////////////////
//                             User Account Page                             //
///////////////////////////////////////////////////////////////////////////////

/*
 This component is the basic "User" account page, it will be displayed for
 all users no matter what role they have. On this page a user will be able to
 change a few basic account settings:
 - change password and/or email address
 - manage communication preferences (whether to receive emails; notification of new posts)
 - TODO: display USMS info, including USMS number and ID and club affiliation, if user is an LMSC member
 - TODO: manage display preferences (eg dark mode, whether to change banner photos and how often, etc)
 - request an "upgraded" role from team leaders (probably they will be directed to the contact page)

 Input prop is the data payload from the token stored from logging in; see auth.js (server-side) for that info. Currently it includes role, _id (for User), and group (really impotant only if role is "coach").
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import * as Dialog from "@radix-ui/react-dialog";
import * as Accordian from "@radix-ui/react-accordion";
import * as Label from "@radix-ui/react-label";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { useQuery, useMutation } from "@apollo/client";

import { QUERY_USER } from "../utils/queries.js";
import { EDIT_USER, EMAIL_WEBMASTER } from "../utils/mutations.js";
import { COLORS, QUERIES } from "../utils/constants.js";
import Auth from "../utils/auth.js";
import * as ModalStyles from "./Styled/ModalStyles.jsx";
import ChangeEmail from "./ChangeEmail.jsx";
import ChangePassword from "./ChangePassword.jsx";
import SubmitButton from "./Styled/SubmiButton.jsx";
import Spinner from "../components/Spinner.jsx";
import ErrorMessage from "./Styled/ErrorMessage.jsx";
import ToastMessage from "../components/ToastMessage";
import { Check } from "react-feather";
import AccordianItem from "./AccordianItem.jsx";
import MinorButton from "./Styled/MinorButton.jsx";
import { FieldSet } from "./Styled/FieldSet.jsx";
import { CheckboxRoot, CheckboxIndicator } from "./Styled/Checkbox.jsx";

export default function User({ userProfile }) {
  // state of modals
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  // before/after user information
  const [user, setUser] = useState({});
  const [originalProfile, setOriginalProfile] = useState({});
  // form controls for role request
  const [role, setRole] = useState("");
  const [roleJustification, setRoleJustification] = useState("");
  // messages to user (often errors)
  const [message, setMessage] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  // request statuses
  const [roleRequestSent, setRoleRequestSent] = useState(false);
  const [profileUpdated, setProfileUpdated] = useState(false);

  const [editUser] = useMutation(EDIT_USER);
  const [emailWebmaster] = useMutation(EMAIL_WEBMASTER);

  const { loading } = useQuery(QUERY_USER, {
    variables: { id: userProfile._id },
    onCompleted: (data) => {
      const user = data.users[0];
      setUser({ ...user });
      setRole(user.role);
      setOriginalProfile({ ...user });
    },
  });

  if (loading) {
    return (
      <SpinnerWrapper>
        <Spinner />
        <p>Loading user data...</p>
      </SpinnerWrapper>
    );
  }

  const isProfileChanged = () => {
    return (
      user.firstName !== originalProfile.firstName ||
      user.lastName !== originalProfile.lastName ||
      user.email !== originalProfile.email ||
      user.notifications !== originalProfile.notifications ||
      user.emailPermission !== originalProfile.emailPermission
    );
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const { firstName, lastName, email, notifications, emailPermission } = user;
    try {
      // submit the "user" state to the server for updating
      const {
        data: { editUser: updatedUser },
      } = await editUser({
        variables: {
          id: userProfile._id,
          user: { firstName, lastName, email, notifications, emailPermission },
        },
      });
      // check that we got something back
      if (!updatedUser) {
        // need to send a message to the user
        setMessage(
          "Something went wrong on the server; possibly the email address you chose is already in use."
        );
        return;
      }
      // trigger Toast
      setProfileUpdated(true);
      // update the "original user" to match what's in the DB
      setOriginalProfile({ ...user });
    } catch (error) {
      // need to send a message to the user
      setMessage(error.message);
    }
  };

  const handleRoleRequest = async () => {
    // if justification is empty, early return
    if (roleJustification === "") {
      setRequestMessage("You cannot leave the request justification blank.");
      return;
    }

    const subject = `Request from VMST website user (ID ${userProfile._id}) to change role to ${role}`;

    let html = "";
    const plainText = roleJustification;
    const txtArray = plainText.split("\n");

    for (let i = 0; i < txtArray.length; i++) {
      // skip blank lines
      if (txtArray[i] === "") continue;
      // wrap p-tags around text blocks
      html += `<p>${txtArray[i]}</p>`;
    }

    const emailData = {
      from: `${user.firstName} ${user.lastName}`,
      replyTo: user.email,
      id: [],
      subject,
      plainText,
      html,
    };

    try {
      await emailWebmaster({ variables: { emailData } });
      // trigger Toast, which has its own cleanup functioin
      setRoleRequestSent(true);
    } catch (err) {
      console.log(err.message);
      setRequestMessage(`Something went wrong: ${err.message}`);
    }
  };

  return (
    <Wrapper>
      <Title>
        Welcome to your user account page, {originalProfile.firstName}!
      </Title>

      <UserForm>
        <SubTitle>User Profile</SubTitle>
        <p>
          Click any of the <Highlighted>highlighted items</Highlighted> below to
          edit your user profile.
        </p>

        <NameWrapper>
          <legend>User Name</legend>
          <InputWrapper>
            <label htmlFor="firstName">First</label>
            <input
              type="text"
              id="firstName"
              value={user.firstName}
              onChange={(evt) =>
                setUser({ ...user, firstName: evt.target.value })
              }
            />
          </InputWrapper>
          <InputWrapper>
            <label htmlFor="lastName">Last</label>
            <input
              type="text"
              id="lastName"
              value={user.lastName}
              onChange={(evt) =>
                setUser({ ...user, lastName: evt.target.value })
              }
            />
          </InputWrapper>
        </NameWrapper>

        <CommunicationsWrapper>
          <legend>Communication Preferences</legend>
          <EmailInputWrapper>
            <p>Email: {user.email} </p>
            <Dialog.Root open={emailOpen} onOpenChange={setEmailOpen}>
              <Dialog.Trigger asChild>
                <MinorButton type="button">Change Email</MinorButton>
              </Dialog.Trigger>
              <Dialog.Portal>
                <ModalStyles.DialogOverlay />
                <ChangeEmail
                  setOpen={setEmailOpen}
                  user={user}
                  setUser={setUser}
                />
              </Dialog.Portal>
            </Dialog.Root>
          </EmailInputWrapper>

          <InputWrapper>
            <CheckboxRoot
              id="post-notifications"
              checked={user.notifications}
              onCheckedChange={(checked) =>
                setUser({ ...user, notifications: checked })
              }
            >
              <CheckboxIndicator>
                <Check strokeWidth={3} />
              </CheckboxIndicator>
            </CheckboxRoot>
            <label htmlFor="post-notifications">
              I want to be notified of new posts
            </label>
          </InputWrapper>

          <InputWrapper>
            <CheckboxRoot
              id="email-permission"
              checked={user.emailPermission}
              onCheckedChange={(checked) =>
                setUser({ ...user, emailPermission: checked })
              }
            >
              <CheckboxIndicator>
                <Check strokeWidth={3} />
              </CheckboxIndicator>
            </CheckboxRoot>
            <label htmlFor="email-permission">
              I want to receive emails from VMST
            </label>
          </InputWrapper>

          {!user.emailPermission && (
            <Description>
              Note: if email permission is not granted, you will not receive any
              comunications related to meets (relays, social events, etc).
            </Description>
          )}
        </CommunicationsWrapper>
        {isProfileChanged() && <ErrorMessage>Profile has changed</ErrorMessage>}
        {message && <ErrorMessage>{message}</ErrorMessage>}
      </UserForm>

      <MemberWrapper>
        <MemberSection>
          <SubTitle>
            Current User Role: {user.role === "user" ? "basic user" : user.role}
          </SubTitle>
          {user.role === "coach" && (
            <div style={{ margin: "6px 0" }}>
              <p>
                Workout group affiliation:{" "}
                <strong>{user.group ? user.group : "none"}</strong>.
              </p>
              <Description>
                Coaches can communicate with their designated workout group. If
                you do not have a designated workout group yet, please contact
                the webmaster using <Link to="/contact">the Contact page</Link>.
              </Description>
            </div>
          )}

          <p>
            While visitors to the website are not required to create an account,
            doing so confers some extra superpowers. Accounts have one of three
            roles, which are described below.
          </p>

          {/* Explanation of roles, form to request changed role */}
          <AccordianRoot type="multiple">
            <AccordianItem title="Role: Basic User" titlePadding="24px">
              <p>
                Basic users are able to manage their communication preferences,
                in particular whether to be notified (by email) when new items
                are posted to the home page and whether or not to receive emails
                from workout group coaches or VMST team leaders.
              </p>
              <p>
                The roles of &quot;coach&quot; and &quot;leader&quot; have the
                ability to email VMST members or the members of a specific
                workout group. If you do not wish to recieve these emails, you
                can opt out of them.
              </p>
              <p>
                Before opting out, however, note that one reason coaches/leaders
                might wish to communicate with members is to communicate
                information about relays or social gatherings at upcoming
                competitions.
              </p>
              <p>
                <strong>
                  <YellowHighlight>IMPORTANT</YellowHighlight>
                </strong>
                : USMS provides the ability to opt out of emails from the LMSC
                when you create/renew your USMS membership. They do not get more
                granular than the LMSC level, so by default if a member opts out
                of LMSC emails{" "}
                <em>they will also not receive emails from VMST</em>. If you
                wish to receive emails from VMST leaders and coaches, you can do
                so without changing your LMSC-level preference. In other words,
                you can get emails from VMST but not the LMSC (if you wish).
              </p>
              <p>
                Finally: if demand warrants it, users will gain the ability to
                reply to posts (non-anonymously).
              </p>
            </AccordianItem>
            <AccordianItem title="Role: Coach" titlePadding="24px">
              <p>
                A role of &quot;coach&quot; is intended for coaches of workout
                groups, or someone designated by them, to communicate with
                workout groups on their behalf. A coach{" "}
                <em>
                  <strong>MUST</strong>
                </em>{" "}
                have a workout group affiliated with their account in order to
                communicate with that group. In other words, coaches can only
                email their own WO group members.
              </p>
              <p>
                A coach might do this for any number of reasons, such as
                communicating information about changes in practice times,
                social gatherings, or organizing relays for upcoming meets.{" "}
              </p>
              <p>
                Emails sent by coaches will go out to all swimmers who are
                formally registered for a given WO group (and VMST). Membership
                rolls are updated weekly. In the Communications tab of your
                account page you should be able to see who will receive your
                emails. But note that WO group members who have opted out of
                emails will NOT receive these communications; the names of those
                opt-outs are also displayed in your Communications page.
              </p>
              <p>
                Note that, at present, we are using a persional gmail account to
                send out email messages. Such accounts have a limit of 100
                recipients per email and 500 recipients in a given 24-h period.
                While no single WO group has more than 100 members, if you send
                out multiple messages then you could start to approach the 24h
                limit. Remembering that you share this account with other
                coaches and leaders, you do not want to come anywhere close to
                this limit. Please review your message carefully before sending
                to avoid the need to send repeated messages, particularly if you
                have a large WO group.
              </p>
              <p>
                If you think there is some mistake in your WO group roll (eg,
                you think someone is a member who is not on the list or it has
                not been updated recently), please{" "}
                <a href="mailto: VAmembership@usms.org">
                  email the LMSC Membership Coordinator
                </a>{" "}
                with your concerns.
              </p>
            </AccordianItem>
            <AccordianItem title="Role: Leader" titlePadding="24px">
              <p>
                A person with the role of &quot;leader&quot; (ie, a VMST team
                leader) will be able to email any VMST member. Leaders will also
                be able to create posts that appear on the home page (and are
                seen by all visitors to the site) as well as edit/delete
                existing posts. This role is meant to be shared by those who are
                authorized to communicate with any VMST team member on official
                team business or to create/edit posts to the website. It is
                intended that this would be the three VMST Board Members, though
                they may designate others for this role if they wish.
              </p>
              <p>
                Note that, at present, we are using a personal gmail account to
                send out email messages. Such accounts have a limit of 100
                recipients per email and 500 recipients in a 24-h period. It is
                strongly advised that you remain well below this limit to avoid
                suspension of the account; remember that all users (ie, other
                leaders and coaches) are using the same account. Please review
                your message carefully before sending in order to avoid the need
                to send multiple messages.
              </p>
              <p>
                If you need to send a message to all members, there are two
                options. VMST can pay for an account with a higher send limit,
                or you can send such messages through the{" "}
                <a href="mailto:VAmembership@usms.org">
                  LMSC Membership Coordinator
                </a>
                .
              </p>
              <p>
                Email messages can only go to USMS members who are registered
                for VMST. Membership rolls will be updated weekly by the
                Membership Coordinator. Note that messages will{" "}
                <strong>not</strong> go to anyone who has opted out of receiving
                VMST emails, but you will be able to see a list of people who
                have opted out of such messages.
              </p>
            </AccordianItem>
            <AccordianItem title="Request Role Change" titlePadding="24px">
              <p>
                Please indicate which role you would like for your account, and
                provide your justification below. Clicking the Submit button
                will submit your request to the webmaster for review.
              </p>
              <RoleRequestWrapper>
                <legend>Request Role Change</legend>
                <RadioGroupRoot value={role} onValueChange={setRole}>
                  <RadioButtonWrapper>
                    <RadioGroupItem value="user" id="user">
                      <RadioGroupIndicator />
                    </RadioGroupItem>
                    <Label.Root htmlFor="user">User</Label.Root>
                  </RadioButtonWrapper>
                  <RadioButtonWrapper>
                    <RadioGroupItem value="coach" id="coach">
                      <RadioGroupIndicator />
                    </RadioGroupItem>
                    <Label.Root htmlFor="coach">Coach</Label.Root>
                  </RadioButtonWrapper>
                  <RadioButtonWrapper>
                    <RadioGroupItem value="leader" id="leader">
                      <RadioGroupIndicator />
                    </RadioGroupItem>
                    <Label.Root htmlFor="leader">Leader</Label.Root>
                  </RadioButtonWrapper>
                </RadioGroupRoot>
                <Label.Root htmlFor="justification">Justification:</Label.Root>
                <textarea
                  id="justification"
                  value={roleJustification}
                  onChange={(evt) => setRoleJustification(evt.target.value)}
                />
                <RoleSubmitWrapper>
                  <MinorButton
                    type="button"
                    onClick={handleRoleRequest}
                    disabled={roleJustification === "" || role === user.role}
                  >
                    Submit Request
                  </MinorButton>
                  {(roleJustification === "" || role === user.role) && (
                    <Description>
                      Role must change and justification cannot be blank
                    </Description>
                  )}
                </RoleSubmitWrapper>
              </RoleRequestWrapper>
              {requestMessage && <ErrorMessage>{requestMessage}</ErrorMessage>}
            </AccordianItem>
          </AccordianRoot>
        </MemberSection>
      </MemberWrapper>

      {/* logout and password change button alignment */}
      <ButtonWrapper>
        <Button
          onClick={(evt) => handleSubmit(evt)}
          disabled={!isProfileChanged()}
        >
          Save Changes
        </Button>
        <Button
          onClick={() => {
            setUser({ ...originalProfile });
            setMessage("");
          }}
        >
          Discard Changes
        </Button>
        <Dialog.Root open={passwordOpen} onOpenChange={setPasswordOpen}>
          <Dialog.Trigger asChild>
            <Button>Change Password</Button>
          </Dialog.Trigger>
          <ModalStyles.DialogOverlay />
          <ChangePassword setOpen={setPasswordOpen} />
        </Dialog.Root>

        <Button onClick={() => Auth.logout()}>Log out</Button>
      </ButtonWrapper>
      {profileUpdated && (
        <ToastMessage toastCloseEffect={() => setProfileUpdated(false)}>
          Your user profile has been updated!
        </ToastMessage>
      )}
      {roleRequestSent && (
        <ToastMessage
          toastCloseEffect={() => {
            // cleanup
            setRoleRequestSent(false);
            setRequestMessage("");
            setRoleJustification("");
            setRole(user.role);
          }}
        >
          Your request has been sent to the webmaster.
        </ToastMessage>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin: 16px auto;
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(2, minmax(200px, 1fr));
  grid-template-areas:
    "title title"
    "user member"
    "button button";
  padding: 16px;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      "title"
      "user"
      "member"
      "button";
  }
`;

// for user information (name, email, preferences)
const UserForm = styled.form`
  max-width: var(--max-prose-width);
  grid-area: user;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const NameWrapper = styled(FieldSet)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  @media ${QUERIES.tabletAndLess} {
    grid-template-columns: 1fr;
  }

  @media (max-width: 800px) {
    grid-template-columns: 1fr 1fr;
  }

  @media ${QUERIES.mobile} {
    grid-template-columns: 1fr;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 4px;
`;

const EmailInputWrapper = styled(InputWrapper)`
  justify-content: space-between;

  @media ${QUERIES.mobile} {
    flex-direction: column;
  }
`;

const CommunicationsWrapper = styled(NameWrapper)`
  display: flex;
  flex-direction: column;
`;

const Highlighted = styled.span`
  background-color: var(--change-background-color);
`;

const YellowHighlight = styled.span`
  background-color: ${COLORS.secondary_light};
`;

// membership info
const MemberWrapper = styled.div`
  max-width: var(--max-prose-width);
  grid-area: member;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AccordianRoot = styled(Accordian.Root)`
  /* manage paragraph spacing */
  & p {
    margin: 1pc 0;
  }
  & p:first-child {
    /* header seems to have padding or a non-collapsible bottom margin */
    margin: 0;
  }
`;

const MemberSection = styled.section``;

const ButtonWrapper = styled.div`
  grid-area: button;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  justify-content: center;
  gap: 24px;
  padding-top: 8px;

  @media (max-width: 800px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
`;

const Button = styled(SubmitButton)`
  flex: 1 1 auto;
  min-width: 150px;
`;

const Title = styled.h2`
  font-size: var(--subheading-size);
  text-align: center;
  grid-area: title;
`;

const SubTitle = styled.h3`
  font-size: 1.1rem;
`;

const P = styled.p`
  margin: 12px 0 3px;
`;

const SpinnerWrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Description = styled.p`
  font-size: 0.8rem;
`;

// Role Request Submission Form Styling

const RoleRequestWrapper = styled(NameWrapper)`
  margin-top: 16px;
  display: flex;
  flex-direction: column;

  & textarea {
    margin-top: -6px;
    height: 10pc;
    padding: 4px;
  }
`;

const RadioGroupRoot = styled(RadioGroup.Root)`
  display: flex;
  gap: 24px;
`;

const RadioButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RadioGroupItem = styled(RadioGroup.Item)`
  background-color: transparent;
  border: 1px solid black;
  border-radius: 100%;
  width: 20px;
  height: 20px;
  position: relative;
`;

const RadioGroupIndicator = styled(RadioGroup.Indicator)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  width: 12px;
  height: 12px;
  background-color: ${COLORS.accent[8]};
`;

const RoleSubmitWrapper = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  justify-items: start;
  gap: 8px;
`;

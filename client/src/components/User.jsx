///////////////////////////////////////////////////////////////////////////////
//                             User Account Page                             //
///////////////////////////////////////////////////////////////////////////////

/*
 This component is the basic "User" account page, it will be displayed for
 all users no matter what role they have. On this page a user will be able to
 change a few basic account settings:
 - change password and/or email address
 - manage communication preferences (whether to receive emails; notification of new posts)
 - display USMS info, including USMS number and ID and club affiliation, if user is an LMSC member
 - manage display preferences (eg dark mode, whether to change banner photos and how often, etc)
 - request an "upgraded" role from team leaders (probably they will be directed to the contact page)
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import * as Dialog from "@radix-ui/react-dialog";
import * as Checkbox from "@radix-ui/react-checkbox";
import { useQuery, useMutation } from "@apollo/client";

import { QUERY_USER } from "../utils/queries.js";
import { EDIT_USER } from "../utils/mutations.js";
import { COLORS, QUERIES, WEIGHTS } from "../utils/constants.js";
import Auth from "../utils/auth.js";
import * as ModalStyles from "./Styled/ModalStyles.jsx";
import ChangeEmail from "./ChangeEmail.jsx";
import ChangePassword from "./ChangePassword.jsx";
import SubmitButton from "./Styled/SubmiButton.jsx";
import Spinner from "../components/Spinner.jsx";
import ErrorMessage from "./Styled/ErrorMessage.jsx";
import ToastMessage from "../components/ToastMessage";
import { Check, X } from "react-feather";

export default function User({ userProfile }) {
  // state of "change password" modal
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [user, setUser] = useState({});
  const [originalProfile, setOriginalProfile] = useState({});
  const [message, setMessage] = useState("");

  const [editUser] = useMutation(EDIT_USER);

  const { loading } = useQuery(QUERY_USER, {
    variables: { id: userProfile._id },
    onCompleted: (data) => {
      const user = data.users[0];
      setUser({ ...user });
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
      // update the "original user" to match what's in the DB
      setOriginalProfile({ ...user });
    } catch (error) {
      // need to send a message to the user
      setMessage(error.message);
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
          <InputWrapper style={{ justifyContent: "space-between" }}>
            <p>Email: {user.email} </p>
            <Dialog.Root open={emailOpen} onOpenChange={setEmailOpen}>
              <Dialog.Trigger asChild>
                <button type="button">Change Email</button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <ModalStyles.DialogOverlay />
                {/* <ChangePassword setOpen={setPasswordOpen} /> */}
                <ChangeEmail
                  setOpen={setEmailOpen}
                  user={user}
                  setUser={setUser}
                />
              </Dialog.Portal>
            </Dialog.Root>
          </InputWrapper>

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
          <p>TBD:</p>
          <ul>
            <li>Info about user roles (accordian)</li>
            <li>Ability to request role upgrade (accordian form)</li>
          </ul>
        </MemberSection>
        {/* 
        <MemberSection>
          <SubTitle>USMS Member Information</SubTitle>
          <p>TBD:</p>
          <ul>
            <li>Display USMS ID (or request their ID)</li>
            <li>Basic info: registration date, club, WO group</li>
            <li>Link to public page</li>
            <li>Link to results page</li>
            <li>
              Any problems with this info?{" "}
              <a href="mailto:VAmembership@usms.org">
                Contact the LMSC membership coordinator
              </a>
            </li>
          </ul>
        </MemberSection>
                */}
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
    </Wrapper>
  );
}

const Wrapper = styled.div`
  /* background color associated with editable properties */
  --change-background-color: ${COLORS.accent[3]};
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

const NameWrapper = styled.fieldset`
  padding: 8px;
  border-radius: 4px;
  border: 1px dotted ${COLORS.gray[9]};
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  & legend {
    border-radius: 4px;
    display: inline-block;
    background-color: ${COLORS.accent[12]};
    color: ${COLORS.accent[2]};
    padding: 3px 6px;
    width: max-content;
  }

  & input[type="text"] {
    background-color: var(--change-background-color);
    padding: 0 4px;
    border: none;
    width: 100%;
  }

  & input[type="text"]:hover {
    background-color: ${COLORS.accent[4]};
    outline: auto;
  }

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

const CommunicationsWrapper = styled(NameWrapper)`
  display: flex;
  flex-direction: column;

  & ${InputWrapper} {
    align-items: center;
  }

  & button {
    background-color: var(--change-background-color);
    border-radius: 4px;
    border: 1px solid ${COLORS.accent[11]};
    padding: 2px 6px;
  }

  & button:hover {
    background-color: ${COLORS.accent[4]};
    transform: scale(1.05);
  }
`;

const Highlighted = styled.span`
  background-color: var(--change-background-color);
`;

const CheckboxRoot = styled(Checkbox.Root)`
  all: "unset";
  background-color: transparent;
  border: 1px solid ${COLORS.gray[11]};
  width: 32px;
  height: 32px;
  border-radius: 4px;
  box-shadow: 1px 2px 4px ${COLORS.gray[8]};
  margin-right: 6px;

  &[data-disabled] {
    border: 1px solid ${COLORS.gray[8]};
  }
`;

const CheckboxIndicator = styled(Checkbox.Indicator)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

// membership info
const MemberWrapper = styled.div`
  max-width: var(--max-prose-width);
  grid-area: member;
  display: flex;
  flex-direction: column;
  gap: 16px;
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

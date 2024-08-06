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
import styled from "styled-components";
import { COLORS, WEIGHTS } from "../utils/constants.js";
import * as Dialog from "@radix-ui/react-dialog";
import Auth from "../utils/auth.js";
import * as ModalStyles from "./Styled/ModalStyles.jsx";
import ChangePassword from "./ChangePassword.jsx";

export default function User() {
  // state of "change password" modal
  const [open, setOpen] = useState(false);

  return (
    <Wrapper>
      <Title>Welcome to your user account page!</Title>

      <Figure>
        <Image
          src="/assets/anne-nygard-unsplash-construction.jpg"
          alt="scaffolding on construction site"
        />
        <figcaption>This page is still being built.</figcaption>
      </Figure>

      <p>Sorry for our dust, this page is under construction. </p>

      {/* logout and password change button alignment */}
      <ButtonWrapper>
        <Button onClick={() => Auth.logout()}>Log out</Button>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <Button>Change Password</Button>
          </Dialog.Trigger>
          <ModalStyles.DialogOverlay />
          <ChangePassword setOpen={setOpen} />
        </Dialog.Root>
      </ButtonWrapper>

      <p>
        Things a <strong>basic user</strong> will eventually be able to do the
        following on this page:
      </p>
      <ul>
        <li>change password</li>
        <li>change email</li>
        <li>
          manage communication preferences (email and post notification opt
          in/out)
        </li>
        <li>see their USMS info: ID, club, WO group</li>
        <li>direct link to other USMS info: results, personal page</li>
        <li>log out</li>
        <li>upload photos to the VMST Flickr account (after review)</li>
        <li>see/edit responses to posts by VMST team leaders</li>
        <li>
          manage banner preferences (choose an image, or choose to randomly
          change them at a user-specified interval)
        </li>
        <li>request an "upgraded" role (eg coach or team leader)</li>
      </ul>

      <P>Some users will have additional capabilities</P>
      <ul>
        <li>
          <strong>LMSC membership coordinator</strong> will be able to upload
          the current LMSC membership information
        </li>
        <li>
          <strong>VMST WO group coaches</strong> will be able to see their
          current roster and email them individually or all at once using a Rich
          Text Format (RTF) editor
        </li>
        <li>
          <strong>VMST Team Leaders</strong> will be able to create posts and
          edit previous posts as well as edit certain parts of the website
          (again using an RTF editor)
        </li>
        <li>
          <strong>VMST Team Leaders</strong> will be able to upload meet
          rosters, create and post relays, and communicate with competitors in
          an upcoming meet
        </li>
        <li>
          <strong>VMST Team Leaders</strong> will be able to communicate with
          coaches (however they decide to define the term)
        </li>
        <li>
          <strong>Webmaster</strong> will be able to manage certain aspects of
          the site, such as deleting offensive comments, suspending or banning
          users from posting them, resetting passwords, changing user roles.
          They will also have the same privileges as Team Leaders in case they
          need assistance in various tasks.
        </li>
      </ul>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: min(100%, var(--max-prose-width));
  margin: 16px auto;
`;

const Figure = styled.figure`
  padding: 4px;
  float: right;
  margin-right: 0;
  margin-left: 4px;
  padding: 4px;
  border: 1px solid ${COLORS.gray[8]};
  box-shadow: 1px 2px 4px ${COLORS.gray[6]};

  & figcaption {
    text-align: center;
  }

  @media (max-width: 650px) {
    width: 208px;
  }

  @media (max-width: 450px) {
    float: revert;
  }
`;

const Image = styled.img`
  height: 250px;
  width: 300px;
  object-fit: cover;

  @media (max-width: 650px) {
    width: 200px;
    height: 150px;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  margin: 16px 0;

  @media (max-width: 750px) {
    gap: 16px;
  }
`;

const Button = styled.div`
  display: inline-block;
  text-align: center;
  width: fit-content;
  min-width: 160px;
  padding: 4px 8px;
  background-color: ${COLORS.accent[12]};
  color: white;
  border-radius: 4px;
  font-weight: ${WEIGHTS.medium};
  cursor: pointer;

  &:hover {
    background-color: ${COLORS.accent[10]};
  }
`;

const Title = styled.h2`
  font-size: var(--subheading-size);
`;

const P = styled.p`
  margin: 12px 0 3px;
`;

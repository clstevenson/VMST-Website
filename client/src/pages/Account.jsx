import styled from "styled-components";
import Auth from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { COLORS, WEIGHTS } from "../utils/constants.js";
import * as Separator from "@radix-ui/react-separator";

export default function Account() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!Auth.loggedIn()) {
      navigate("/");
    }
  }, [navigate]);

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

      <Separator.Root
        style={{
          backgroundColor: "black",
          height: "2px",
          width: "200px",
          margin: "6px 100px",
        }}
        aria-hidden
      />

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
        <li>upload photos to the VMST Flickr account</li>
        <li>see/edit responses to posts by VMST team leaders</li>
        <li>
          manage banner preferences (choose an image, or choose to randomly
          change them at a user-specified interval)
        </li>
        <li>display the website in dark mode</li>
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

      <Button onClick={() => Auth.logout()}>Log out</Button>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: min(100%, var(--max-prose-width));
  margin: 0 auto;
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

const Button = styled.div`
  width: fit-content;
  padding: 4px 8px;
  margin-top: 16px;
  background-color: ${COLORS.accent[12]};
  color: white;
  border-radius: 4px;
  font-weight: ${WEIGHTS.medium};
  cursor: pointer;
`;

const Title = styled.h2`
  font-size: var(--subheading-size);
`;

const P = styled.p`
  margin: 12px 0 3px;
`;

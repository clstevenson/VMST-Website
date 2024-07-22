import styled from "styled-components";
import Home from "./Home";
import Auth from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { COLORS, WEIGHTS } from "../utils/constants.js";

export default function Account() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!Auth.loggedIn()) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <Wrapper>
      <Title>Welcome to your user page, [name]!</Title>

      <p>Things a user will be able to do on this page:</p>
      <ul>
        <li>change password</li>
        <li>change email</li>
        <li>change email preferences (opt in/out)</li>
        <li>notifications of posts (opt in/out)</li>
        <li>banner preferences</li>
        <li>see USMS info: ID, club, WO group</li>
        <li>link to other USMS info: results, personal page</li>
        <li>log out</li>
        <li>allow photo uploading privileges (when implemented)</li>
        <li>see/edit responses to posts (when that is implemented)</li>
      </ul>

      <p>Other notes:</p>
      <ul>
        <li>
          split content into two columns on wider screens, preferences on the
          left and links on the right (might become a pattern)
        </li>
      </ul>

      <Button onClick={() => Auth.logout()}>Log out</Button>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: var(--max-prose-width);
  margin: 0 auto;
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

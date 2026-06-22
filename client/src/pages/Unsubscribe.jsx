/*
 Landing page for the one-click unsubscribe link in post-notification
 emails. No login required -- the signed token in the URL is the only
 credential, and it can only ever do this one thing (see the `unsubscribe`
 resolver in server/schemas/resolvers.js).
 */
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import styled from "styled-components";
import { UNSUBSCRIBE } from "../utils/mutations";
import { COLORS } from "../utils/constants";

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [unsubscribe] = useMutation(UNSUBSCRIBE);
  const [status, setStatus] = useState("working");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    unsubscribe({ variables: { token } })
      .then(({ data }) => setStatus(data.unsubscribe ? "success" : "error"))
      .catch(() => setStatus("error"));
    // only ever run once per token, regardless of mutation-identity churn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <Wrapper>
      {status === "working" && <Paragraph>Working...</Paragraph>}
      {status === "success" && (
        <Paragraph>
          You&apos;ve been unsubscribed from post notifications. You can
          turn them back on anytime from your account page.
        </Paragraph>
      )}
      {status === "error" && (
        <Paragraph>
          Sorry, that unsubscribe link isn&apos;t valid. You can manage your
          notification preferences from your account page instead.
        </Paragraph>
      )}
      <Paragraph>
        <Link to="/">Return home</Link>
      </Paragraph>
    </Wrapper>
  );
}

const Wrapper = styled.article`
  max-width: 60ch;
  margin: 32px auto;
  border: 1px solid ${COLORS.accent[12]};
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 2px 4px 6px ${COLORS.gray[9]};
  background-color: ${COLORS.accent[2]};
  text-align: center;
`;

const Paragraph = styled.p`
  margin: 8px 0;
`;

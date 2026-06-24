/*
 Landing page for the verification link sent on signup (and again whenever
 a user changes their email address). No login required -- the signed
 token in the URL is the only credential, and it expires after 48h (see
 the `verifyEmail` resolver in server/schemas/resolvers.js).
 */
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import styled from "styled-components";
import { VERIFY_EMAIL } from "../utils/mutations";
import { COLORS } from "../utils/constants";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [verifyEmail] = useMutation(VERIFY_EMAIL);
  const [status, setStatus] = useState("working");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    verifyEmail({ variables: { token } })
      .then(({ data }) => setStatus(data.verifyEmail ? "success" : "error"))
      .catch(() => setStatus("error"));
    // only ever run once per token, regardless of mutation-identity churn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <Wrapper>
      {status === "working" && <Paragraph>Working...</Paragraph>}
      {status === "success" && (
        <Paragraph>Your email address has been verified. Thanks!</Paragraph>
      )}
      {status === "error" && (
        <Paragraph>
          Sorry, that verification link isn&apos;t valid or has expired.
          Links expire after 48 hours -- you can request a new one from
          your account page.
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

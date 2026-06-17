import { useRouteError } from "react-router-dom";
import styled from "styled-components";
import { COLORS } from "../utils/constants";

/*
 * TODO: Connect to GlobalStyles
   Somehow the component isn't working properly here, I think React Router's error routine
   renders outside the normal component tree. I think I will eventually more to Next.js
   and thus move away from React Router. But for now I will simply hard-code the CSS variables.
 */

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
      <Wrapper id="error-page">
        <Title>Oops!</Title>
        <Paragraph>
        Sorry, an unexpected error has occurred:{' '}<i>{error.statusText || error.message}</i>
          </Paragraph>
          <Paragraph>
          <a href="/">Click here</a> to return to the home page.
        </Paragraph>
      </Wrapper>
  );
}

const Wrapper = styled.article`
  max-width: 80ch;
  margin: 8px auto 32px;
  border: 1px solid ${COLORS.accent[12]};
  padding: 8px 24px 16px 48px;
  border-radius: 8px;
  box-shadow: 2px 4px 6px ${COLORS.gray[9]};
  background-color: ${COLORS.accent[2]};
`;

const Paragraph = styled.p`
  /* spacing between all paragraphs */
  margin: 16px 0;
  /* make the prose a little more readable */
  font-family: var(--font-serif);
  text-align: justify;
  -webkit-hyphens: auto;
  hyphens: auto;
  overflow-wrap: break-word;
`;

const Title = styled.h1`
  font-size: 2rem;
`;

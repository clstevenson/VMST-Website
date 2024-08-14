import { createGlobalStyle } from "styled-components";
import { COLORS } from "./src/utils/constants";

const GlobalStyles = createGlobalStyle`
*, *::before, *::after {
  box-sizing: border-box;
}

* {
  margin: 0;
  padding: 0;
}

html, body, #root {
  height: 100%;
}

body {
  /* Typographic tweaks  */
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  width: 100%;
  background-color: ${COLORS.white};
}

/* limit content width and center it */
/* note that this is the root div element for React */
#root {
  display: grid;
  grid-template-columns: 1fr min(100%, 1600px) 1fr;
}

/* Remove built-in form typography styles */
input, button, textarea, select {
  font: inherit;
}

/* Avoid text overflows */
p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}

/* Create a root stacking context */
#root, #__next {
  isolation: isolate;
}

/* eliminate link underlines by default */
a {
  text-decoration: none;
}

:root {
  /* text shouldn't be too wide to read easily */
  --max-prose-width: 80ch;
  /* first font-stack is from Bulma, second is JWC's "system font stack" suggestion */
  --font-sans-serif: Inter, "SF Pro", "Segoe UI", Roboto, Oxygen, Ubuntu, "Helvetica Neue", Helvetica, Arial, sans-serif;
  --font-sans-serif: -apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Ubuntu, roboto, noto, arial, sans-serif;
  --font-serif: Iowan Old Style, Apple Garamond, Baskerville, Times New Roman, Droid Serif, Times, Source Serif Pro, serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;
}

html {
  font-family: var(--font-sans-serif);
  /* color of bkgd "behind" the content */
  /* background-color: hsl(267deg 25% 50% / 0.2); */
  --subheading-size: 1.4rem;  /* usually an h2 element */
  /* common box shadow */
  --main-box-shadow: 2px 4px 6px ${COLORS.gray[9]};
  /* settings for navigation links */
  --nav-border-radius: 6px 6px 0 0;
  --nav-focus-outline: 2px solid ${COLORS.accent[9]};
  --nav-focus-color: ${COLORS.accent[9]};
  /* background color associated with editable properties */
  --change-background-color: ${COLORS.accent[3]};
  /* Uncomment line below to always display scrollbar (avoiding related shift) */
  overflow: scroll;
}

/* roughly align bullet with other text */
ul, ol {
  padding-left: 1.2em;
}
`;

export default GlobalStyles;

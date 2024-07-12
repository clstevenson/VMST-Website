import { createGlobalStyle } from "styled-components";
import { COLORS } from "./src/utils/constants";

const GlobalStyles = createGlobalStyle`
*, *::before, *::after {
  box-sizing: border-box;
}

* {
  margin: 0;
}

html, body, #root {
  height: 100%;
}

body {
  /* Typographic tweaks  */
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  /* limit width (centered on wide screens) */
  max-width: 1600px;
  margin: 0 auto;
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
  /* background-color: ${COLORS.gray[100]}; */
}
`;

export default GlobalStyles;

export const COLORS = {
  white: "hsl(0deg 0% 100%)",
  offblack: "hsl(24deg 5% 6%)",
  gray: {
    100: "hsl(40deg 12% 95%)",
    300: "hsl(35deg 8% 80%)",
    500: "hsl(30deg 4% 60%)",
    700: "hsl(28deg 5% 40%)",
    900: "hsl(24deg 6% 16%)",
  },
  primary: "hsl(267deg 36% 45%)",
  primary_dark: "hsl(267deg 36% 30%)",
  primary_light: "hsl(267deg 50% 60%)",
  secondary: "hsl(60deg 80% 45%)",
  secondary_light: "hsl(60deg 100% 50% / 0.5)",
  secondary_dark: "hsl(60deg 80% 40%)",
  urgent: "hsl(0deg 75% 40%)",
};

export const WEIGHTS = {
  normal: 400,
  medium: 550,
  bold: 700,
};

export const BREAKPOINTS = {
  phoneMax: 550,
  tabletMax: 1100,
  laptopMax: 1500,
};

export const QUERIES = {
  mobile: `(max-width: ${BREAKPOINTS.phoneMax / 16}rem)`,
  tabletAndLess: `(max-width: ${BREAKPOINTS.tabletMax / 16}rem)`,
  laptopAndLess: `(max-width: ${BREAKPOINTS.laptopMax / 16}rem)`,
  tabletOnly: `
    (min-width: ${BREAKPOINTS.phoneMax / 16}rem) and
    (max-width: ${(BREAKPOINTS.tabletMax - 1) / 16}rem)`,
};

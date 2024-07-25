export const COLORS = {
  white: "hsl(0deg 0% 100%)",
  offblack: "hsl(24deg 5% 6%)",
  // backdrop overlays for modals
  overlay: "hsl(24deg 6% 16% / 0.2)",
  // color scheme based on "VMST logo purple" color
  //bkgds: 1-2, interactives: 3-5, borders: 6-8, color: 9-10, text: 11-12
  accent: {
    1: "hsl(276deg 56% 99%)",
    2: "hsl(268deg 63% 98%)",
    3: "hsl(259deg 66% 96%)",
    4: "hsl(263deg 73% 94%)",
    5: "hsl(262deg 71% 91%)",
    6: "hsl(263deg 61% 87%)",
    7: "hsl(264deg 52% 81%)",
    8: "hsl(265deg 48% 73%)",
    9: "hsl(267deg 37% 45%)",
    10: "hsl(268deg 42% 39%)",
    11: "hsl(267deg 35% 48%)",
    12: "hsl(268deg 39% 24%)",
  },
  gray: {
    1: "hsl(242deg 22% 99%)",
    2: "hsl(241deg 22% 98%)",
    3: "hsl(241deg 12% 95%)",
    4: "hsl(227deg 13% 92%)",
    5: "hsl(229deg 12% 89%)",
    6: "hsl(229deg 10% 86%)",
    7: "hsl(233deg 11% 82%)",
    8: "hsl(229deg 10% 75%)",
    9: "hsl(234deg 6% 57%)",
    10: "hsl(234deg 5% 53%)",
    11: "hsl(233deg 5% 41%)",
    12: "hsl(229deg 10% 13%)",
  },
  // yellow highlighting
  secondary: "hsl(60deg 80% 45%)",
  secondary_light: "hsl(60deg 100% 50% / 0.5)",
  secondary_dark: "hsl(60deg 80% 40%)",
  // error/attention needed
  urgent_text: "hsl(351deg 63% 24%)",
  urgent: "hsl(358deg 75% 59%)",
  urgent_light: "hsl(359deg 92% 96%)",
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

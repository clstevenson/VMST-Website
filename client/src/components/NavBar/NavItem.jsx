/*
 * NavItem is for rendering/styling individual navigation links (using React Router)
 * It is used by the NavBar component
 */

import styled from "styled-components";
import { useLocation } from "react-router-dom";
import * as Tooltip from "@radix-ui/react-tooltip";

import { LinkButton, NavLink } from "./LinkButton";
import { COLORS, QUERIES } from "../../utils/constants";

// TODO passing isCurrent as a prop causes warnings/errors; fix that
export function NavItem({ href, label, icon: Icon }) {
  // get the current page so we know which link to highlight
  const currentPage = useLocation().pathname;
  return (
    <Tooltip.Root>
      <TooltipTrigger tabIndex={-1}>
        <li>
          <NavLink to={href}>
            <LinkButton isCurrent={href === currentPage} tabIndex={-1}>
              <Icon />
              <LabelWrapper>{label}</LabelWrapper>
            </LinkButton>
          </NavLink>
        </li>
        <TooltipContent>{label}</TooltipContent>
      </TooltipTrigger>
    </Tooltip.Root>
  );
};

///////////////////////////////////////////////////////////////////////////////
//                             Styled Components                             //
///////////////////////////////////////////////////////////////////////////////

// For the tooltips (on smaller screens) using Radix Tooltip primitive
const TooltipTrigger = styled(Tooltip.Trigger)`
  background-color: transparent;
  border: none;
  padding: 0;
`;

export const TooltipContent = styled(Tooltip.Content)`
  display: none;
  background-color: ${COLORS.accent[1]};

  @media ${QUERIES.tabletAndLess} {
    display: revert;
  }
`;

// Text next to nav icons disappears on smaller screens
const LabelWrapper = styled.span`
  @media ${QUERIES.tabletAndLess} {
    display: none;
  }
`;

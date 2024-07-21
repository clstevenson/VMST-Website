/* eslint-disable react/prop-types */
/*
 * NavItem is for rendering/styling individual navigation links (using React Router)
 * It is used by the NavBar component
 */

import styled from "styled-components";
import * as Tooltip from "@radix-ui/react-tooltip";

import { LinkTab, NavLink } from "./LinkTab";
import { COLORS, QUERIES } from "../../utils/constants";

export function NavItem({ href, label, icon: Icon }) {
  return (
    <Tooltip.Root>
      <TooltipTrigger role="link" tabIndex={-1}>
        <li>
          <NavLink to={href}>
            <LinkTab href={href} tabIndex={-1}>
              <Icon />
              <LabelWrapper>{label}</LabelWrapper>
            </LinkTab>
          </NavLink>
        </li>
        <TooltipContent>{label}</TooltipContent>
      </TooltipTrigger>
    </Tooltip.Root>
  );
}

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

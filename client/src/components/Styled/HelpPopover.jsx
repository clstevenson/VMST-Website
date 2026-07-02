import styled from "styled-components";
import * as Popover from "@radix-ui/react-popover";
import { HelpCircle } from "react-feather";
import { COLORS } from "../../utils/constants";

// A small "?" icon that opens a popover with supplementary info, for use
// next to a label/heading that could use a bit more explanation.
export default function HelpPopover({ label, children }) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <HelpIconButton type="button" aria-label={label}>
          <HelpCircle size={16} />
        </HelpIconButton>
      </Popover.Trigger>
      <Popover.Portal>
        <HelpPopoverContent sideOffset={5}>
          {children}
          <Popover.Arrow />
        </HelpPopoverContent>
      </Popover.Portal>
    </Popover.Root>
  );
}

const HelpIconButton = styled.button`
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
  color: ${COLORS.accent[11]};
  cursor: pointer;
`;

const HelpPopoverContent = styled(Popover.Content)`
  max-width: 280px;
  padding: 12px 16px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px hsl(0deg 0% 0% / 0.2);
  font-size: 0.875rem;

  ol {
    padding-left: 1.25em;
    margin: 8px 0 0;
  }
`;

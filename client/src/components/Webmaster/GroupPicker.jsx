import { forwardRef, useState, useEffect } from "react";
import styled from "styled-components";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import { Check } from "react-feather";

import * as ModalStyles from "../Styled/ModalStyles";
import SubmitButton from "../Styled/SubmiButton";
import { COLORS } from "../../utils/constants";

// forces a non-blank group choice when the webmaster assigns the coach
// role: any dismissal (Cancel, Escape, click-outside) is treated the same
// way by the caller -- reverting the pending role change
export default function GroupPicker({
  open,
  groups,
  initialValue = "",
  onConfirm,
  onCancel,
}) {
  const [selected, setSelected] = useState(initialValue);

  // re-sync if a different row's picker opens while this instance is reused
  useEffect(() => {
    if (open) setSelected(initialValue);
  }, [open, initialValue]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel();
      }}
    >
      <Dialog.Portal>
        <ModalStyles.DialogOverlay />
        <ModalStyles.DialogContent aria-describedby="group-picker-description">
          <ModalStyles.DialogTitle>Choose a Workout Group</ModalStyles.DialogTitle>
          <Dialog.Description id="group-picker-description">
            A coach must be assigned either a specific workout group, or
            &quot;VMST&quot; for a coach with access to all members (like a
            leader).
          </Dialog.Description>

          <Select.Root value={selected} onValueChange={setSelected}>
            <SelectTrigger aria-label="workout group">
              <Select.Value placeholder="Select a group..." />
            </SelectTrigger>
            <SelectContent position="popper" align="center">
              <Select.Viewport>
                <SelectItem value="VMST">VMST (all members)</SelectItem>
                {groups.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </Select.Viewport>
            </SelectContent>
          </Select.Root>

          <ModalStyles.DialogButtonWrapper>
            <ModalStyles.CloseButton type="button" onClick={onCancel}>
              Cancel
            </ModalStyles.CloseButton>
            <ConfirmButton
              type="button"
              disabled={!selected}
              onClick={() => onConfirm(selected)}
            >
              Confirm
            </ConfirmButton>
          </ModalStyles.DialogButtonWrapper>
        </ModalStyles.DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// eslint-disable-next-line react/display-name
const SelectItem = forwardRef(({ children, ...props }, forwardedRef) => {
  return (
    <StyledItem {...props} ref={forwardedRef}>
      <Select.ItemIndicator>
        <Check size={14} />
      </Select.ItemIndicator>
      <Select.ItemText>{children}</Select.ItemText>
    </StyledItem>
  );
});

const StyledItem = styled(Select.Item)`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  &[data-highlighted] {
    background-color: ${COLORS.accent[5]};
    outline: none;
  }
`;

const SelectTrigger = styled(Select.Trigger)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 6px 12px;
  border: 1px solid ${COLORS.gray[8]};
  border-radius: 4px;
  background-color: ${COLORS.accent[2]};

  &:hover {
    cursor: pointer;
    background-color: ${COLORS.accent[5]};
  }
`;

const SelectContent = styled(Select.Content)`
  background-color: white;
  border-radius: 4px;
  border: 1px solid ${COLORS.accent[12]};
  box-shadow: 2px 4px 8px black;
  cursor: pointer;
  width: var(--radix-select-trigger-width);
`;

const ConfirmButton = styled(SubmitButton)`
  padding: 4px 16px;

  &:disabled {
    background-color: ${COLORS.gray[10]};
    border: none;
    cursor: not-allowed;
  }
`;

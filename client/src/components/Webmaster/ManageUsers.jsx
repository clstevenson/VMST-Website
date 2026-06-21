import { forwardRef, useState } from "react";
import styled from "styled-components";
import * as Select from "@radix-ui/react-select";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { Check, Trash2 } from "react-feather";

import { useAuth } from "../../context/AuthContext";
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_USERS, QUERY_GROUPS } from "../../utils/queries";
import { EDIT_USER, DELETE_USER } from "../../utils/mutations";
import { COLORS, QUERIES, WEIGHTS } from "../../utils/constants";
import usePendingChanges from "../../utils/usePendingChanges";
import Table from "../Styled/Table";
import SubmitButton from "../Styled/SubmiButton";
import { CheckboxRoot, CheckboxIndicator } from "../Styled/Checkbox";
import Alert from "../Alert";
import ToastMessage from "../ToastMessage";
import GroupPicker from "./GroupPicker";

const ROLES = ["user", "leader", "coach", "membership", "webmaster"];
const STATUSES = ["active", "silent", "banned"];

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export default function ManageUsers() {
  const { user } = useAuth();
  // state representing the DB (the full, unfiltered user list)
  const [currentUsers, setCurrentUsers] = useState([]);
  // state representing what is actually displayed in the table (may be a
  // filtered subset of currentUsers)
  const [display, setDisplay] = useState([]);
  // states for filtering the users table
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  // accountStatus values, OR'd together, then AND'd with the text filters
  const [quickFilters, setQuickFilters] = useState([]);

  // unsaved edits, keyed by "userId:field", flushed together by the Save
  // Changes button rather than writing the DB on every click
  const { pendingChanges, setChange, discard, clearChanges, isChanged } =
    usePendingChanges();
  const [editUser] = useMutation(EDIT_USER);
  const [deleteUserMutation] = useMutation(DELETE_USER);
  const [savedChanges, setSavedChanges] = useState(false);
  // which row (if any) currently has its delete confirmation open
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  // which row (if any) currently has the coach-group picker open, and
  // whether confirming it should also apply role: "coach" (true when
  // opened by switching the Role dropdown to Coach; false when opened by
  // clicking an existing coach's Group cell to reassign it)
  const [groupPickerFor, setGroupPickerFor] = useState(null);
  const [groups, setGroups] = useState([]);

  useQuery(QUERY_USERS, {
    onCompleted: (data) => {
      setCurrentUsers(data.users);
      setDisplay(data.users);
    },
  });

  useQuery(QUERY_GROUPS, {
    // some VMST members aren't assigned to a WO group; filter that blank
    // entry out so it can't be mistaken for a real, selectable group
    onCompleted: (data) => setGroups(data.groups.filter(Boolean)),
  });

  // case-insensitive recompute of display from every current filter
  // criterion. Accepts overrides for whichever field just changed, since the
  // corresponding setState call hasn't landed yet when this runs in the same
  // handler.
  const applyFilters = (overrides = {}) => {
    const nameTerm = (overrides.name ?? name).toLowerCase();
    const emailTerm = (overrides.email ?? email).toLowerCase();
    const roleTerm = (overrides.role ?? role).toLowerCase();
    const activeQuickFilters = overrides.quickFilters ?? quickFilters;

    const filtered = currentUsers.filter((u) => {
      const fullName = `${u.firstName}${u.lastName}`.toLowerCase();
      if (!fullName.includes(nameTerm)) return false;
      if (!u.email.toLowerCase().includes(emailTerm)) return false;
      if (!u.role.toLowerCase().includes(roleTerm)) return false;
      if (
        activeQuickFilters.length > 0 &&
        !activeQuickFilters.includes(u.accountStatus)
      )
        return false;

      return true;
    });

    setDisplay(filtered);
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    applyFilters({ name: value });
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    applyFilters({ email: value });
  };

  const handleRoleChange = (e) => {
    const value = e.target.value;
    setRole(value);
    applyFilters({ role: value });
  };

  const handleQuickFiltersChange = (value) => {
    setQuickFilters(value);
    applyFilters({ quickFilters: value });
  };

  // update a single field locally (queued for the Save Changes button);
  // updates currentUsers and display in parallel so a later filter change
  // doesn't re-derive display from a stale currentUsers and silently drop
  // the unsaved edit
  const updateField = (userId, field, value) => {
    const applyUpdate = (list) =>
      list.map((u) => (u._id === userId ? { ...u, [field]: value } : u));
    setCurrentUsers(applyUpdate);
    setDisplay(applyUpdate);

    const current = currentUsers.find((u) => u._id === userId)?.[field];
    setChange(`${userId}:${field}`, current, value, { userId, field });
  };

  // a coach must always have a non-blank group (a specific WO group, or
  // "VMST" for a coach with full access like a leader) -- so switching the
  // Role dropdown to Coach opens a forced picker instead of applying the
  // role change immediately. Leaving Coach for any other role clears group
  // back to "" right away, no picker needed.
  const handleRoleSelectChange = (targetUser, newRole) => {
    if (newRole === "coach" && targetUser.role !== "coach") {
      setGroupPickerFor({ userId: targetUser._id, alsoSetRole: true });
      return;
    }
    if (targetUser.role === "coach" && newRole !== "coach") {
      updateField(targetUser._id, "group", "");
    }
    updateField(targetUser._id, "role", newRole);
  };

  const handleGroupPickConfirm = (selectedGroup) => {
    const { userId, alsoSetRole } = groupPickerFor;
    if (alsoSetRole) updateField(userId, "role", "coach");
    updateField(userId, "group", selectedGroup);
    setGroupPickerFor(null);
  };

  const handleSaveChanges = async () => {
    // group pending field-level changes back into one UserData object per
    // user, since editUser updates a whole document at a time
    const byUser = {};
    for (const { userId, field, value } of Object.values(pendingChanges)) {
      byUser[userId] = { ...byUser[userId], [field]: value };
    }
    const ids = Object.keys(byUser);
    if (ids.length === 0) return;
    await Promise.all(
      ids.map((id) => editUser({ variables: { id, user: byUser[id] } })),
    );
    clearChanges();
    setSavedChanges(true);
  };

  // discard unsaved edits, reverting currentUsers/display to the
  // DB-persisted values recorded when each pending edit started
  const handleClearChanges = () => {
    const revert = (list) =>
      list.map((u) => {
        const userPending = Object.values(pendingChanges).filter(
          (change) => change.userId === u._id,
        );
        if (userPending.length === 0) return u;
        const reverted = { ...u };
        userPending.forEach((change) => {
          reverted[change.field] = change.original;
        });
        return reverted;
      });
    setCurrentUsers(revert);
    setDisplay(revert);
    clearChanges();
  };

  const handleDeleteUser = async (userId) => {
    await deleteUserMutation({ variables: { id: userId } });
    setCurrentUsers((prev) => prev.filter((u) => u._id !== userId));
    setDisplay((prev) => prev.filter((u) => u._id !== userId));
    discard((change) => change.userId === userId);
  };

  // a group edit paired with a role edit for the same user (eg switching to
  // or from coach) is one logical change, not two -- don't double-count it
  // in the Save Changes button. A group edit with no paired role change
  // (reassigning an existing coach's group on its own) still counts.
  const pendingCount = Object.values(pendingChanges).filter((change) => {
    if (change.field !== "group") return true;
    return !(`${change.userId}:role` in pendingChanges);
  }).length;

  // only the webmaster has access to this page
  if (user?.role !== "webmaster") {
    throw new Error("Not authorized to view this page");
  }

  return (
    <Wrapper>
      <p>
        As webmaster, your main responsibility is to manage the accounts of
        registered users and to respond to questions from members and visitors.
        From this page you can:
      </p>
      <ul>
        <li>
          Change a user&apos;s role. This should be done in consultation with
          VMST leaders.
        </li>
        <li>
          Change a user&apos;s account status (active, silent, or banned).
          Silent users can no longer comment while banned users can no longer
          log into their account, and the email associated with the account can
          no longer be used.
        </li>
        <li>
          Update a user&apos;s communication preferences (VMST emails, post
          notifications).
        </li>
        <li>
          Delete a user&apos;s account, which removes it from the database. An
          account with the same email can be re-created by a user.
        </li>
      </ul>

      <form>
        <SearchWrapper>
          <InputWrapper>
            <label htmlFor="name">Search by name: </label>
            <input
              type="text"
              id="name"
              placeholder="First or Last Name"
              value={name}
              onChange={handleNameChange}
            ></input>
          </InputWrapper>

          <InputWrapper>
            <label htmlFor="email">Search by email: </label>
            <input
              id="email"
              type="text"
              placeholder="Email address"
              value={email}
              onChange={handleEmailChange}
            ></input>
          </InputWrapper>

          <InputWrapper>
            <label htmlFor="role">Search by role: </label>
            <input
              id="role"
              type="text"
              placeholder="Role"
              value={role}
              onChange={handleRoleChange}
            ></input>
          </InputWrapper>

          <ClearSearchButton
            onClick={(evt) => {
              evt.preventDefault();
              setName("");
              setEmail("");
              setRole("");
              setQuickFilters([]);
              setDisplay(currentUsers);
            }}
          >
            Clear All
          </ClearSearchButton>
        </SearchWrapper>

        <QuickFilterRow>
          <QuickFilterGroup
            type="multiple"
            value={quickFilters}
            onValueChange={handleQuickFiltersChange}
            aria-label="account status filters"
          >
            <QuickFilterItem value="active">Active</QuickFilterItem>
            <QuickFilterItem value="silent">Silent</QuickFilterItem>
            <QuickFilterItem value="banned">Banned</QuickFilterItem>
          </QuickFilterGroup>
        </QuickFilterRow>
      </form>

      <SaveChangesRow>
        {pendingCount > 0 && (
          <>
            <SaveChangesButton onClick={handleSaveChanges}>
              Save Changes ({pendingCount})
            </SaveChangesButton>
            <ClearSearchButton onClick={handleClearChanges}>
              Clear Changes
            </ClearSearchButton>
          </>
        )}
      </SaveChangesRow>

      <TableScroll>
        <Table>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
              <th scope="col">Group</th>
              <th scope="col">Receive emails?</th>
              <th scope="col">Post notification</th>
              <th scope="col">Status</th>
              <th scope="col">Delete</th>
            </tr>
          </thead>
          <tbody>
            {display.map((u) => (
              <tr key={u._id}>
                <th scope="row">
                  {u.firstName} {u.lastName}
                </th>
                <td>{u.email}</td>
                <td>
                  <EditableSelect
                    value={u.role}
                    options={ROLES}
                    onValueChange={(val) => handleRoleSelectChange(u, val)}
                    $changed={isChanged(`${u._id}:role`)}
                  />
                </td>
                <td>
                  {u.role === "coach" ? (
                    <GroupButton
                      type="button"
                      $changed={isChanged(`${u._id}:group`)}
                      onClick={() =>
                        setGroupPickerFor({
                          userId: u._id,
                          alsoSetRole: false,
                        })
                      }
                    >
                      {u.group || "(choose group)"}
                    </GroupButton>
                  ) : (
                    <NoGroup>&mdash;</NoGroup>
                  )}
                </td>
                <td style={{ textAlign: "center" }}>
                  <UserCheckbox
                    checked={u.emailPermission}
                    onCheckedChange={(checked) =>
                      updateField(u._id, "emailPermission", checked)
                    }
                    $changed={isChanged(`${u._id}:emailPermission`)}
                    aria-label="receives VMST emails"
                  >
                    <CheckboxIndicator>
                      <Check strokeWidth={3} />
                    </CheckboxIndicator>
                  </UserCheckbox>
                </td>
                <td style={{ textAlign: "center" }}>
                  <UserCheckbox
                    checked={u.notifications}
                    onCheckedChange={(checked) =>
                      updateField(u._id, "notifications", checked)
                    }
                    $changed={isChanged(`${u._id}:notifications`)}
                    aria-label="receives post notifications"
                  >
                    <CheckboxIndicator>
                      <Check strokeWidth={3} />
                    </CheckboxIndicator>
                  </UserCheckbox>
                </td>
                <td>
                  <EditableSelect
                    value={u.accountStatus}
                    options={STATUSES}
                    onValueChange={(val) =>
                      updateField(u._id, "accountStatus", val)
                    }
                    $changed={isChanged(`${u._id}:accountStatus`)}
                  />
                </td>
                <td style={{ textAlign: "center" }}>
                  <Alert
                    title="Delete User"
                    description={`Are you sure you want to permanently delete the account for ${u.firstName} ${u.lastName} (${u.email})? This cannot be undone.`}
                    actionText="Delete"
                    open={confirmDeleteId === u._id}
                    onOpenChange={(open) =>
                      setConfirmDeleteId(open ? u._id : null)
                    }
                    cancelAction={() => setConfirmDeleteId(null)}
                    confirmAction={() => {
                      setConfirmDeleteId(null);
                      handleDeleteUser(u._id);
                    }}
                  >
                    <DeleteButton type="button" aria-label="delete user">
                      <Trash2 size={18} />
                    </DeleteButton>
                  </Alert>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableScroll>

      <GroupPicker
        open={groupPickerFor !== null}
        groups={groups}
        initialValue={
          display.find((u) => u._id === groupPickerFor?.userId)?.group ?? ""
        }
        onConfirm={handleGroupPickConfirm}
        onCancel={() => setGroupPickerFor(null)}
      />

      {savedChanges && (
        <ToastMessage toastCloseEffect={() => setSavedChanges(false)}>
          User account changes saved!
        </ToastMessage>
      )}
    </Wrapper>
  );
}

// editable Select showing the current value, with an onValueChange handler
// and an optional $changed flag (red border) for an unsaved local edit
function EditableSelect({ value, options, onValueChange, $changed }) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <SelectTrigger aria-label="current value" $changed={$changed} asChild>
        <button>{capitalize(value)}</button>
      </SelectTrigger>
      <SelectContent position="popper" align="start">
        <Select.Viewport>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {capitalize(opt)}
            </SelectItem>
          ))}
        </Select.Viewport>
      </SelectContent>
    </Select.Root>
  );
}

// eslint-disable-next-line react/display-name
const SelectItem = forwardRef(({ children, ...props }, forwardedRef) => {
  return (
    <StyledItem {...props} ref={forwardedRef}>
      <Select.ItemText>{children}</Select.ItemText>
    </StyledItem>
  );
});

const StyledItem = styled(Select.Item)`
  padding: 4px 8px;
  text-align: center;
  &[data-highlighted] {
    background-color: ${COLORS.accent[5]};
    outline: none;
  }
`;

const SelectTrigger = styled(Select.Trigger)`
  width: fit-content;
  /* border is always 2px (transparent unless changed) so the trigger
     doesn't resize when the "changed" indicator appears */
  padding: 1px 8px;
  border: 2px solid transparent;
  border-radius: 4px;

  &:hover {
    cursor: pointer;
    background-color: ${COLORS.accent[5]};
  }

  ${({ $changed }) => $changed && `border-color: ${COLORS.urgent};`}
`;

const SelectContent = styled(Select.Content)`
  background-color: white;
  border-radius: 4px;
  border: 1px solid ${COLORS.accent[12]};
  box-shadow: 2px 4px 8px black;
  cursor: pointer;
  width: max-content;
`;

const Wrapper = styled.div`
  width: min(1200px, 100%);
  padding: 16px;
  margin: 0 auto;
`;

const SearchWrapper = styled.div`
  padding: 12px 4px;
  display: flex;
  gap: 2px;
  width: 100%;
  align-items: flex-end;

  @media ${QUERIES.mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;

  @media ${QUERIES.mobile} {
    width: 100%;
  }

  & input {
    border: 1px solid ${COLORS.gray[8]};
    background-color: ${COLORS.accent[2]};
    padding: 4px;
  }
`;

const ClearSearchButton = styled.button`
  border: 1px solid ${COLORS.accent[12]};
  box-shadow: 1px 2px 4px ${COLORS.gray[10]};
  border-radius: 4px;
  min-width: 44px;
  height: fit-content;
  padding: 4px 12px;
  background-color: ${COLORS.accent[3]};
  margin-left: 4px;
  font-weight: ${WEIGHTS.medium};

  @media ${QUERIES.mobile} {
    width: fit-content;
    min-height: 44px;
    margin-left: 0;
  }
`;

const QuickFilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
`;

const QuickFilterGroup = styled(ToggleGroup.Root)`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px;
`;

const QuickFilterItem = styled(ToggleGroup.Item)`
  border: 1px solid ${COLORS.accent[12]};
  border-radius: 999px;
  min-height: 36px;
  padding: 4px 14px;
  background-color: ${COLORS.accent[2]};
  font-weight: ${WEIGHTS.medium};

  &[data-state="on"] {
    background-color: ${COLORS.accent[9]};
    color: white;
  }

  &:hover {
    cursor: pointer;
    background-color: ${COLORS.accent[5]};
  }

  &[data-state="on"]:hover {
    background-color: ${COLORS.accent[10]};
  }
`;

const SaveChangesRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
  /* reserve the buttons' height even when empty, so the table below doesn't
     jump when they appear */
  min-height: 44px;
`;

const SaveChangesButton = styled(SubmitButton)`
  display: inline-block;
  padding: 4px 16px;
  box-shadow: 1px 2px 4px ${COLORS.gray[10]};
`;

const TableScroll = styled.div`
  width: 100%;
  min-width: 0;
  overflow-x: auto;
  contain: layout;
`;

const UserCheckbox = styled(CheckboxRoot)`
  width: 22px;
  height: 22px;
  flex: 0 0 auto;

  ${({ $changed }) =>
    $changed &&
    `
    border-color: ${COLORS.urgent};
    border-width: 4px;
  `}
`;

const GroupButton = styled.button`
  /* border is always 2px (transparent unless changed) so the button
     doesn't resize when the "changed" indicator appears */
  border: 2px solid transparent;
  border-radius: 4px;
  padding: 1px 8px;
  background-color: transparent;

  &:hover {
    cursor: pointer;
    background-color: ${COLORS.accent[5]};
  }

  ${({ $changed }) => $changed && `border-color: ${COLORS.urgent};`}
`;

const NoGroup = styled.span`
  color: ${COLORS.gray[8]};
  padding: 1px 8px;
`;

const DeleteButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${COLORS.accent[12]};
  box-shadow: 1px 2px 4px ${COLORS.gray[10]};
  border-radius: 4px;
  padding: 4px;

  &:hover {
    cursor: pointer;
    background-color: ${COLORS.accent[5]};
    color: ${COLORS.urgent};
  }
`;

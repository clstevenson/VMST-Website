import { forwardRef, useState } from "react";
import styled from "styled-components";
import * as Select from "@radix-ui/react-select";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { Check, Trash2 } from "react-feather";

import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@apollo/client";
import { QUERY_USERS } from "../../utils/queries";
import { COLORS, QUERIES, WEIGHTS } from "../../utils/constants";
import Table from "../Styled/Table";
import { CheckboxRoot, CheckboxIndicator } from "../Styled/Checkbox";

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

  useQuery(QUERY_USERS, {
    onCompleted: (data) => {
      setCurrentUsers(data.users);
      setDisplay(data.users);
    },
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

      <TableScroll>
        <Table>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
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
                  <DropdownDisplay value={u.role} options={ROLES} />
                </td>
                <td style={{ textAlign: "center" }}>
                  <UserCheckbox
                    checked={u.emailPermission}
                    disabled
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
                    disabled
                    aria-label="receives post notifications"
                  >
                    <CheckboxIndicator>
                      <Check strokeWidth={3} />
                    </CheckboxIndicator>
                  </UserCheckbox>
                </td>
                <td>
                  <DropdownDisplay value={u.accountStatus} options={STATUSES} />
                </td>
                <td style={{ textAlign: "center" }}>
                  <DeleteButton type="button" aria-label="delete user">
                    <Trash2 size={18} />
                  </DeleteButton>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableScroll>
    </Wrapper>
  );
}

// a disabled Select showing the current value -- chrome only for now, ready
// to be wired up (onValueChange, disabled removed) in a later task
function DropdownDisplay({ value, options }) {
  return (
    <Select.Root value={value} disabled>
      <SelectTrigger aria-label="current value" asChild>
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
  padding: 1px 8px;

  &[data-disabled] {
    cursor: not-allowed;
    color: ${COLORS.gray[9]};
  }
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

import styled from "styled-components";
import Auth from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Separator from "@radix-ui/react-separator";

import { COLORS, WEIGHTS } from "../utils/constants.js";
import User from "../components/User";
import UploadMembers from "../components/UploadMembers.jsx";
import Communication from "../components/Communication.jsx";

export default function Account() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("user");

  // if not logged in, redirect to home page
  useEffect(() => {
    if (!Auth.loggedIn()) {
      navigate("/");
    }
  }, [navigate]);

  const { data: userProfile } = Auth.getProfile();

  // early return: if basic user, don't show tabs
  if (userProfile.role === "user") return <User />;

  // other roles have tabs (ie more things they can do)
  return (
    <TabsRoot defaultValue="user" value={tab} onValueChange={setTab}>
      <TabsList aria-label="Account page">
        <TabsTrigger value="user">User Settings</TabsTrigger>
        {userProfile.role === "membership" && (
          <TabsTrigger value="membership">Update Membership</TabsTrigger>
        )}
        {(userProfile.role === "leader" || userProfile.role === "coach") && (
          <TabsTrigger value="email">Communication</TabsTrigger>
        )}
        {userProfile.role === "leader" && (
          <TabsTrigger value="meets">Meets</TabsTrigger>
        )}
        {userProfile.role === "webmaster" && (
          <TabsTrigger value="webmaster">Website Mgmt</TabsTrigger>
        )}
      </TabsList>
      <Tabs.Content value="user" asChild>
        <User />
      </Tabs.Content>
      <Tabs.Content value="membership">
        <UploadMembers />
      </Tabs.Content>
      <Tabs.Content value="email">
        <Communication setTab={setTab} />
      </Tabs.Content>
      <Tabs.Content value="meets">
        <p>Upcoming capabilities for this page:</p>
        <ul>
          <li>upload/manage competitors for a specific meet</li>
          <li>manage competitions (eg delete meet after no longer needed)</li>
          <li>construct relays</li>
          <li>post relays to home page</li>
        </ul>
      </Tabs.Content>
      <Tabs.Content value="webmaster"></Tabs.Content>
    </TabsRoot>
  );
}

const TabsRoot = styled(Tabs.Root)`
  width: min(1400px, 100%);
  margin: 8px auto;
  border: 1px solid ${COLORS.accent[12]};
  border-radius: 8px;
  padding: 16px;
`;

const TabsList = styled(Tabs.List)`
  border-bottom: 1px solid ${COLORS.accent[12]};
`;

const TabsTrigger = styled(Tabs.Trigger)`
  all: unset;
  font-family: inherit;
  font-size: 1.05rem;
  padding: 4px 20px;
  border: 1px solid ${COLORS.gray[9]};
  border-bottom: none;
  border-radius: var(--nav-border-radius);

  &:hover {
    cursor: pointer;
    outline: var(--nav-focus-outline);
    background-color: ${COLORS.accent[2]};
  }

  &[data-state="active"] {
    background-color: ${COLORS.secondary_light};
    font-weight: ${WEIGHTS.medium};
  }
`;

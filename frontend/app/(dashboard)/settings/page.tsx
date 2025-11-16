"use client";

import React from "react";
import { SettingsTabs } from "@/components/settings/SettingsTabs";
import { UsersTab } from "@/components/settings/UsersTab";
import { AgencyTab } from "@/components/settings/AgencyTab";
import { useAuthStore } from "@/lib/store";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const role = user?.role ?? "agent";
  const canManageUsers = role === "agency_admin" || role === "admin";
  const canManageBilling = role === "agency_admin";

  return (
    <div>
      <h2 style={{ margin: "0 0 16px" }}>Settings</h2>
      <SettingsTabs
        canManageUsers={canManageUsers}
        canManageBilling={canManageBilling}
        childrenByKey={{
          profile: <div>Profile settings</div>,
          organization: <AgencyTab />,
          branding: <div>Branding settings</div>,
          security: <div>Security settings</div>,
          users: canManageUsers ? <UsersTab /> : null,
          integrations: <div>Integrations</div>,
          notifications: <div>Notifications</div>,
          billing: canManageBilling ? <div>Billing</div> : null,
        }}
      />
    </div>
  );
}


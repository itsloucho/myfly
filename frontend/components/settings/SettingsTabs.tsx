import React, { useMemo, useState } from "react";

type TabKey =
  | "profile"
  | "organization"
  | "branding"
  | "security"
  | "users"
  | "integrations"
  | "notifications"
  | "billing";

export function SettingsTabs({
  canManageUsers,
  canManageBilling,
  childrenByKey,
  initial = "profile",
}: {
  canManageUsers: boolean;
  canManageBilling: boolean;
  childrenByKey: Partial<Record<TabKey, React.ReactNode>>;
  initial?: TabKey;
}) {
  const allTabs: { key: TabKey; label: string; visible: boolean }[] = useMemo(
    () => [
      { key: "profile", label: "My Profile", visible: true },
      { key: "organization", label: "Agency", visible: true },
      { key: "branding", label: "Branding", visible: true },
      { key: "security", label: "Security", visible: true },
      { key: "users", label: "Users", visible: canManageUsers },
      { key: "integrations", label: "Integrations", visible: true },
      { key: "notifications", label: "Notifications", visible: true },
      { key: "billing", label: "Billing", visible: canManageBilling },
    ],
    [canManageUsers, canManageBilling]
  );

  const visibleTabs = allTabs.filter((t) => t.visible);
  const [active, setActive] = useState<TabKey>(
    visibleTabs.some((t) => t.key === initial) ? initial : visibleTabs[0].key
  );

  return (
    <div>
      <div className="tabs-row" role="tablist" aria-label="Settings">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active === tab.key}
            onClick={() => setActive(tab.key)}
            className={`tab ${active === tab.key ? "active" : ""}`}
            style={{ cursor: "pointer" }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-panel" role="tabpanel">
        {childrenByKey[active] ?? null}
      </div>
      <style jsx>{`
        .tabs-row {
          display: flex;
          gap: 12px;
          border-bottom: 1px solid var(--border, #e5e7eb);
          margin-bottom: 16px;
        }
        .tab {
          padding: 8px 12px;
          border-radius: 6px 6px 0 0;
          background: transparent;
          border: 0;
        }
        .tab.active {
          background: var(--bgElevated, #fff);
          border: 1px solid var(--border, #e5e7eb);
          border-bottom-color: transparent;
        }
        .tab-panel {
          padding: 16px;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 0 6px 6px 6px;
          background: var(--bgElevated, #fff);
        }
      `}</style>
    </div>
  );
}



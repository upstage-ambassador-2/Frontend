"use client";

import { SettingsScreen } from "@/components/screens";
import { useMello } from "@/components/MelloShell";

export function SettingsRoute() {
  const { me, handleLogout, showToast } = useMello();
  return (
    <SettingsScreen
      me={me}
      onLogout={() => void handleLogout()}
      onToast={showToast}
    />
  );
}

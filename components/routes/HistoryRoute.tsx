"use client";

import { HistoryScreen } from "@/components/screens";
import { useMello } from "@/components/MelloShell";

export function HistoryRoute() {
  const { history, personas, removeHistory, showToast } = useMello();
  return (
    <HistoryScreen
      history={history}
      personas={personas}
      onDeleted={removeHistory}
      onToast={showToast}
    />
  );
}

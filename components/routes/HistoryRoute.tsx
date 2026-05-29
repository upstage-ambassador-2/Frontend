"use client";

import { HistoryScreen } from "@/components/screens";
import { useMello } from "@/components/MelloShell";

export function HistoryRoute() {
  const { history, personas, removeHistory, showToast, initialLoadErrors } =
    useMello();
  return (
    <HistoryScreen
      history={history}
      personas={personas}
      loadError={initialLoadErrors.history}
      onDeleted={removeHistory}
      onToast={showToast}
    />
  );
}

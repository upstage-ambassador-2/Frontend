"use client";

import { HistoryScreen } from "@/components/screens";
import { useMello } from "@/components/MelloShell";

export function HistoryRoute() {
  const { history, personas } = useMello();
  return <HistoryScreen history={history} personas={personas} />;
}

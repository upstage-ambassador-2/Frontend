"use client";

import { InboxScreen } from "@/components/screens";
import { useMello } from "@/components/MelloShell";

export function InboxRoute() {
  const { handleReply, showToast } = useMello();
  return <InboxScreen onReply={handleReply} onToast={showToast} />;
}

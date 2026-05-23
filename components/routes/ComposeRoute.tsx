"use client";

import { ComposerScreen } from "@/components/ComposerScreen";
import { useMello } from "@/components/MelloShell";

export function ComposeRoute() {
  const mello = useMello();
  return (
    <ComposerScreen
      personas={mello.personas}
      format={mello.format}
      onToast={mello.showToast}
      selectedId={mello.selectedId}
      setSelectedId={mello.setSelectedId}
      tone={mello.tone}
      setTone={mello.setTone}
      length={mello.length}
      setLength={mello.setLength}
      brief={mello.brief}
      setBrief={mello.setBrief}
      replyContext={mello.replyContext}
      onClearReplyContext={mello.clearReplyContext}
      onHistoryCreated={mello.replaceHistory}
      onHistoryUpdated={mello.replaceHistory}
    />
  );
}

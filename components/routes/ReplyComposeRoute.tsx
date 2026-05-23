"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ComposerScreen } from "@/components/ComposerScreen";
import { useMello } from "@/components/MelloShell";
import type { ReplyContext } from "@/lib/api";
import { composeHref } from "@/lib/routes";

type Props = {
  initialReplyContext: ReplyContext;
};

export function ReplyComposeRoute({ initialReplyContext }: Props) {
  const router = useRouter();
  const mello = useMello();
  const [brief, setBrief] = useState("");
  const [replyContext, setReplyContext] = useState<ReplyContext | null>(
    initialReplyContext,
  );

  const clearReplyContext = () => {
    setReplyContext(null);
    if (mello.selectedId) {
      router.push(composeHref(mello.selectedId));
    }
  };

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
      brief={brief}
      setBrief={setBrief}
      replyContext={replyContext}
      onClearReplyContext={clearReplyContext}
      onHistoryCreated={mello.replaceHistory}
      onHistoryUpdated={mello.replaceHistory}
    />
  );
}

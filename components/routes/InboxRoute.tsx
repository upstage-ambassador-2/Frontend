"use client";

import { InboxScreen } from "@/components/screens";
import { useMello } from "@/components/MelloShell";
import type { GmailMessage } from "@/lib/api";
import { composeHref } from "@/lib/routes";

type Props = {
  initialMessages: GmailMessage[];
  initialError: string | null;
};

export function InboxRoute({ initialMessages, initialError }: Props) {
  const { personas, selectedId } = useMello();

  const replyHrefForMessage = (message: GmailMessage) => {
    const senderEmail =
      message.fromAddr.match(/<([^>]+)>/)?.[1] ?? message.fromAddr.trim();
    const matched = personas.find((persona) => persona.email === senderEmail);
    const personaId = matched?.id || selectedId || personas[0]?.id;
    if (!personaId) return "/compose";
    return `${composeHref(personaId)}/reply/${encodeURIComponent(message.id)}`;
  };

  return (
    <InboxScreen
      initialMessages={initialMessages}
      initialError={initialError}
      replyHrefForMessage={replyHrefForMessage}
    />
  );
}

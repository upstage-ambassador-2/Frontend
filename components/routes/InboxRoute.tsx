"use client";

import { InboxScreen } from "@/components/screens";
import { useMello } from "@/components/MelloShell";
import type { GmailMessage, PaginatedGmailMessages } from "@/lib/api";
import { normalizeEmailAddress } from "@/lib/email";
import { composeHref } from "@/lib/routes";

type Props = {
  initialPage: PaginatedGmailMessages;
  initialError: string | null;
  pageToken: string | null;
};

export function InboxRoute({ initialPage, initialError, pageToken }: Props) {
  const { personas, selectedId } = useMello();

  const personaMatchForMessage = (message: GmailMessage) => {
    const senderEmail = normalizeEmailAddress(message.fromAddr || message.from);
    const matched = personas.find(
      (persona) => normalizeEmailAddress(persona.email) === senderEmail,
    );
    return {
      matched,
      senderEmail,
    };
  };

  const replyHrefForMessage = (message: GmailMessage) => {
    const { matched } = personaMatchForMessage(message);
    const personaId = matched?.id || selectedId || personas[0]?.id;
    if (!personaId) {
      return `/compose/reply/${encodeURIComponent(message.id)}`;
    }
    return `${composeHref(personaId)}/reply/${encodeURIComponent(message.id)}`;
  };

  return (
    <InboxScreen
      initialPage={initialPage}
      initialError={initialError}
      pageToken={pageToken}
      replyHrefForMessage={replyHrefForMessage}
      personaMatchForMessage={personaMatchForMessage}
    />
  );
}

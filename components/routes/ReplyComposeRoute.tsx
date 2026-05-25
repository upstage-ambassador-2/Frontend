"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ComposerScreen } from "@/components/ComposerScreen";
import { useMello } from "@/components/MelloShell";
import { api, type ReplyContext } from "@/lib/api";
import type { Persona } from "@/lib/data";
import {
  extractEmailDisplayName,
  normalizeEmailAddress,
} from "@/lib/email";
import { composeHref } from "@/lib/routes";

type Props = {
  initialReplyContext: ReplyContext;
  messageId: string;
};

function personaNameFromSender(fromAddr: string, senderEmail: string): string {
  return (
    extractEmailDisplayName(fromAddr) ||
    senderEmail.split("@")[0] ||
    senderEmail
  );
}

function mergePersonaByEmail(personas: Persona[], persona: Persona): Persona[] {
  const personaEmail = normalizeEmailAddress(persona.email);
  if (!personaEmail) return [persona, ...personas];

  const existingIndex = personas.findIndex(
    (item) => normalizeEmailAddress(item.email) === personaEmail,
  );
  if (existingIndex < 0) return [persona, ...personas];

  return personas.map((item, index) =>
    index === existingIndex ? persona : item,
  );
}

export function ReplyComposeRoute({ initialReplyContext, messageId }: Props) {
  const router = useRouter();
  const mello = useMello();
  const [brief, setBrief] = useState("");
  const [replyContext, setReplyContext] = useState<ReplyContext | null>(
    initialReplyContext,
  );
  const creatingEmailRef = useRef<string | null>(null);
  const mountedRef = useRef(false);
  const personasRef = useRef(mello.personas);

  const senderEmail = useMemo(
    () =>
      normalizeEmailAddress(
        initialReplyContext.senderEmail || initialReplyContext.fromAddr,
      ),
    [initialReplyContext.fromAddr, initialReplyContext.senderEmail],
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    personasRef.current = mello.personas;
  }, [mello.personas]);

  useEffect(() => {
    if (!senderEmail) return;
    if (senderEmail === normalizeEmailAddress(mello.me.user.email)) return;

    const matchedPersona = mello.personas.find(
      (persona) => normalizeEmailAddress(persona.email) === senderEmail,
    );
    if (matchedPersona) {
      if (matchedPersona.id !== mello.selectedId) {
        router.replace(
          `${composeHref(matchedPersona.id)}/reply/${encodeURIComponent(
            messageId,
          )}`,
        );
      }
      return;
    }

    if (creatingEmailRef.current === senderEmail) return;
    creatingEmailRef.current = senderEmail;

    const createPersona = async () => {
      try {
        const created = await api.createPersona({
          name:
            initialReplyContext.senderName ||
            personaNameFromSender(initialReplyContext.fromAddr, senderEmail),
          relation: "",
          tone: "중립",
          notes: "",
          email: senderEmail,
        });
        if (!mountedRef.current) return;
        mello.setPersonas(mergePersonaByEmail(personasRef.current, created));
        router.replace(
          `${composeHref(created.id)}/reply/${encodeURIComponent(messageId)}`,
        );
        mello.showToast("새 발신자를 사람에 추가했습니다");
      } catch (error) {
        if (mountedRef.current) {
          creatingEmailRef.current = null;
          mello.showToast(
            error instanceof Error
              ? error.message
              : "새 발신자를 사람에 추가하지 못했습니다",
          );
        }
      }
    };

    void createPersona();
  }, [
    initialReplyContext.fromAddr,
    initialReplyContext.senderName,
    mello.me.user.email,
    mello.personas,
    mello.selectedId,
    mello.setPersonas,
    mello.showToast,
    messageId,
    router,
    senderEmail,
  ]);

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

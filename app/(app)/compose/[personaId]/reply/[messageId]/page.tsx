import { notFound, redirect } from "next/navigation";
import {
  ReplyComposeErrorRoute,
  ReplyComposeRoute,
} from "@/components/routes/ReplyComposeRoute";
import {
  getServerGmailMessage,
  getServerInitial,
} from "@/lib/server-api";

export const dynamic = "force-dynamic";

export default async function ReplyComposePage({
  params,
}: {
  params: { personaId: string; messageId: string };
}) {
  const initial = await getServerInitial();
  if (initial.auth === "out") {
    redirect("/login");
  }

  const personaId = decodeURIComponent(params.personaId);
  const hasPersona = initial.personas.some(
    (persona) => persona.id === personaId,
  );
  if (!hasPersona && initial.personas.length > 0) {
    notFound();
  }

  const message = await getServerGmailMessage(params.messageId);
  if (!message.ok) {
    return (
      <ReplyComposeErrorRoute
        error={message.error}
        messageId={params.messageId}
        personaId={personaId}
      />
    );
  }
  if (!message.data) {
    return (
      <ReplyComposeErrorRoute
        error="메일 원문을 불러오지 못했습니다."
        messageId={params.messageId}
        personaId={personaId}
      />
    );
  }

  return (
    <ReplyComposeRoute
      initialReplyContext={message.data.replyContext}
      messageId={params.messageId}
    />
  );
}

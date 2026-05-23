import { notFound, redirect } from "next/navigation";
import { ReplyComposeRoute } from "@/components/routes/ReplyComposeRoute";
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
  if (!initial.personas.some((persona) => persona.id === personaId)) {
    notFound();
  }

  const message = await getServerGmailMessage(params.messageId);
  if (!message.ok || !message.data) {
    notFound();
  }

  return (
    <ReplyComposeRoute
      initialReplyContext={message.data.replyContext}
      messageId={params.messageId}
    />
  );
}

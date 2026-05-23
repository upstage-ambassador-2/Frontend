import { notFound, redirect } from "next/navigation";
import { ReplyComposeRoute } from "@/components/routes/ReplyComposeRoute";
import {
  getServerGmailMessage,
  getServerInitial,
} from "@/lib/server-api";

export const dynamic = "force-dynamic";

export default async function ReplyBootstrapPage({
  params,
}: {
  params: { messageId: string };
}) {
  const initial = await getServerInitial();
  if (initial.auth === "out") {
    redirect("/login");
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

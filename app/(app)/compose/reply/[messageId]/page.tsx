import { redirect } from "next/navigation";
import {
  ReplyComposeErrorRoute,
  ReplyComposeRoute,
} from "@/components/routes/ReplyComposeRoute";
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
  if (!message.ok) {
    return (
      <ReplyComposeErrorRoute
        error={message.error}
        messageId={params.messageId}
      />
    );
  }
  if (!message.data) {
    return (
      <ReplyComposeErrorRoute
        error="메일 원문을 불러오지 못했습니다."
        messageId={params.messageId}
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

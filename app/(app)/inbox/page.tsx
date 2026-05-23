import { InboxRoute } from "@/components/routes/InboxRoute";
import { getServerGmailMessages } from "@/lib/server-api";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const messages = await getServerGmailMessages();
  return (
    <InboxRoute
      initialMessages={messages.data}
      initialError={messages.ok ? null : messages.error}
    />
  );
}

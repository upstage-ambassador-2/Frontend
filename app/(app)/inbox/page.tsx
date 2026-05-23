import { InboxRoute } from "@/components/routes/InboxRoute";
import { getServerGmailMessages } from "@/lib/server-api";

export const dynamic = "force-dynamic";

type SearchParams = {
  limit?: string | string[];
  pageToken?: string | string[];
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function InboxPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const pageToken = firstParam(searchParams?.pageToken) || null;
  const messages = await getServerGmailMessages({
    limit: firstParam(searchParams?.limit),
    pageToken,
  });

  return (
    <InboxRoute
      initialPage={messages.data}
      initialError={messages.ok ? null : messages.error}
      pageToken={pageToken}
    />
  );
}

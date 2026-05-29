import { redirect } from "next/navigation";
import { ComposeRoute } from "@/components/routes/ComposeRoute";
import { getServerDraftSession, getServerInitial } from "@/lib/server-api";
import { composeHref } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function ComposePage({
  searchParams,
}: {
  searchParams?: { draftId?: string };
}) {
  const initial = await getServerInitial();
  if (initial.auth === "out") {
    redirect("/login");
  }
  const firstPersona = initial.personas[0];
  if (firstPersona) {
    const href = composeHref(firstPersona.id);
    const draftId = searchParams?.draftId;
    redirect(draftId ? `${href}?draftId=${encodeURIComponent(draftId)}` : href);
  }
  const draftSession = await getServerDraftSession(searchParams?.draftId);
  return <ComposeRoute initialDraftSession={draftSession.data} />;
}

import { notFound, redirect } from "next/navigation";
import { ComposeRoute } from "@/components/routes/ComposeRoute";
import { getServerDraftSession, getServerInitial } from "@/lib/server-api";

export const dynamic = "force-dynamic";

export default async function PersonaComposePage({
  params,
  searchParams,
}: {
  params: { personaId: string };
  searchParams?: { draftId?: string };
}) {
  const initial = await getServerInitial();
  if (initial.auth === "out") {
    redirect("/login");
  }

  const personaId = decodeURIComponent(params.personaId);
  if (!initial.personas.some((persona) => persona.id === personaId)) {
    notFound();
  }

  const draftSession = await getServerDraftSession(searchParams?.draftId);
  return <ComposeRoute initialDraftSession={draftSession.data} />;
}

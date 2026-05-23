import { redirect } from "next/navigation";
import { ComposeRoute } from "@/components/routes/ComposeRoute";
import { getServerInitial } from "@/lib/server-api";
import { composeHref } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function ComposePage() {
  const initial = await getServerInitial();
  if (initial.auth === "out") {
    redirect("/login");
  }
  const firstPersona = initial.personas[0];
  if (firstPersona) {
    redirect(composeHref(firstPersona.id));
  }
  return <ComposeRoute />;
}

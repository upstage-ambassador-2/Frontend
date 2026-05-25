import { redirect } from "next/navigation";
import { ComposeRoute } from "@/components/routes/ComposeRoute";
import { getServerInitial } from "@/lib/server-api";

export const dynamic = "force-dynamic";

export default async function ComposePage() {
  const initial = await getServerInitial();
  if (initial.auth === "out") {
    redirect("/login");
  }
  return <ComposeRoute />;
}

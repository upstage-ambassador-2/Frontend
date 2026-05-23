import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { MelloShell } from "@/components/MelloShell";
import { getServerInitial } from "@/lib/server-api";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const initial = await getServerInitial();
  if (initial.auth === "out") {
    redirect("/login");
  }

  return (
    <MelloShell
      initialMe={initial.me}
      initialPersonas={initial.personas}
      initialHistory={initial.history}
      initialFormat={initial.format}
    >
      {children}
    </MelloShell>
  );
}

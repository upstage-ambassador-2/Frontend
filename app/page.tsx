import { LoginPage } from "@/components/LoginPage";
import { MelloApp } from "@/components/MelloApp";
import { getServerInitial } from "@/lib/server-api";

export const dynamic = "force-dynamic";

export default async function Page() {
  const initial = await getServerInitial();
  if (initial.auth === "out") {
    return <LoginPage />;
  }
  return (
    <MelloApp
      initialMe={initial.me}
      initialPersonas={initial.personas}
      initialHistory={initial.history}
      initialFormat={initial.format}
    />
  );
}

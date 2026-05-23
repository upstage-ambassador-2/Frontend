import { redirect } from "next/navigation";
import { LoginPage } from "@/components/LoginPage";
import { getServerInitial } from "@/lib/server-api";

export const dynamic = "force-dynamic";

export default async function LoginRoute() {
  const initial = await getServerInitial();
  if (initial.auth === "in") {
    redirect("/compose");
  }
  return <LoginPage />;
}

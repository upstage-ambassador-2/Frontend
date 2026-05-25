import { redirect } from "next/navigation";
import { LoginPage } from "@/components/LoginPage";
import { getServerInitial } from "@/lib/server-api";

export const dynamic = "force-dynamic";

export default async function LoginRoute({
  searchParams,
}: {
  searchParams?: { auth_error?: string | string[] };
}) {
  const initial = await getServerInitial();
  if (initial.auth === "in") {
    redirect("/compose");
  }
  const authError = Array.isArray(searchParams?.auth_error)
    ? searchParams?.auth_error[0]
    : searchParams?.auth_error;
  return <LoginPage authError={authError} />;
}

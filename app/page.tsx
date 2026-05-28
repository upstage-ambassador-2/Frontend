import { redirect } from "next/navigation";
import { getServerInitial } from "@/lib/server-api";

export const dynamic = "force-dynamic";

export default async function Page() {
  const initial = await getServerInitial();
  redirect(initial.auth === "in" ? "/inbox" : "/login");
}

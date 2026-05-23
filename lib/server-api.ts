import "server-only";

import { cookies } from "next/headers";
import type { HistoryItem, MailFormat, Persona } from "./data";
import type { MeResponse } from "./api";

const API_BASE = process.env.MELLO_API_URL || "http://localhost:4010";

const EMPTY_FORMAT: MailFormat = {
  signature: "",
  greeting: "",
  closing: "",
  structure: "",
  bulletStyle: "",
  language: "",
};

export type InitialState =
  | { auth: "out" }
  | {
      auth: "in";
      me: MeResponse;
      personas: Persona[];
      history: HistoryItem[];
      format: MailFormat;
    };

async function fetchJson<T>(path: string, cookieHeader: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    cache: "no-store",
  });
  if (!response.ok) {
    const error = new Error(`Request failed (${response.status}) ${path}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }
  return (await response.json()) as T;
}

export async function getServerInitial(): Promise<InitialState> {
  const cookieHeader = cookies()
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  let me: MeResponse;
  try {
    me = await fetchJson<MeResponse>("/me", cookieHeader);
  } catch {
    return { auth: "out" };
  }

  const [personas, history, format] = await Promise.all([
    fetchJson<Persona[]>("/personas", cookieHeader).catch(() => [] as Persona[]),
    fetchJson<HistoryItem[]>("/history", cookieHeader).catch(
      () => [] as HistoryItem[],
    ),
    fetchJson<MailFormat>("/format", cookieHeader).catch(() => EMPTY_FORMAT),
  ]);

  return { auth: "in", me, personas, history, format };
}

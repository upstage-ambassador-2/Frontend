import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import type { HistoryItem, MailFormat, Persona } from "./data";
import type { GmailMessage, GmailMessageDetail, MeResponse } from "./api";

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

export type ServerDataResult<T> =
  | { ok: true; data: T }
  | { ok: false; data: T; error: string };

function cookieHeader(): string {
  return cookies()
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

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

export const getServerInitial = cache(async (): Promise<InitialState> => {
  const header = cookieHeader();

  let me: MeResponse;
  try {
    me = await fetchJson<MeResponse>("/me", header);
  } catch {
    return { auth: "out" };
  }

  const [personas, history, format] = await Promise.all([
    fetchJson<Persona[]>("/personas", header).catch(() => [] as Persona[]),
    fetchJson<HistoryItem[]>("/history", header).catch(
      () => [] as HistoryItem[],
    ),
    fetchJson<MailFormat>("/format", header).catch(() => EMPTY_FORMAT),
  ]);

  return { auth: "in", me, personas, history, format };
});

export async function getServerGmailMessages(): Promise<
  ServerDataResult<GmailMessage[]>
> {
  try {
    const data = await fetchJson<GmailMessage[]>(
      "/gmail/messages?limit=30",
      cookieHeader(),
    );
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      data: [],
      error:
        error instanceof Error
          ? error.message
          : "받은편지함을 불러오지 못했습니다.",
    };
  }
}

export async function getServerGmailMessage(
  messageId: string,
): Promise<ServerDataResult<GmailMessageDetail | null>> {
  try {
    const data = await fetchJson<GmailMessageDetail>(
      `/gmail/messages/${encodeURIComponent(messageId)}`,
      cookieHeader(),
    );
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "메일 원문을 불러오지 못했습니다.",
    };
  }
}

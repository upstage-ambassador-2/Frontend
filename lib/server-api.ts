import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import {
  normalizePersonas,
  type HistoryItem,
  type MailFormat,
  type Persona,
} from "./data";
import {
  DEFAULT_GMAIL_PAGE_SIZE,
  normalizeGmailPageSize,
  type GmailMessage,
  type GmailMessageDetail,
  type MeResponse,
  type PaginatedGmailMessages,
} from "./api";

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

function errorMessageFromPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const body = payload as { detail?: unknown; message?: unknown };
  if (typeof body.detail === "string" && body.detail.trim()) return body.detail;
  if (typeof body.message === "string" && body.message.trim()) {
    return body.message;
  }
  return null;
}

async function fetchJson<T>(path: string, cookieHeader: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    cache: "no-store",
  });
  if (!response.ok) {
    let message = `Request failed (${response.status}) ${path}`;
    try {
      message = errorMessageFromPayload(await response.json()) || message;
    } catch {
      // Keep the status/path fallback when the response body is not JSON.
    }
    const error = new Error(message);
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
    fetchJson<Persona[]>("/personas", header)
      .then(normalizePersonas)
      .catch(() => [] as Persona[]),
    fetchJson<HistoryItem[]>("/history", header).catch(
      () => [] as HistoryItem[],
    ),
    fetchJson<MailFormat>("/format", header).catch(() => EMPTY_FORMAT),
  ]);

  return { auth: "in", me, personas, history, format };
});

type GmailMessageQuery = {
  limit?: string | number;
  pageToken?: string | null;
};

const EMPTY_GMAIL_PAGE: PaginatedGmailMessages = {
  messages: [],
  nextPageToken: null,
  resultSizeEstimate: null,
  limit: DEFAULT_GMAIL_PAGE_SIZE,
  hasMore: false,
};

function normalizeGmailMessagesResponse(
  data: PaginatedGmailMessages | GmailMessage[],
  limit: number,
): PaginatedGmailMessages {
  if (Array.isArray(data)) {
    return {
      messages: data,
      nextPageToken: null,
      resultSizeEstimate: data.length,
      limit,
      hasMore: false,
    };
  }

  return {
    messages: data.messages,
    nextPageToken: data.nextPageToken ?? null,
    resultSizeEstimate: data.resultSizeEstimate ?? null,
    limit: data.limit || limit,
    hasMore: Boolean(data.hasMore || data.nextPageToken),
  };
}

export async function getServerGmailMessages({
  limit: limitParam,
  pageToken,
}: GmailMessageQuery = {}): Promise<ServerDataResult<PaginatedGmailMessages>> {
  const limit = normalizeGmailPageSize(limitParam);
  const params = new URLSearchParams({ limit: String(limit) });
  if (pageToken) params.set("pageToken", pageToken);

  try {
    const data = await fetchJson<PaginatedGmailMessages | GmailMessage[]>(
      `/gmail/messages?${params.toString()}`,
      cookieHeader(),
    );
    return { ok: true, data: normalizeGmailMessagesResponse(data, limit) };
  } catch (error) {
    return {
      ok: false,
      data: { ...EMPTY_GMAIL_PAGE, limit },
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

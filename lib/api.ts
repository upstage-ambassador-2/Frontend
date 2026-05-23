import type { HistoryItem, MailFormat, Persona } from "./data";

const GET_DEDUPE_TTL_MS = 750;
const getJsonRequests = new Map<
  string,
  { expiresAt: number; promise: Promise<unknown> }
>();

export type User = {
  id: string;
  email: string;
  name: string;
  pictureUrl: string | null;
  createdAt: string;
};

export type IntegrationStatus = {
  gmail: boolean;
  contacts: boolean;
  slack: "planned";
  notion: "planned";
};

export type MeResponse = {
  user: User;
  integrations: IntegrationStatus;
};

export type ReplyContext = {
  id: string;
  gmailMessageId: string;
  fromAddr: string;
  from?: string;
  subject: string;
  snippet: string;
  rawBody: string;
  threadId: string | null;
  messageId: string | null;
  references: string | null;
  date: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type GmailMessage = {
  id: string;
  threadId: string | null;
  fromAddr: string;
  from?: string;
  subject: string;
  snippet: string;
  date: string | null;
  messageId: string | null;
  references: string | null;
};

export type PaginatedGmailMessages = {
  messages: GmailMessage[];
  nextPageToken: string | null;
  resultSizeEstimate: number | null;
  limit: number;
  hasMore: boolean;
};

export const GMAIL_PAGE_SIZE_OPTIONS = [10, 30, 50] as const;
export const DEFAULT_GMAIL_PAGE_SIZE = 30;

export type GmailPageSize = (typeof GMAIL_PAGE_SIZE_OPTIONS)[number];

export function normalizeGmailPageSize(
  value: string | number | undefined,
): GmailPageSize {
  const numericValue =
    typeof value === "number" ? value : Number.parseInt(value ?? "", 10);
  return GMAIL_PAGE_SIZE_OPTIONS.includes(numericValue as GmailPageSize)
    ? (numericValue as GmailPageSize)
    : DEFAULT_GMAIL_PAGE_SIZE;
}

export type GmailMessageDetail = GmailMessage & {
  rawBody: string;
  replyContext: ReplyContext;
};

export type GeneratedDraft = {
  subject: string;
  body: string;
  history: HistoryItem | null;
};

export type GeneratePayload = {
  brief: string;
  tone: number;
  length: number;
  personaId?: string | null;
  replyContextId?: string | null;
  replyContext?: Omit<ReplyContext, "id" | "createdAt" | "updatedAt"> | null;
};

export type PersonaPayload = {
  name: string;
  relation: string;
  tone: string;
  notes: string;
  email?: string;
  role?: string;
  keywords?: string[];
  avoid?: string[];
  prefer?: string;
};

export type SendPayload = {
  to?: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  historyId?: string | null;
  replyContextId?: string | null;
};

export type SendResponse = {
  id: string;
  threadId: string | null;
  status: "sent";
  history: HistoryItem | null;
  raw: Record<string, unknown> | null;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const FIVE_STEP_SCALE = [0, 25, 50, 75, 100] as const;

export type FiveStepScaleValue = (typeof FIVE_STEP_SCALE)[number];

export function toFiveStepScale(value: number): FiveStepScaleValue {
  const numericValue = Number.isFinite(value) ? value : 50;
  const index = Math.min(
    FIVE_STEP_SCALE.length - 1,
    Math.max(0, Math.round(numericValue / 25)),
  );
  return FIVE_STEP_SCALE[index];
}

function apiUrl(path: string): string {
  return path;
}

async function parseError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as { detail?: string; message?: string };
    return new ApiError(
      body.detail || body.message || "요청을 처리하지 못했습니다.",
      response.status,
    );
  } catch {
    return new ApiError("요청을 처리하지 못했습니다.", response.status);
  }
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const method = (init.method || "GET").toUpperCase();
  if (method !== "GET") {
    getJsonRequests.clear();
  }
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(apiUrl(path), {
    ...init,
    headers,
    credentials: "include",
  });
  if (!response.ok) {
    throw await parseError(response);
  }
  return response;
}

export async function apiJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const method = (init.method || "GET").toUpperCase();
  const canDedupe = method === "GET" && !init.body && !init.signal;
  const key = `${method}:${path}`;
  if (canDedupe) {
    const cached = getJsonRequests.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.promise as Promise<T>;
    }
    if (cached) getJsonRequests.delete(key);
  }

  const request = (async () => {
    const response = await apiFetch(path, init);
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  })();

  if (!canDedupe) return request;

  const deduped = request.catch((error) => {
    getJsonRequests.delete(key);
    throw error;
  });

  getJsonRequests.set(key, {
    expiresAt: Date.now() + GET_DEDUPE_TTL_MS,
    promise: deduped,
  });
  return deduped as Promise<T>;
}

export async function startGoogleLogin(next = "/"): Promise<string> {
  const result = await apiJson<{ url: string }>("/auth/google/start", {
    method: "POST",
    body: JSON.stringify({ next }),
  });
  return result.url;
}

export const api = {
  health: () => apiJson<{ status: string }>("/health"),
  me: () => apiJson<MeResponse>("/me"),
  logout: () => apiFetch("/auth/logout", { method: "POST" }),
  personas: () => apiJson<Persona[]>("/personas"),
  createPersona: (payload: PersonaPayload) =>
    apiJson<Persona>("/personas", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updatePersona: (id: string, payload: PersonaPayload) =>
    apiJson<Persona>(`/personas/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deletePersona: (id: string) =>
    apiFetch(`/personas/${id}`, { method: "DELETE" }),
  importContacts: () =>
    apiJson<{ imported: number; skipped: number; personas: Persona[] }>(
      "/personas/import-contacts",
      { method: "POST", body: JSON.stringify({ limit: 20 }) },
    ),
  history: () => apiJson<HistoryItem[]>("/history"),
  format: () => apiJson<MailFormat>("/format"),
  updateFormat: (payload: Partial<MailFormat>) =>
    apiJson<MailFormat>("/format", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  send: (payload: SendPayload) =>
    apiJson<SendResponse>("/gmail/send", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  toggleIntegration: (provider: string) =>
    apiJson<{ provider: string; status: "planned"; message: string }>(
      `/integrations/${provider}/toggle`,
      { method: "POST" },
    ),
};

export async function generateDraft(
  payload: GeneratePayload,
  handlers: {
    onDelta: (chunk: string, subject?: string) => void;
    onDone: (draft: GeneratedDraft) => void;
    onError: (message: string) => void;
  },
  signal?: AbortSignal,
): Promise<void> {
  const scaledPayload = {
    ...payload,
    tone: toFiveStepScale(payload.tone),
    length: toFiveStepScale(payload.length),
  };
  const response = await apiFetch("/ai/generate", {
    method: "POST",
    body: JSON.stringify(scaledPayload),
    signal,
  });
  if (!response.body) {
    throw new ApiError("스트리밍 응답을 읽을 수 없습니다.", 500);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const flushEvent = (raw: string) => {
    const lines = raw.split("\n");
    const event = lines
      .find((line) => line.startsWith("event:"))
      ?.slice("event:".length)
      .trim();
    const data = lines
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice("data:".length).trim())
      .join("\n");
    if (!event || !data) return;
    const payload = JSON.parse(data) as Record<string, unknown>;
    if (event === "delta") {
      handlers.onDelta(String(payload.text || ""), payload.subject as string);
    }
    if (event === "done") {
      handlers.onDone({
        subject: String(payload.subject || ""),
        body: String(payload.body || ""),
        history: (payload.history as HistoryItem | undefined) || null,
      });
    }
    if (event === "error") {
      handlers.onError(String(payload.detail || "초안 생성에 실패했습니다."));
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    let boundary = buffer.indexOf("\n\n");
    while (boundary >= 0) {
      flushEvent(buffer.slice(0, boundary));
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf("\n\n");
    }
    if (done) break;
  }
  if (buffer.trim()) flushEvent(buffer);
}

import http from "node:http";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.MELLO_MOCK_PORT || 4010);
const FRONTEND_URL = process.env.MELLO_WEB_URL || "http://localhost:3000";
const SESSION_COOKIE = "mello_session";
const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/contacts.readonly",
];

const nowIso = () => new Date().toISOString();
const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60_000).toISOString();
const shortDate = (minutes) =>
  new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(Date.now() - minutes * 60_000));
const emailFromAddress = (value = "") => {
  const text = String(value).trim();
  const match = text.match(/<([^>]+)>/);
  const email = (match?.[1] || text).trim();
  return email.includes("@") ? email : "";
};
const normalizedEmail = (value = "") => emailFromAddress(value).toLowerCase();
const normalizedName = (value = "") =>
  String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
const senderNameFromAddress = (value = "") => {
  const text = String(value || "").trim();
  const match = text.match(/^(.*?)\s*<[^>]+>$/);
  return (match?.[1] || "").trim().replace(/^"|"$/g, "");
};
const PERSONA_TONE_VALUES = new Set([
  "매우 격식",
  "격식",
  "중립",
  "친근",
  "매우 친근",
]);
const normalizePersonaTone = (value = "") => {
  const tone = String(value || "").trim();
  if (!tone) return "중립";
  if (PERSONA_TONE_VALUES.has(tone)) return tone;
  if (
    tone.includes("매우") &&
    (tone.includes("격식") || tone.includes("정중") || tone.includes("공식"))
  ) {
    return "매우 격식";
  }
  if (
    tone.includes("매우") &&
    (tone.includes("친근") || tone.includes("캐주얼") || tone.includes("편한"))
  ) {
    return "매우 친근";
  }
  if (
    tone.includes("격식") ||
    tone.includes("정중") ||
    tone.includes("공손") ||
    tone.includes("예의") ||
    tone.includes("공식")
  ) {
    return "격식";
  }
  if (
    tone.includes("친근") ||
    tone.includes("따뜻") ||
    tone.includes("편한") ||
    tone.includes("캐주얼") ||
    tone.includes("친구") ||
    tone.includes("가족")
  ) {
    return "친근";
  }
  return "중립";
};

const user = {
  id: "user-mock-oj",
  email: "jisong.oh@mello.app",
  name: "오지송",
  pictureUrl: null,
  createdAt: minutesAgo(20_000),
};

const sessions = new Map();

let personas = [
  {
    id: "lead",
    name: "김지훈 팀장",
    relation: "회사 · 직속 상사",
    tone: "중립",
    notes: "결론, 일정, 근거 순서를 선호합니다.",
    email: "lead@mello.test",
    source: "manual",
    role: "백엔드 챕터 리드",
    mbti: "ENTJ",
    avatar: "KJ",
    color: "#e8dfd1",
    keywords: ["결과 중심", "직설적", "결론 먼저", "긴 설명 싫어함"],
    avoid: ["변명조 표현", "모호한 시작"],
    prefer: "결론 → 일정 → 근거 순서",
    channel: "이메일",
    lastUsed: "어제",
    tagColor: "amber",
    createdAt: minutesAgo(8000),
    updatedAt: minutesAgo(8000),
  },
  {
    id: "partner",
    name: "박서연 책임",
    relation: "거래처 · 외부 협력사",
    tone: "격식",
    notes: "명확한 요청과 후보 일정을 선호합니다.",
    email: "partner@mello.test",
    source: "manual",
    role: "디자인 에이전시 PM",
    mbti: "ISTJ",
    avatar: "PS",
    color: "#dfe3da",
    keywords: ["공식적", "예의 중시", "명확한 요청 선호"],
    avoid: ["반말체", "이모지"],
    prefer: "정중한 인사 → 요청 → 회신 부탁",
    channel: "이메일",
    lastUsed: "3일 전",
    tagColor: "green",
    createdAt: minutesAgo(7800),
    updatedAt: minutesAgo(7800),
  },
  {
    id: "friend",
    name: "정다은",
    relation: "친구 · 대학 동기",
    tone: "친근",
    notes: "감정을 먼저 챙기는 표현에 반응이 좋습니다.",
    email: "friend@mello.test",
    source: "manual",
    role: "디자이너",
    mbti: "ENFP",
    avatar: "JD",
    color: "#efd9d3",
    keywords: ["감정에 민감", "따뜻한 표현", "이모지 OK"],
    avoid: ["차가운 단문", "사무적 단어"],
    prefer: "감정 한 줄 → 사정 → 다음 약속",
    channel: "이메일",
    lastUsed: "5일 전",
    tagColor: "rose",
    createdAt: minutesAgo(7600),
    updatedAt: minutesAgo(7600),
  },
  {
    id: "colleague",
    name: "이민호 사원",
    relation: "회사 · 옆 팀",
    tone: "중립",
    notes: "데이터와 범위를 분리해서 쓰면 좋습니다.",
    email: "colleague@mello.test",
    source: "manual",
    role: "데이터 분석가",
    mbti: "INTP",
    avatar: "LM",
    color: "#d8dee5",
    keywords: ["데이터 선호", "논리적", "수치 좋아함"],
    avoid: ["감정적 호소"],
    prefer: "맥락 → 수치 → 결론",
    channel: "이메일",
    lastUsed: "오늘",
    tagColor: "blue",
    createdAt: minutesAgo(7400),
    updatedAt: minutesAgo(7400),
  },
  {
    id: "mom",
    name: "엄마",
    relation: "가족",
    tone: "친근",
    notes: "짧고 안심되는 표현을 선호합니다.",
    email: "",
    source: "manual",
    role: "",
    mbti: "",
    avatar: "M",
    color: "#eddccf",
    keywords: ["안심시키기", "짧은 메시지"],
    avoid: ["모호한 표현"],
    prefer: "괜찮다는 한 줄을 먼저",
    channel: "이메일 미연결",
    lastUsed: "2일 전",
    tagColor: "amber",
    createdAt: minutesAgo(7200),
    updatedAt: minutesAgo(7200),
  },
];

let mailFormat = {
  signature: "오지송 · Product Designer\nMello team · jisong.oh@mello.app",
  greeting: "안녕하세요, 오지송입니다.",
  closing: "감사합니다.",
  structure: "인사 → 본문 → 요청 → 마무리",
  bulletStyle: "· (가운뎃점)",
  language: "한국어 · 존댓말 기본",
  updatedAt: minutesAgo(6000),
};

let replyContexts = [];
let history = [
  {
    id: "h-seed-1",
    personaId: "lead",
    replyContextId: null,
    targetName: "김지훈 팀장",
    targetEmail: "lead@mello.test",
    personaName: "김지훈 팀장",
    personaEmail: "lead@mello.test",
    replyFromAddr: null,
    replySubject: null,
    brief: "결제 모듈 QA 결과 공유",
    subject: "[공유] 결제 모듈 QA 결과",
    body: "결제 모듈 QA에서 회귀 테스트 1건이 발견되어 내일 오전까지 수정 후 공유드리겠습니다.",
    status: "draft",
    tone: "격식",
    toneValue: 25,
    length: "짧게",
    lengthValue: 25,
    when: "오늘 14:02",
    createdAt: minutesAgo(180),
    sentAt: null,
    gmailMessageId: null,
    subj: "[공유] 결제 모듈 QA 결과",
    prev: "결제 모듈 QA에서 회귀 테스트 1건이 발견되어 내일 오전까지 수정…",
  },
];

const baseGmailMessages = [
  {
    id: "gmail-reply-basic",
    threadId: "thread-basic-1",
    fromAddr: "박서연 책임 <partner@mello.test>",
    from: "박서연 책임 <partner@mello.test>",
    subject: "Re: Mello 소개 자료 일정 문의",
    snippet: "자료 검토했습니다. 다음 주 화요일까지 최종본을 받을 수 있을까요?",
    date: shortDate(55),
    messageId: "<gmail-reply-basic@mello.test>",
    references: "<prev-basic@mello.test>",
    rawBody:
      "안녕하세요, 오지송님.\n\n보내주신 Mello 소개 자료 검토했습니다. 다음 주 화요일 오전까지 최종본을 받을 수 있을까요?\n가능하다면 변경된 슬라이드만 표시해서 공유 부탁드립니다.\n\n감사합니다.\n박서연 드림",
  },
  {
    id: "gmail-reply-thread",
    threadId: "thread-roadmap-7",
    fromAddr: "김지훈 팀장 <lead@mello.test>",
    from: "김지훈 팀장 <lead@mello.test>",
    subject: "[확인] 주간 스프린트 범위",
    snippet: "이번 주 안에 결제 v2와 알림 센터 둘 다 가능한지 범위를 다시 확인해주세요.",
    date: shortDate(130),
    messageId: "<gmail-reply-thread@mello.test>",
    references: "<sprint-1@mello.test> <sprint-2@mello.test>",
    rawBody:
      "지송님,\n\n이번 주 안에 결제 v2와 알림 센터 둘 다 가능한지 범위를 다시 확인해주세요.\n불가능하면 오늘 17시 전까지 우선순위와 제외 범위를 정리해서 주세요.",
  },
  {
    id: "gmail-long-subject",
    threadId: "thread-long-3",
    fromAddr: "이민호 사원 <colleague@mello.test>",
    from: "이민호 사원 <colleague@mello.test>",
    subject:
      "[데이터 요청] Q2 퍼널 전환율 원본 시트 공유 가능 여부와 디바이스별 분포 기준 확인",
    snippet:
      "Q3 분석에 사용할 Q2 퍼널 전환율 원본 시트를 공유드릴 수 있습니다. 다만 모바일/웹 구분 기준을 먼저 확인하고 싶습니다.",
    date: shortDate(240),
    messageId: "<gmail-long-subject@mello.test>",
    references: null,
    rawBody:
      "Q3 분석에 사용할 Q2 퍼널 전환율 원본 시트를 공유드릴 수 있습니다.\n다만 모바일/웹 구분 기준을 먼저 확인하고 싶습니다. 기준 확정 후 원본 링크를 보내드리겠습니다.",
  },
  {
    id: "gmail-unmatched-sender",
    threadId: "thread-new-9",
    fromAddr: "윤하늘 <new.sender@mello.test>",
    from: "윤하늘 <new.sender@mello.test>",
    subject: "Mello 협업 문의",
    snippet: "아직 People에 없는 발신자입니다. 답장 화면에서 기존 사람 매칭 여부를 확인할 수 있어야 합니다.",
    date: shortDate(360),
    messageId: "<gmail-unmatched-sender@mello.test>",
    references: null,
    rawBody:
      "안녕하세요.\n\nMello 협업 가능 여부를 문의드립니다. 다음 주 중 간단히 이야기 나눌 수 있을까요?",
  },
];

const generatedGmailMessages = Array.from({ length: 42 }, (_, index) => {
  const displayIndex = index + 4;
  const senders = [
    "김지훈 팀장 <lead@mello.test>",
    "박서연 책임 <partner@mello.test>",
    "이민호 사원 <colleague@mello.test>",
    "정다은 <friend@mello.test>",
  ];
  const sender = senders[index % senders.length];
  const padded = String(displayIndex).padStart(2, "0");

  return {
    id: `gmail-page-${padded}`,
    threadId: `thread-page-${padded}`,
    fromAddr: sender,
    from: sender,
    subject: `[후속] Mello pagination fixture ${padded}`,
    snippet:
      "페이지네이션 검증을 위한 mock Gmail 메시지입니다. 목록 이동과 pageToken 보존을 확인합니다.",
    date: shortDate(300 + index * 35),
    messageId: `<gmail-page-${padded}@mello.test>`,
    references: index % 3 === 0 ? `<gmail-page-prev-${padded}@mello.test>` : null,
    rawBody:
      `안녕하세요, 오지송님.\n\n이 메일은 받은편지함 pagination 로컬 검증용 fixture ${padded}입니다.\n` +
      "다음/이전 이동과 페이지 크기 변경 후에도 답장 컨텍스트가 유지되는지 확인해 주세요.",
  };
});

const gmailMessages = [...baseGmailMessages, ...generatedGmailMessages];

function sendJson(res, status, payload, extraHeaders = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    ...extraHeaders,
  });
  res.end(JSON.stringify(payload));
}

function sendNoContent(res, extraHeaders = {}) {
  res.writeHead(204, extraHeaders);
  res.end();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      }),
  );
}

function corsHeaders(req) {
  const origin = req.headers.origin || FRONTEND_URL;
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    Vary: "Origin",
  };
}

function requireSession(req, res) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token || !sessions.has(token)) {
    sendJson(res, 401, { detail: "로그인이 필요합니다." }, corsHeaders(req));
    return false;
  }
  return true;
}

function integrationStatus() {
  return {
    gmail: true,
    contacts: true,
    slack: "planned",
    notion: "planned",
  };
}

function fiveStepLabel(value, labels) {
  const numericValue = Number.isFinite(value) ? value : 50;
  const index = Math.min(4, Math.max(0, Math.round(numericValue / 25)));
  return labels[index];
}

function toneLabel(value) {
  return fiveStepLabel(value, [
    "매우 격식",
    "격식",
    "중립",
    "친근",
    "매우 친근",
  ]);
}

function lengthLabel(value) {
  return fiveStepLabel(value, [
    "매우 짧게",
    "짧게",
    "보통",
    "자세히",
    "매우 자세히",
  ]);
}

function historyOut(item) {
  const preview = item.body.replace(/\n/g, " ").slice(0, 120);
  const { gmailMessageId, ...output } = item;
  return {
    ...output,
    subj: item.subject,
    prev: preview,
  };
}

function senderMetadata(message) {
  const senderEmail = normalizedEmail(message.fromAddr || message.from);
  const persona = senderEmail
    ? personas.find((item) => normalizedEmail(item.email) === senderEmail)
    : null;
  return {
    senderEmail,
    senderName:
      senderNameFromAddress(message.fromAddr || message.from) ||
      senderEmail.split("@")[0] ||
      null,
    personaId: persona?.id || null,
    persona: persona || null,
  };
}

function gmailMessageOut(message) {
  return {
    ...message,
    ...senderMetadata(message),
  };
}

function upsertReplyContext(message) {
  const metadata = senderMetadata(message);
  let context = replyContexts.find((item) => item.gmailMessageId === message.id);
  if (!context) {
    context = {
      id: `rc-${randomUUID()}`,
      gmailMessageId: message.id,
      fromAddr: message.fromAddr,
      from: message.fromAddr,
      subject: message.subject,
      snippet: message.snippet,
      rawBody: message.rawBody,
      threadId: message.threadId,
      messageId: message.messageId,
      references: message.references,
      date: message.date,
      senderEmail: metadata.senderEmail,
      senderName: metadata.senderName,
      personaId: metadata.personaId,
      persona: metadata.persona,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    replyContexts.push(context);
  } else {
    Object.assign(context, {
      fromAddr: message.fromAddr,
      from: message.fromAddr,
      subject: message.subject,
      snippet: message.snippet,
      rawBody: message.rawBody,
      threadId: message.threadId,
      messageId: message.messageId,
      references: message.references,
      date: message.date,
      senderEmail: metadata.senderEmail,
      senderName: metadata.senderName,
      personaId: metadata.personaId,
      persona: metadata.persona,
      updatedAt: nowIso(),
    });
  }
  return context;
}

function buildDraft(payload) {
  const personaId = payload.personaId || payload.persona_id;
  const replyContextId = payload.replyContextId || payload.reply_context_id;
  const persona = personas.find((item) => item.id === personaId);
  const replyContext = replyContexts.find(
    (item) => item.id === replyContextId,
  );
  const targetName = persona?.name || "받는 분";
  const brief = (payload.brief || "").trim();
  const subject = replyContext
    ? `Re: ${replyContext.subject.replace(/^Re:\s*/i, "")}`
    : brief.includes("회의")
    ? "[Mello] 회의 일정 조율 요청"
    : brief.includes("일정")
    ? "[공유] 일정 변경 안내"
    : "[Mello] 요청 사항 공유";
  const bodyLines = [
    mailFormat.greeting,
    "",
    replyContext
      ? `${targetName}님 메일 확인했습니다. 요청주신 내용을 기준으로 아래와 같이 답변드립니다.`
      : `${targetName}님께 공유드릴 내용을 정리했습니다.`,
    "",
    brief || "문의주신 내용 확인했으며, 필요한 후속 조치를 진행하겠습니다.",
    "",
    payload.length > 70
      ? `${mailFormat.bulletStyle.split(" ")[0]} 배경과 일정은 확인되는 대로 추가 공유드리겠습니다.\n${mailFormat.bulletStyle.split(" ")[0]} 우선 필요한 액션은 오늘 중 진행하겠습니다.`
      : "필요한 액션은 오늘 중 진행하겠습니다.",
    "",
    mailFormat.closing,
    mailFormat.signature,
  ];
  return {
    subject,
    body: bodyLines.join("\n"),
  };
}

function normalizeTextForMatch(value = "") {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function ensureSignature(body = "") {
  const signature = String(mailFormat.signature || "").trim();
  const draftBody = String(body || "").trim();
  if (!signature) return draftBody;
  if (normalizeTextForMatch(draftBody).includes(normalizeTextForMatch(signature))) {
    return draftBody;
  }
  return `${draftBody}\n\n${signature}`;
}

function forbiddenTermsInDraft(persona, subject = "", body = "") {
  if (!persona?.avoid?.length) return [];
  const haystack = normalizeTextForMatch(`${subject}\n${body}`);
  return persona.avoid.filter((term) => {
    const normalized = normalizeTextForMatch(term);
    return normalized && haystack.includes(normalized);
  });
}

function personaForSend(item, to) {
  if (item?.personaId) {
    const linked = personas.find((persona) => persona.id === item.personaId);
    if (linked) return linked;
  }
  const toEmail = normalizedEmail(to);
  if (!toEmail) return null;
  return personas.find((persona) => normalizedEmail(persona.email) === toEmail) || null;
}

function applySendGuardrails({ item, to, subject, body }) {
  const persona = personaForSend(item, to);
  const guardedBody = ensureSignature(body);
  const forbiddenTerms = forbiddenTermsInDraft(persona, subject, guardedBody);
  if (forbiddenTerms.length) {
    return {
      ok: false,
      detail: `발송하려는 내용에 피해야 할 표현이 포함되었습니다: ${forbiddenTerms
        .slice(0, 3)
        .join(", ")}. 수정 후 다시 보내주세요.`,
    };
  }
  return {
    ok: true,
    subject: String(subject || "").trim(),
    body: guardedBody,
  };
}

function applyGenerationGuardrails({ persona, subject, body }) {
  const guardedBody = ensureSignature(body);
  const forbiddenTerms = forbiddenTermsInDraft(persona, subject, guardedBody);
  if (forbiddenTerms.length) {
    return {
      ok: false,
      detail: `생성 결과에 피해야 할 표현이 포함되었습니다: ${forbiddenTerms
        .slice(0, 3)
        .join(", ")}. 다시 생성해주세요.`,
    };
  }
  return {
    ok: true,
    subject: String(subject || "").trim(),
    body: guardedBody,
  };
}

async function streamDraft(req, res, payload) {
  const personaId = payload.personaId || payload.persona_id || null;
  let replyContextId = payload.replyContextId || payload.reply_context_id || null;
  if (!replyContextId && payload.replyContext) {
    replyContextId = upsertReplyContext({
      id: payload.replyContext.gmailMessageId,
      threadId: payload.replyContext.threadId || null,
      fromAddr: payload.replyContext.fromAddr || payload.replyContext.from || "",
      from: payload.replyContext.from || payload.replyContext.fromAddr || "",
      subject: payload.replyContext.subject || "",
      snippet: payload.replyContext.snippet || "",
      date: payload.replyContext.date || null,
      messageId: payload.replyContext.messageId || null,
      references: payload.replyContext.references || null,
      rawBody: payload.replyContext.rawBody || "",
    }).id;
  }
  const normalizedPayload = { ...payload, personaId, replyContextId };
  const draft = buildDraft(normalizedPayload);
  const persona = personas.find((item) => item.id === personaId);
  const replyContext = replyContexts.find((item) => item.id === replyContextId);
  const guardedDraft = applyGenerationGuardrails({
    persona,
    subject: draft.subject,
    body: draft.body,
  });
  if (!guardedDraft.ok) {
    res.writeHead(200, {
      ...corsHeaders(req),
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    });
    res.write(
      `event: error\ndata: ${JSON.stringify({
        detail: guardedDraft.detail,
        status: 502,
      })}\n\n`,
    );
    res.end();
    return;
  }
  const replyEmail = emailFromAddress(replyContext?.fromAddr);
  const replyMatchesPersona =
    !!replyEmail &&
    !!persona?.email &&
    emailFromAddress(persona.email).toLowerCase() === replyEmail.toLowerCase();
  const item = {
    id: `h-${randomUUID()}`,
    personaId,
    replyContextId,
    targetName: replyContext
      ? replyMatchesPersona
        ? persona.name
        : replyContext.fromAddr
      : persona?.name || null,
    targetEmail: replyContext ? replyEmail : persona?.email || "",
    personaName: persona?.name || null,
    personaEmail: persona?.email || "",
    replyFromAddr: replyContext?.fromAddr || null,
    replySubject: replyContext?.subject || null,
    brief: payload.brief || "",
    subject: guardedDraft.subject,
    body: guardedDraft.body,
    status: "draft",
    tone: toneLabel(payload.tone ?? 50),
    toneValue: payload.tone ?? 50,
    length: lengthLabel(payload.length ?? 50),
    lengthValue: payload.length ?? 50,
    when: "방금 전",
    createdAt: nowIso(),
    sentAt: null,
    gmailMessageId: null,
    subj: guardedDraft.subject,
    prev: guardedDraft.body.replace(/\n/g, " ").slice(0, 120),
  };
  history = [item, ...history];

  res.writeHead(200, {
    ...corsHeaders(req),
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });

  const chunks = guardedDraft.body.match(/.{1,18}(\s|$)|.+/gs) || [
    guardedDraft.body,
  ];
  for (let index = 0; index < chunks.length; index += 1) {
    res.write(
      `event: delta\ndata: ${JSON.stringify({
        subject: guardedDraft.subject,
        text: chunks[index],
      })}\n\n`,
    );
    await new Promise((resolve) => setTimeout(resolve, 24));
  }
  res.write(
    `event: done\ndata: ${JSON.stringify({
      subject: guardedDraft.subject,
      body: guardedDraft.body,
      history: historyOut(item),
    })}\n\n`,
  );
  res.end();
}

function applyPersonaFields(base, payload) {
  const now = nowIso();
  const hasEmailField = Object.prototype.hasOwnProperty.call(payload, "email");
  const email = hasEmailField
    ? String(payload.email || "").trim()
    : base.email || "";
  const listField = (name, fallback) => {
    if (!Object.prototype.hasOwnProperty.call(payload, name)) return fallback;
    const value = payload[name];
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }
    return String(value || "")
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  };
  const channel = hasEmailField
    ? email
      ? "이메일"
      : "이메일 미연결"
    : base.channel || (email ? "이메일" : "이메일 미연결");
  const tone = normalizePersonaTone(payload.tone || base.tone);
  return {
    ...base,
    name: payload.name?.trim() || base.name,
    relation: payload.relation || "",
    tone,
    notes: payload.notes || "",
    email,
    source: base.source || "manual",
    role: Object.prototype.hasOwnProperty.call(payload, "role")
      ? String(payload.role || "").trim()
      : base.role || "",
    mbti: base.mbti || "",
    avatar:
      base.avatar ||
      (payload.name || base.name)
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    color: base.color || "#dfe3da",
    keywords: listField(
      "keywords",
      base.keywords?.length ? base.keywords : [tone],
    ),
    avoid: listField("avoid", base.avoid || []),
    prefer: Object.prototype.hasOwnProperty.call(payload, "prefer")
      ? String(payload.prefer || "").trim()
      : base.prefer || payload.notes || "",
    channel,
    lastUsed: base.lastUsed || "없음",
    tagColor: base.tagColor || "gray",
    createdAt: base.createdAt || now,
    updatedAt: now,
  };
}

async function handler(req, res) {
  const headers = corsHeaders(req);
  if (req.method === "OPTIONS") {
    sendNoContent(res, headers);
    return;
  }

  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const path = url.pathname;

  try {
    if (req.method === "GET" && path === "/health") {
      sendJson(res, 200, { status: "ok" }, headers);
      return;
    }

    if (req.method === "GET" && path === "/health/ready") {
      sendJson(res, 200, { status: "ok", database: "ok" }, headers);
      return;
    }

    if (req.method === "POST" && path === "/auth/google/start") {
      const payload = await readBody(req);
      const origin = req.headers.origin || FRONTEND_URL;
      const next = payload.next || "/";
      const callback = new URL(`${origin}/auth/google/callback`);
      callback.searchParams.set("code", "mock-google-code");
      callback.searchParams.set("state", "mock-state");
      callback.searchParams.set("next", next);
      callback.searchParams.set("scope", GOOGLE_SCOPES.join(" "));
      sendJson(res, 200, { url: callback.toString() }, headers);
      return;
    }

    if (req.method === "GET" && path === "/auth/google/callback") {
      const token = `mock-session-${randomUUID()}`;
      sessions.set(token, { userId: user.id, createdAt: nowIso() });
      res.writeHead(303, {
        ...headers,
        "Set-Cookie": `${SESSION_COOKIE}=${encodeURIComponent(
          token,
        )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=1209600`,
        Location: `${FRONTEND_URL}${url.searchParams.get("next") || "/"}`,
      });
      res.end();
      return;
    }

    if (req.method === "POST" && path === "/auth/logout") {
      const token = parseCookies(req)[SESSION_COOKIE];
      if (token) sessions.delete(token);
      sendNoContent(res, {
        ...headers,
        "Set-Cookie": `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
      });
      return;
    }

    if (!requireSession(req, res)) return;

    if (req.method === "GET" && path === "/me") {
      sendJson(res, 200, { user, integrations: integrationStatus() }, headers);
      return;
    }

    if (req.method === "GET" && path === "/integrations") {
      sendJson(res, 200, integrationStatus(), headers);
      return;
    }

    const integrationMatch = path.match(/^\/integrations\/([^/]+)\/toggle$/);
    if (req.method === "POST" && integrationMatch) {
      const provider = integrationMatch[1];
      sendJson(
        res,
        200,
        {
          provider,
          status: "planned",
          message:
            provider === "gmail" || provider === "contacts"
              ? "Gmail/Contacts는 Google OAuth 동의 시점에 연결됩니다."
              : "지원 예정입니다.",
        },
        headers,
      );
      return;
    }

    if (req.method === "GET" && path === "/personas") {
      sendJson(res, 200, personas, headers);
      return;
    }

    if (req.method === "POST" && path === "/personas") {
      const payload = await readBody(req);
      if (!payload.name?.trim()) {
        sendJson(res, 422, { detail: "이름은 필수입니다." }, headers);
        return;
      }
      const email = normalizedEmail(payload.email);
      const existing = email
        ? personas.find((item) => normalizedEmail(item.email) === email)
        : null;
      if (existing) {
        sendJson(res, 409, { detail: "이미 등록된 이메일입니다." }, headers);
        return;
      }
      const persona = applyPersonaFields({ id: `p-${randomUUID()}` }, payload);
      personas = [persona, ...personas];
      sendJson(res, 201, persona, headers);
      return;
    }

    if (req.method === "POST" && path === "/personas/structure") {
      const payload = await readBody(req);
      const text = String(payload.text || "").trim();
      if (!text) {
        sendJson(res, 422, { detail: "분석할 페르소나 메모가 필요합니다." }, headers);
        return;
      }
      const tone = normalizePersonaTone(text);
      const keywords = [
        text.includes("결론") ? "결론 먼저" : "",
        text.includes("일정") ? "일정 중시" : "",
        text.includes("감정") || text.includes("따뜻") ? "감정 배려" : "",
      ].filter(Boolean);
      const avoid = [
        text.includes("모호") ? "모호한 표현" : "",
        text.includes("변명") ? "변명조 표현" : "",
      ].filter(Boolean);
      sendJson(
        res,
        200,
        {
          tone,
          keywords: keywords.length ? keywords : ["핵심 요약"],
          avoid,
          prefer: text.includes("결론")
            ? "결론 → 일정 → 근거 순서"
            : "맥락 → 요청 → 마무리 순서",
          notes: text.slice(0, 500),
        },
        headers,
      );
      return;
    }

    const personaMatch = path.match(/^\/personas\/([^/]+)$/);
    if (personaMatch && req.method === "PATCH") {
      const payload = await readBody(req);
      const id = personaMatch[1];
      const existing = personas.find((item) => item.id === id);
      if (!existing) {
        sendJson(res, 404, { detail: "페르소나를 찾을 수 없습니다." }, headers);
        return;
      }
      const email = normalizedEmail(payload.email);
      const duplicate = email
        ? personas.find(
            (item) => item.id !== id && normalizedEmail(item.email) === email,
          )
        : null;
      if (duplicate) {
        sendJson(res, 409, { detail: "이미 등록된 이메일입니다." }, headers);
        return;
      }
      const updated = applyPersonaFields(existing, payload);
      personas = personas.map((item) => (item.id === id ? updated : item));
      sendJson(res, 200, updated, headers);
      return;
    }

    if (personaMatch && req.method === "DELETE") {
      const id = personaMatch[1];
      const persona = personas.find((item) => item.id === id);
      if (!persona) {
        sendJson(res, 404, { detail: "페르소나를 찾을 수 없습니다." }, headers);
        return;
      }
      history = history.map((item) => {
        if (item.personaId !== id) return item;
        return {
          ...item,
          personaId: null,
          targetName: item.targetName || persona.name,
          targetEmail: item.targetEmail || persona.email || "",
          personaName: item.personaName || persona.name,
          personaEmail: item.personaEmail || persona.email || "",
          counterpartyName: item.counterpartyName || persona.name,
          counterpartyEmail: item.counterpartyEmail || persona.email || "",
        };
      });
      personas = personas.filter((item) => item.id !== id);
      sendNoContent(res, headers);
      return;
    }

    if (req.method === "POST" && path === "/personas/import-contacts") {
      const contactPersonas = [
        {
          name: "최은영 책임",
          relation: "Google Contacts",
          tone: "격식",
          notes: "Google Contacts에서 가져온 연락처입니다.",
          email: "mentor@mello.test",
        },
        {
          name: "김지훈   팀장",
          relation: "Google Contacts",
          tone: "중립",
          notes: "이미 등록된 연락처와 이름이 같은 항목입니다.",
          email: "lead-copy@mello.test",
        },
        {
          name: "한수민",
          relation: "Google Contacts",
          tone: "친근",
          notes: "제품 피드백을 자주 주는 외부 사용자입니다.",
          email: "soomin@mello.test",
        },
      ];
      let imported = 0;
      let skipped = 0;
      const existingEmails = new Set(
        personas.map((item) => normalizedEmail(item.email)).filter(Boolean),
      );
      const existingNames = new Set(
        personas.map((item) => normalizedName(item.name)).filter(Boolean),
      );
      for (const contact of contactPersonas) {
        const contactEmail = normalizedEmail(contact.email);
        const contactName = normalizedName(contact.name);
        if (
          !contactName ||
          (contactEmail && existingEmails.has(contactEmail)) ||
          existingNames.has(contactName)
        ) {
          skipped += 1;
          continue;
        }
        personas.unshift(
          applyPersonaFields(
            {
              id: `contact-${randomUUID()}`,
              source: "contacts",
              channel: "이메일",
              tagColor: "green",
              color: "#dfe3da",
              keywords: ["연락처", "이메일"],
            },
            contact,
          ),
        );
        if (contactEmail) existingEmails.add(contactEmail);
        existingNames.add(contactName);
        imported += 1;
      }
      sendJson(res, 200, { imported, skipped, personas }, headers);
      return;
    }

    if (req.method === "GET" && path === "/format") {
      sendJson(res, 200, mailFormat, headers);
      return;
    }

    if (req.method === "PUT" && path === "/format") {
      const payload = await readBody(req);
      mailFormat = { ...mailFormat, ...payload, updatedAt: nowIso() };
      sendJson(res, 200, mailFormat, headers);
      return;
    }

    if (req.method === "GET" && path === "/history") {
      sendJson(res, 200, history.map(historyOut), headers);
      return;
    }

    const historyDraftMatch = path.match(/^\/history\/([^/]+)\/draft$/);
    if (historyDraftMatch && req.method === "PATCH") {
      const item = history.find((entry) => entry.id === historyDraftMatch[1]);
      if (!item) {
        sendJson(res, 404, { detail: "히스토리를 찾을 수 없습니다." }, headers);
        return;
      }
      if (item.status === "sent") {
        sendJson(
          res,
          409,
          { detail: "발송 완료된 히스토리는 수정할 수 없습니다." },
          headers,
        );
        return;
      }
      const payload = await readBody(req);
      if (payload.subject === undefined && payload.body === undefined) {
        sendJson(res, 422, { detail: "수정할 초안 내용이 필요합니다." }, headers);
        return;
      }
      if (payload.subject !== undefined) item.subject = String(payload.subject);
      if (payload.body !== undefined) item.body = String(payload.body);
      sendJson(res, 200, historyOut(item), headers);
      return;
    }

    const historyDraftResetMatch = path.match(/^\/history\/([^/]+)\/draft\/reset$/);
    if (historyDraftResetMatch && req.method === "POST") {
      const item = history.find((entry) => entry.id === historyDraftResetMatch[1]);
      if (!item) {
        sendJson(res, 404, { detail: "히스토리를 찾을 수 없습니다." }, headers);
        return;
      }
      if (item.status === "sent") {
        sendJson(
          res,
          409,
          { detail: "발송 완료된 히스토리는 수정할 수 없습니다." },
          headers,
        );
        return;
      }
      item.subject = "";
      item.body = "";
      sendJson(res, 200, historyOut(item), headers);
      return;
    }

    const historyMatch = path.match(/^\/history\/([^/]+)$/);
    if (historyMatch && req.method === "GET") {
      const item = history.find((entry) => entry.id === historyMatch[1]);
      if (!item) {
        sendJson(res, 404, { detail: "히스토리를 찾을 수 없습니다." }, headers);
        return;
      }
      sendJson(res, 200, historyOut(item), headers);
      return;
    }

    if (historyMatch && req.method === "DELETE") {
      const item = history.find((entry) => entry.id === historyMatch[1]);
      if (!item) {
        sendJson(res, 404, { detail: "히스토리를 찾을 수 없습니다." }, headers);
        return;
      }
      history = history.filter((entry) => entry.id !== item.id);
      sendNoContent(res, headers);
      return;
    }

    if (req.method === "GET" && path === "/gmail/messages") {
      const requestedLimit = Number(url.searchParams.get("limit") || 30);
      const limit = [10, 30, 50].includes(requestedLimit) ? requestedLimit : 30;
      const pageToken = url.searchParams.get("pageToken");
      const tokenOffset =
        pageToken && pageToken.startsWith("mock-page-")
          ? Number(pageToken.replace("mock-page-", ""))
          : 0;
      const start = Number.isFinite(tokenOffset)
        ? Math.min(Math.max(tokenOffset, 0), gmailMessages.length)
        : 0;
      const end = start + limit;
      const nextPageToken =
        end < gmailMessages.length ? `mock-page-${end}` : null;
      sendJson(
        res,
        200,
        {
          messages: gmailMessages
            .slice(start, end)
            .map(({ rawBody, ...message }) => gmailMessageOut(message)),
          nextPageToken,
          resultSizeEstimate: gmailMessages.length,
          limit,
          hasMore: Boolean(nextPageToken),
        },
        headers,
      );
      return;
    }

    const gmailMatch = path.match(/^\/gmail\/messages\/([^/]+)$/);
    if (gmailMatch && req.method === "GET") {
      const message = gmailMessages.find((item) => item.id === gmailMatch[1]);
      if (!message) {
        sendJson(res, 404, { detail: "메일을 찾을 수 없습니다." }, headers);
        return;
      }
      const output = gmailMessageOut(message);
      const replyContext = upsertReplyContext(output);
      sendJson(res, 200, { ...output, replyContext }, headers);
      return;
    }

    if (req.method === "POST" && path === "/ai/generate") {
      const payload = await readBody(req);
      const replyContextId = payload.replyContextId || payload.reply_context_id;
      if (!payload.brief?.trim() && !replyContextId && !payload.replyContext) {
        sendJson(res, 422, { detail: "brief 또는 reply_context가 필요합니다." }, headers);
        return;
      }
      await streamDraft(req, res, payload);
      return;
    }

    if (req.method === "POST" && path === "/gmail/send") {
      const payload = await readBody(req);
      const historyId = payload.historyId || payload.history_id;
      const replyContextId = payload.replyContextId || payload.reply_context_id;
      const item = history.find((entry) => entry.id === historyId);
      if (historyId && !item) {
        sendJson(res, 404, { detail: "히스토리를 찾을 수 없습니다." }, headers);
        return;
      }
      const replyContext = replyContexts.find(
        (context) => context.id === replyContextId,
      );
      if (replyContextId && !replyContext) {
        sendJson(
          res,
          404,
          { detail: "답장 컨텍스트를 찾을 수 없습니다." },
          headers,
        );
        return;
      }
      const to = payload.to || replyContext?.fromAddr || "";
      if (!to) {
        sendJson(res, 422, { detail: "받는 사람 이메일이 필요합니다." }, headers);
        return;
      }
      if (item?.status === "sent" && item.gmailMessageId) {
        sendJson(
          res,
          200,
          {
            id: item.gmailMessageId,
            threadId: null,
            status: "sent",
            history: historyOut(item),
            raw: {
              id: item.gmailMessageId,
              deduplicated: true,
            },
          },
          headers,
        );
        return;
      }
      const guardedDraft = applySendGuardrails({
        item,
        to,
        subject: payload.subject,
        body: payload.body,
      });
      if (!guardedDraft.ok) {
        sendJson(res, 422, { detail: guardedDraft.detail }, headers);
        return;
      }
      const sentId = `sent-${randomUUID()}`;
      if (item) {
        const sendPersona = personaForSend(item, to);
        const normalizedTo = normalizedEmail(to);
        item.subject = guardedDraft.subject;
        item.body = guardedDraft.body;
        item.status = "sent";
        item.sentAt = nowIso();
        item.gmailMessageId = sentId;
        if (!item.personaId && sendPersona) item.personaId = sendPersona.id;
        if (sendPersona) {
          item.targetName = sendPersona.name;
          item.targetEmail = sendPersona.email || normalizedTo || "";
          item.personaName = sendPersona.name;
          item.personaEmail = sendPersona.email || "";
          item.counterpartyName = sendPersona.name;
          item.counterpartyEmail = sendPersona.email || normalizedTo || "";
        } else {
          item.targetName =
            item.targetName ||
            (replyContext ? senderNameFromAddress(replyContext.fromAddr) : null);
          item.targetEmail = item.targetEmail || normalizedTo || "";
          item.counterpartyName =
            item.counterpartyName ||
            (replyContext ? senderNameFromAddress(replyContext.fromAddr) : null);
          item.counterpartyEmail = item.counterpartyEmail || normalizedTo || "";
        }
      }
      sendJson(
        res,
        200,
        {
          id: sentId,
          threadId: replyContext?.threadId || null,
          status: "sent",
          history: item ? historyOut(item) : null,
          raw: {
            id: sentId,
            from: user.email,
            to,
            cc: payload.cc || [],
            bcc: payload.bcc || [],
            headers: replyContext
              ? {
                  "In-Reply-To": replyContext.messageId,
                  References: [replyContext.references, replyContext.messageId]
                    .filter(Boolean)
                    .join(" "),
                }
              : {},
          },
        },
        headers,
      );
      return;
    }

    sendJson(res, 404, { detail: "Mock endpoint not found." }, headers);
  } catch (error) {
    sendJson(
      res,
      500,
      { detail: error instanceof Error ? error.message : "Mock server error" },
      headers,
    );
  }
}

http.createServer(handler).listen(PORT, () => {
  console.log(`[mello-mock] listening on http://localhost:${PORT}`);
});

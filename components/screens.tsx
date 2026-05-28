"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PERSONA_TONE_OPTIONS,
  normalizePersonaTone,
  type HistoryItem,
  type MailFormat,
  type Persona,
} from "@/lib/data";
import {
  GMAIL_PAGE_SIZE_OPTIONS,
  api,
  normalizeGmailPageSize,
  startGoogleLogin,
  type GmailMessage,
  type MeResponse,
  type PaginatedGmailMessages,
  type PersonaMbtiInferResult,
  type PersonaPayload,
} from "@/lib/api";
import { extractEmailAddress, normalizeEmailAddress } from "@/lib/email";
import { PersonaAvatar } from "./PersonaAvatar";
import {
  IconChat,
  IconChevron,
  IconClose,
  IconFormat,
  IconHistory,
  IconMail,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSend,
  IconSparkle,
} from "./icons";

function PageTitle({
  title,
  desc,
  action,
}: {
  title: string;
  desc: string;
  action?: ReactNode;
}) {
  return (
    <div className="row between page-title">
      <div>
        <div className="page-title-text">{title}</div>
        <div className="small muted mt-1">{desc}</div>
      </div>
      {action}
    </div>
  );
}

type PersonaDraft = {
  id?: string;
  name: string;
  relation: string;
  tone: string;
  notes: string;
  email: string;
  role: string;
  mbti: string;
  keywords: string;
  avoid: string;
  prefer: string;
};

type PersonaValidation = {
  field: "name" | "email" | "mbti";
  message: string;
};

const MBTI_TYPES = [
  "ISTJ",
  "ISFJ",
  "INFJ",
  "INTJ",
  "ISTP",
  "ISFP",
  "INFP",
  "INTP",
  "ESTP",
  "ESFP",
  "ENFP",
  "ENTP",
  "ESTJ",
  "ESFJ",
  "ENFJ",
  "ENTJ",
] as const;

const MBTI_TYPE_SET = new Set<string>(MBTI_TYPES);

const emptyPersona = (): PersonaDraft => ({
  name: "",
  relation: "",
  tone: "중립",
  notes: "",
  email: "",
  role: "",
  mbti: "",
  keywords: "",
  avoid: "",
  prefer: "",
});

function listText(items: string[] | undefined) {
  return (items || []).join(", ");
}

function splitList(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isValidOptionalEmail(value: string) {
  const email = value.trim();
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeMbtiInput(value: string) {
  return value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
}

function isValidOptionalMbti(value: string) {
  const mbti = normalizeMbtiInput(value);
  return !mbti || MBTI_TYPE_SET.has(mbti);
}

function validatePersonaDraft(draft: PersonaDraft): PersonaValidation | null {
  if (!draft.name.trim()) {
    return { field: "name", message: "이름은 필수입니다." };
  }
  if (!isValidOptionalEmail(draft.email)) {
    return { field: "email", message: "이메일 형식을 확인해주세요." };
  }
  if (!isValidOptionalMbti(draft.mbti)) {
    return { field: "mbti", message: "MBTI는 16가지 유형 중 하나로 입력해주세요." };
  }
  return null;
}

function draftFromPersona(persona: Persona): PersonaDraft {
  return {
    id: persona.id,
    name: persona.name,
    relation: persona.relation,
    tone: normalizePersonaTone(persona.tone),
    notes: persona.notes || "",
    email: persona.email || "",
    role: persona.role || "",
    mbti: normalizeMbtiInput(persona.mbti || ""),
    keywords: listText(persona.keywords),
    avoid: listText(persona.avoid),
    prefer: persona.prefer || "",
  };
}

function serializeDraft(draft: PersonaDraft | null) {
  if (!draft) return "";
  return JSON.stringify({
    id: draft.id || "",
    name: draft.name,
    relation: draft.relation,
    tone: draft.tone,
    notes: draft.notes,
    email: draft.email,
    role: draft.role,
    mbti: normalizeMbtiInput(draft.mbti),
    keywords: draft.keywords,
    avoid: draft.avoid,
    prefer: draft.prefer,
  });
}

function PersonaDialog({
  draft,
  saving,
  structuring,
  validation,
  saveDisabled,
  onChange,
  onCancel,
  onSave,
  onStructure,
  onToast,
  onPatch,
}: {
  draft: PersonaDraft;
  saving: boolean;
  structuring: boolean;
  validation: PersonaValidation | null;
  saveDisabled: boolean;
  onChange: (draft: PersonaDraft) => void;
  onCancel: () => void;
  onSave: () => void;
  onStructure: () => void;
  onToast: (message: string) => void;
  onPatch: (patch: Partial<PersonaDraft>) => void;
}) {
  const nameRef = useRef<HTMLInputElement>(null);
  const [mbtiHelperOpen, setMbtiHelperOpen] = useState(false);
  const [mbtiDescription, setMbtiDescription] = useState("");
  const [analyzingMbti, setAnalyzingMbti] = useState(false);
  const [mbtiAnalysis, setMbtiAnalysis] =
    useState<PersonaMbtiInferResult | null>(null);
  const title = draft.id ? "사람 수정" : "사람 추가";

  const analyzeMbti = async () => {
    const text = mbtiDescription.trim();
    if (!text) {
      onToast("성향 설명을 입력해주세요");
      return;
    }
    setAnalyzingMbti(true);
    try {
      const result = await api.inferPersonaMbti(text);
      onPatch({ mbti: normalizeMbtiInput(result.mbti) });
      setMbtiAnalysis(result);
      onToast(`MBTI를 ${result.mbti}로 추정했습니다`);
    } catch (error) {
      onToast(error instanceof Error ? error.message : "MBTI를 분석하지 못했습니다");
    } finally {
      setAnalyzingMbti(false);
    }
  };

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div className="modal-backdrop" onMouseDown={onCancel}>
      <section
        className="modal-panel person-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="persona-dialog-title"
        aria-describedby="persona-dialog-desc"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-h">
          <div>
            <div id="persona-dialog-title" className="modal-title">
              {title}
            </div>
            <div id="persona-dialog-desc" className="modal-sub">
              관계, 톤, MBTI, 메모와 Gmail 발송 이메일을 저장합니다.
            </div>
          </div>
          <button
            type="button"
            className="icon-btn modal-close"
            aria-label="닫기"
            onClick={onCancel}
          >
            <IconClose size={15} />
          </button>
        </div>

        <div className="modal-body thin-scroll">
          <div className="form-grid">
            <label>
              <span>이름</span>
              <input
                ref={nameRef}
                value={draft.name}
                onChange={(event) => onChange({ ...draft, name: event.target.value })}
                placeholder="예: 김지훈 팀장"
                aria-invalid={validation?.field === "name" || undefined}
                aria-describedby={
                  validation?.field === "name" ? "persona-dialog-error" : undefined
                }
              />
            </label>
            <label>
              <span>이메일 (선택)</span>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={draft.email}
                onChange={(event) => onChange({ ...draft, email: event.target.value })}
                placeholder="lead@example.com"
                aria-invalid={validation?.field === "email" || undefined}
                aria-describedby={
                  validation?.field === "email" ? "persona-dialog-error" : undefined
                }
              />
            </label>
            <label>
              <span>관계</span>
              <input
                value={draft.relation}
                onChange={(event) =>
                  onChange({ ...draft, relation: event.target.value })
                }
                placeholder="회사 · 직속 상사"
              />
            </label>
            <label>
              <span>역할</span>
              <input
                value={draft.role}
                onChange={(event) => onChange({ ...draft, role: event.target.value })}
                placeholder="백엔드 챕터 리드"
              />
            </label>
            <div className="form-field">
              <div className="row between mbti-label-row">
                <span id="persona-mbti-label">MBTI (선택)</span>
                <button
                  type="button"
                  className="btn-secondary mbti-helper-toggle"
                  onClick={() => setMbtiHelperOpen((open) => !open)}
                  aria-label="잘 모르겠어요"
                  aria-controls="persona-mbti-analysis"
                  aria-expanded={mbtiHelperOpen}
                >
                  잘 모르겠어요
                </button>
              </div>
              <input
                value={draft.mbti}
                onChange={(event) =>
                  onChange({ ...draft, mbti: normalizeMbtiInput(event.target.value) })
                }
                placeholder="INTJ"
                aria-labelledby="persona-mbti-label"
                maxLength={4}
                aria-invalid={validation?.field === "mbti" || undefined}
                aria-describedby={
                  validation?.field === "mbti" ? "persona-dialog-error" : undefined
                }
              />
            </div>
            <label>
              <span>톤</span>
              <select
                value={normalizePersonaTone(draft.tone)}
                onChange={(event) =>
                  onChange({
                    ...draft,
                    tone: normalizePersonaTone(event.target.value),
                  })
                }
              >
                {PERSONA_TONE_OPTIONS.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </select>
            </label>
            {mbtiHelperOpen && (
              <div
                id="persona-mbti-analysis"
                className="span-2 mbti-analysis-panel"
              >
                <div className="mbti-analysis-head">
                  <div>
                    <div className="mbti-analysis-title">성향 설명으로 MBTI 추정</div>
                    <div className="mbti-analysis-sub">
                      공식 MBTI 선호축 기준을 백엔드에서 참고해 유형을 제안합니다.
                    </div>
                  </div>
                  {mbtiAnalysis && (
                    <span className="person-card-mbti">{mbtiAnalysis.mbti}</span>
                  )}
                </div>
                <textarea
                  value={mbtiDescription}
                  onChange={(event) => setMbtiDescription(event.target.value)}
                  aria-label="성향 설명"
                  placeholder="예: 혼자 정리할 때 에너지가 나고, 큰 그림과 장기 계획을 먼저 세운 뒤 논리적으로 판단합니다."
                  maxLength={4000}
                />
                <div className="mbti-analysis-foot">
                  <a
                    href={mbtiAnalysis?.sourceUrl || "https://www.mbtionline.com/en-US/MBTI-Types/All-about-the-Myers-Briggs-types"}
                    target="_blank"
                    rel="noreferrer"
                  >
                    공식 MBTI 기준
                  </a>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => void analyzeMbti()}
                    disabled={saving || analyzingMbti || !mbtiDescription.trim()}
                  >
                    <IconSparkle size={13} />
                    {analyzingMbti ? "분석 중" : "MBTI 분석"}
                  </button>
                </div>
                {mbtiAnalysis && (
                  <div className="mbti-analysis-result">
                    신뢰도 {mbtiAnalysis.confidence} · {mbtiAnalysis.rationale}
                  </div>
                )}
              </div>
            )}
            <label>
              <span>키워드</span>
              <input
                value={draft.keywords}
                onChange={(event) =>
                  onChange({ ...draft, keywords: event.target.value })
                }
                placeholder="결과 중심, 결론 먼저"
              />
            </label>
            <label className="span-2">
              <span>회피 표현</span>
              <textarea
                value={draft.avoid}
                onChange={(event) => onChange({ ...draft, avoid: event.target.value })}
                placeholder="변명조 표현, 모호한 시작"
              />
            </label>
            <label className="span-2">
              <span>선호 구조</span>
              <textarea
                value={draft.prefer}
                onChange={(event) => onChange({ ...draft, prefer: event.target.value })}
                placeholder="결론 → 일정 → 근거 순서"
              />
            </label>
            <label className="span-2">
              <span className="row between">
                <span>메모</span>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onStructure}
                  disabled={saving || structuring || !draft.notes.trim()}
                >
                  <IconSparkle size={13} />
                  {structuring ? "정리 중" : "AI 정리"}
                </button>
              </span>
              <textarea
                value={draft.notes}
                onChange={(event) => onChange({ ...draft, notes: event.target.value })}
                placeholder="선호하는 문장 구조나 피해야 할 표현"
              />
            </label>
          </div>
          {validation && (
            <div
              id="persona-dialog-error"
              className="state-row error-text persona-form-error"
              role="alert"
            >
              {validation.message}
            </div>
          )}
        </div>

        <div className="modal-foot">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            취소
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onSave}
            disabled={saveDisabled}
          >
            저장
          </button>
        </div>
      </section>
    </div>
  );
}

const htmlEntities: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: "\"",
};

function decodeCodePoint(codePoint: number, fallback: string) {
  return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
    ? String.fromCodePoint(codePoint)
    : fallback;
}

function decodeHtmlEntities(value: string | null | undefined) {
  if (!value) return "";
  return value.replace(/&(#\d+|#x[\da-f]+|[a-z]+);/gi, (entity, body) => {
    const key = body.toLowerCase();
    if (key.startsWith("#x")) {
      const codePoint = Number.parseInt(key.slice(2), 16);
      return decodeCodePoint(codePoint, entity);
    }
    if (key.startsWith("#")) {
      const codePoint = Number.parseInt(key.slice(1), 10);
      return decodeCodePoint(codePoint, entity);
    }
    return htmlEntities[key] ?? entity;
  });
}

function parseInboxSender(value: string) {
  const text = decodeHtmlEntities(value).trim();
  const addressMatch = text.match(/^(.*?)\s*<([^<>]+)>$/);

  if (addressMatch) {
    const name = addressMatch[1].trim().replace(/^"|"$/g, "");
    const email = addressMatch[2].trim();
    return {
      name: name || email || "알 수 없는 발신자",
      email: name ? email : "",
    };
  }

  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return {
    name: text || emailMatch?.[0] || "알 수 없는 발신자",
    email: emailMatch && emailMatch[0] !== text ? emailMatch[0] : "",
  };
}

function inboxSenderFromMessage(message: GmailMessage) {
  const fallback = parseInboxSender(message.fromAddr || message.from || "");
  return {
    name:
      decodeHtmlEntities(message.senderName).trim() ||
      fallback.name ||
      message.senderEmail ||
      "알 수 없는 발신자",
    email: normalizeEmailAddress(message.senderEmail) || fallback.email,
  };
}

function needsGoogleReauth(error: string | null | undefined): boolean {
  return !!error && /권한|재인증|다시 로그인|Google 연결/.test(error);
}

const inboxMonthNumbers: Record<string, string> = {
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12",
};

function formatInboxDate(value: string | null) {
  const text = decodeHtmlEntities(value).trim();
  if (!text) return "";

  const rfcMatch = text.match(/\b(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})\b/);
  if (rfcMatch) {
    const [, day, month, year] = rfcMatch;
    const monthNumber = inboxMonthNumbers[month.toLowerCase()];
    if (monthNumber) return `${year}.${monthNumber}.${day.padStart(2, "0")}`;
  }

  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getUTCFullYear();
    const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
    const day = String(parsed.getUTCDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  }

  return text;
}

function personaEmail(persona: Persona | undefined): string {
  return persona?.email?.trim() || "";
}

function initialsFrom(value: string): string {
  const compact = value.trim();
  if (!compact) return "?";
  const initials = compact
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
  return initials.toUpperCase();
}

export function PeopleScreen({
  personas,
  loadError,
  onOpen,
  onChanged,
  onToast,
}: {
  personas: Persona[];
  loadError?: string;
  onOpen: (id: string) => void;
  onChanged: (items: Persona[]) => void;
  onToast: (message: string) => void;
}) {
  const [draft, setDraft] = useState<PersonaDraft | null>(null);
  const [initialDraft, setInitialDraft] = useState<PersonaDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [structuring, setStructuring] = useState(false);
  const [importingContacts, setImportingContacts] = useState(false);
  const [reauthorizingContacts, setReauthorizingContacts] = useState(false);
  const [importRecoveryError, setImportRecoveryError] = useState<string | null>(
    null,
  );
  const connectedCount = useMemo(
    () => personas.filter((persona) => !!personaEmail(persona)).length,
    [personas],
  );
  const draftDirty = useMemo(
    () => serializeDraft(draft) !== serializeDraft(initialDraft),
    [draft, initialDraft],
  );
  const draftValidation = useMemo(
    () => (draft ? validatePersonaDraft(draft) : null),
    [draft],
  );
  const visibleDraftValidation = saveAttempted ? draftValidation : null;

  const openDraft = (next: PersonaDraft) => {
    setInitialDraft(next);
    setDraft(next);
    setSaveAttempted(false);
  };

  const closeDraft = useCallback(() => {
    if (saving) return;
    if (draftDirty && !window.confirm("저장하지 않은 변경을 버릴까요?")) return;
    setDraft(null);
    setInitialDraft(null);
    setSaveAttempted(false);
  }, [draftDirty, saving]);

  const save = async () => {
    setSaveAttempted(true);
    if (!draft) return;
    const validation = validatePersonaDraft(draft);
    if (validation) {
      onToast(validation.message);
      return;
    }
    setSaving(true);
    try {
      const payload: PersonaPayload = {
        name: draft.name.trim(),
        relation: draft.relation.trim(),
        tone: normalizePersonaTone(draft.tone),
        notes: draft.notes.trim(),
        email: draft.email.trim() || null,
        role: draft.role.trim(),
        mbti: normalizeMbtiInput(draft.mbti),
        keywords: splitList(draft.keywords),
        avoid: splitList(draft.avoid),
        prefer: draft.prefer.trim(),
      };
      const saved = draft.id
        ? await api.updatePersona(draft.id, payload)
        : await api.createPersona(payload);
      const hasSavedPersona = personas.some((item) => item.id === saved.id);
      const nextPersonas =
        draft.id || hasSavedPersona
          ? personas.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...personas];
      onChanged(nextPersonas);
      setDraft(null);
      setInitialDraft(null);
      setSaveAttempted(false);
      onToast(draft.id ? "페르소나를 수정했습니다" : "페르소나를 추가했습니다");
    } catch (error) {
      onToast(error instanceof Error ? error.message : "저장하지 못했습니다");
    } finally {
      setSaving(false);
    }
  };

  const structureDraft = async () => {
    if (!draft?.notes.trim()) {
      onToast("정리할 메모를 입력해주세요");
      return;
    }
    setStructuring(true);
    try {
      const result = await api.structurePersona(draft.notes);
      setDraft((current) =>
        current
          ? {
              ...current,
              tone: normalizePersonaTone(result.tone),
              notes: result.notes || current.notes,
              keywords: result.keywords.join(", "),
              avoid: result.avoid.join(", "),
              prefer: result.prefer,
            }
          : current,
      );
      onToast("페르소나 메모를 정리했습니다");
    } catch (error) {
      onToast(error instanceof Error ? error.message : "페르소나 메모를 정리하지 못했습니다");
    } finally {
      setStructuring(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("이 페르소나를 삭제할까요?")) return;
    try {
      await api.deletePersona(id);
      onChanged(personas.filter((item) => item.id !== id));
      onToast("페르소나를 삭제했습니다");
    } catch (error) {
      onToast(error instanceof Error ? error.message : "삭제하지 못했습니다");
    }
  };

  const importContacts = async () => {
    if (importingContacts || importRecoveryError) return;
    setImportingContacts(true);
    setImportRecoveryError(null);
    try {
      const result = await api.importContacts();
      onChanged(result.personas);
      setImportRecoveryError(null);
      onToast(`Contacts에서 ${result.imported}명 가져옴 · ${result.skipped}명 건너뜀`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Contacts를 가져오지 못했습니다";
      if (needsGoogleReauth(message)) {
        setImportRecoveryError(message);
      }
      onToast(message);
    } finally {
      setImportingContacts(false);
    }
  };

  const reauthorizeContacts = async () => {
    setReauthorizingContacts(true);
    try {
      window.location.href = await startGoogleLogin("/people");
    } catch (error) {
      setReauthorizingContacts(false);
      onToast(
        error instanceof Error ? error.message : "Google 재동의를 시작하지 못했습니다.",
      );
    }
  };

  return (
    <div className="page people-page">
      <PageTitle
        title="사람"
        desc="자주 보내는 사람의 관계, MBTI, 톤, 메모와 Gmail 발송 이메일을 함께 저장합니다."
        action={
          <div className="row gap-2 people-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={importContacts}
              disabled={importingContacts || !!importRecoveryError}
            >
              <IconMail size={13} />{" "}
              {importingContacts ? "가져오는 중" : "Contacts에서 가져오기"}
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => openDraft(emptyPersona())}
            >
              <IconPlus size={14} /> 사람 추가
            </button>
          </div>
        }
      />

      <div className="connection-summary" aria-label="사람 이메일 연결 요약">
        <span>
          <b>{connectedCount}</b>명 이메일 연결
        </span>
        <span>
          <b>{personas.length - connectedCount}</b>명 이메일 없음
        </span>
      </div>

      {loadError && (
        <div className="state-row error-text" role="alert">
          {loadError}
        </div>
      )}

      {importRecoveryError && (
        <div className="state-row state-stack error-text" role="alert">
          <div>{importRecoveryError}</div>
          <div className="row gap-2">
            <button
              type="button"
              className="btn-primary"
              onClick={() => void reauthorizeContacts()}
              disabled={reauthorizingContacts}
            >
              <IconRefresh size={13} />
              {reauthorizingContacts ? "재동의 중" : "Google 재동의"}
            </button>
          </div>
        </div>
      )}

      {draft && (
        <PersonaDialog
          draft={draft}
          saving={saving}
          structuring={structuring}
          validation={visibleDraftValidation}
          saveDisabled={saving || !!visibleDraftValidation}
          onChange={setDraft}
          onCancel={closeDraft}
          onSave={() => void save()}
          onStructure={() => void structureDraft()}
          onToast={onToast}
          onPatch={(patch) =>
            setDraft((current) => (current ? { ...current, ...patch } : current))
          }
        />
      )}

      <div className="people-grid">
        {personas.map((persona) => {
          const email = personaEmail(persona);
          const hasEmail = !!email;
          const profileSummary = (persona.notes || persona.prefer || "").trim();
          return (
            <div key={persona.id} className="person-card">
              <button
                type="button"
                className="person-card-main"
                onClick={() => onOpen(persona.id)}
              >
                <div className="person-card-h">
                  <PersonaAvatar persona={persona} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="person-card-name">{persona.name}</div>
                    <div className="person-card-meta">{persona.relation}</div>
                  </div>
                  <span className="person-card-mbti">
                    {persona.mbti || "MBTI 미입력"}
                  </span>
                </div>
                <div className="person-card-tags">
                  <span className={`tag ${hasEmail ? "green" : "amber"}`}>
                    {hasEmail ? "이메일 연결됨" : "이메일 없음"}
                  </span>
                  <span className={`tag ${persona.tagColor || "gray"}`}>
                    {normalizePersonaTone(persona.tone)}
                  </span>
                  {(persona.keywords || []).slice(0, 2).map((keyword, index) => (
                    <span key={index} className={`tag ${persona.tagColor || "gray"}`}>
                      {keyword}
                    </span>
                  ))}
                </div>
                {profileSummary && (
                  <div className="person-card-summary">
                    {normalizePersonaTone(persona.tone)} · {profileSummary}
                  </div>
                )}
                <div className="person-card-foot">
                  <span className="person-card-last">
                    <IconHistory size={12} /> 마지막 작성 · {persona.lastUsed}
                  </span>
                  <span
                    className={
                      "person-card-channel" + (hasEmail ? "" : " is-missing")
                    }
                  >
                    {hasEmail ? <IconMail size={12} /> : <IconChat size={12} />}
                    {hasEmail ? email : "Gmail 발송 전 이메일 필요"}
                  </span>
                </div>
              </button>
              <div className="card-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => openDraft(draftFromPersona(persona))}
                >
                  수정
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => void remove(persona.id)}
                >
                  삭제
                </button>
              </div>
            </div>
          );
        })}
        {personas.length === 0 && !loadError && (
          <div className="empty-card people-empty-card">
            <IconPlus size={18} />
            <div>아직 등록된 페르소나가 없습니다.</div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => openDraft(emptyPersona())}
            >
              <IconPlus size={14} /> 사람 추가
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function InboxScreen({
  initialPage,
  initialError,
  pageToken,
  replyHrefForMessage,
  personaMatchForMessage,
  onToast,
}: {
  initialPage: PaginatedGmailMessages;
  initialError: string | null;
  pageToken: string | null;
  replyHrefForMessage: (message: GmailMessage) => string;
  personaMatchForMessage: (message: GmailMessage) => {
    matched: Persona | undefined;
    senderEmail: string;
  };
  onToast: (message: string) => void;
}) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [navigating, startNavigation] = useTransition();
  const [tokenHistory, setTokenHistory] = useState<Record<string, string>>({});
  const [reauthorizing, setReauthorizing] = useState(false);
  const reauthorizingRef = useRef(false);
  const currentLimit = normalizeGmailPageSize(initialPage.limit);
  const messages = useMemo(
    () =>
      initialPage.messages.map((message) => {
        const sender = inboxSenderFromMessage(message);
        return {
          ...message,
          sender,
          subjectText: decodeHtmlEntities(message.subject),
          snippetText: decodeHtmlEntities(message.snippet),
          dateText: formatInboxDate(message.date),
        };
      }),
    [initialPage.messages],
  );
  const busy = refreshing || navigating;
  const previousToken = pageToken ? tokenHistory[pageToken] : undefined;
  const canGoPrevious = Boolean(pageToken && previousToken !== undefined);
  const canGoNext = Boolean(initialPage.hasMore && initialPage.nextPageToken);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(
        `mello:inbox:token-history:${currentLimit}`,
      );
      setTokenHistory(
        saved ? (JSON.parse(saved) as Record<string, string>) : {},
      );
    } catch {
      setTokenHistory({});
    }
  }, [currentLimit]);

  const inboxHref = (limit: number, token: string | null) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (token) params.set("pageToken", token);
    return `/inbox?${params.toString()}`;
  };

  const rememberPreviousToken = (
    nextToken: string,
    currentToken: string | null,
  ) => {
    setTokenHistory((current) => {
      const updated = { ...current, [nextToken]: currentToken ?? "" };
      try {
        window.sessionStorage.setItem(
          `mello:inbox:token-history:${currentLimit}`,
          JSON.stringify(updated),
        );
      } catch {
        // Session history is only an enhancement for cursor-based previous nav.
      }
      return updated;
    });
  };

  const load = () => {
    if (reauthorizingRef.current) return;
    startRefresh(() => router.refresh());
  };

  const reauthorizeGoogle = async () => {
    if (reauthorizingRef.current) return;
    reauthorizingRef.current = true;
    setReauthorizing(true);
    try {
      const returnPath = inboxHref(currentLimit, pageToken);
      window.location.href = await startGoogleLogin(returnPath);
    } catch (error) {
      reauthorizingRef.current = false;
      setReauthorizing(false);
      onToast(
        error instanceof Error ? error.message : "Google 재동의를 시작하지 못했습니다.",
      );
    }
  };

  const goNext = () => {
    if (reauthorizingRef.current) return;
    const nextToken = initialPage.nextPageToken;
    if (!nextToken) return;
    rememberPreviousToken(nextToken, pageToken);
    startNavigation(() => router.push(inboxHref(currentLimit, nextToken)));
  };

  const goPrevious = () => {
    if (reauthorizingRef.current) return;
    if (!canGoPrevious) return;
    startNavigation(() =>
      router.push(inboxHref(currentLimit, previousToken || null)),
    );
  };

  const changePageSize = (value: string) => {
    if (reauthorizingRef.current) return;
    const nextLimit = normalizeGmailPageSize(value);
    startNavigation(() => router.push(inboxHref(nextLimit, null)));
  };

  const countText =
    initialPage.resultSizeEstimate == null
      ? `${messages.length}개 표시`
      : `전체 약 ${initialPage.resultSizeEstimate}개 중 ${messages.length}개 표시`;
  const actionsDisabled = busy || reauthorizing;

  return (
    <div className="page inbox-page" style={{ maxWidth: 1040 }}>
      <PageTitle
        title="받은편지함"
        desc="최근 Gmail 메일을 고르면 작성 화면에서 답장 초안을 만들 수 있습니다."
        action={
          <div className="inbox-actions">
            <label className="inbox-size-control">
              <span>페이지 크기</span>
              <select
                value={currentLimit}
                onChange={(event) => changePageSize(event.target.value)}
                disabled={actionsDisabled}
              >
                {GMAIL_PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}개
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => void load()}
              disabled={actionsDisabled}
            >
              {refreshing ? (
                <span className="result-spinner" aria-hidden />
              ) : (
                <IconRefresh size={13} />
              )}
              {refreshing ? "새로고침 중" : "새로고침"}
            </button>
          </div>
        }
      />

      <div className="inbox-meta">
        <div className="small muted">
          {initialError ? "받은편지함을 불러오지 못했습니다." : countText}
          {pageToken && <span> · cursor 페이지</span>}
        </div>
        <div className="inbox-pager" aria-label="받은편지함 페이지 이동">
          <button
            type="button"
            className="btn-secondary"
            onClick={goPrevious}
            disabled={!canGoPrevious || actionsDisabled}
          >
            <IconChevron size={13} style={{ transform: "rotate(180deg)" }} />
            이전
          </button>
          <span className="inbox-page-label">
            {pageToken ? "이후 메일" : "첫 페이지"}
          </span>
          <button
            type="button"
            className="btn-secondary"
            onClick={goNext}
            disabled={!canGoNext || actionsDisabled}
          >
            {navigating ? (
              <span className="result-spinner" aria-hidden />
            ) : null}
            다음
            <IconChevron size={13} />
          </button>
        </div>
      </div>

      <div className="card inbox-card">
        {initialError && (
          <div className="state-row state-stack error-text" role="alert">
            <div>{initialError}</div>
            <div className="row gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => void load()}
                disabled={actionsDisabled}
              >
                <IconRefresh size={13} />
                다시 시도
              </button>
              {needsGoogleReauth(initialError) && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => void reauthorizeGoogle()}
                  disabled={actionsDisabled}
                >
                  {reauthorizing ? "재동의 중" : "Google 재동의"}
                </button>
              )}
            </div>
          </div>
        )}
        {!initialError && messages.length === 0 && (
          <div className="state-row">
            {pageToken
              ? "이 페이지에는 표시할 메일이 없습니다. 이전 페이지로 돌아가거나 페이지 크기를 변경해 주세요."
              : "최근 받은 메일이 없습니다."}
          </div>
        )}
        {messages.map((message) => {
          const match = personaMatchForMessage(message);
          return (
            <Link
              key={message.id}
              className="inbox-row"
              href={replyHrefForMessage(message)}
              aria-label={`${message.sender.name}의 ${message.subjectText} 메일에 답장하기`}
              title={`${message.sender.name} · ${message.subjectText}`}
            >
              <div className="inbox-from" title={message.fromAddr}>
                <div className="inbox-sender-line">
                  <span className="inbox-from-name">{message.sender.name}</span>
                  {!match.matched && <span className="tag amber">신규</span>}
                </div>
                {message.sender.email && (
                  <span className="inbox-from-email">{message.sender.email}</span>
                )}
              </div>
              <div className="inbox-main">
                <div className="inbox-subject" title={message.subjectText}>
                  {message.subjectText}
                </div>
                <div className="inbox-snippet" title={message.snippetText}>
                  {message.snippetText}
                </div>
              </div>
              <div className="inbox-date" title={message.date || undefined}>
                {message.dateText}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

type HistoryDetailState = {
  item?: HistoryItem;
  isLoading: boolean;
  error?: string;
};

export function HistoryScreen({
  history,
  personas,
  loadError,
  onDeleted,
  onToast,
}: {
  history: HistoryItem[];
  personas: Persona[];
  loadError?: string;
  onDeleted: (id: string) => void;
  onToast: (message: string) => void;
}) {
  const searchParams = useSearchParams();
  const requestedOpenId = searchParams.get("open");
  const requestedOpenIdRef = useRef<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filterId, setFilterId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [detailById, setDetailById] = useState<Record<string, HistoryDetailState>>(
    {},
  );
  const pmap = useMemo(
    () => Object.fromEntries(personas.map((persona) => [persona.id, persona])),
    [personas],
  );
  const targetFor = useCallback((item: HistoryItem) => {
    const persona = item.personaId ? pmap[item.personaId] : undefined;
    const replyEmail = extractEmailAddress(item.replyFromAddr);
    const targetEmail =
      item.targetEmail ||
      item.personaEmail ||
      personaEmail(persona) ||
      item.counterpartyEmail ||
      replyEmail ||
      "";
    const targetName =
      item.targetName ||
      item.personaName ||
      item.counterpartyName ||
      persona?.name ||
      item.replyFromAddr ||
      "대상 미확인";
    return {
      persona,
      name: targetName,
      email: targetEmail,
      source: item.replyContextId ? "답장" : targetEmail ? "메일" : "이메일 없음",
    };
  }, [pmap]);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const visibleHistory = useMemo(() => {
    const filtered =
      filterId === "all"
        ? history
        : filterId === "reply"
          ? history.filter((item) => !!item.replyContextId)
          : history.filter((item) => item.personaId === filterId);

    if (!normalizedSearch) return filtered;

    return filtered.filter((item) => {
      const target = targetFor(item);
      return [
        item.subject,
        item.subj,
        item.prev,
        item.body,
        item.brief,
        item.replySubject,
        target.name,
        target.email,
        target.source,
        item.status,
        item.when,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch));
    });
  }, [filterId, history, normalizedSearch, targetFor]);

  useEffect(() => {
    if (openId && !visibleHistory.some((item) => item.id === openId)) {
      setOpenId(null);
    }
  }, [openId, visibleHistory]);

  const ensureHistoryDetail = useCallback(
    (item: HistoryItem) => {
      const cachedDetail = detailById[item.id];
      if (cachedDetail?.item || cachedDetail?.isLoading) return;

      setDetailById((current) => ({
        ...current,
        [item.id]: {
          ...current[item.id],
          isLoading: true,
          error: undefined,
        },
      }));

      void api
        .historyDetail(item.id)
        .then((detail) => {
          setDetailById((current) => ({
            ...current,
            [item.id]: {
              item: detail,
              isLoading: false,
            },
          }));
        })
        .catch((error: unknown) => {
          setDetailById((current) => ({
            ...current,
            [item.id]: {
              ...current[item.id],
              isLoading: false,
              error:
                error instanceof Error
                  ? error.message
                  : "상세를 불러오지 못했습니다.",
            },
          }));
        });
    },
    [detailById],
  );

  const openHistoryItem = useCallback(
    (item: HistoryItem) => {
      setOpenId(item.id);
      ensureHistoryDetail(item);
    },
    [ensureHistoryDetail],
  );

  const handleHistoryToggle = useCallback(
    (item: HistoryItem) => {
      const isClosing = openId === item.id;
      if (isClosing) {
        setOpenId(null);
        return;
      }
      openHistoryItem(item);
    },
    [openHistoryItem, openId],
  );

  useEffect(() => {
    if (!requestedOpenId) return;
    if (requestedOpenIdRef.current === requestedOpenId) return;
    const requestedItem = history.find((item) => item.id === requestedOpenId);
    if (!requestedItem) return;
    requestedOpenIdRef.current = requestedOpenId;
    openHistoryItem(requestedItem);
  }, [history, openHistoryItem, requestedOpenId]);

  useEffect(() => {
    if (!requestedOpenId || openId !== requestedOpenId) return;
    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById(`history-detail-${requestedOpenId}`)
        ?.scrollIntoView({ block: "nearest" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [openId, requestedOpenId]);

  const handleHistoryDelete = useCallback(
    async (item: HistoryItem) => {
      if (!window.confirm("이 히스토리를 삭제할까요?")) return;
      setDeletingId(item.id);
      try {
        await api.deleteHistory(item.id);
        setDetailById((current) => {
          const { [item.id]: _removed, ...rest } = current;
          return rest;
        });
        setOpenId((current) => (current === item.id ? null : current));
        onDeleted(item.id);
        onToast("히스토리를 삭제했습니다");
      } catch (error) {
        onToast(error instanceof Error ? error.message : "히스토리를 삭제하지 못했습니다.");
      } finally {
        setDeletingId(null);
      }
    },
    [onDeleted, onToast],
  );

  return (
    <div className="page history-page">
      <PageTitle
        title="히스토리"
        desc="생성된 초안과 Gmail 발송 상태를 사람과 이메일 기준으로 확인합니다."
        action={
          <div className="history-actions">
            <label className="history-filter">
              <span>사람</span>
              <select
                value={filterId}
                onChange={(event) => setFilterId(event.target.value)}
                aria-label="사람별 히스토리 필터"
              >
                <option value="all">모두</option>
                {personas.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.name}
                  </option>
                ))}
                <option value="reply">답장 기록</option>
              </select>
            </label>
            <label className="history-filter history-search">
              <IconSearch size={13} />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="제목, 본문, 사람 검색"
                aria-label="히스토리 검색"
              />
            </label>
          </div>
        }
      />

      <div className="card history-card">
        {loadError && (
          <div className="state-row error-text" role="alert">
            {loadError}
          </div>
        )}
        <div className="history-row is-head">
          <span></span>
          <span>제목 / 미리보기</span>
          <span>대상</span>
          <span>상태</span>
          <span>작성 시각</span>
        </div>
        {visibleHistory.map((item) => {
          const target = targetFor(item);
          const subject = item.subject || item.subj || "제목 없음";
          const preview = item.prev || item.body || item.brief || "미리보기 없음";
          const status = item.status || "draft";
          const toneMeta = [item.tone, item.length].filter(Boolean).join(" · ");
          const detailId = `history-detail-${item.id}`;
          const detailState = detailById[item.id];
          const detailItem = detailState?.item || item;
          const detailTarget = targetFor(detailItem);
          const detailSubject = detailItem.subject || detailItem.subj || subject;
          const detailPreview =
            detailItem.prev || detailItem.body || detailItem.brief || preview;
          const detailBody = detailItem.body || detailPreview;
          return (
            <div key={item.id}>
              <button
                type="button"
                className="history-row history-button"
                onClick={() => handleHistoryToggle(item)}
                aria-expanded={openId === item.id}
                aria-controls={detailId}
              >
                <span className="history-avatar">
                  {target.persona ? (
                    <PersonaAvatar persona={target.persona} size={22} />
                  ) : (
                    <span className="avatar">{initialsFrom(target.name)}</span>
                  )}
                </span>
                <div className="history-copy">
                  <div className="h-subj" title={subject}>
                    {subject}
                  </div>
                  <div className="h-prev" title={preview}>
                    {preview}
                  </div>
                </div>
                <div className="h-target">
                  <span>{target.name}</span>
                  <small>{target.email || target.source}</small>
                </div>
                <div className="h-status">
                  <span className={`tag ${status === "sent" ? "green" : "gray"}`}>
                    {status}
                  </span>
                  {toneMeta && <small>{toneMeta}</small>}
                </div>
                <div className="h-meta">{item.when}</div>
              </button>
              {openId === item.id && (
                <div
                  id={detailId}
                  className="history-detail"
                  role="region"
                  aria-label={`${detailSubject} 상세`}
                >
                  <div className="history-detail-head">
                    <div className="history-detail-title">{detailSubject}</div>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => void handleHistoryDelete(detailItem)}
                      disabled={deletingId === detailItem.id}
                    >
                      <IconClose size={13} />
                      {deletingId === detailItem.id ? "삭제 중" : "삭제"}
                    </button>
                    <button
                      type="button"
                      className="icon-btn history-detail-close"
                      aria-label="히스토리 상세 닫기"
                      onClick={() => setOpenId(null)}
                    >
                      <IconClose size={13} />
                    </button>
                  </div>
                  <div className="history-detail-meta">
                    <span>대상: {detailTarget.name}</span>
                    <span>{detailTarget.email || detailTarget.source}</span>
                  </div>
                  {detailState?.isLoading ? (
                    <p className="muted">상세를 불러오는 중입니다.</p>
                  ) : detailState?.error ? (
                    <p className="muted">상세를 불러오지 못했습니다.</p>
                  ) : (
                    <p>{detailBody}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {visibleHistory.length === 0 && !loadError && (
          <div className="state-row">
            {history.length === 0
              ? "아직 작성한 메일이 없습니다."
              : "검색 조건에 맞는 히스토리가 없습니다."}
          </div>
        )}
      </div>
    </div>
  );
}

function FormatSlot({
  label,
  desc,
  on,
}: {
  label: string;
  desc: string;
  on?: boolean;
}) {
  return (
    <div className="row gap-3 format-slot">
      <div className="mini-icon">
        <IconFormat size={14} />
      </div>
      <div className="grow">
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{label}</div>
        <div className="small muted">{desc}</div>
      </div>
      <span className={`tag ${on ? "green" : "gray"}`}>
        {on ? "사용 중" : "꺼짐"}
      </span>
    </div>
  );
}

const FORMAT_DIRTY_KEYS: Array<keyof MailFormat> = [
  "signature",
  "greeting",
  "closing",
  "structure",
  "bulletStyle",
  "language",
];

function validateFormatDraft(draft: MailFormat): string | null {
  if (!draft.greeting.trim()) return "인사말은 비워둘 수 없습니다.";
  if (!draft.structure.trim()) return "본문 구조는 비워둘 수 없습니다.";
  if (!draft.language.trim()) return "기본 언어는 비워둘 수 없습니다.";
  return null;
}

export function FormatScreen({
  format,
  loadError,
  onChanged,
  onToast,
}: {
  format: MailFormat;
  loadError?: string;
  onChanged: (format: MailFormat) => void;
  onToast: (message: string) => void;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(format);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const formatDirty = useMemo(
    () =>
      FORMAT_DIRTY_KEYS.some(
        (key) => String(draft[key] || "") !== String(format[key] || ""),
      ),
    [draft, format],
  );
  const formatValidationError = editing ? validateFormatDraft(draft) : null;

  useEffect(() => {
    if (!editing) setDraft(format);
  }, [editing, format]);

  useEffect(() => {
    if (!editing || !formatDirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [editing, formatDirty]);

  useEffect(() => {
    if (!editing || !formatDirty) return;
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      const nextUrl = new URL(anchor.href);
      if (nextUrl.origin !== window.location.origin) return;
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const nextPath = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
      if (currentPath === nextPath) return;
      event.preventDefault();
      event.stopPropagation();
      if (!window.confirm("저장하지 않은 메일 형식 변경을 버릴까요?")) return;
      setEditing(false);
      setDraft(format);
      router.push(nextPath);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [editing, format, formatDirty, router]);

  const cancel = () => {
    if (saving) return;
    if (formatDirty && !window.confirm("저장하지 않은 변경을 버릴까요?")) return;
    setDraft(format);
    setEditing(false);
  };

  const save = async () => {
    if (!formatDirty || saving) return;
    if (formatValidationError) {
      onToast(formatValidationError);
      return;
    }
    setSaving(true);
    try {
      const saved = await api.updateFormat(draft);
      setDraft(saved);
      onChanged(saved);
      setEditing(false);
      onToast("메일 형식을 저장했습니다");
    } catch (error) {
      onToast(error instanceof Error ? error.message : "메일 형식을 저장하지 못했습니다");
    } finally {
      setSaving(false);
    }
  };

  const renderEditActions = (placement: "top" | "bottom") => (
    <div className={`format-actions format-actions-${placement}`}>
      <button type="button" className="btn-secondary" onClick={cancel} disabled={saving}>
        취소
      </button>
      <button
        type="button"
        className="btn-primary"
        onClick={save}
        disabled={saving || !formatDirty || !!formatValidationError}
      >
        {saving ? "저장 중" : "저장"}
      </button>
    </div>
  );

  return (
    <div className="page format-page" style={{ maxWidth: 760 }}>
      <PageTitle
        title="내 메일 형식"
        desc="사용자별 인사말과 서명을 저장해 AI 생성 프롬프트에 반영합니다."
        action={
          editing ? (
            renderEditActions("top")
          ) : (
            <button type="button" className="btn-primary" onClick={() => setEditing(true)}>
              편집
            </button>
          )
        }
      />

      {loadError && (
        <div className="state-row error-text" role="alert">
          {loadError}
        </div>
      )}

      <div className="card">
        <div className="card-h">
          <div className="card-h-title">기본 형식</div>
          <span style={{ marginLeft: "auto" }} className="card-h-sub">
            기본값 · 항상 적용
          </span>
        </div>
        <div className="card-b">
          {editing ? (
            <>
              <div className="form-grid format-form-grid">
                {[
                  ["greeting", "인사말"],
                  ["structure", "본문 구조"],
                  ["bulletStyle", "불릿 스타일"],
                  ["closing", "마무리 문장"],
                  ["language", "기본 언어"],
                ].map(([key, label]) => (
                  <label key={key}>
                    <span>{label}</span>
                    <input
                      value={String(draft[key as keyof MailFormat] || "")}
                      onChange={(event) =>
                        setDraft({ ...draft, [key]: event.target.value })
                      }
                    />
                  </label>
                ))}
                <label className="span-2 format-signature">
                  <span>서명</span>
                  <textarea
                    value={draft.signature}
                    onChange={(event) =>
                      setDraft({ ...draft, signature: event.target.value })
                    }
                  />
                </label>
              </div>
              {formatValidationError && (
                <div className="state-row error-text" role="alert">
                  {formatValidationError}
                </div>
              )}
              {renderEditActions("bottom")}
            </>
          ) : (
            <div className="format-grid">
              <div className="format-row">
                <div className="k">인사말</div>
                <div className="v">{format.greeting}</div>
              </div>
              <div className="format-row">
                <div className="k">본문 구조</div>
                <div className="v">{format.structure}</div>
              </div>
              <div className="format-row">
                <div className="k">불릿 스타일</div>
                <div className="v">{format.bulletStyle}</div>
              </div>
              <div className="format-row">
                <div className="k">마무리 문장</div>
                <div className="v">{format.closing}</div>
              </div>
              <div className="format-row">
                <div className="k">기본 언어</div>
                <div className="v">{format.language}</div>
              </div>
              <div className="format-row">
                <div className="k">서명</div>
                <div className="v">{format.signature}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <div className="card-h-title">상황별 형식</div>
          <span style={{ marginLeft: "auto" }} className="card-h-sub">
            선택적
          </span>
        </div>
        <div className="card-b stack">
          <FormatSlot label="외부 메일" desc="정중한 인사 + 서명 포함" on />
          <FormatSlot label="사내 메일" desc="간결한 본문 + 짧은 서명" on />
          <FormatSlot label="캐주얼 메시지" desc="인사·서명 없이 본문만" on />
        </div>
      </div>
    </div>
  );
}

function Row({
  k,
  v,
  action,
  sub,
}: {
  k: string;
  v: ReactNode;
  action?: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="settings-row">
      <div className="settings-key">{k}</div>
      <div className="settings-value">
        <div className="settings-value-main">{v}</div>
        {sub && <div className="settings-value-sub">{sub}</div>}
      </div>
      {action && <div className="settings-row-action">{action}</div>}
    </div>
  );
}

function Integration({
  title,
  desc,
  statusLabel,
  statusTone,
  actionLabel,
  onClick,
  disabled = false,
}: {
  title: string;
  desc: string;
  statusLabel: string;
  statusTone: "green" | "amber" | "gray";
  actionLabel: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="settings-integration">
      <div className="integration-icon" aria-hidden="true">
        {title.slice(0, 1)}
      </div>
      <div className="settings-integration-copy">
        <div className="settings-integration-title">{title}</div>
        <div className="small muted">{desc}</div>
      </div>
      <span className={`tag ${statusTone}`}>{statusLabel}</span>
      <button
        type="button"
        className="btn-secondary"
        onClick={onClick}
        disabled={disabled}
      >
        {actionLabel}
      </button>
    </div>
  );
}

type NotificationPreferenceKey = "personaRecommendation" | "monthlyReport";

type NotificationPreferences = Record<NotificationPreferenceKey, boolean>;

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  personaRecommendation: true,
  monthlyReport: false,
};

const NOTIFICATION_PREFERENCE_STORAGE_KEY = "mello:settings:notifications";

function notificationTag(enabled: boolean) {
  return (
    <span className={`tag ${enabled ? "green" : "gray"}`}>
      {enabled ? "켜짐" : "꺼짐"}
    </span>
  );
}

function NotificationToggle({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={"settings-toggle" + (checked ? " is-on" : "")}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
    >
      <span className="settings-toggle-thumb" />
    </button>
  );
}

export function SettingsScreen({
  me,
  onLogout,
  onToast,
}: {
  me: MeResponse | null;
  onLogout: () => void;
  onToast: (message: string) => void;
}) {
  const [busyIntegration, setBusyIntegration] = useState<string | null>(null);
  const [notificationPrefs, setNotificationPrefs] =
    useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const busyIntegrationRef = useRef<string | null>(null);
  const userName = me?.user.name || "로그인 사용자";
  const userEmail = me?.user.email || "mello@example.com";
  const notificationPreferenceStorageKey = useMemo(() => {
    const normalizedEmail = normalizeEmailAddress(me?.user.email);
    return normalizedEmail
      ? `${NOTIFICATION_PREFERENCE_STORAGE_KEY}:${normalizedEmail}`
      : NOTIFICATION_PREFERENCE_STORAGE_KEY;
  }, [me?.user.email]);

  useEffect(() => {
    let next = DEFAULT_NOTIFICATION_PREFERENCES;
    try {
      const saved = window.localStorage.getItem(
        notificationPreferenceStorageKey,
      );
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<NotificationPreferences>;
        next = {
          ...DEFAULT_NOTIFICATION_PREFERENCES,
          personaRecommendation:
            typeof parsed.personaRecommendation === "boolean"
              ? parsed.personaRecommendation
              : DEFAULT_NOTIFICATION_PREFERENCES.personaRecommendation,
          monthlyReport:
            typeof parsed.monthlyReport === "boolean"
              ? parsed.monthlyReport
              : DEFAULT_NOTIFICATION_PREFERENCES.monthlyReport,
        };
      }
    } catch {
      next = DEFAULT_NOTIFICATION_PREFERENCES;
    }
    setNotificationPrefs(next);
  }, [notificationPreferenceStorageKey]);

  const setIntegrationBusy = (value: string | null) => {
    busyIntegrationRef.current = value;
    setBusyIntegration(value);
  };

  const planned = async (provider: string) => {
    if (busyIntegrationRef.current) return;
    setIntegrationBusy(provider);
    try {
      const result = await api.toggleIntegration(provider);
      onToast(result.message);
    } catch (error) {
      onToast(error instanceof Error ? error.message : "통합 상태를 처리하지 못했습니다");
    } finally {
      setIntegrationBusy(null);
    }
  };
  const reauthorizeGoogle = async () => {
    if (busyIntegrationRef.current) return;
    setIntegrationBusy("google");
    try {
      window.location.href = await startGoogleLogin("/settings");
    } catch (error) {
      setIntegrationBusy(null);
      onToast(
        error instanceof Error ? error.message : "Google 재동의를 시작하지 못했습니다.",
      );
    }
  };
  const gmailConnected = !!me?.integrations.gmail;
  const contactsConnected = !!me?.integrations.contacts;
  const toggleNotification = (key: NotificationPreferenceKey, label: string) => {
    const next = { ...notificationPrefs, [key]: !notificationPrefs[key] };
    setNotificationPrefs(next);
    try {
      window.localStorage.setItem(
        notificationPreferenceStorageKey,
        JSON.stringify(next),
      );
    } catch {
      // Local notification preferences are a client-side convenience only.
    }
    onToast(`${label}을 ${next[key] ? "켰습니다" : "껐습니다"}`);
  };

  return (
    <div className="page settings-page">
      <PageTitle title="설정" desc="계정과 통합을 관리합니다." />

      <div className="card settings-account-card">
        <div className="card-h">
          <div className="card-h-title">계정</div>
        </div>
        <div className="card-b">
          <div className="settings-account-summary">
            <div className="settings-account-avatar">
              {initialsFrom(userName || userEmail)}
            </div>
            <div className="settings-account-copy">
              <div className="settings-account-name">{userName}</div>
              <div className="settings-account-mail">{userEmail}</div>
            </div>
            <span className="tag amber">Free · 30회 / 월</span>
          </div>
          <Row k="이메일" v={userEmail} />
          <Row k="이름" v={userName} />
          <Row
            k="요금제"
            v={<span className="tag amber">Free · 30회 / 월</span>}
            sub="백엔드 quota enforcement 없이 정적 라벨로 표시됩니다."
          />
          <Row
            k="세션"
            v="HttpOnly 쿠키 기반 서버 세션"
            action={
              <button type="button" className="btn-secondary" onClick={onLogout}>
                로그아웃
              </button>
            }
          />
        </div>
      </div>

      <div className="card settings-integration-card">
        <div className="card-h">
          <div className="card-h-title">통합</div>
        </div>
        <div className="card-b stack">
          <Integration
            title="Gmail"
            desc="받은편지함 조회 · 사용자 본인 명의 발송"
            statusLabel={gmailConnected ? "연결됨" : "권한 필요"}
            statusTone={gmailConnected ? "green" : "amber"}
            actionLabel={
              busyIntegration === "google" && !gmailConnected
                ? "재동의 중"
                : gmailConnected
                  ? "관리"
                  : "재동의"
            }
            onClick={gmailConnected ? () => void planned("gmail") : reauthorizeGoogle}
            disabled={!!busyIntegration}
          />
          <Integration
            title="Google Contacts"
            desc="연락처를 페르소나 후보로 가져오기"
            statusLabel={contactsConnected ? "연결됨" : "권한 필요"}
            statusTone={contactsConnected ? "green" : "amber"}
            actionLabel={
              busyIntegration === "google" && !contactsConnected
                ? "재동의 중"
                : contactsConnected
                  ? "관리"
                  : "재동의"
            }
            onClick={
              contactsConnected ? () => void planned("contacts") : reauthorizeGoogle
            }
            disabled={!!busyIntegration}
          />
          <Integration
            title="Slack"
            desc="지원 예정 통합"
            statusLabel="지원 예정"
            statusTone="gray"
            actionLabel={busyIntegration === "slack" ? "확인 중" : "안내"}
            onClick={() => void planned("slack")}
            disabled={!!busyIntegration}
          />
          <Integration
            title="Notion"
            desc="지원 예정 통합"
            statusLabel="지원 예정"
            statusTone="gray"
            actionLabel={busyIntegration === "notion" ? "확인 중" : "안내"}
            onClick={() => void planned("notion")}
            disabled={!!busyIntegration}
          />
        </div>
      </div>

      <div className="card settings-notification-card">
        <div className="card-h">
          <div className="card-h-title">알림</div>
        </div>
        <div className="card-b">
          <Row
            k="새 페르소나 추천 알림"
            v={notificationTag(notificationPrefs.personaRecommendation)}
            sub="새 연락처나 답장 발신자 기준으로 추천이 생기면 알려줍니다."
            action={
              <NotificationToggle
                label="새 페르소나 추천 알림"
                checked={notificationPrefs.personaRecommendation}
                onToggle={() =>
                  toggleNotification(
                    "personaRecommendation",
                    "새 페르소나 추천 알림",
                  )
                }
              />
            }
          />
          <Row
            k="월간 사용 리포트"
            v={notificationTag(notificationPrefs.monthlyReport)}
            sub="이번 달 생성/발송 요약을 월간 리포트로 받습니다."
            action={
              <NotificationToggle
                label="월간 사용 리포트"
                checked={notificationPrefs.monthlyReport}
                onToggle={() =>
                  toggleNotification("monthlyReport", "월간 사용 리포트")
                }
              />
            }
          />
        </div>
      </div>
    </div>
  );
}

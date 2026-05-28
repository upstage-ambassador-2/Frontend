"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { HistoryItem, MailFormat, Persona } from "@/lib/data";
import {
  api,
  generateDraft,
  toFiveStepScale,
  type ReplyContext,
} from "@/lib/api";
import { emailsMatch, extractEmailAddress } from "@/lib/email";
import { PersonaAvatar } from "./PersonaAvatar";
import {
  IconCheck,
  IconClose,
  IconCopy,
  IconRefresh,
  IconSend,
  IconSparkle,
} from "./icons";

function RecipientPicker({
  personas,
  current,
  onPick,
  label = "받는 사람 변경",
  disabled = false,
}: {
  personas: Persona[];
  current: string;
  onPick: (id: string) => void;
  label?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="recipient-picker">
      <button
        type="button"
        className="recipient-change"
        onClick={() => {
          if (disabled) return;
          setOpen((value) => !value);
        }}
        aria-expanded={open}
        disabled={disabled}
      >
        {label}
      </button>
      {open && (
        <div role="listbox" aria-label="받는 사람 선택" className="popover">
          <div className="popover-label">등록된 사람</div>
          {personas.map((persona) => (
            <button
              key={persona.id}
              type="button"
              className="side-person"
              role="option"
              aria-selected={current === persona.id}
              disabled={disabled}
              style={{ width: "100%" }}
              onClick={() => {
                onPick(persona.id);
                setOpen(false);
              }}
            >
              <PersonaAvatar persona={persona} size={22} />
              <span style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "var(--text)" }}>
                  {persona.name}
                </div>
                <div className="small muted mt-1">{persona.relation}</div>
              </span>
              {current === persona.id && <IconCheck size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RecipientCard({
  persona,
  personas,
  onPick,
  replyContext,
  locked,
}: {
  persona: Persona | undefined;
  personas: Persona[];
  onPick: (id: string) => void;
  replyContext: ReplyContext | null;
  locked: boolean;
}) {
  if (!persona) {
    return (
      <div className="recipient recipient-empty">
        {personas.length > 0 ? (
          <RecipientPicker
            personas={personas}
            current=""
            onPick={onPick}
            label="받는 사람 선택"
            disabled={locked}
          />
        ) : (
          <div className="small muted">먼저 페르소나를 추가해주세요.</div>
        )}
      </div>
    );
  }

  const email = persona.email?.trim() || "";
  const replyEmail = extractEmailAddress(replyContext?.fromAddr);
  const replyMatchesPersona = emailsMatch(persona.email, replyContext?.fromAddr);
  const deliveryLabel = replyContext
    ? replyMatchesPersona
      ? `답장 발신자와 연결됨 · ${replyEmail}`
      : `답장 대상 · ${replyContext.fromAddr}`
    : email
    ? `Gmail 발송 대상 · ${email}`
    : "이메일 없음 · 발송 전 People에서 이메일을 추가하세요";

  return (
    <div className="recipient">
      <PersonaAvatar persona={persona} size={42} />
      <div className="recipient-main">
        <div className="recipient-name">{persona.name}</div>
        <div className="recipient-meta">
          <span>{persona.relation}</span>
          {persona.role && <span className="dot" />}
          {persona.role && <span>{persona.role}</span>}
          {persona.email && <span className="dot" />}
          {persona.email && <span>{persona.email}</span>}
        </div>
        <div className="recipient-delivery">
          <span
            className={
              "delivery-state " +
              (replyContext || email ? "is-ready" : "is-missing")
            }
          />
          <span>{deliveryLabel}</span>
        </div>
        <div className="recipient-tags">
          {(persona.keywords || []).slice(0, 4).map((keyword, index) => (
            <span key={index} className={`tag ${persona.tagColor || "gray"}`}>
              {keyword}
            </span>
          ))}
        </div>
      </div>
      {!replyContext && (
        <RecipientPicker
          personas={personas}
          current={persona.id}
          onPick={onPick}
          disabled={locked}
        />
      )}
    </div>
  );
}

type ScaleOption = {
  value: number;
  label: string;
};

const TONE_SCALE: ScaleOption[] = [
  { value: 0, label: "매우 격식" },
  { value: 25, label: "격식" },
  { value: 50, label: "중립" },
  { value: 75, label: "친근" },
  { value: 100, label: "매우 친근" },
];

const LENGTH_SCALE: ScaleOption[] = [
  { value: 0, label: "매우 짧게" },
  { value: 25, label: "짧게" },
  { value: 50, label: "보통" },
  { value: 75, label: "자세히" },
  { value: 100, label: "매우 자세히" },
];

function selectedScaleOption(options: ScaleOption[], value: number): ScaleOption {
  const scaledValue = toFiveStepScale(value);
  return (
    options.find((option) => option.value === scaledValue) ??
    options[Math.floor(options.length / 2)]
  );
}

function Knob({
  label,
  options,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  options: ScaleOption[];
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  const selected = selectedScaleOption(options, value);

  return (
    <div>
      <div className="knob-label">
        <b>{label}</b>
        <span className="v">{selected.label}</span>
      </div>
      <div className="knob-options" aria-label={`${label} 선택`} role="group">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={
              "knob-option" +
              (selected.value === option.value ? " is-selected" : "")
            }
            aria-pressed={selected.value === option.value}
            disabled={disabled}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

type DraftState = {
  subject: string;
  body: string;
  history: HistoryItem | null;
};

type Props = {
  personas: Persona[];
  format: MailFormat;
  onToast: (message: string) => void;
  selectedId: string;
  setSelectedId: (id: string) => void;
  tone: number;
  setTone: (value: number) => void;
  length: number;
  setLength: (value: number) => void;
  brief: string;
  setBrief: (value: string) => void;
  replyContext: ReplyContext | null;
  onClearReplyContext: () => void;
  onHistoryCreated: (item: HistoryItem) => void;
  onHistoryUpdated: (item: HistoryItem) => void;
};

export function ComposerScreen({
  personas,
  format,
  onToast,
  selectedId,
  setSelectedId,
  tone,
  setTone,
  length,
  setLength,
  brief,
  setBrief,
  replyContext,
  onClearReplyContext,
  onHistoryCreated,
  onHistoryUpdated,
}: Props) {
  const persona = useMemo(
    () => personas.find((item) => item.id === selectedId),
    [personas, selectedId],
  );
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [formatExpanded, setFormatExpanded] = useState(false);
  const [draftEditedSinceGenerate, setDraftEditedSinceGenerate] =
    useState(false);
  const requestRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const sendingRef = useRef(false);
  const draftSaveTimerRef = useRef<number | null>(null);
  const draftSaveSeqRef = useRef(0);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [draftSaveState, setDraftSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  useEffect(() => {
    if (!taRef.current) return;
    taRef.current.style.height = "auto";
    taRef.current.style.height =
      Math.min(260, Math.max(96, taRef.current.scrollHeight)) + "px";
  }, [brief]);

  const toneOption = selectedScaleOption(TONE_SCALE, tone);
  const lengthOption = selectedScaleOption(LENGTH_SCALE, length);
  const toneLabel = toneOption.label;
  const lengthLabel = lengthOption.label;

  const canGenerate = !!brief.trim() || !!replyContext;
  const draftAlreadySent = draft?.history?.status === "sent";
  const canRequestGenerate = canGenerate && !generating;
  const canSend =
    !!draft?.subject.trim() &&
    !!draft?.body.trim() &&
    !generating &&
    !sending &&
    !draftAlreadySent &&
    (!!replyContext || !!persona?.email);
  const canEditDraft =
    !!draft && !generating && draft.history?.status !== "sent";
  const canResetDraft =
    canEditDraft && !sending && (!!draft?.subject.trim() || !!draft?.body.trim());
  const currentSubject = draft?.subject || "";
  const currentBody = draft?.body || "";

  const clearPendingDraftSave = useCallback(() => {
    if (draftSaveTimerRef.current) {
      window.clearTimeout(draftSaveTimerRef.current);
      draftSaveTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearPendingDraftSave, [clearPendingDraftSave]);

  const applyDraftHistory = useCallback(
    (history: HistoryItem) => {
      onHistoryUpdated(history);
      setDraft((current) =>
        current?.history?.id === history.id
          ? {
              ...current,
              subject: history.subject ?? current.subject,
              body: history.body ?? current.body,
              history,
            }
          : current,
      );
    },
    [onHistoryUpdated],
  );

  const scheduleDraftSave = useCallback(
    (historyId: string, subject: string, body: string) => {
      clearPendingDraftSave();
      const requestSeq = draftSaveSeqRef.current + 1;
      draftSaveSeqRef.current = requestSeq;
      setDraftSaveState("saving");
      draftSaveTimerRef.current = window.setTimeout(() => {
        draftSaveTimerRef.current = null;
        void api
          .updateHistoryDraft(historyId, { subject, body })
          .then((history) => {
            if (draftSaveSeqRef.current !== requestSeq) return;
            applyDraftHistory(history);
            setDraftSaveState("saved");
          })
          .catch((error: unknown) => {
            if (draftSaveSeqRef.current !== requestSeq) return;
            setDraftSaveState("error");
            onToast(
              error instanceof Error
                ? error.message
                : "수정한 초안을 저장하지 못했습니다.",
            );
          });
      }, 500);
    },
    [applyDraftHistory, clearPendingDraftSave, onToast],
  );

  const editDraftBody = useCallback(
    (body: string) => {
      setDraftEditedSinceGenerate(true);
      setDraft((current) => {
        if (!current) return current;
        const next = { ...current, body };
        const historyId = current.history?.id;
        if (historyId && current.history?.status !== "sent") {
          scheduleDraftSave(historyId, next.subject, next.body);
        } else {
          setDraftSaveState("idle");
        }
        return next;
      });
    },
    [scheduleDraftSave],
  );

  const editDraftSubject = useCallback(
    (subject: string) => {
      setDraftEditedSinceGenerate(true);
      setDraft((current) => {
        if (!current) return current;
        const next = { ...current, subject };
        const historyId = current.history?.id;
        if (historyId && current.history?.status !== "sent") {
          scheduleDraftSave(historyId, next.subject, next.body);
        } else {
          setDraftSaveState("idle");
        }
        return next;
      });
    },
    [scheduleDraftSave],
  );

  const runGenerate = useCallback(async () => {
    if (!canRequestGenerate) return;
    const previousDraftEdited = draftEditedSinceGenerate;
    if (
      previousDraftEdited &&
      draft &&
      !window.confirm("수정한 초안을 새 생성 결과로 덮어쓸까요?")
    ) {
      return;
    }
    clearPendingDraftSave();
    draftSaveSeqRef.current += 1;
    setDraftSaveState("idle");
    const previousDraft = draft;
    setDraftEditedSinceGenerate(false);
    let receivedDelta = false;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setGenerating(true);

    try {
      await generateDraft(
        {
          brief,
          tone: toneOption.value,
          length: lengthOption.value,
          personaId: persona?.id || null,
          replyContextId: replyContext?.id || null,
        },
        {
          onDelta: (chunk, subject) => {
            if (requestRef.current !== requestId) return;
            const isFirstDelta = !receivedDelta;
            receivedDelta = true;
            setDraft((current) => ({
              subject: subject || (isFirstDelta ? "" : current?.subject || ""),
              body: `${isFirstDelta ? "" : current?.body || ""}${chunk}`,
              history: isFirstDelta ? null : current?.history || null,
            }));
          },
          onDone: (result) => {
            if (requestRef.current !== requestId) return;
            setDraft(result);
            setDraftEditedSinceGenerate(false);
            if (result.history) onHistoryCreated(result.history);
          },
          onError: (message) => {
            if (requestRef.current !== requestId) return;
            setDraft(previousDraft);
            setDraftEditedSinceGenerate(previousDraftEdited);
            onToast(message);
          },
        },
        controller.signal,
      );
    } catch (error) {
      if (controller.signal.aborted) return;
      setDraft(previousDraft);
      setDraftEditedSinceGenerate(previousDraftEdited);
      onToast(error instanceof Error ? error.message : "초안 생성에 실패했습니다.");
    } finally {
      if (requestRef.current === requestId) setGenerating(false);
    }
  }, [
    brief,
    canRequestGenerate,
    clearPendingDraftSave,
    draft,
    draftEditedSinceGenerate,
    lengthOption.value,
    onHistoryCreated,
    onToast,
    persona?.id,
    replyContext,
    toneOption.value,
  ]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.isComposing) return;
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        const target = event.target as HTMLElement | null;
        const isResultEditor =
          target?.closest("[data-testid='result-panel']") &&
          (target instanceof HTMLInputElement ||
            target instanceof HTMLTextAreaElement);
        if (isResultEditor) return;
        event.preventDefault();
        void runGenerate();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [runGenerate]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentBody);
      onToast("복사되었습니다");
    } catch {
      onToast("클립보드에 접근하지 못했습니다");
    }
  }, [currentBody, onToast]);

  const send = useCallback(async () => {
    if (!draft?.subject.trim() || !draft?.body.trim() || sendingRef.current) {
      return;
    }
    if (draft.history?.status === "sent") {
      onToast("이미 발송된 초안입니다.");
      return;
    }
    if (!replyContext && !persona?.email) {
      onToast("받는 사람 이메일이 필요합니다.");
      return;
    }
    clearPendingDraftSave();
    draftSaveSeqRef.current += 1;
    setDraftSaveState("idle");
    sendingRef.current = true;
    setSending(true);
    try {
      const result = await api.send({
        to: replyContext ? undefined : persona?.email,
        subject: draft.subject,
        body: draft.body,
        historyId: draft.history?.id,
        replyContextId: replyContext?.id,
      });
      if (result.history) {
        onHistoryUpdated(result.history);
        setDraft((current) =>
          current
            ? {
                ...current,
                subject: result.history?.subject ?? current.subject,
                body: result.history?.body ?? current.body,
                history: result.history,
              }
            : current,
        );
      }
      setDraftEditedSinceGenerate(false);
      onToast("Gmail로 발송되었습니다");
    } catch (error) {
      onToast(error instanceof Error ? error.message : "메일 발송에 실패했습니다.");
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }, [
    clearPendingDraftSave,
    draft,
    onHistoryUpdated,
    onToast,
    persona?.email,
    replyContext,
  ]);

  const resetDraft = useCallback(async () => {
    if (!draft || !canResetDraft) return;
    if (!window.confirm("작성된 초안을 비울까요?")) return;
    clearPendingDraftSave();
    draftSaveSeqRef.current += 1;
    const historyId = draft.history?.id;
    if (!historyId) {
      setDraft({ ...draft, subject: "", body: "" });
      setDraftEditedSinceGenerate(false);
      setDraftSaveState("idle");
      onToast("초안을 비웠습니다");
      return;
    }
    setDraftSaveState("saving");
    try {
      const history = await api.resetHistoryDraft(historyId);
      applyDraftHistory(history);
      setDraftEditedSinceGenerate(false);
      setDraftSaveState("saved");
      onToast("초안을 비웠습니다");
    } catch (error) {
      setDraftSaveState("error");
      onToast(error instanceof Error ? error.message : "초안을 비우지 못했습니다.");
    }
  }, [
    applyDraftHistory,
    canResetDraft,
    clearPendingDraftSave,
    draft,
    onToast,
  ]);

  return (
    <div className="page">
      <div>
        <div className="section-label">받는 사람</div>
        <RecipientCard
          persona={persona}
          personas={personas}
          onPick={setSelectedId}
          replyContext={replyContext}
          locked={generating}
        />
      </div>

      {replyContext && (
        <div className="reply-context">
          <div className="reply-context-body">
            <div className="card-h-title">답장 컨텍스트</div>
            <div className="small muted mt-1 reply-context-meta">
              {replyContext.fromAddr} · {replyContext.subject}
            </div>
            <div className="reply-snippet">{replyContext.snippet}</div>
          </div>
          <button
            type="button"
            className="btn-secondary reply-context-clear"
            onClick={onClearReplyContext}
            disabled={generating}
          >
            제거
          </button>
        </div>
      )}

      <div>
        <div className="section-label row between">
          <span>전달할 내용</span>
          <span className="section-help">
            답장에서는 비워둬도 원문 맥락으로 작성합니다
          </span>
        </div>
        <div className="card">
          <textarea
            ref={taRef}
            className="compose-input"
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
            placeholder="예: 결제 모듈 일정이 하루 정도 지연될 것 같음. 내일까지 완료 가능."
            readOnly={generating}
            aria-disabled={generating}
            data-testid="brief-input"
          />

          <div className="knobs">
            <Knob
              label="말투"
              options={TONE_SCALE}
              value={tone}
              onChange={setTone}
              disabled={generating}
            />
            <Knob
              label="길이"
              options={LENGTH_SCALE}
              value={length}
              onChange={setLength}
              disabled={generating}
            />
          </div>

          <div className="compose-foot">
            <button
              type="button"
              className={
                "foot-meta format-summary" +
                (formatExpanded ? " is-expanded" : "")
              }
              onClick={() => setFormatExpanded((value) => !value)}
              aria-expanded={formatExpanded}
              aria-label={
                formatExpanded ? "내 메일 형식 접기" : "내 메일 형식 펼치기"
              }
              title={format.structure}
            >
              <span className="format-summary-label">내 메일 형식:</span>
              <span className="format-summary-text">{format.structure}</span>
            </button>
            <span className="foot-spacer" />
            <span className="foot-hint">
              <kbd>⌘</kbd> <kbd>↵</kbd> 작성 요청
            </span>
            <button
              type="button"
              className="btn-primary"
              onClick={runGenerate}
              disabled={!canRequestGenerate}
              data-testid="generate-btn"
            >
              <IconSparkle size={14} />
              {generating ? "작성 중" : "Mello에게 작성 요청"}
            </button>
          </div>
        </div>
      </div>

      {(draft || generating) && (
        <div className="result" data-testid="result-panel">
          <div className="result-h">
            <div className="result-title" role="status" aria-live="polite">
              {generating ? (
                <>
                  <span className="result-spinner" aria-hidden />
                  <span>Mello가 작성 중</span>
                </>
              ) : (
                <>
                  <IconSparkle size={14} style={{ color: "var(--accent)" }} />
                  <span>작성 결과</span>
                </>
              )}
            </div>
            <div className="result-tools">
              <button
                type="button"
                className="icon-btn"
                onClick={runGenerate}
                aria-label="다시 생성"
                disabled={!canRequestGenerate}
              >
                <IconRefresh size={15} />
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={copy}
                aria-label="복사"
                disabled={!currentBody}
              >
                <IconCopy size={15} />
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => void resetDraft()}
                aria-label="초안 비우기"
                disabled={!canResetDraft}
              >
                <IconClose size={15} />
              </button>
            </div>
          </div>

          {(draft?.subject || (!generating && draft)) && (
            <div className="result-subject">
              <span>제목</span>
              {generating ? (
                <b>{currentSubject}</b>
              ) : (
                <input
                  aria-label="작성 결과 제목 편집"
                  data-testid="result-subject"
                  value={currentSubject}
                  onChange={(event) => editDraftSubject(event.target.value)}
                  readOnly={!canEditDraft}
                  placeholder="제목을 입력하세요"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    border: 0,
                    background: "transparent",
                    color: "var(--text)",
                    font: "inherit",
                    fontWeight: 600,
                    outline: "none",
                    padding: 0,
                  }}
                />
              )}
            </div>
          )}

          {generating ? (
            <div className="result-body thin-scroll" data-testid="result-body">
              {currentBody}
              <span className="cursor" aria-hidden />
            </div>
          ) : (
            <textarea
              className="result-body thin-scroll"
              data-testid="result-body"
              aria-label="작성 결과 본문 편집"
              value={currentBody}
              onChange={(event) => editDraftBody(event.target.value)}
              readOnly={!canEditDraft}
              style={{
                width: "100%",
                border: 0,
                background: "transparent",
                outline: "none",
                resize: "vertical",
                display: "block",
                fontFamily: "inherit",
              }}
            />
          )}

          <div className="result-analysis">
            <span className="analysis-label">반영</span>
            <span className="tag amber">{toneLabel}</span>
            <span className="tag green">{lengthLabel}</span>
            {replyContext && <span className="tag blue">답장 컨텍스트</span>}
            {draft?.history?.id && draft.history.status !== "sent" && (
              <span
                className={`tag ${
                  draftSaveState === "error"
                    ? "amber"
                    : draftSaveState === "saving"
                      ? "gray"
                      : "green"
                }`}
              >
                {draftSaveState === "saving"
                  ? "저장 중"
                  : draftSaveState === "error"
                    ? "저장 실패"
                    : "수동 편집 가능"}
              </span>
            )}
            {draft?.history?.status && (
              <span className={`tag ${draft.history.status === "sent" ? "green" : "gray"}`}>
                {draft.history.status}
              </span>
            )}
          </div>

          <div className="result-foot">
            <span className="format-pill">
              <b>형식</b>
              <span style={{ color: "var(--text-3)" }}>· 인사말/서명 적용</span>
            </span>
            <span className="format-pill">
              <b>채널</b>
              <span style={{ color: "var(--text-3)" }}>· Gmail</span>
            </span>
            <div className="result-spacer" />
            <button
              type="button"
              className="btn-secondary"
              onClick={() => void resetDraft()}
              disabled={!canResetDraft}
            >
              <IconClose size={14} /> 비우기
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={copy}
              disabled={!currentBody}
            >
              <IconCopy size={14} /> 복사
            </button>
            {!replyContext && !persona && (
              <span className="send-warning">받는 사람 선택 후 발송 가능</span>
            )}
            {!replyContext && persona && !persona.email && (
              <span className="send-warning">이메일 추가 후 발송 가능</span>
            )}
            <button
              type="button"
              className="btn-primary"
              onClick={send}
              disabled={!canSend}
              data-testid="send-btn"
            >
              <IconSend size={14} />
              {draftAlreadySent ? "발송 완료" : sending ? "보내는 중" : "보내기"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

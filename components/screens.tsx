"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { HistoryItem, MailFormat, Persona } from "@/lib/data";
import {
  api,
  type GmailMessage,
  type MeResponse,
  type PersonaPayload,
  type ReplyContext,
} from "@/lib/api";
import { PersonaAvatar } from "./PersonaAvatar";
import {
  IconChat,
  IconFormat,
  IconHistory,
  IconMail,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSend,
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

type PersonaDraft = PersonaPayload & { id?: string };

const emptyPersona: PersonaDraft = {
  name: "",
  relation: "",
  tone: "중립",
  notes: "",
  email: "",
};

export function PeopleScreen({
  personas,
  onOpen,
  onChanged,
  onToast,
}: {
  personas: Persona[];
  onOpen: (id: string) => void;
  onChanged: (items: Persona[]) => void;
  onToast: (message: string) => void;
}) {
  const [draft, setDraft] = useState<PersonaDraft | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!draft?.name.trim()) {
      onToast("이름은 필수입니다");
      return;
    }
    setSaving(true);
    try {
      const payload: PersonaPayload = {
        name: draft.name,
        relation: draft.relation,
        tone: draft.tone,
        notes: draft.notes,
        email: draft.email || undefined,
      };
      const saved = draft.id
        ? await api.updatePersona(draft.id, payload)
        : await api.createPersona(payload);
      onChanged(
        draft.id
          ? personas.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...personas],
      );
      setDraft(null);
      onToast(draft.id ? "페르소나를 수정했습니다" : "페르소나를 추가했습니다");
    } catch (error) {
      onToast(error instanceof Error ? error.message : "저장하지 못했습니다");
    } finally {
      setSaving(false);
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
    try {
      const result = await api.importContacts();
      onChanged(result.personas);
      onToast(`Contacts에서 ${result.imported}명 가져옴 · ${result.skipped}명 건너뜀`);
    } catch (error) {
      onToast(error instanceof Error ? error.message : "Contacts를 가져오지 못했습니다");
    }
  };

  return (
    <div className="page" style={{ maxWidth: 1040 }}>
      <PageTitle
        title="사람"
        desc="자주 보내는 사람의 관계, 톤, 메모를 사용자별로 저장합니다."
        action={
          <div className="row gap-2">
            <button type="button" className="btn-secondary" onClick={importContacts}>
              <IconMail size={13} /> Contacts에서 가져오기
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setDraft(emptyPersona)}
            >
              <IconPlus size={14} /> 사람 추가
            </button>
          </div>
        }
      />

      {draft && (
        <div className="card form-card">
          <div className="form-grid">
            <label>
              <span>이름</span>
              <input
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                placeholder="예: 김지훈 팀장"
              />
            </label>
            <label>
              <span>이메일</span>
              <input
                value={draft.email || ""}
                onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                placeholder="lead@example.com"
              />
            </label>
            <label>
              <span>관계</span>
              <input
                value={draft.relation}
                onChange={(event) =>
                  setDraft({ ...draft, relation: event.target.value })
                }
                placeholder="회사 · 직속 상사"
              />
            </label>
            <label>
              <span>톤</span>
              <input
                value={draft.tone}
                onChange={(event) => setDraft({ ...draft, tone: event.target.value })}
                placeholder="결론 우선"
              />
            </label>
            <label className="span-2">
              <span>메모</span>
              <textarea
                value={draft.notes}
                onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
                placeholder="선호하는 문장 구조나 피해야 할 표현"
              />
            </label>
          </div>
          <div className="row gap-2" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="btn-secondary" onClick={() => setDraft(null)}>
              취소
            </button>
            <button type="button" className="btn-primary" onClick={save} disabled={saving}>
              저장
            </button>
          </div>
        </div>
      )}

      <div className="people-grid">
        {personas.map((persona) => (
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
                <span className="person-card-mbti">{persona.source || "manual"}</span>
              </div>
              <div className="person-card-tags">
                <span className={`tag ${persona.tagColor || "gray"}`}>
                  {persona.tone || "중립"}
                </span>
                {(persona.keywords || []).slice(0, 3).map((keyword, index) => (
                  <span key={index} className={`tag ${persona.tagColor || "gray"}`}>
                    {keyword}
                  </span>
                ))}
              </div>
              <div className="person-card-foot">
                <IconHistory size={12} /> 마지막 작성 · {persona.lastUsed}
                <span className="person-card-channel">
                  {persona.channel?.includes("이메일") ? (
                    <IconMail size={12} />
                  ) : (
                    <IconChat size={12} />
                  )}
                  {persona.email || persona.channel}
                </span>
              </div>
            </button>
            <div className="card-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  setDraft({
                    id: persona.id,
                    name: persona.name,
                    relation: persona.relation,
                    tone: persona.tone || "중립",
                    notes: persona.notes || "",
                    email: persona.email || "",
                  })
                }
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
        ))}
        {personas.length === 0 && (
          <div className="empty-card">
            <IconPlus size={18} />
            <div>아직 등록된 페르소나가 없습니다.</div>
          </div>
        )}
      </div>
    </div>
  );
}

export function InboxScreen({
  onReply,
  onToast,
}: {
  onReply: (context: ReplyContext) => void;
  onToast: (message: string) => void;
}) {
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setMessages(await api.gmailMessages());
    } catch (err) {
      setError(err instanceof Error ? err.message : "받은편지함을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const open = async (message: GmailMessage) => {
    setOpeningId(message.id);
    try {
      const detail = await api.gmailMessage(message.id);
      onReply(detail.replyContext);
    } catch (err) {
      onToast(err instanceof Error ? err.message : "메일 원문을 불러오지 못했습니다.");
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 1040 }}>
      <PageTitle
        title="받은편지함"
        desc="최근 Gmail 메일을 고르면 작성 화면에서 답장 초안을 만들 수 있습니다."
        action={
          <button type="button" className="btn-secondary" onClick={() => void load()}>
            <IconRefresh size={13} /> 새로고침
          </button>
        }
      />

      <div className="card inbox-card">
        {loading && <div className="state-row">받은편지함을 불러오는 중입니다.</div>}
        {error && <div className="state-row error-text">{error}</div>}
        {!loading && !error && messages.length === 0 && (
          <div className="state-row">최근 받은 메일이 없습니다.</div>
        )}
        {messages.map((message) => (
          <button
            key={message.id}
            type="button"
            className="inbox-row"
            onClick={() => void open(message)}
          >
            <div className="inbox-from">{message.fromAddr}</div>
            <div className="inbox-main">
              <div className="inbox-subject">{message.subject}</div>
              <div className="inbox-snippet">{message.snippet}</div>
            </div>
            <div className="inbox-date">
              {openingId === message.id ? "여는 중" : message.date}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function HistoryScreen({
  history,
  personas,
}: {
  history: HistoryItem[];
  personas: Persona[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const pmap = useMemo(
    () => Object.fromEntries(personas.map((persona) => [persona.id, persona])),
    [personas],
  );

  return (
    <div className="page" style={{ maxWidth: 1040 }}>
      <PageTitle
        title="히스토리"
        desc="생성된 초안과 Gmail 발송 상태를 사용자별로 확인합니다."
        action={
          <div className="row gap-2">
            <button type="button" className="btn-secondary">
              필터 · 모두
            </button>
            <button type="button" className="btn-secondary">
              <IconSearch size={13} /> 검색
            </button>
          </div>
        }
      />

      <div className="card" style={{ padding: 0 }}>
        <div className="history-row is-head">
          <span></span>
          <span>제목 / 미리보기</span>
          <span>대상</span>
          <span>상태</span>
          <span>작성 시각</span>
        </div>
        {history.map((item) => {
          const persona = item.personaId ? pmap[item.personaId] : undefined;
          return (
            <div key={item.id}>
              <button
                type="button"
                className="history-row history-button"
                onClick={() => setOpenId(openId === item.id ? null : item.id)}
              >
                {persona ? (
                  <PersonaAvatar persona={persona} size={22} />
                ) : (
                  <span className="avatar">R</span>
                )}
                <div style={{ minWidth: 0 }}>
                  <div className="h-subj">{item.subj || item.subject}</div>
                  <div className="h-prev">{item.prev}</div>
                </div>
                <div className="h-meta">{persona?.name || "답장"}</div>
                <div>
                  <span className={`tag ${item.status === "sent" ? "green" : "gray"}`}>
                    {item.status || "draft"}
                  </span>
                </div>
                <div className="h-meta">{item.when}</div>
              </button>
              {openId === item.id && (
                <div className="history-detail">
                  <b>{item.subject || item.subj}</b>
                  <p>{item.body || item.prev}</p>
                </div>
              )}
            </div>
          );
        })}
        {history.length === 0 && (
          <div className="state-row">아직 작성한 메일이 없습니다.</div>
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
    <div className="row gap-3" style={{ padding: "8px 4px" }}>
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

export function FormatScreen({
  format,
  onChanged,
  onToast,
}: {
  format: MailFormat;
  onChanged: (format: MailFormat) => void;
  onToast: (message: string) => void;
}) {
  const [draft, setDraft] = useState(format);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setDraft(format);
  }, [format]);

  const save = async () => {
    try {
      const saved = await api.updateFormat(draft);
      onChanged(saved);
      setEditing(false);
      onToast("메일 형식을 저장했습니다");
    } catch (error) {
      onToast(error instanceof Error ? error.message : "메일 형식을 저장하지 못했습니다");
    }
  };

  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <PageTitle
        title="내 메일 형식"
        desc="사용자별 인사말과 서명을 저장해 AI 생성 프롬프트에 반영합니다."
        action={
          editing ? (
            <div className="row gap-2">
              <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
                취소
              </button>
              <button type="button" className="btn-primary" onClick={save}>
                저장
              </button>
            </div>
          ) : (
            <button type="button" className="btn-primary" onClick={() => setEditing(true)}>
              편집
            </button>
          )
        }
      />

      <div className="card">
        <div className="card-h">
          <div className="card-h-title">기본 형식</div>
          <span style={{ marginLeft: "auto" }} className="card-h-sub">
            기본값 · 항상 적용
          </span>
        </div>
        <div className="card-b">
          {editing ? (
            <div className="form-grid">
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
              <label className="span-2">
                <span>서명</span>
                <textarea
                  value={draft.signature}
                  onChange={(event) =>
                    setDraft({ ...draft, signature: event.target.value })
                  }
                />
              </label>
            </div>
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
  last,
}: {
  k: string;
  v: ReactNode;
  action?: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className="row settings-row"
      style={{ borderBottom: last ? 0 : "1px solid var(--border-faint)" }}
    >
      <div className="settings-key">{k}</div>
      <div className="grow">{v}</div>
      {action}
    </div>
  );
}

function Integration({
  title,
  desc,
  on,
  onClick,
}: {
  title: string;
  desc: string;
  on?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="row gap-3" style={{ padding: "8px 4px" }}>
      <div className="integration-icon">{title.slice(0, 1)}</div>
      <div className="grow">
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{title}</div>
        <div className="small muted">{desc}</div>
      </div>
      <span className={`tag ${on ? "green" : "gray"}`}>
        {on ? "연결됨" : "지원 예정"}
      </span>
      <button type="button" className="btn-secondary" onClick={onClick}>
        {on ? "관리" : "연결"}
      </button>
    </div>
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
  const planned = async (provider: string) => {
    try {
      const result = await api.toggleIntegration(provider);
      onToast(result.message);
    } catch (error) {
      onToast(error instanceof Error ? error.message : "통합 상태를 처리하지 못했습니다");
    }
  };

  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <PageTitle title="설정" desc="계정과 통합을 관리합니다." />

      <div className="card">
        <div className="card-h">
          <div className="card-h-title">계정</div>
        </div>
        <div className="card-b">
          <Row k="이메일" v={me?.user.email || "-"} />
          <Row k="이름" v={me?.user.name || "-"} />
          <Row
            k="요금제"
            v={<span className="tag amber">Free · 30회 / 월</span>}
          />
          <Row
            k="세션"
            v="HttpOnly 쿠키 기반 서버 세션"
            action={
              <button type="button" className="btn-secondary" onClick={onLogout}>
                로그아웃
              </button>
            }
            last
          />
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <div className="card-h-title">통합</div>
        </div>
        <div className="card-b stack">
          <Integration
            title="Gmail"
            desc="받은편지함 조회 · 사용자 본인 명의 발송"
            on={!!me?.integrations.gmail}
            onClick={() => void planned("gmail")}
          />
          <Integration
            title="Google Contacts"
            desc="연락처를 페르소나 후보로 가져오기"
            on={!!me?.integrations.contacts}
            onClick={() => void planned("contacts")}
          />
          <Integration
            title="Slack"
            desc="DM 톤 맞춰 전송"
            on={false}
            onClick={() => void planned("slack")}
          />
          <Integration
            title="Notion"
            desc="작성 결과를 페이지로 저장"
            on={false}
            onClick={() => void planned("notion")}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <div className="card-h-title">알림</div>
        </div>
        <div className="card-b">
          <Row k="새 페르소나 추천 알림" v={<span className="tag green">켜짐</span>} />
          <Row k="월간 사용 리포트" v={<span className="tag gray">꺼짐</span>} last />
        </div>
      </div>
    </div>
  );
}

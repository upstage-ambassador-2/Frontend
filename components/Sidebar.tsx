"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import type { HistoryItem, Persona } from "@/lib/data";
import { PersonaAvatar } from "./PersonaAvatar";
import {
  IconCompose,
  IconPeople,
  IconHistory,
  IconFormat,
  IconSettings,
  IconSearch,
  IconPlus,
  IconMore,
  IconMail,
  IconClose,
  IconLogout,
} from "./icons";
import { hrefForRoute, type Route } from "@/lib/routes";
import type { User } from "@/lib/api";

type NavItemProps = {
  icon: ReactNode;
  label: string;
  active: boolean;
  href: string;
  count?: ReactNode;
  onNavigate?: () => void;
};

function NavItem({ icon, label, active, href, count, onNavigate }: NavItemProps) {
  return (
    <Link
      href={href}
      className={"side-item" + (active ? " is-active" : "")}
      onClick={onNavigate}
    >
      <span className="side-item-icon">{icon}</span>
      <span>{label}</span>
      {count != null && <span className="side-item-count">{count}</span>}
    </Link>
  );
}

type Props = {
  personas: Persona[];
  history: HistoryItem[];
  route: Route;
  selectedId: string;
  onPickPerson: (id: string) => void;
  historyCount: number;
  user: User | null;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
};

export function Sidebar({
  personas,
  history,
  route,
  selectedId,
  onPickPerson,
  historyCount,
  user,
  mobileOpen,
  onCloseMobile,
  onLogout,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const searchActive = normalizedSearch.length > 0;

  const personaResults = useMemo(() => {
    if (!normalizedSearch) return [];
    return personas
      .filter((persona) =>
        [
          persona.name,
          persona.email,
          persona.relation,
          persona.role,
          persona.mbti,
          ...(persona.keywords || []),
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(normalizedSearch),
          ),
      )
      .slice(0, 5);
  }, [normalizedSearch, personas]);

  const historyResults = useMemo(() => {
    if (!normalizedSearch) return [];
    return history
      .filter((item) =>
        [
          item.subject,
          item.subj,
          item.prev,
          item.body,
          item.brief,
          item.replySubject,
          item.targetName,
          item.targetEmail,
          item.personaName,
          item.personaEmail,
          item.counterpartyName,
          item.counterpartyEmail,
          item.replyFromAddr,
          item.status,
          item.when,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(normalizedSearch),
          ),
      )
      .slice(0, 4);
  }, [history, normalizedSearch]);

  const clearSearch = () => setSearchQuery("");
  const hasSearchResults =
    personaResults.length > 0 || historyResults.length > 0;

  useEffect(() => {
    if (!accountMenuOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountMenuOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [accountMenuOpen]);

  return (
    <aside
      id="app-sidebar"
      className={"side" + (mobileOpen ? " is-mobile-open" : "")}
      aria-label="앱 메뉴"
    >
      <div className="side-brand">
        <img
          className="side-brand-logo"
          src="/mello-logo.png"
          width={24}
          height={24}
          alt=""
          aria-hidden="true"
        />
        <div className="side-brand-name">Mello</div>
        <span className="side-brand-badge">v0.4 · beta</span>
        <button
          type="button"
          className="icon-btn side-close"
          aria-label="메뉴 닫기"
          onClick={onCloseMobile}
        >
          <IconClose size={15} />
        </button>
      </div>

      <div className="side-search">
        <IconSearch size={13} />
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="사람·기록 검색"
          aria-label="검색"
        />
        <kbd>⌘K</kbd>
      </div>

      {searchActive && (
        <div className="side-search-results" aria-label="검색 결과">
          {personaResults.length > 0 && (
            <div className="side-search-group">
              <div className="side-search-label">사람</div>
              {personaResults.map((persona) => (
                <button
                  key={persona.id}
                  type="button"
                  className="side-search-result"
                  onClick={() => {
                    clearSearch();
                    onPickPerson(persona.id);
                    onCloseMobile();
                  }}
                >
                  <PersonaAvatar persona={persona} size={20} />
                  <span className="side-search-result-copy">
                    <span>{persona.name}</span>
                    <small>
                      {persona.email || persona.relation || "메일 없음"}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          )}

          {historyResults.length > 0 && (
            <div className="side-search-group">
              <div className="side-search-label">히스토리</div>
              {historyResults.map((item) => {
                const subject = item.subject || item.subj || "제목 없음";
                const target =
                  item.targetName ||
                  item.personaName ||
                  item.counterpartyName ||
                  item.targetEmail ||
                  item.personaEmail ||
                  item.counterpartyEmail ||
                  "대상 미확인";
                return (
                  <Link
                    key={item.id}
                    href={`${hrefForRoute("history")}?open=${encodeURIComponent(
                      item.id,
                    )}`}
                    className="side-search-result"
                    title={subject}
                    onClick={() => {
                      clearSearch();
                      onCloseMobile();
                    }}
                  >
                    <span className="avatar side-search-history-icon">
                      <IconHistory size={12} />
                    </span>
                    <span className="side-search-result-copy">
                      <span>{subject}</span>
                      <small>{target}</small>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

          {!hasSearchResults && (
            <div className="side-search-empty">검색 결과가 없습니다.</div>
          )}
        </div>
      )}

      <nav className="side-nav" aria-label="주요 메뉴">
        <NavItem
          icon={<IconCompose size={14} />}
          label="작성"
          active={route === "compose"}
          href={hrefForRoute("compose")}
          count="⌘N"
          onNavigate={onCloseMobile}
        />
        <NavItem
          icon={<IconMail size={14} />}
          label="받은편지함"
          active={route === "inbox"}
          href={hrefForRoute("inbox")}
          onNavigate={onCloseMobile}
        />
        <NavItem
          icon={<IconPeople size={14} />}
          label="사람"
          active={route === "people"}
          href={hrefForRoute("people")}
          count={personas.length}
          onNavigate={onCloseMobile}
        />
        <NavItem
          icon={<IconHistory size={14} />}
          label="히스토리"
          active={route === "history"}
          href={hrefForRoute("history")}
          count={historyCount}
          onNavigate={onCloseMobile}
        />
        <NavItem
          icon={<IconFormat size={14} />}
          label="내 메일 형식"
          active={route === "format"}
          href={hrefForRoute("format")}
          onNavigate={onCloseMobile}
        />
        <NavItem
          icon={<IconSettings size={14} />}
          label="설정"
          active={route === "settings"}
          href={hrefForRoute("settings")}
          onNavigate={onCloseMobile}
        />
      </nav>

      <div className="side-section">자주 보내는 사람</div>
      <div className="side-people thin-scroll">
        {personas.map((p) => (
          <button
            key={p.id}
            type="button"
            className={
              "side-person" +
              (selectedId === p.id && route === "compose" ? " is-active" : "")
            }
            onClick={() => {
              clearSearch();
              onPickPerson(p.id);
              onCloseMobile();
            }}
          >
            <PersonaAvatar persona={p} size={20} />
            <span className="side-person-name">{p.name}</span>
            <span className="side-person-meta">
              {p.email ? p.mbti || "메일" : "메일 없음"}
            </span>
          </button>
        ))}
        <Link
          href={hrefForRoute("people")}
          className="side-person"
          style={{ color: "var(--text-3)" }}
          onClick={onCloseMobile}
        >
          <span
            className="avatar"
            style={{
              width: 20,
              height: 20,
              background: "transparent",
              border: "1px dashed var(--border-strong)",
              color: "var(--text-3)",
            }}
          >
            <IconPlus size={11} />
          </span>
          <span className="side-person-name">사람 추가</span>
        </Link>
      </div>

      <div className="side-foot-wrap" ref={accountMenuRef}>
        <div className="side-foot">
          <div className="avatar" style={{ background: "#dfe3da", fontSize: 11 }}>
            {(user?.name || "M")
              .split(/\s+/)
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="grow">
            <div className="side-foot-name">{user?.name || "로그인 사용자"}</div>
            <div className="side-foot-mail">{user?.email || "mello@example.com"}</div>
          </div>
          <button
            type="button"
            className="icon-btn"
            aria-label="계정 메뉴"
            aria-haspopup="menu"
            aria-expanded={accountMenuOpen}
            onClick={() => setAccountMenuOpen((open) => !open)}
          >
            <IconMore size={14} />
          </button>
        </div>
        {accountMenuOpen && (
          <div className="side-account-menu" role="menu" aria-label="계정 메뉴">
            <Link
              href={hrefForRoute("settings")}
              role="menuitem"
              className="side-account-menu-item"
              onClick={() => {
                setAccountMenuOpen(false);
                onCloseMobile();
              }}
            >
              <IconSettings size={13} />
              <span>
                <span>계정 설정</span>
                <small>프로필과 통합 상태</small>
              </span>
            </Link>
            <button
              type="button"
              role="menuitem"
              className="side-account-menu-item"
              onClick={() => {
                setAccountMenuOpen(false);
                onCloseMobile();
                onLogout();
              }}
            >
              <IconLogout size={13} />
              <span>
                <span>로그아웃</span>
                <small>현재 세션 종료</small>
              </span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

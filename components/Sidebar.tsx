"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { Persona } from "@/lib/data";
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
  route: Route;
  selectedId: string;
  onPickPerson: (id: string) => void;
  historyCount: number;
  user: User | null;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export function Sidebar({
  personas,
  route,
  selectedId,
  onPickPerson,
  historyCount,
  user,
  mobileOpen,
  onCloseMobile,
}: Props) {
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
        <input placeholder="사람·기록 검색" aria-label="검색" />
        <kbd>⌘K</kbd>
      </div>

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
        <button type="button" className="icon-btn" aria-label="더보기">
          <IconMore size={14} />
        </button>
      </div>
    </aside>
  );
}

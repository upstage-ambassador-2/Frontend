"use client";

import type { ReactNode } from "react";
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
} from "./icons";
import type { Route } from "./MelloApp";
import type { User } from "@/lib/api";

type NavItemProps = {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  count?: ReactNode;
};

function NavItem({ icon, label, active, onClick, count }: NavItemProps) {
  return (
    <button
      type="button"
      className={"side-item" + (active ? " is-active" : "")}
      onClick={onClick}
    >
      <span className="side-item-icon">{icon}</span>
      <span>{label}</span>
      {count != null && <span className="side-item-count">{count}</span>}
    </button>
  );
}

type Props = {
  personas: Persona[];
  route: Route;
  setRoute: (r: Route) => void;
  selectedId: string;
  onPickPerson: (id: string) => void;
  historyCount: number;
  user: User | null;
};

export function Sidebar({
  personas,
  route,
  setRoute,
  selectedId,
  onPickPerson,
  historyCount,
  user,
}: Props) {
  return (
    <aside className="side">
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
          onClick={() => setRoute("compose")}
          count="⌘N"
        />
        <NavItem
          icon={<IconMail size={14} />}
          label="받은편지함"
          active={route === "inbox"}
          onClick={() => setRoute("inbox")}
          count={30}
        />
        <NavItem
          icon={<IconPeople size={14} />}
          label="사람"
          active={route === "people"}
          onClick={() => setRoute("people")}
          count={personas.length}
        />
        <NavItem
          icon={<IconHistory size={14} />}
          label="히스토리"
          active={route === "history"}
          onClick={() => setRoute("history")}
          count={historyCount}
        />
        <NavItem
          icon={<IconFormat size={14} />}
          label="내 메일 형식"
          active={route === "format"}
          onClick={() => setRoute("format")}
        />
        <NavItem
          icon={<IconSettings size={14} />}
          label="설정"
          active={route === "settings"}
          onClick={() => setRoute("settings")}
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
            onClick={() => onPickPerson(p.id)}
          >
            <PersonaAvatar persona={p} size={20} />
            <span className="side-person-name">{p.name}</span>
            <span className="side-person-meta">{p.mbti}</span>
          </button>
        ))}
        <button
          type="button"
          className="side-person"
          style={{ color: "var(--text-3)" }}
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
        </button>
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

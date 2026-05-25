"use client";

import { IconMenu, IconSparkle, IconSearch } from "./icons";
import type { Route } from "@/lib/routes";

type Props = {
  route: Route;
  crumb: [string, string | null];
  onOpenMobileMenu?: () => void;
  onFocusHistorySearch?: () => void;
  mobileMenuOpen?: boolean;
};

export function Topbar({
  route,
  crumb,
  onOpenMobileMenu,
  onFocusHistorySearch,
  mobileMenuOpen = false,
}: Props) {
  return (
    <div className="topbar">
      <button
        type="button"
        className="icon-btn mobile-menu-btn"
        aria-label="메뉴 열기"
        aria-controls="app-sidebar"
        aria-expanded={mobileMenuOpen}
        onClick={onOpenMobileMenu}
      >
        <IconMenu size={16} />
      </button>
      <div className="mobile-topbar-brand" aria-hidden="true">
        <img src="/mello-logo.png" width={20} height={20} alt="" />
        <span>Mello</span>
      </div>
      <div className="crumb">
        <span>{crumb[0]}</span>
        {crumb[1] && (
          <>
            <span className="sep">›</span>
            <span className="now">{crumb[1]}</span>
          </>
        )}
      </div>
      <div className="topbar-spacer" />
      {route === "compose" && (
        <>
          <span
            className="format-pill"
            style={{ background: "var(--surface-2)" }}
          >
            <IconSparkle size={12} style={{ color: "var(--accent)" }} />
            <b>Mello</b>
            <span style={{ color: "var(--text-3)" }}>
              · 페르소나 + 내 형식 결합
            </span>
          </span>
        </>
      )}
      {route === "history" && (
        <button
          type="button"
          className="topbar-btn"
          onClick={onFocusHistorySearch}
        >
          <IconSearch size={13} />
          <span className="topbar-btn-label">검색</span>
        </button>
      )}
      {route === "inbox" && (
        <span className="format-pill" style={{ background: "var(--surface-2)" }}>
          Gmail · 페이지 단위 조회
        </span>
      )}
    </div>
  );
}

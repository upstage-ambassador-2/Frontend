"use client";

import { IconSparkle, IconRefresh, IconSearch } from "./icons";
import type { Route } from "@/lib/routes";

type Props = {
  route: Route;
  crumb: [string, string | null];
  onResetCompose?: () => void;
};

export function Topbar({ route, crumb, onResetCompose }: Props) {
  return (
    <div className="topbar">
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
          <button
            type="button"
            className="topbar-btn"
            onClick={onResetCompose}
          >
            <IconRefresh size={13} /> 초기화
          </button>
        </>
      )}
      {route === "history" && (
        <button type="button" className="topbar-btn">
          <IconSearch size={13} /> 검색
        </button>
      )}
      {route === "inbox" && (
        <span className="format-pill" style={{ background: "var(--surface-2)" }}>
          Gmail · 최근 30개
        </span>
      )}
    </div>
  );
}

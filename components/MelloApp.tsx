"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MELLO_FORMAT, MELLO_SCENARIOS } from "@/lib/data";
import type { HistoryItem, MailFormat, Persona } from "@/lib/data";
import { api, ApiError, type MeResponse, type ReplyContext } from "@/lib/api";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ToastStack, type ToastItem } from "./Toast";
import { ComposerScreen } from "./ComposerScreen";
import { LoginScreen } from "./LoginScreen";
import {
  FormatScreen,
  HistoryScreen,
  InboxScreen,
  PeopleScreen,
  SettingsScreen,
} from "./screens";

export type Route =
  | "compose"
  | "inbox"
  | "people"
  | "history"
  | "format"
  | "settings";

const TONE_PRESETS: Record<string, number> = {
  lead: 35,
  partner: 20,
  friend: 88,
  colleague: 45,
  mentor: 28,
  mom: 78,
};

const LENGTH_PRESETS: Record<string, number> = {
  lead: 45,
  partner: 70,
  friend: 35,
  colleague: 55,
  mentor: 55,
  mom: 25,
};

function presetTone(persona: Persona | undefined): number {
  if (!persona) return 50;
  if (TONE_PRESETS[persona.id] != null) return TONE_PRESETS[persona.id];
  if (persona.tone?.includes("친근")) return 82;
  if (persona.tone?.includes("정중")) return 25;
  if (persona.tone?.includes("격식")) return 30;
  return 50;
}

function presetLength(persona: Persona | undefined): number {
  if (!persona) return 50;
  return LENGTH_PRESETS[persona.id] ?? 55;
}

export function MelloApp() {
  const [auth, setAuth] = useState<"checking" | "in" | "out">("checking");
  const [me, setMe] = useState<MeResponse | null>(null);
  const [route, setRoute] = useState<Route>("compose");
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [format, setFormat] = useState<MailFormat>(MELLO_FORMAT);
  const [selectedId, setSelectedId] = useState<string>("");
  const [tone, setTone] = useState<number>(35);
  const [length, setLength] = useState<number>(45);
  const [brief, setBrief] = useState<string>("");
  const [replyContext, setReplyContext] = useState<ReplyContext | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((arr) => [...arr, { id, msg }]);
    setTimeout(
      () => setToasts((arr) => arr.filter((x) => x.id !== id)),
      1800,
    );
  }, []);

  const loadApp = useCallback(async () => {
    try {
      const meResult = await api.me();
      const [personasResult, historyResult, formatResult] = await Promise.all([
        api.personas(),
        api.history(),
        api.format(),
      ]);
      setMe(meResult);
      setPersonas(personasResult);
      setHistory(historyResult);
      setFormat(formatResult);
      const first = personasResult[0];
      setSelectedId((current) => current || first?.id || "");
      setTone((current) => (current === 35 ? presetTone(first) : current));
      setLength((current) => (current === 45 ? presetLength(first) : current));
      setBrief((current) => current || MELLO_SCENARIOS[first?.id || ""]?.brief || "");
      setAuth("in");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setAuth("out");
        return;
      }
      setAuth("out");
      showToast(
        error instanceof Error
          ? error.message
          : "앱 데이터를 불러오지 못했습니다.",
      );
    }
  }, [showToast]);

  useEffect(() => {
    void loadApp();
  }, [loadApp]);

  const currentPerson = useMemo(
    () => personas.find((p) => p.id === selectedId) ?? personas[0],
    [personas, selectedId],
  );

  const onPickPerson = useCallback(
    (id: string) => {
      const persona = personas.find((p) => p.id === id);
      setSelectedId(id);
      setTone(presetTone(persona));
      setLength(presetLength(persona));
      setReplyContext(null);
      setBrief(MELLO_SCENARIOS[id]?.brief || "");
      setRoute("compose");
    },
    [personas],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        const input = document.querySelector<HTMLInputElement>(".side-search input");
        input?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const crumb: [string, string | null] = useMemo(() => {
    switch (route) {
      case "compose":
        return [
          "작성",
          replyContext
            ? `${replyContext.fromAddr} 답장`
            : currentPerson
            ? `${currentPerson.name}에게`
            : null,
        ];
      case "inbox":
        return ["받은편지함", null];
      case "people":
        return ["사람", null];
      case "history":
        return ["히스토리", null];
      case "format":
        return ["내 메일 형식", null];
      case "settings":
        return ["설정", null];
    }
  }, [currentPerson, replyContext, route]);

  const resetCompose = useCallback(() => {
    const persona = personas.find((p) => p.id === selectedId);
    setReplyContext(null);
    setBrief(MELLO_SCENARIOS[selectedId]?.brief || "");
    setTone(presetTone(persona));
    setLength(presetLength(persona));
  }, [personas, selectedId]);

  const handleReply = useCallback(
    (context: ReplyContext) => {
      const senderEmail = context.fromAddr.match(/<([^>]+)>/)?.[1];
      const matched = personas.find((persona) => persona.email === senderEmail);
      if (matched) {
        setSelectedId(matched.id);
        setTone(presetTone(matched));
        setLength(presetLength(matched));
      }
      setReplyContext(context);
      setBrief("");
      setRoute("compose");
      showToast("답장 컨텍스트가 작성 화면에 적용되었습니다");
    },
    [personas, showToast],
  );

  const handleLogout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setAuth("out");
      setMe(null);
      setRoute("compose");
      setReplyContext(null);
    }
  }, []);

  const replaceHistory = useCallback((updated: HistoryItem) => {
    setHistory((items) => {
      const exists = items.some((item) => item.id === updated.id);
      if (!exists) return [updated, ...items];
      return items.map((item) => (item.id === updated.id ? updated : item));
    });
  }, []);

  if (auth === "checking") {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="side-brand-logo">M</div>
          <div className="auth-title">Mello를 준비 중입니다</div>
          <div className="small muted">세션을 확인하고 있습니다.</div>
        </div>
      </div>
    );
  }

  if (auth === "out") {
    return <LoginScreen onToast={showToast} />;
  }

  return (
    <div className="mello-shell">
      <Sidebar
        personas={personas}
        route={route}
        setRoute={setRoute}
        selectedId={selectedId}
        onPickPerson={onPickPerson}
        historyCount={history.length}
        user={me?.user ?? null}
      />

      <main className="main">
        <Topbar
          route={route}
          crumb={crumb}
          onResetCompose={resetCompose}
        />

        <div className="main-scroll thin-scroll">
          {route === "compose" && (
            <ComposerScreen
              personas={personas}
              format={format}
              onToast={showToast}
              selectedId={selectedId}
              setSelectedId={onPickPerson}
              tone={tone}
              setTone={setTone}
              length={length}
              setLength={setLength}
              brief={brief}
              setBrief={setBrief}
              replyContext={replyContext}
              onClearReplyContext={() => setReplyContext(null)}
              onHistoryCreated={replaceHistory}
              onHistoryUpdated={replaceHistory}
            />
          )}
          {route === "inbox" && (
            <InboxScreen onReply={handleReply} onToast={showToast} />
          )}
          {route === "people" && (
            <PeopleScreen
              personas={personas}
              onOpen={onPickPerson}
              onChanged={setPersonas}
              onToast={showToast}
            />
          )}
          {route === "history" && (
            <HistoryScreen history={history} personas={personas} />
          )}
          {route === "format" && (
            <FormatScreen
              format={format}
              onChanged={setFormat}
              onToast={showToast}
            />
          )}
          {route === "settings" && (
            <SettingsScreen
              me={me}
              onLogout={handleLogout}
              onToast={showToast}
            />
          )}
        </div>

        <ToastStack items={toasts} />
      </main>
    </div>
  );
}

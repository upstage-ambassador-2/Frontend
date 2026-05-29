"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { MELLO_SCENARIOS, normalizePersonaTone } from "@/lib/data";
import type { HistoryItem, MailFormat, Persona } from "@/lib/data";
import {
  SESSION_EXPIRED_EVENT,
  api,
  type MeResponse,
  type ReplyContext,
} from "@/lib/api";
import { normalizeEmailAddress } from "@/lib/email";
import type { InitialLoadErrors } from "@/lib/server-api";
import {
  hrefForRoute,
  labelForRoute,
  composeHref,
  personaIdFromPathname,
  routeFromPathname,
  type Route,
} from "@/lib/routes";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileBottomNav } from "./MobileBottomNav";
import { ToastStack, enqueueToast, type ToastItem } from "./Toast";

const TONE_PRESETS: Record<string, number> = {
  lead: 25,
  partner: 25,
  friend: 100,
  colleague: 50,
  mentor: 25,
  mom: 75,
};

const LENGTH_PRESETS: Record<string, number> = {
  lead: 25,
  partner: 75,
  friend: 25,
  colleague: 50,
  mentor: 50,
  mom: 25,
};

function presetTone(persona: Persona | undefined): number {
  if (!persona) return 50;
  if (TONE_PRESETS[persona.id] != null) return TONE_PRESETS[persona.id];
  switch (normalizePersonaTone(persona.tone)) {
    case "매우 격식":
      return 0;
    case "격식":
      return 25;
    case "친근":
      return 75;
    case "매우 친근":
      return 100;
    case "중립":
    default:
      return 50;
  }
}

function presetLength(persona: Persona | undefined): number {
  if (!persona) return 50;
  return LENGTH_PRESETS[persona.id] ?? 55;
}

type MelloContextValue = {
  me: MeResponse;
  personas: Persona[];
  setPersonas: (items: Persona[]) => void;
  history: HistoryItem[];
  format: MailFormat;
  initialLoadErrors: InitialLoadErrors;
  setFormat: (format: MailFormat) => void;
  selectedId: string;
  setSelectedId: (id: string) => void;
  tone: number;
  setTone: (value: number) => void;
  length: number;
  setLength: (value: number) => void;
  brief: string;
  setBrief: (value: string) => void;
  replyContext: ReplyContext | null;
  clearReplyContext: () => void;
  openPersonaCompose: (id: string) => void;
  showToast: (message: string) => void;
  handleReply: (context: ReplyContext) => void;
  handleLogout: () => Promise<void>;
  replaceHistory: (item: HistoryItem) => void;
  removeHistory: (id: string) => void;
};

const MelloContext = createContext<MelloContextValue | null>(null);

export function useMello() {
  const value = useContext(MelloContext);
  if (!value) {
    throw new Error("useMello must be used within MelloShell");
  }
  return value;
}

type Props = {
  children: ReactNode;
  initialMe: MeResponse;
  initialPersonas: Persona[];
  initialHistory: HistoryItem[];
  initialFormat: MailFormat;
  initialLoadErrors: InitialLoadErrors;
};

export function MelloShell({
  children,
  initialMe,
  initialPersonas,
  initialHistory,
  initialFormat,
  initialLoadErrors,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const route = routeFromPathname(pathname);
  const routePersonaId = personaIdFromPathname(pathname);
  const initialPersona =
    routePersonaId != null
      ? initialPersonas.find((persona) => persona.id === routePersonaId)
      : undefined;

  const [personas, setPersonas] = useState<Persona[]>(initialPersonas);
  const [history, setHistory] = useState<HistoryItem[]>(initialHistory);
  const [format, setFormat] = useState<MailFormat>(initialFormat);
  const [selectedId, setSelectedIdState] = useState<string>(
    initialPersona?.id ?? "",
  );
  const [tone, setTone] = useState<number>(presetTone(initialPersona));
  const [length, setLength] = useState<number>(presetLength(initialPersona));
  const [brief, setBrief] = useState<string>(
    MELLO_SCENARIOS[initialPersona?.id ?? ""]?.brief ?? "",
  );
  const [replyContext, setReplyContext] = useState<ReplyContext | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const sessionExpiredRedirectRef = useRef(false);

  const currentPerson = useMemo(
    () => personas.find((p) => p.id === selectedId),
    [personas, selectedId],
  );

  const showToast = useCallback((msg: string) => {
    enqueueToast(setToasts, msg);
  }, []);

  useEffect(() => {
    const onSessionExpired = () => {
      if (sessionExpiredRedirectRef.current) return;
      sessionExpiredRedirectRef.current = true;
      router.replace("/login?auth_error=session_expired");
      router.refresh();
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    };
  }, [router]);

  const applyPersona = useCallback(
    (id: string, { clearReply }: { clearReply: boolean }) => {
      const persona = personas.find((p) => p.id === id);
      setSelectedIdState(id);
      setTone(presetTone(persona));
      setLength(presetLength(persona));
      if (clearReply) setReplyContext(null);
      setBrief(MELLO_SCENARIOS[id]?.brief || "");
    },
    [personas],
  );

  useEffect(() => {
    if (route !== "compose" || !routePersonaId || routePersonaId === selectedId) {
      return;
    }
    applyPersona(routePersonaId, { clearReply: true });
  }, [applyPersona, route, routePersonaId, selectedId]);

  useEffect(() => {
    if (pathname !== "/compose" || !selectedId) {
      return;
    }
    setSelectedIdState("");
    setTone(presetTone(undefined));
    setLength(presetLength(undefined));
    setBrief("");
    setReplyContext(null);
  }, [pathname, selectedId]);

  useEffect(() => {
    if (!pathname?.startsWith("/compose/reply/") || !selectedId) {
      return;
    }
    setSelectedIdState("");
    setTone(presetTone(undefined));
    setLength(presetLength(undefined));
    setBrief("");
    setReplyContext(null);
  }, [pathname, selectedId]);

  const setSelectedId = useCallback(
    (id: string) => {
      applyPersona(id, { clearReply: true });
      router.push(composeHref(id));
    },
    [applyPersona, router],
  );

  const openPersonaCompose = useCallback(
    (id: string) => {
      setSelectedId(id);
    },
    [setSelectedId],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.isComposing) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        const input = document.querySelector<HTMLInputElement>(".side-search input");
        input?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const focusHistorySearch = useCallback(() => {
    document
      .querySelector<HTMLInputElement>('[aria-label="히스토리 검색"]')
      ?.focus();
  }, []);

  const closeMobileDrawer = useCallback(() => {
    setMobileDrawerOpen(false);
  }, []);

  useEffect(() => {
    closeMobileDrawer();
  }, [closeMobileDrawer, pathname]);

  useEffect(() => {
    if (!mobileDrawerOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobileDrawer();
    };
    const frame = window.requestAnimationFrame(() => {
      document.querySelector<HTMLButtonElement>(".side-close")?.focus();
    });

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeMobileDrawer, mobileDrawerOpen]);

  const crumb: [string, string | null] = useMemo(() => {
    if (route === "compose") {
      return [
        "작성",
        replyContext
          ? `${replyContext.fromAddr} 답장`
          : currentPerson
          ? `${currentPerson.name}에게`
          : null,
      ];
    }
    return [labelForRoute(route), null];
  }, [currentPerson, replyContext, route]);

  const handleReply = useCallback(
    (context: ReplyContext) => {
      const senderEmail = normalizeEmailAddress(context.fromAddr);
      const matched = personas.find(
        (persona) => normalizeEmailAddress(persona.email) === senderEmail,
      );
      const targetPersonaId = matched?.id ?? selectedId;
      if (matched) {
        applyPersona(matched.id, { clearReply: false });
      }
      setReplyContext(context);
      setBrief("");
      if (targetPersonaId) {
        router.push(composeHref(targetPersonaId));
      } else {
        router.push(hrefForRoute("compose"));
      }
      showToast("답장 컨텍스트가 작성 화면에 적용되었습니다");
    },
    [applyPersona, personas, router, selectedId, showToast],
  );

  const handleLogout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }, [router]);

  const replaceHistory = useCallback((updated: HistoryItem) => {
    setHistory((items) => {
      const exists = items.some((item) => item.id === updated.id);
      if (!exists) return [updated, ...items];
      return items.map((item) => (item.id === updated.id ? updated : item));
    });
  }, []);

  const removeHistory = useCallback((id: string) => {
    setHistory((items) => items.filter((item) => item.id !== id));
  }, []);

  const value = useMemo<MelloContextValue>(
    () => ({
      me: initialMe,
      personas,
      setPersonas,
      history,
      format,
      initialLoadErrors,
      setFormat,
      selectedId,
      setSelectedId,
      tone,
      setTone,
      length,
      setLength,
      brief,
      setBrief,
      replyContext,
      clearReplyContext: () => setReplyContext(null),
      openPersonaCompose,
      showToast,
      handleReply,
      handleLogout,
      replaceHistory,
      removeHistory,
    }),
    [
      brief,
      format,
      handleLogout,
      handleReply,
      history,
      initialMe,
      initialLoadErrors,
      length,
      personas,
      replyContext,
      openPersonaCompose,
      removeHistory,
      replaceHistory,
      selectedId,
      setSelectedId,
      showToast,
      tone,
    ],
  );

  return (
    <MelloContext.Provider value={value}>
      <div className={`mello-shell route-${route}`}>
        <button
          type="button"
          className={
            "mobile-drawer-backdrop" + (mobileDrawerOpen ? " is-visible" : "")
          }
          aria-label="메뉴 닫기"
          aria-hidden={!mobileDrawerOpen}
          tabIndex={mobileDrawerOpen ? 0 : -1}
          onClick={closeMobileDrawer}
        />
        <Sidebar
          personas={personas}
          history={history}
          route={route}
          selectedId={selectedId}
          onPickPerson={openPersonaCompose}
          historyCount={history.length}
          user={initialMe.user ?? null}
          mobileOpen={mobileDrawerOpen}
          onCloseMobile={closeMobileDrawer}
          onLogout={() => void handleLogout()}
        />

        <main className="main">
          <Topbar
            route={route}
            crumb={crumb}
            onOpenMobileMenu={() => setMobileDrawerOpen(true)}
            onFocusHistorySearch={focusHistorySearch}
            mobileMenuOpen={mobileDrawerOpen}
          />

          <div className="main-scroll thin-scroll">{children}</div>
          <MobileBottomNav route={route} />
          <ToastStack items={toasts} />
        </main>
      </div>
    </MelloContext.Provider>
  );
}

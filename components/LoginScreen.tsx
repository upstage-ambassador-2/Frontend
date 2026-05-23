"use client";

import { useEffect, useState } from "react";
import { startGoogleLogin } from "@/lib/api";
import { IconCheck, IconSparkle } from "./icons";

type Props = {
  onToast: (message: string) => void;
};

function GoogleG({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.35 0-4.34-1.58-5.05-3.71H.95v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.71A5.4 5.4 0 0 1 3.66 9c0-.6.1-1.17.29-1.71V4.96H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.04l3-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58A8.99 8.99 0 0 0 9 0 9 9 0 0 0 .95 4.96l3 2.33C4.66 5.16 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}

type AuthDemo = {
  persona: { name: string; mbti: string; color: string; avatar: string };
  before: string;
  after: string;
  keyword: string;
};

const AUTH_DEMOS: AuthDemo[] = [
  {
    persona: { name: "김지훈 팀장", mbti: "ENTJ", color: "#e8dfd1", avatar: "KJ" },
    before: "개발 일정 하루 늦어질 것 같음. 내일까지는 완료.",
    after:
      "결제 모듈 일정 1일 지연됩니다.\n내일 18시까지 완료 후 보고드리겠습니다.",
    keyword: "직설 · 결론 먼저",
  },
  {
    persona: { name: "정다은", mbti: "ENFP", color: "#efd9d3", avatar: "JD" },
    before: "오늘 약속 못 갈 듯. 미안하고 다음에 보자.",
    after:
      "다은아 진짜 가고 싶었는데 일정이 생겨버렸어 ㅠㅠ\n갑자기 말해서 너무 미안해. 이번 주에 꼭 다시 잡자!",
    keyword: "따뜻 · 사과 명확",
  },
  {
    persona: { name: "박서연 책임", mbti: "ISTJ", color: "#dfe3da", avatar: "PS" },
    before: "회의 시간 바꾸고 싶음. 15일 3시나 16일 10시 가능.",
    after:
      "안녕하세요, 박 책임님.\n회의 일정 변경 가능 여부 문의드립니다.\n5/15(목) 15:00 또는 5/16(금) 10:00 중 회신 부탁드립니다.",
    keyword: "정중 · 옵션 명확",
  },
];

function AuthDemoCard() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setIdx((i) => (i + 1) % AUTH_DEMOS.length),
      5200,
    );
    return () => clearInterval(t);
  }, []);
  const d = AUTH_DEMOS[idx];

  return (
    <div className="auth-demo">
      <div className="auth-demo-head">
        <div
          className="avatar"
          style={{
            background: d.persona.color,
            width: 28,
            height: 28,
            fontSize: 11,
          }}
        >
          {d.persona.avatar}
        </div>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 500 }}>{d.persona.name}</div>
          <div
            style={{
              fontSize: 10.5,
              color: "var(--text-3)",
              marginTop: 1,
              fontFamily: "var(--mono)",
              letterSpacing: ".05em",
            }}
          >
            {d.persona.mbti} · {d.keyword}
          </div>
        </div>
      </div>

      <div className="auth-demo-before">
        <span className="auth-demo-lbl">내가 적은 것</span>
        <div>{d.before}</div>
      </div>

      <div className="auth-demo-arrow">
        <span className="auth-demo-arrow-line" />
        <span className="auth-demo-arrow-lbl">
          <IconSparkle size={11} style={{ color: "var(--accent)" }} /> Mello
        </span>
        <span className="auth-demo-arrow-line" />
      </div>

      <div className="auth-demo-after" key={idx}>
        <span className="auth-demo-lbl">Mello가 보낸 것</span>
        <div className="auth-demo-after-body">{d.after}</div>
      </div>

      <div className="auth-demo-dots">
        {AUTH_DEMOS.map((_, i) => (
          <span
            key={i}
            className={"auth-demo-dot" + (i === idx ? " is-on" : "")}
          />
        ))}
      </div>
    </div>
  );
}

export function LoginScreen({ onToast }: Props) {
  const [stage, setStage] = useState<"idle" | "google-loading">("idle");
  const [showSignup, setShowSignup] = useState(false);

  const onGoogle = async () => {
    if (stage !== "idle") return;
    setStage("google-loading");
    try {
      const url = await startGoogleLogin("/");
      window.location.href = url;
    } catch (error) {
      setStage("idle");
      onToast(
        error instanceof Error ? error.message : "로그인을 시작하지 못했습니다.",
      );
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <div className="auth-brand-h">
          <img
            className="auth-brand-mark"
            src="/mello-logo.png"
            width={30}
            height={30}
            alt=""
            aria-hidden="true"
          />
          <span className="auth-brand-name">Mello</span>
          <span className="auth-brand-badge">beta</span>
        </div>

        <div className="auth-brand-copy">
          <h1>
            나답게 쓰고,
            <br />
            <span className="auth-em">상대답게</span> 도착하는 글.
          </h1>
          <p>
            상대방의 MBTI와 성향, 내 평소 메일 형식을 함께 기억해서
            <br />
            Mello가 받는 사람에게 어울리는 톤으로 다시 써드립니다.
          </p>
        </div>

        <AuthDemoCard />

        <div className="auth-brand-foot">
          <div className="auth-brand-foot-l">
            <span className="auth-int-icon" title="Gmail">
              G
            </span>
            <span className="auth-int-icon" title="Google Contacts">
              C
            </span>
            <span className="auth-int-icon" title="Slack">
              S
            </span>
            <span className="auth-int-icon" title="Notion">
              N
            </span>
          </div>
          <span className="auth-brand-foot-txt">
            Gmail · Slack · Notion과 함께 사용
          </span>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-h">
          <div className="auth-form-tabs">
            <button
              type="button"
              className={"auth-tab" + (!showSignup ? " is-on" : "")}
              onClick={() => setShowSignup(false)}
            >
              로그인
            </button>
            <button
              type="button"
              className={"auth-tab" + (showSignup ? " is-on" : "")}
              onClick={() => setShowSignup(true)}
            >
              회원가입
            </button>
          </div>
          <span className="auth-help">도움말 ↗</span>
        </div>

        <div className="auth-card">
          <div className="auth-title">
            {showSignup ? "Mello 계정 만들기" : "다시 오신 걸 환영해요"}
          </div>
          <div className="auth-sub">
            {showSignup
              ? "받는 사람과 내 메일 형식을 기억하는 AI 글쓰기 도구입니다."
              : "로그인하고 저장된 페르소나로 바로 시작하세요."}
          </div>

          <button
            type="button"
            className="auth-btn auth-btn-google"
            onClick={onGoogle}
            disabled={stage === "google-loading"}
          >
            {stage === "google-loading" ? (
              <>
                <span
                  className="result-spinner"
                  style={{
                    borderColor: "var(--surface-3)",
                    borderTopColor: "var(--text)",
                  }}
                />
                Google 계정으로 연결 중…
              </>
            ) : (
              <>
                <GoogleG /> Google 계정으로{" "}
                {showSignup ? "시작하기" : "계속하기"}
              </>
            )}
          </button>

          <div className="auth-perm">
            <IconCheck size={13} />
            <span>
              Gmail 읽기·보내기 권한과 Google Contacts 접근을 요청합니다.
              메일 본문은 작성 시점에만 사용되며 저장되지 않습니다.
            </span>
          </div>

          <div className="auth-google-note">
            <span className="auth-google-note-line" />
            <span>업무용·개인 Gmail 모두 지원</span>
            <span className="auth-google-note-line" />
          </div>
        </div>

        <div className="auth-foot">
          계속 진행하면{" "}
          <a
            className="auth-text-btn"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            서비스 약관
          </a>{" "}
          및{" "}
          <a
            className="auth-text-btn"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            개인정보 처리방침
          </a>
          에 동의하게 됩니다.
        </div>
      </div>
    </div>
  );
}

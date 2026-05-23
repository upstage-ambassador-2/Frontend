"use client";

import { startGoogleLogin } from "@/lib/api";
import { IconMail, IconSparkle } from "./icons";

type Props = {
  onToast: (message: string) => void;
};

export function LoginScreen({ onToast }: Props) {
  const signIn = async () => {
    try {
      const url = await startGoogleLogin("/");
      window.location.href = url;
    } catch (error) {
      onToast(error instanceof Error ? error.message : "로그인을 시작하지 못했습니다.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-mark">
          <div className="side-brand-logo">M</div>
          <span className="tag amber">Google OAuth</span>
        </div>
        <div>
          <div className="auth-title">Mello</div>
          <div className="auth-subtitle">
            내 페르소나와 메일 형식에 맞춰 Gmail 답장과 새 메일 초안을 작성합니다.
          </div>
        </div>
        <button type="button" className="auth-google" onClick={signIn}>
          <IconMail size={16} />
          Sign in with Google
        </button>
        <div className="auth-scope">
          <IconSparkle size={13} style={{ color: "var(--accent)" }} />
          <span>
            openid, email, profile, Gmail read/send, Contacts 권한을 서버
            API가 처리합니다.
          </span>
        </div>
      </div>
    </div>
  );
}

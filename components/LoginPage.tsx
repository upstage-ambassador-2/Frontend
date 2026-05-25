"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LoginScreen } from "./LoginScreen";
import { ToastStack, type ToastItem } from "./Toast";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  access_denied: "Google 로그인 동의가 취소되었습니다. 다시 시도해주세요.",
  invalid_state: "로그인 요청이 만료되었거나 올바르지 않습니다. 다시 시도해주세요.",
  missing_code: "Google 로그인 응답이 올바르지 않습니다. 다시 시도해주세요.",
  oauth_failed: "Google 로그인에 실패했습니다. 다시 시도해주세요.",
  session_expired: "세션이 만료되었습니다. 다시 로그인해주세요.",
};

export function LoginPage({ authError }: { authError?: string }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const shownAuthErrorRef = useRef<string | null>(null);

  const showToast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((arr) => [...arr, { id, msg }]);
    setTimeout(
      () => setToasts((arr) => arr.filter((x) => x.id !== id)),
      1800,
    );
  }, []);

  const authErrorMessage = useMemo(() => {
    if (!authError) return null;
    return AUTH_ERROR_MESSAGES[authError] || AUTH_ERROR_MESSAGES.oauth_failed;
  }, [authError]);

  useEffect(() => {
    if (!authError || !authErrorMessage || shownAuthErrorRef.current === authError) {
      return;
    }
    shownAuthErrorRef.current = authError;
    showToast(authErrorMessage);
  }, [authError, authErrorMessage, showToast]);

  return (
    <>
      <LoginScreen onToast={showToast} />
      <ToastStack items={toasts} />
    </>
  );
}

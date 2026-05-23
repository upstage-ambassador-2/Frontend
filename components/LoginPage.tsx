"use client";

import { useCallback, useState } from "react";
import { LoginScreen } from "./LoginScreen";
import { ToastStack, type ToastItem } from "./Toast";

export function LoginPage() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((arr) => [...arr, { id, msg }]);
    setTimeout(
      () => setToasts((arr) => arr.filter((x) => x.id !== id)),
      1800,
    );
  }, []);

  return (
    <>
      <LoginScreen onToast={showToast} />
      <ToastStack items={toasts} />
    </>
  );
}

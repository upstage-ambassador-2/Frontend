"use client";

import type { Dispatch, SetStateAction } from "react";
import { IconCheck } from "./icons";

export type ToastItem = { id: number; msg: string };

const MAX_VISIBLE_TOASTS = 3;
const TOAST_TTL_MS = 1800;

export function enqueueToast(
  setToasts: Dispatch<SetStateAction<ToastItem[]>>,
  msg: string,
) {
  const id = Date.now() + Math.random();
  setToasts((items) => [...items.slice(-(MAX_VISIBLE_TOASTS - 1)), { id, msg }]);
  setTimeout(
    () => setToasts((items) => items.filter((item) => item.id !== id)),
    TOAST_TTL_MS,
  );
}

export function ToastStack({ items }: { items: ToastItem[] }) {
  return (
    <div className="toast-wrap" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className="toast" role="status">
          <IconCheck size={13} /> {t.msg}
        </div>
      ))}
    </div>
  );
}

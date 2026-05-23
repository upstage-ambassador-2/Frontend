"use client";

import { IconCheck } from "./icons";

export type ToastItem = { id: number; msg: string };

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

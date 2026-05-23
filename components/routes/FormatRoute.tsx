"use client";

import { FormatScreen } from "@/components/screens";
import { useMello } from "@/components/MelloShell";

export function FormatRoute() {
  const { format, setFormat, showToast } = useMello();
  return (
    <FormatScreen
      format={format}
      onChanged={setFormat}
      onToast={showToast}
    />
  );
}

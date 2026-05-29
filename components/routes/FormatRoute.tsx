"use client";

import { FormatScreen } from "@/components/screens";
import { useMello } from "@/components/MelloShell";

export function FormatRoute() {
  const { format, setFormat, showToast, initialLoadErrors } = useMello();
  return (
    <FormatScreen
      format={format}
      loadError={initialLoadErrors.format}
      onChanged={setFormat}
      onToast={showToast}
    />
  );
}

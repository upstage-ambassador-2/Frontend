"use client";

import { PeopleScreen } from "@/components/screens";
import { useMello } from "@/components/MelloShell";

export function PeopleRoute() {
  const {
    personas,
    setPersonas,
    openPersonaCompose,
    showToast,
    initialLoadErrors,
  } = useMello();
  return (
    <PeopleScreen
      personas={personas}
      loadError={initialLoadErrors.personas}
      onOpen={openPersonaCompose}
      onChanged={setPersonas}
      onToast={showToast}
    />
  );
}

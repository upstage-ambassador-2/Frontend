"use client";

import { PeopleScreen } from "@/components/screens";
import { useMello } from "@/components/MelloShell";

export function PeopleRoute() {
  const { personas, setPersonas, openPersonaCompose, showToast } = useMello();
  return (
    <PeopleScreen
      personas={personas}
      onOpen={openPersonaCompose}
      onChanged={setPersonas}
      onToast={showToast}
    />
  );
}

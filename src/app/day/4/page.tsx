"use client";

import { RequireDarkMode } from "@/components/ThemeProvider";
import { Calculator } from "./components/Calculator";
import { IPhoneFrame } from "./components/IPhoneFrame";

export default function Day4Page() {
  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-black md:items-center md:justify-center md:bg-gradient-to-b md:from-[#141419] md:via-[#0a0a0d] md:to-black md:p-8">
      <RequireDarkMode />
      <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(ellipse_45%_35%_at_50%_42%,rgba(255,255,255,0.06),transparent_70%)] md:block" />
      <IPhoneFrame>
        <Calculator keyboard />
      </IPhoneFrame>
    </main>
  );
}

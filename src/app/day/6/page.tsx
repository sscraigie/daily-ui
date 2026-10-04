import React from "react";

import { RequireDarkMode } from "@/components/ThemeProvider";

import Header from "./components/Header";
import SideProfile from "./components/SideProfile";
import { PinnedSection } from "./components/PinnedSection";
import { ActivityChart } from "./components/ActivityChart";
import { Footer } from "./components/Footer";

// Border: border-[#7e8590]
// Icon: fill-[#7e8590]
// Button Border: border-[#31363d]

//subtext: text-[#747b85]
const Github = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#0e1117]">
      <RequireDarkMode />
      <Header />
      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-8 px-4 py-6 md:flex-row md:gap-6">
        <SideProfile />
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <PinnedSection />
          <ActivityChart />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Github;

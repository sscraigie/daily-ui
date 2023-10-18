import React from "react";

import Header from "./components/Header";
import SideProfile from "./components/SideProfile";
import { PinnedSection } from "./components/PinnedSection";

// Border: border-[#7e8590]
// Icon: fill-[#7e8590]

//subtext: text-[#747b85]
export const Github = () => {
  return (
    <div className="flex h-screen flex-col bg-[#0e1117]">
      <Header />
      <div className="flex">
        <SideProfile />
        <div className="w-full p-2">
          <PinnedSection />
        </div>
      </div>
    </div>
  );
};

export default Github;

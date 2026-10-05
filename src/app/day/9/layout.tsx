"use client";
// Day 9 - Spotify clone shell
// Persistent layout for all /day/9/* routes: owns the player state
// (PlayerProvider) so playback keeps running across navigation, and renders
// the app chrome — sidebar (desktop), queue panel, desktop player bar,
// and the mobile app-style miniplayer + bottom tab bar.

import React from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { RequireDarkMode } from "@/components/ThemeProvider";
import { PlayerProvider, usePlayer } from "./player-context";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { PlayerBar } from "./components/PlayerBar";
import { NowPlayingPanel } from "./components/NowPlayingPanel";
import { FullScreenPlayer } from "./components/FullScreenPlayer";
import { MiniPlayer, TabBar } from "./components/MobileNav";
import { scrollY } from "./components/Shared";

function Shell({ children }: { children: React.ReactNode }) {
  const { queueOpen, track } = usePlayer();
  const pathname = usePathname();

  return (
    <>
      <RequireDarkMode />
      <div className="flex h-full w-full min-h-0 flex-col bg-black">
        <div className="flex min-h-0 flex-1 gap-2 p-2">
          <Sidebar />

          <main className="relative min-w-0 flex-1 overflow-hidden rounded-lg bg-[#121212]">
            <TopBar />
            {/* keyed by route so each page starts scrolled to the top */}
            <div key={pathname} className={`h-full overflow-y-auto ${scrollY}`}>
              {children}
            </div>
          </main>

          <AnimatePresence>
            {queueOpen && track && <NowPlayingPanel key="now-playing" />}
          </AnimatePresence>
        </div>

        {/* Mobile: miniplayer + bottom tab bar (Spotify app style) */}
        <div className="shrink-0 md:hidden">
          <MiniPlayer />
          <TabBar />
        </div>

        {/* Desktop: full player bar */}
        <div className="hidden shrink-0 md:block">
          <PlayerBar />
        </div>
      </div>

      <FullScreenPlayer />
    </>
  );
}

export default function Day9Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlayerProvider>
      <Shell>{children}</Shell>
    </PlayerProvider>
  );
}

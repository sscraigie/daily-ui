"use client";
// Day 9 - Your Library (/day/9/library)
// Mobile-first library grid (like the app's "Your Library" tab): Liked
// Songs, playlists and artists as tappable tiles.

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PlayIcon, HeartIcon } from "../components/Icons";
import { Cover, scrollX } from "../components/Shared";
import { artistPages, playlists, LIKED_COVER } from "../data";
import { usePlayer } from "../player-context";

type Chip = "All" | "Playlists" | "Artists";
const CHIPS: Chip[] = ["All", "Playlists", "Artists"];

export default function Day9Library() {
  const { liked, playContext } = usePlayer();
  const router = useRouter();
  const [chip, setChip] = useState<Chip>("All");

  const tiles = [
    {
      key: "liked",
      name: "Liked Songs",
      subtitle: `Playlist • ${liked.size} ${liked.size === 1 ? "song" : "songs"}`,
      cover: LIKED_COVER,
      round: false,
      liked: true,
      href: "/day/9/liked",
      contextId: -1,
    },
    ...playlists.map((p) => ({
      key: `pl-${p.id}`,
      name: p.name,
      subtitle: "Playlist • Spotify",
      cover: p.cover,
      round: false,
      liked: false,
      href: `/day/9/playlist/${p.id}`,
      contextId: p.id,
    })),
    ...artistPages.map((a) => ({
      key: `ar-${a.id}`,
      name: a.name,
      subtitle: "Artist",
      cover: a.cover,
      round: true,
      liked: false,
      href: `/day/9/artist/${encodeURIComponent(a.name)}`,
      contextId: a.id,
    })),
  ].filter((t) =>
    chip === "All"
      ? true
      : chip === "Playlists"
        ? t.key === "liked" || !t.key.startsWith("ar-")
        : t.key.startsWith("ar-")
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`min-h-full px-4 pb-10 pt-4 sm:px-6 ${scrollX}`}
    >
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-white">
        Your Library
      </h1>

      {/* Filter chips */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {CHIPS.map((c) => (
          <button
            key={c}
            onClick={() => setChip(c)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              chip === c
                ? "bg-[#1DB954] text-black"
                : "bg-[#232323] text-white hover:bg-[#2a2a2a]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
        {tiles.map((t) => (
          <div
            key={t.key}
            role="button"
            tabIndex={0}
            onClick={() => router.push(t.href)}
            onKeyDown={(e) => e.key === "Enter" && router.push(t.href)}
            className="group relative flex items-center gap-3 overflow-hidden rounded-md bg-white/10 p-2 pr-3 transition-colors hover:bg-white/20"
          >
            <Cover colors={t.cover} className="h-14 w-14 rounded-md">
              {t.round && (
                <span className="absolute inset-0 grid place-items-center text-xl font-black text-white/90">
                  {t.name[0]}
                </span>
              )}
              {t.liked && (
                <HeartIcon
                  filled
                  className="absolute inset-0 m-auto h-5 w-5 text-white"
                />
              )}
            </Cover>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-white">
                {t.name}
              </span>
              <span className="block truncate text-xs text-gray-400">
                {t.subtitle}
              </span>
            </span>
            <button
              aria-label={`Play ${t.name}`}
              onClick={(e) => {
                e.stopPropagation();
                playContext(t.contextId);
              }}
              className="absolute right-3 grid h-10 w-10 translate-y-1 place-items-center rounded-full bg-[#1DB954] text-black opacity-0 shadow-xl transition-all duration-200 hover:scale-105 group-hover:translate-y-0 group-hover:opacity-100"
            >
              <PlayIcon className="h-4 w-4 translate-x-[1px]" />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

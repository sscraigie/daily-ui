"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PlayIcon } from "./Icons";
import { Cover, scrollX } from "./Shared";
import { artistPages, playlists } from "../data";
import { usePlayer } from "../player-context";

type Chip = "All" | "Playlists" | "Artists";

const CHIPS: Chip[] = ["All", "Playlists", "Artists"];

export const HomeView = () => {
  const { playContext } = usePlayer();
  const router = useRouter();
  const [chip, setChip] = useState<Chip>("All");

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const showPlaylists = chip !== "Artists";
  const showArtists = chip !== "Playlists";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-full px-4 pb-10 pt-4 sm:px-6"
      style={{
        background:
          "linear-gradient(180deg, #2a2a2a 0%, rgba(18,18,18,0) 320px), #121212",
      }}
    >
      {/* Filter chips (like the mobile app) */}
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

      <h1 className="mb-4 text-3xl font-bold tracking-tight text-white">
        {greeting}
      </h1>

      {showPlaylists && (
        <>
          {/* Shortcut tiles */}
          <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
            {playlists.slice(0, 6).map((p) => (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/day/9/playlist/${p.id}`)}
                onKeyDown={(e) =>
                  e.key === "Enter" && router.push(`/day/9/playlist/${p.id}`)
                }
                className="group relative flex cursor-default items-center gap-3 overflow-hidden rounded-md bg-white/10 pr-3 transition-colors hover:bg-white/20"
              >
                <Cover colors={p.cover} className="h-14 w-14 sm:h-20 sm:w-20" />
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-white sm:text-base">
                  {p.name}
                </span>
                <button
                  aria-label={`Play ${p.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    playContext(p.id);
                  }}
                  className="absolute right-3 grid h-11 w-11 translate-y-1 place-items-center rounded-full bg-[#1DB954] text-black opacity-0 shadow-xl transition-all duration-200 hover:scale-105 group-hover:translate-y-0 group-hover:opacity-100"
                >
                  <PlayIcon className="h-5 w-5 translate-x-[1px]" />
                </button>
              </div>
            ))}
          </div>

          {/* Made for you */}
          <h2 className="mb-2 mt-8 text-2xl font-bold tracking-tight text-white">
            Made for you
          </h2>
          <div className={`flex gap-2 overflow-x-auto pb-2 ${scrollX}`}>
            {playlists.map((p) => (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  router.push(`/day/9/playlist/${p.id}`)
                }
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  router.push(`/day/9/playlist/${p.id}`)
                }
                className="group w-[180px] shrink-0 cursor-default rounded-lg p-3 transition-colors hover:bg-white/10"
              >
                <div className="relative mb-3">
                  <Cover
                    colors={p.cover}
                    className="aspect-square w-full rounded-md shadow-lg"
                  />
                  <button
                    aria-label={`Play ${p.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      playContext(p.id);
                    }}
                    className="absolute bottom-2 right-2 grid h-11 w-11 translate-y-2 place-items-center rounded-full bg-[#1DB954] text-black opacity-0 shadow-xl transition-all duration-200 hover:scale-105 group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    <PlayIcon className="h-5 w-5 translate-x-[1px]" />
                  </button>
                </div>
                <p className="truncate font-bold text-white">{p.name}</p>
                <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {showArtists && (
        <>
          {/* Popular artists */}
          <h2 className="mb-2 mt-6 text-2xl font-bold tracking-tight text-white">
            Popular artists
          </h2>
          <div className={`flex gap-2 overflow-x-auto pb-2 ${scrollX}`}>
            {artistPages.map((a) => (
              <div
                key={a.id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  router.push(`/day/9/artist/${encodeURIComponent(a.name)}`)
                }
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  router.push(`/day/9/artist/${encodeURIComponent(a.name)}`)
                }
                className="group w-[180px] shrink-0 cursor-default rounded-lg p-3 transition-colors hover:bg-white/10"
              >
                <div className="relative mb-3">
                  <Cover
                    colors={a.cover}
                    className="aspect-square w-full rounded-full shadow-lg"
                  >
                    <span className="absolute inset-0 grid place-items-center text-4xl font-black text-white/90">
                      {a.name[0]}
                    </span>
                  </Cover>
                  <button
                    aria-label={`Play ${a.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      playContext(a.id);
                    }}
                    className="absolute bottom-2 right-2 grid h-11 w-11 translate-y-2 place-items-center rounded-full bg-[#1DB954] text-black opacity-0 shadow-xl transition-all duration-200 hover:scale-105 group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    <PlayIcon className="h-5 w-5 translate-x-[1px]" />
                  </button>
                </div>
                <p className="truncate font-bold text-white">{a.name}</p>
                <p className="mt-1 text-sm text-gray-400">Artist</p>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PlayIcon, XIcon } from "./Icons";
import { Cover, scrollX } from "./Shared";
import { TrackRow } from "./PlaylistView";
import {
  allTracks,
  artistPages,
  playlists,
  playlistOfTrack,
  colorsForArtist,
} from "../data";
import { usePlayer } from "../player-context";

const categories = [
  { name: "Pop", color: "#E8115B", deco: ["#F6B1C3", "#E8115B"] },
  { name: "Hip-Hop", color: "#BA5D07", deco: ["#E8A15C", "#7A2E0C"] },
  { name: "Indie", color: "#8D67AB", deco: ["#C3A6D9", "#503750"] },
  { name: "Chill", color: "#1E3264", deco: ["#537AA1", "#0E1E3E"] },
  { name: "Workout", color: "#477D95", deco: ["#7BC3D8", "#2B4C5C"] },
  { name: "Electronic", color: "#D84000", deco: ["#FF8A5C", "#5C1A00"] },
  { name: "Rock", color: "#E13300", deco: ["#F07C5C", "#661400"] },
  { name: "Focus", color: "#503750", deco: ["#B39DDB", "#2E1F2E"] },
  { name: "Sleep", color: "#1E3264", deco: ["#8899C4", "#0B1530"] },
  { name: "Jazz", color: "#B06239", deco: ["#E8A15C", "#5C3218"] },
];

export const SearchView = () => {
  const {
    current,
    playing,
    liked,
    playTrack,
    togglePlay,
    toggleLike,
    playContext,
  } = usePlayer();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const openPage = (id: number) => router.push(`/day/9/playlist/${id}`);

  const inputRow = (
      <div className="relative mb-6 max-w-md pt-6">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to listen to?"
          className="h-10 w-full rounded-full bg-[#242424] pl-4 pr-10 text-sm text-white outline-none ring-white/30 transition placeholder:text-gray-500 focus:ring-2"
        />
        {query && (
          <button
            aria-label="Clear search"
            onClick={() => setQuery("")}
            className="absolute right-3 top-11 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>
  );

  if (!q) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="px-4 pb-10 sm:px-6"
      >
        {inputRow}
        <h2 className="mb-4 text-2xl font-bold tracking-tight text-white">
          Browse all
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {categories.map((c) => (
            <button
              key={c.name}
              onClick={() => setQuery(c.name)}
              className="relative min-h-[120px] overflow-hidden rounded-lg p-4 text-left transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: c.color }}
            >
              <span className="text-xl font-bold text-white">{c.name}</span>
              <div
                className="absolute -bottom-3 -right-3 h-20 w-20 rounded shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${c.deco[0]}, ${c.deco[1]})`,
                  transform: "rotate(25deg)",
                }}
              />
            </button>
          ))}
        </div>
      </motion.div>
    );
  }

  const tracks = allTracks
    .filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q)
    )
    .slice(0, 8);
  const pages = [...playlists, ...artistPages].filter((p) =>
    p.name.toLowerCase().includes(q)
  );
  const top = tracks[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="px-4 pb-10 sm:px-6"
    >
      {inputRow}
      {tracks.length === 0 && pages.length === 0 ? (
        <div>
          <p className="text-2xl font-bold text-white">
            No results found for &quot;{query}&quot;
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Please make sure your words are spelled correctly, or use fewer or
            different keywords.
          </p>
        </div>
      ) : (
        <>
          {top && (
            <div className="mb-8 flex flex-col gap-6 xl:flex-row">
              {/* Top result */}
              <div>
                <h3 className="mb-3 text-2xl font-bold text-white">
                  Top result
                </h3>
                <div className="group relative w-[340px] max-w-full cursor-default overflow-hidden rounded-lg bg-[#181818] p-5 pb-6 transition-colors hover:bg-[#282828]">
                  <Cover
                    colors={colorsForArtist(top.artist)}
                    className="h-24 w-24 rounded-md shadow-xl"
                  />
                  <p className="mt-4 truncate text-3xl font-black text-white">
                    {top.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    Song •{" "}
                    <span className="font-semibold text-white">
                      {top.artist}
                    </span>
                  </p>
                  <button
                    aria-label={`Play ${top.title}`}
                    onClick={() => playTrack(playlistOfTrack(top.id)?.id ?? 1, top.id)}
                    className="absolute bottom-5 right-5 grid h-12 w-12 translate-y-2 place-items-center rounded-full bg-[#1DB954] text-black opacity-0 shadow-xl transition-all duration-200 hover:scale-105 group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    <PlayIcon className="h-5 w-5 translate-x-[1px]" />
                  </button>
                </div>
              </div>

              {/* Songs */}
              {tracks.length > 0 && (
                <div className="min-w-0 flex-1">
                  <h3 className="mb-3 text-2xl font-bold text-white">Songs</h3>
                  <div className="divide-y divide-white/5">
                    {tracks.slice(0, 5).map((tr, i) => (
                      <TrackRow
                        key={tr.id}
                        track={tr}
                        index={i + 1}
                        isCurrent={tr.id === current.trackId}
                        isPlaying={tr.id === current.trackId && playing}
                        isLiked={liked.has(tr.id)}
                        showCover
                        onPlay={() =>
                          playTrack(playlistOfTrack(tr.id)?.id ?? 1, tr.id)
                        }
                        onToggle={togglePlay}
                        onToggleLike={() => toggleLike(tr.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {pages.length > 0 && (
            <>
              <h3 className="mb-2 text-2xl font-bold text-white">
                Playlists &amp; artists
              </h3>
              <div className={`flex gap-2 overflow-x-auto pb-2 ${scrollX}`}>
                {pages.map((p) => (
                  <div
                    key={p.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openPage(p.id)}
                    onKeyDown={(e) => e.key === "Enter" && openPage(p.id)}
                    className="group w-[180px] shrink-0 cursor-default rounded-lg p-3 transition-colors hover:bg-white/10"
                  >
                    <div className="relative mb-3">
                      <Cover
                        colors={p.cover}
                        className={`aspect-square w-full shadow-lg ${
                          p.kind === "artist" ? "rounded-full" : "rounded-md"
                        }`}
                      >
                        {p.kind === "artist" && (
                          <span className="absolute inset-0 grid place-items-center text-4xl font-black text-white/90">
                            {p.name[0]}
                          </span>
                        )}
                      </Cover>
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
                    <p className="mt-1 text-sm text-gray-400">
                      {p.kind === "artist" ? "Artist" : "Playlist"}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </motion.div>
  );
};

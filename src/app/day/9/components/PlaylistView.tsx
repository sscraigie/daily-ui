"use client";

import React from "react";
import { motion } from "framer-motion";
import { PlayIcon, PauseIcon, DotsIcon, ClockIcon, HeartIcon } from "./Icons";
import { Cover, Equalizer, fmt, fmtLong } from "./Shared";
import {
  colorsForArtist,
  LIKED_CONTEXT_ID,
  LIKED_COVER,
  type Playlist,
  type Track,
} from "../data";
import { usePlayer } from "../player-context";

const GRID =
  "grid grid-cols-[minmax(0,1fr)_100px] items-center gap-4 md:grid-cols-[24px_minmax(0,6fr)_minmax(0,4fr)_120px]";

export const PlaylistView = ({ page }: { page: Playlist }) => {
  const {
    current,
    playing,
    liked,
    playContext,
    playTrack,
    togglePlay,
    toggleLike,
  } = usePlayer();

  const kind = page.kind ?? "playlist";
  const total = page.tracks.reduce((a, t) => a + t.duration, 0);
  const coverColors: [string, string] =
    page.id === LIKED_CONTEXT_ID ? LIKED_COVER : page.cover;
  const contextActive = current.playlistId === page.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-full pb-10"
    >
      {/* Header */}
      <div
        className="px-6 pb-6 pt-20"
        style={{
          backgroundColor: page.bg,
          backgroundImage:
            "linear-gradient(180deg, rgba(18,18,18,0) 0%, rgba(18,18,18,0.5) 70%, #121212 100%)",
        }}
      >
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:gap-6">
          <Cover
            colors={coverColors}
            className={`h-32 w-32 shadow-[0_8px_40px_rgba(0,0,0,0.6)] sm:h-44 sm:w-44 md:h-52 md:w-52 ${
              kind === "artist" ? "rounded-full" : "rounded-md"
            }`}
          >
            {kind === "artist" && (
              <span className="absolute inset-0 grid place-items-center text-6xl font-black text-white/85">
                {page.name[0]}
              </span>
            )}
            {page.id === LIKED_CONTEXT_ID && (
              <HeartIcon
                filled
                className="absolute inset-0 m-auto h-16 w-16 text-white"
              />
            )}
          </Cover>
          <div className="min-w-0 pb-1">
            <p className="text-xs font-bold text-white md:text-sm">
              {kind === "artist" ? "Artist" : "Playlist"}
            </p>
            <h1 className="mb-3 mt-2 break-words text-4xl font-black tracking-tight text-white md:text-6xl xl:text-7xl">
              {page.name}
            </h1>
            {page.description && kind !== "artist" && (
              <p className="mb-2 text-sm text-gray-300/80">{page.description}</p>
            )}
            <div className="flex items-center gap-1 text-sm text-white">
              <span className="font-bold">Spotify</span>
              {kind !== "artist" && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-300">
                    {page.tracks.length} songs,
                  </span>
                </>
              )}
              <span className="text-gray-300">about {fmtLong(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-6 px-6 py-5">
        <button
          onClick={() => playContext(page.id)}
          aria-label={contextActive && playing ? "Pause" : "Play"}
          className="grid h-14 w-14 place-items-center rounded-full bg-[#1DB954] text-black shadow-xl transition hover:scale-105 hover:bg-[#3BE477]"
        >
          {contextActive && playing ? (
            <PauseIcon className="h-6 w-6" />
          ) : (
            <PlayIcon className="h-6 w-6 translate-x-[1px]" />
          )}
        </button>
        <button
          aria-label="More options"
          className="cursor-default text-gray-400 transition-colors hover:text-white"
        >
          <DotsIcon className="h-7 w-7" />
        </button>
      </div>

      {/* Track table */}
      <div className="px-6">
        <div
          className={`${GRID} mb-2 border-b border-white/10 px-4 pb-2 text-xs text-gray-400`}
        >
          <span className="hidden md:block">#</span>
          <span>Title</span>
          <span className="hidden md:block">Album</span>
          <span className="justify-self-end pr-2">
            <ClockIcon className="h-4 w-4" />
          </span>
        </div>

        <div className="divide-y divide-white/5">
          {page.tracks.map((tr, i) => (
            <TrackRow
              key={tr.id}
              track={tr}
              index={i + 1}
              isCurrent={tr.id === current.trackId}
              isPlaying={tr.id === current.trackId && playing}
              isLiked={liked.has(tr.id)}
              showCover
              onPlay={() => playTrack(page.id, tr.id)}
              onToggle={togglePlay}
              onToggleLike={() => toggleLike(tr.id)}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export const TrackRow = ({
  track,
  index,
  isCurrent,
  isPlaying,
  isLiked,
  showCover = false,
  onPlay,
  onToggle,
  onToggleLike,
}: {
  track: Track;
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  isLiked: boolean;
  showCover?: boolean;
  onPlay: () => void;
  onToggle: () => void;
  onToggleLike: () => void;
}) => (
  <div
    role="button"
    tabIndex={0}
    onClick={() => (isCurrent ? onToggle() : onPlay())}
    onKeyDown={(e) => {
      if (e.key === "Enter") isCurrent ? onToggle() : onPlay();
    }}
    className={`group ${GRID} cursor-default rounded-sm px-4 py-2 text-left transition-colors hover:bg-white/10`}
  >
    <span className="relative hidden h-5 items-center justify-center text-sm tabular-nums md:flex">
      {isPlaying ? (
        <Equalizer className="h-3.5" />
      ) : (
        <>
          <span className={isCurrent ? "text-[#1DB954]" : "text-gray-400"}>
            {index}
          </span>
          <PlayIcon className="absolute h-3.5 w-3.5 text-white opacity-0 group-hover:opacity-100" />
        </>
      )}
    </span>

    <span className="flex min-w-0 items-center gap-3">
      {showCover && (
        <Cover
          colors={colorsForArtist(track.artist)}
          className="h-10 w-10 rounded"
        />
      )}
      <span className="min-w-0">
        <span
          className={`block truncate text-sm font-medium ${
            isCurrent ? "text-[#1DB954]" : "text-white"
          }`}
        >
          {track.title}
        </span>
        <span className="block truncate text-sm text-gray-400 hover:text-white hover:underline">
          {track.artist}
        </span>
      </span>
    </span>

    <span className="hidden truncate text-sm text-gray-400 hover:text-white hover:underline md:block">
      {track.album}
    </span>

    <span className="flex items-center justify-end gap-3 pr-2">
      <button
        aria-label={isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}
        onClick={(e) => {
          e.stopPropagation();
          onToggleLike();
        }}
        className={`transition-colors ${
          isLiked
            ? "text-[#1DB954]"
            : "text-gray-400 opacity-0 hover:text-white group-hover:opacity-100"
        }`}
      >
        <HeartIcon filled={isLiked} className="h-4 w-4" />
      </button>
      <span className="w-8 text-right text-sm tabular-nums text-gray-400">
        {fmt(track.duration)}
      </span>
    </span>
  </div>
);

"use client";

import React from "react";
import {
  PlayIcon,
  PauseIcon,
  NextIcon,
  PrevIcon,
  ShuffleIcon,
  RepeatIcon,
  VolumeIcon,
  QueueIcon,
  HeartIcon,
} from "./Icons";
import { Cover, Slider, fmt } from "./Shared";
import { colorsForArtist } from "../data";
import { usePlayer } from "../player-context";

const toggleDot =
  "absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#1DB954]";

export const PlayerBar = () => {
  const {
    track,
    playing,
    progress,
    shuffle,
    repeat,
    volume,
    muted,
    liked,
    queueOpen,
    seek,
    togglePlay,
    next,
    prev,
    toggleShuffle,
    cycleRepeat,
    setVolume,
    toggleMute,
    toggleLike,
    setQueueOpen,
    openFull,
  } = usePlayer();

  const level = muted || volume === 0 ? "mute" : volume < 0.5 ? "low" : "high";

  return (
    <footer
      onClick={track ? openFull : undefined}
      className={`grid h-20 shrink-0 grid-cols-[1fr_minmax(0,2fr)_1fr] items-center gap-2 bg-black px-4 ${
        track ? "cursor-pointer" : ""
      }`}
    >
      {/* Left: current track — click to open full screen */}
      <div className="flex min-w-0 items-center gap-1">
        {track ? (
          <>
            <button
              onClick={openFull}
              className="group flex min-w-0 items-center gap-3 rounded-md p-1 text-left hover:bg-white/5"
            >
              <Cover
                colors={colorsForArtist(track.artist)}
                className="h-14 w-14 rounded-md"
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-white group-hover:underline">
                  {track.title}
                </span>
                <span className="block truncate text-xs text-gray-400 hover:text-white hover:underline">
                  {track.artist}
                </span>
              </span>
            </button>
            <button
              aria-label={liked.has(track.id) ? "Remove from Liked Songs" : "Save to Liked Songs"}
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(track.id);
              }}
              className={`ml-1 hidden shrink-0 transition-colors sm:block ${
                liked.has(track.id) ? "text-[#1DB954]" : "text-gray-400 hover:text-white"
              }`}
            >
              <HeartIcon filled={liked.has(track.id)} className="h-4 w-4" />
            </button>
          </>
        ) : (
          <p className="text-sm text-gray-400">Nothing playing</p>
        )}
      </div>

      {/* Center: controls + progress (controls shouldn't trigger full screen) */}
      <div
        className="flex flex-col items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4">
          <button
            aria-label="Shuffle"
            onClick={toggleShuffle}
            className={`relative hidden h-8 w-8 place-items-center transition-colors sm:grid ${
              shuffle ? "text-[#1DB954]" : "text-gray-400 hover:text-white"
            }`}
          >
            <ShuffleIcon className="h-4 w-4" />
            {shuffle && <span className={toggleDot} />}
          </button>
          <button
            aria-label="Previous"
            onClick={prev}
            className="text-gray-300 transition-colors hover:text-white"
          >
            <PrevIcon className="h-5 w-5" />
          </button>
          <button
            aria-label={playing ? "Pause" : "Play"}
            onClick={togglePlay}
            className="grid h-8 w-8 place-items-center rounded-full bg-white text-black transition hover:scale-105"
          >
            {playing ? (
              <PauseIcon className="h-4 w-4" />
            ) : (
              <PlayIcon className="h-4 w-4 translate-x-[1px]" />
            )}
          </button>
          <button
            aria-label="Next"
            onClick={next}
            className="text-gray-300 transition-colors hover:text-white"
          >
            <NextIcon className="h-5 w-5" />
          </button>
          <button
            aria-label="Repeat"
            onClick={cycleRepeat}
            className={`relative hidden h-8 w-8 place-items-center transition-colors sm:grid ${
              repeat === "off" ? "text-gray-400 hover:text-white" : "text-[#1DB954]"
            }`}
          >
            <RepeatIcon one={repeat === "one"} className="h-4 w-4" />
            {repeat !== "off" && <span className={toggleDot} />}
          </button>
        </div>

        <div className="flex w-full max-w-[600px] items-center gap-2">
          <span className="w-10 text-right text-[11px] tabular-nums text-gray-400">
            {track ? fmt(progress) : "-:--"}
          </span>
          {track ? (
            <Slider
              ariaLabel="Seek"
              value={Math.min(progress, track.duration)}
              max={track.duration}
              onChange={seek}
              className="flex-1"
            />
          ) : (
            <div className="h-3 flex-1" />
          )}
          <span className="w-10 text-left text-[11px] tabular-nums text-gray-400">
            {track ? fmt(track.duration) : "-:--"}
          </span>
        </div>
      </div>

      {/* Right: queue + volume */}
      <div
        className="flex items-center justify-end gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Now playing view"
          onClick={() => setQueueOpen(!queueOpen)}
          className={`grid h-8 w-8 place-items-center transition-colors ${
            queueOpen ? "text-[#1DB954]" : "text-gray-400 hover:text-white"
          }`}
        >
          <QueueIcon className="h-4 w-4" />
        </button>
        <button
          aria-label="Mute"
          onClick={toggleMute}
          className="text-gray-400 transition-colors hover:text-white"
        >
          <VolumeIcon level={level} className="h-4 w-4" />
        </button>
        <div className="hidden w-24 md:block">
          <Slider
            ariaLabel="Volume"
            value={muted ? 0 : volume}
            max={1}
            onChange={setVolume}
          />
        </div>
      </div>
    </footer>
  );
};

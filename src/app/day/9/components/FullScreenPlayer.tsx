"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDownIcon,
  DotsIcon,
  HeartIcon,
  PlayIcon,
  PauseIcon,
  PrevIcon,
  NextIcon,
  ShuffleIcon,
  RepeatIcon,
  VolumeIcon,
  QueueIcon,
} from "./Icons";
import { Cover, Slider, fmt } from "./Shared";
import { colorsForArtist } from "../data";
import { usePlayer } from "../player-context";

export const FullScreenPlayer = () => {
  const {
    track,
    fullOpen,
    playing,
    progress,
    shuffle,
    repeat,
    liked,
    contextName,
    contextKind,
    seek,
    togglePlay,
    next,
    prev,
    toggleShuffle,
    cycleRepeat,
    toggleLike,
    setQueueOpen,
    closeFull,
  } = usePlayer();

  // Close with Escape
  useEffect(() => {
    if (!fullOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFull();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullOpen, closeFull]);

  return (
    <AnimatePresence>
      {fullOpen && track && (
        <motion.div
          key="full-screen-player"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 34 }}
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto"
          style={{
            background: `linear-gradient(180deg, ${
              colorsForArtist(track.artist)[0]
            } 0%, ${colorsForArtist(track.artist)[1]} 32%, #121212 66%, #000 100%)`,
          }}
        >
          {/* Header */}
          <div className="grid grid-cols-3 items-center px-4 py-4 sm:px-8">
            <button
              aria-label="Close full screen"
              onClick={closeFull}
              className="grid h-10 w-10 place-items-center rounded-full text-white/90 hover:bg-white/10"
            >
              <ChevronDownIcon className="h-6 w-6" />
            </button>
            <div className="text-center">
              <p className="text-[11px] text-gray-300">
                Playing from {contextKind}
              </p>
              <p className="truncate text-sm font-bold text-white">
                {contextName}
              </p>
            </div>
            <span className="justify-self-end text-white/70">
              <DotsIcon className="h-5 w-5" />
            </span>
          </div>

          {/* Cover */}
          <div className="flex flex-1 flex-col items-center justify-center px-6">
            <Cover
              colors={colorsForArtist(track.artist)}
              className="aspect-square w-[min(62vw,320px)] rounded-lg shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
            />

            {/* Title + like */}
            <div className="mt-8 flex w-full max-w-[480px] items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-2xl font-bold text-white sm:text-3xl">
                  {track.title}
                </p>
                <p className="truncate text-sm text-gray-300 hover:text-white hover:underline">
                  {track.artist}
                </p>
              </div>
              <button
                aria-label={liked.has(track.id) ? "Remove from Liked Songs" : "Save to Liked Songs"}
                onClick={() => toggleLike(track.id)}
                className={`shrink-0 transition-colors ${
                  liked.has(track.id)
                    ? "text-[#1DB954]"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <HeartIcon filled={liked.has(track.id)} className="h-7 w-7" />
              </button>
            </div>

            {/* Progress */}
            <div className="mt-6 w-full max-w-[480px]">
              <Slider
                ariaLabel="Seek"
                value={Math.min(progress, track.duration)}
                max={track.duration}
                onChange={seek}
              />
              <div className="mt-1 flex justify-between text-[11px] tabular-nums text-gray-300">
                <span>{fmt(progress)}</span>
                <span>{fmt(track.duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-4 flex w-full max-w-[480px] items-center justify-between px-2">
              <button
                aria-label="Shuffle"
                onClick={toggleShuffle}
                className={`grid h-10 w-10 place-items-center transition-colors ${
                  shuffle ? "text-[#1DB954]" : "text-white hover:text-white"
                }`}
              >
                <ShuffleIcon className="h-6 w-6" />
              </button>
              <button
                aria-label="Previous"
                onClick={prev}
                className="grid h-12 w-12 place-items-center text-white"
              >
                <PrevIcon className="h-8 w-8" />
              </button>
              <button
                aria-label={playing ? "Pause" : "Play"}
                onClick={togglePlay}
                className="grid h-16 w-16 place-items-center rounded-full bg-white text-black transition hover:scale-105"
              >
                {playing ? (
                  <PauseIcon className="h-7 w-7" />
                ) : (
                  <PlayIcon className="h-7 w-7 translate-x-[2px]" />
                )}
              </button>
              <button
                aria-label="Next"
                onClick={next}
                className="grid h-12 w-12 place-items-center text-white"
              >
                <NextIcon className="h-8 w-8" />
              </button>
              <button
                aria-label="Repeat"
                onClick={cycleRepeat}
                className={`grid h-10 w-10 place-items-center transition-colors ${
                  repeat === "off" ? "text-white" : "text-[#1DB954]"
                }`}
              >
                <RepeatIcon one={repeat === "one"} className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between px-6 pb-8 pt-6 sm:px-10">
            <VolumeIcon level="high" className="h-5 w-5 text-[#1DB954]" />
            <div className="flex items-center gap-6">
              <span className="cursor-default text-white/70">
                <DotsIcon className="h-5 w-5" />
              </span>
              <button
                aria-label="Queue"
                onClick={() => {
                  setQueueOpen(true);
                  closeFull();
                }}
                className="text-white/90 transition-colors hover:text-white"
              >
                <QueueIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

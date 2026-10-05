"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { DotsIcon, XIcon, HeartIcon } from "./Icons";
import { Cover, fmtCompact } from "./Shared";
import { allTracks, colorsForArtist } from "../data";
import { usePlayer } from "../player-context";

function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const FollowButton = ({ artist }: { artist: string }) => {
  const [following, setFollowing] = useState(false);
  return (
    <button
      onClick={() => setFollowing((f) => !f)}
      className={`mt-4 rounded-full border px-4 py-1.5 text-sm font-bold transition ${
        following
          ? "border-white bg-white text-black"
          : "border-gray-500 text-white hover:border-white"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
};

export const NowPlayingPanel = () => {
  const {
    track,
    current,
    playing,
    liked,
    upNext,
    contextName,
    toggleLike,
    setQueueOpen,
    playTrack,
  } = usePlayer();

  if (!track) return null;

  const listeners = 1_800_000 + (hashCode(track.artist) % 14_000_000);
  const artistPlays = allTracks
    .filter((t) => t.artist === track.artist)
    .reduce((a, t) => a + t.plays, 0);
  const colors = colorsForArtist(track.artist);
  const isLiked = liked.has(track.id);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.2 }}
      className="hidden w-[360px] shrink-0 flex-col gap-2 overflow-y-auto rounded-lg bg-[#121212] p-1 xl:flex"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="min-w-0 flex-1 truncate px-1 text-sm font-bold text-white">
          {track.title}
        </span>
        <button
          aria-label="More options"
          className="grid h-8 w-8 cursor-default place-items-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white"
        >
          <DotsIcon className="h-4 w-4" />
        </button>
        <button
          aria-label="Close"
          onClick={() => setQueueOpen(false)}
          className="grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Cover + info */}
      <div className="px-4">
        <Cover
          colors={colors}
          className="aspect-square w-full rounded-lg shadow-2xl"
        />
        <div className="mt-4 flex items-start justify-between gap-2 pb-4">
          <div className="min-w-0">
            <p className="truncate text-2xl font-bold text-white hover:underline">
              {track.title}
            </p>
            <p className="truncate text-sm text-gray-400 hover:text-white hover:underline">
              {track.artist}
            </p>
            <p className="mt-2 truncate text-xs text-gray-500">
              Playing from {contextName} {playing ? "" : "(paused)"}
            </p>
          </div>
          <button
            aria-label={isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}
            onClick={() => toggleLike(track.id)}
            className={`shrink-0 transition-colors ${
              isLiked ? "text-[#1DB954]" : "text-gray-400 hover:text-white"
            }`}
          >
            <HeartIcon filled={isLiked} className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* About the artist */}
      <div className="mx-4 rounded-lg bg-[#1F1F1F] p-4">
        <p className="text-base font-bold text-white">About the artist</p>
        <div className="mt-3 flex items-center gap-3">
          <Cover colors={colors} className="h-12 w-12 rounded-full">
            <span className="absolute inset-0 grid place-items-center text-lg font-black text-white/90">
              {track.artist[0]}
            </span>
          </Cover>
          <div>
            <p className="font-bold text-white">{track.artist}</p>
            <p className="text-xs text-gray-400">
              {(listeners / 1_000_000).toFixed(1)}M monthly listeners
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-400">
          {fmtCompact(artistPlays)} plays and counting — listeners keep{" "}
          {track.artist} on repeat.
        </p>
        <FollowButton key={track.artist} artist={track.artist} />
      </div>

      {/* Next in queue */}
      <div className="mx-4 mb-4 rounded-lg bg-[#1F1F1F] p-4">
        <p className="text-base font-bold text-white">Next in queue</p>
        {upNext ? (
          <button
            onClick={() => upNext && playTrack(current.playlistId, upNext.id)}
            className="mt-3 flex w-full items-center gap-3 rounded-md p-1 text-left hover:bg-white/10"
          >
            <Cover
              colors={colorsForArtist(upNext.artist)}
              className="h-10 w-10 rounded"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {upNext.title}
              </p>
              <p className="truncate text-xs text-gray-400">{upNext.artist}</p>
            </div>
          </button>
        ) : (
          <p className="mt-3 text-sm text-gray-400">Queue is empty.</p>
        )}
      </div>
    </motion.aside>
  );
};

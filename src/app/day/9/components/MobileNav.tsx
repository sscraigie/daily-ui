"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  SearchIcon,
  LibraryIcon,
  HeartIcon,
  PlayIcon,
  PauseIcon,
  NextIcon,
} from "./Icons";
import { Cover } from "./Shared";
import { colorsForArtist } from "../data";
import { usePlayer } from "../player-context";

/* Bottom tab bar — mirrors the Spotify mobile app (Home / Search / Your Library) */
export const TabBar = () => {
  const pathname = usePathname();
  const tabs = [
    {
      href: "/day/9",
      label: "Home",
      icon: HomeIcon,
      active: pathname === "/day/9",
    },
    {
      href: "/day/9/search",
      label: "Search",
      icon: SearchIcon,
      active: pathname.startsWith("/day/9/search"),
    },
    {
      href: "/day/9/library",
      label: "Your Library",
      icon: LibraryIcon,
      active:
        pathname.startsWith("/day/9/library") ||
        pathname.startsWith("/day/9/liked") ||
        pathname.startsWith("/day/9/playlist") ||
        pathname.startsWith("/day/9/artist"),
    },
  ];

  return (
    <nav className="flex h-16 shrink-0 items-stretch justify-around border-t border-white/10 bg-black">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`flex flex-col items-center justify-center gap-1 px-4 ${
            t.active ? "text-white" : "text-gray-400"
          }`}
        >
          <t.icon className="h-6 w-6" />
          <span className="text-[11px] font-medium">{t.label}</span>
        </Link>
      ))}
    </nav>
  );
};

/* Compact now-playing bar above the tabs — tap it to open the full screen player */
export const MiniPlayer = () => {
  const { track, playing, liked, togglePlay, next, toggleLike, openFull } =
    usePlayer();

  if (!track) return null;

  return (
    <div className="mx-2 mb-1 flex items-center gap-2 rounded-lg bg-[#1f1f1f] p-2">
      <button
        onClick={openFull}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left"
      >
        <Cover
          colors={colorsForArtist(track.artist)}
          className="h-11 w-11 rounded"
        />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-white">
            {track.title}
          </span>
          <span className="block truncate text-xs text-gray-400">
            {track.artist}
          </span>
        </span>
      </button>
      <button
        aria-label={liked.has(track.id) ? "Remove from Liked Songs" : "Save to Liked Songs"}
        onClick={() => toggleLike(track.id)}
        className={`shrink-0 p-1 transition-colors ${
          liked.has(track.id) ? "text-[#1DB954]" : "text-gray-400"
        }`}
      >
        <HeartIcon filled={liked.has(track.id)} className="h-5 w-5" />
      </button>
      <button
        aria-label={playing ? "Pause" : "Play"}
        onClick={togglePlay}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-black transition hover:scale-105"
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
        className="shrink-0 p-1 text-gray-300 transition-colors hover:text-white"
      >
        <NextIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

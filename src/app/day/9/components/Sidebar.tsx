"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SpotifyLogo,
  HomeIcon,
  SearchIcon,
  LibraryIcon,
  PlusIcon,
  HeartIcon,
} from "./Icons";
import { Cover } from "./Shared";
import { LIKED_CONTEXT_ID, LIKED_COVER, playlists } from "../data";
import { usePlayer } from "../player-context";

const NAV_ITEM =
  "flex w-full items-center gap-4 rounded-md px-2 py-2 text-left text-sm font-bold transition-colors";

export const Sidebar = () => {
  const pathname = usePathname();
  const { liked } = usePlayer();
  const likedActive = pathname.startsWith("/day/9/liked");

  return (
    <div className="hidden w-[240px] shrink-0 flex-col gap-2 md:flex xl:w-[280px]">
      <div className="rounded-lg bg-black px-3 py-4">
        <Link
          href="/day/9"
          className="flex items-center gap-2 px-2 text-white"
        >
          <SpotifyLogo className="h-8 w-8 text-[#1DB954]" />
          <span className="text-xl font-bold tracking-tight">Spotify</span>
        </Link>

        <nav className="mt-5 flex flex-col gap-1">
          <Link
            href="/day/9"
            className={`${NAV_ITEM} ${
              pathname === "/day/9" ? "text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <HomeIcon className="h-6 w-6" />
            Home
          </Link>
          <Link
            href="/day/9/search"
            className={`${NAV_ITEM} ${
              pathname.startsWith("/day/9/search")
                ? "text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <SearchIcon className="h-6 w-6" />
            Search
          </Link>
        </nav>
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-lg bg-black px-3 pb-2 pt-3">
        <div className="flex items-center justify-between border-b border-white/10 px-2 pb-3">
          <Link
            href="/day/9/liked"
            className={`flex items-center gap-3 text-sm font-bold transition-colors ${
              likedActive ? "text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <LibraryIcon className="h-6 w-6" />
            Your Library
          </Link>
          <div
            title="Create playlist"
            className="grid h-8 w-8 cursor-default place-items-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <PlusIcon className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
          <Link
            href="/day/9/liked"
            className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-white/10"
          >
            <Cover colors={LIKED_COVER} className="h-12 w-12 rounded">
              <HeartIcon
                filled
                className="absolute inset-0 m-auto h-5 w-5 text-white"
              />
            </Cover>
            <div className="min-w-0">
              <p
                className={`truncate text-sm font-semibold ${
                  likedActive ? "text-[#1DB954]" : "text-white"
                }`}
              >
                Liked Songs
              </p>
              <p className="truncate text-xs text-gray-400">
                Playlist • {liked.size} {liked.size === 1 ? "song" : "songs"}
              </p>
            </div>
          </Link>

          {playlists.map((p) => {
            const active = pathname === `/day/9/playlist/${p.id}`;
            return (
              <Link
                key={p.id}
                href={`/day/9/playlist/${p.id}`}
                className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-white/10"
              >
                <Cover colors={p.cover} className="h-12 w-12 rounded" />
                <div className="min-w-0">
                  <p
                    className={`truncate text-sm font-semibold ${
                      active ? "text-[#1DB954]" : "text-white"
                    }`}
                  >
                    {p.name}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    Playlist • Spotify
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export { LIKED_CONTEXT_ID };

"use client";
// Day 9 - Playlist (/day/9/playlist/[id])

import React from "react";
import { useParams } from "next/navigation";
import { PlaylistView } from "../../components/PlaylistView";
import { pageByIdAll } from "../../data";

export default function Day9Playlist() {
  const params = useParams();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const page = pageByIdAll(Number(rawId));

  if (!page) {
    return (
      <div className="px-6 pb-10 pt-24">
        <p className="text-2xl font-bold text-white">Playlist not found</p>
        <p className="mt-2 text-sm text-gray-400">
          The playlist you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    );
  }

  return <PlaylistView page={page} />;
}

"use client";
// Day 9 - Artist (/day/9/artist/[name])

import React from "react";
import { useParams } from "next/navigation";
import { PlaylistView } from "../../components/PlaylistView";
import { artistPages } from "../../data";

export default function Day9Artist() {
  const params = useParams();
  const rawName = Array.isArray(params.name) ? params.name[0] : params.name;
  const page = artistPages.find((p) => p.name === rawName);

  if (!page) {
    return (
      <div className="px-6 pb-10 pt-24">
        <p className="text-2xl font-bold text-white">Artist not found</p>
        <p className="mt-2 text-sm text-gray-400">
          The artist you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    );
  }

  return <PlaylistView page={page} />;
}

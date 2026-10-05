"use client";
// Day 9 - Liked Songs (/day/9/liked)

import React from "react";
import { PlaylistView } from "../components/PlaylistView";
import { LIKED_CONTEXT_ID, LIKED_COVER, type Playlist } from "../data";
import { usePlayer } from "../player-context";

export default function Day9Liked() {
  const { likedTracks } = usePlayer();

  const page: Playlist = {
    id: LIKED_CONTEXT_ID,
    name: "Liked Songs",
    description: "All the tracks you've given a green heart.",
    cover: LIKED_COVER,
    bg: "#4C1D95",
    tracks: likedTracks,
  };

  return <PlaylistView page={page} />;
}

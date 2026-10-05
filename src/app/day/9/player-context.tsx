"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  allTracks,
  findTrack,
  LIKED_CONTEXT_ID,
  pageByIdAll,
  type Track,
} from "./data";

type RepeatMode = "off" | "all" | "one";

type PlayerContextValue = {
  current: { playlistId: number; trackId: number };
  track: Track | null;
  playing: boolean;
  progress: number;
  shuffle: boolean;
  repeat: RepeatMode;
  volume: number;
  muted: boolean;
  liked: Set<number>;
  queueOpen: boolean;
  fullOpen: boolean;
  contextName: string;
  contextKind: string;
  upNext: Track | null;
  likedTracks: Track[];
  getContextTracks: (ctxId: number) => Track[];
  playTrack: (playlistId: number, trackId: number) => void;
  playContext: (ctxId: number) => void;
  togglePlay: () => void;
  seek: (v: number) => void;
  next: () => void;
  prev: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleLike: (id: number) => void;
  setQueueOpen: (v: boolean) => void;
  openFull: () => void;
  closeFull: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export const usePlayer = () => {
  const v = useContext(PlayerContext);
  if (!v) throw new Error("usePlayer must be used within PlayerProvider");
  return v;
};

function nextIndexInContext(ctx: Track[], idx: number, shuffle: boolean) {
  if (ctx.length <= 1) return idx;
  if (shuffle) {
    let n = idx;
    while (n === idx) n = Math.floor(Math.random() * ctx.length);
    return n;
  }
  return (idx + 1) % ctx.length;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState({ playlistId: 1, trackId: 101 });
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [volume, setVolumeState] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [liked, setLiked] = useState<Set<number>>(
    new Set([101, 203, 303, 402, 501])
  );
  const [queueOpen, setQueueOpen] = useState(false);
  const [fullOpen, setFullOpen] = useState(false);

  const track = findTrack(current.trackId) ?? null;

  const getContextTracks = useCallback(
    (ctxId: number): Track[] => {
      if (ctxId === LIKED_CONTEXT_ID)
        return allTracks.filter((t) => liked.has(t.id));
      return pageByIdAll(ctxId)?.tracks ?? [];
    },
    [liked]
  );

  // Tick while playing
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setProgress((p) => p + 1), 1000);
    return () => clearInterval(id);
  }, [playing]);

  // End of track: auto-advance / repeat / stop
  useEffect(() => {
    if (!playing || !track) return;
    if (progress < track.duration) return;

    if (repeat === "one") {
      setProgress(0);
      return;
    }
    const ctx = getContextTracks(current.playlistId);
    const idx = ctx.findIndex((x) => x.id === current.trackId);
    if (idx === -1) {
      setPlaying(false);
      setProgress(0);
      return;
    }
    if (repeat === "off" && !shuffle && idx + 1 >= ctx.length) {
      setPlaying(false);
      setProgress(0);
      return;
    }
    const n = nextIndexInContext(ctx, idx, shuffle);
    setCurrent({ playlistId: current.playlistId, trackId: ctx[n].id });
    setProgress(0);
  }, [progress, playing, track, current, repeat, shuffle, getContextTracks]);

  const playTrack = (playlistId: number, trackId: number) => {
    setCurrent({ playlistId, trackId });
    setProgress(0);
    setPlaying(true);
  };

  const playContext = (ctxId: number) => {
    const ctx = getContextTracks(ctxId);
    if (!ctx.length) return;
    if (current.playlistId === ctxId && track) {
      setPlaying((p) => !p);
      return;
    }
    playTrack(ctxId, ctx[0].id);
  };

  const toggleLike = (id: number) =>
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const next = () => {
    const ctx = getContextTracks(current.playlistId);
    const idx = ctx.findIndex((x) => x.id === current.trackId);
    if (idx === -1) return;
    const n = nextIndexInContext(ctx, idx, shuffle);
    if (n === idx) {
      setProgress(0);
      return;
    }
    setCurrent({ playlistId: current.playlistId, trackId: ctx[n].id });
    setProgress(0);
  };

  const prev = () => {
    if (progress > 3) {
      setProgress(0);
      return;
    }
    const ctx = getContextTracks(current.playlistId);
    const idx = ctx.findIndex((x) => x.id === current.trackId);
    if (idx === -1) return;
    const n = (idx - 1 + ctx.length) % ctx.length;
    setCurrent({ playlistId: current.playlistId, trackId: ctx[n].id });
    setProgress(0);
  };

  const likedTracks = allTracks.filter((t) => liked.has(t.id));

  const contextName =
    current.playlistId === LIKED_CONTEXT_ID
      ? "Liked Songs"
      : pageByIdAll(current.playlistId)?.name ?? "Spotify";
  const contextKind =
    current.playlistId === LIKED_CONTEXT_ID
      ? "Playlist"
      : pageByIdAll(current.playlistId)?.kind === "artist"
        ? "Artist"
        : "Playlist";

  const upNext: Track | null = (() => {
    const ctx = getContextTracks(current.playlistId);
    const idx = ctx.findIndex((x) => x.id === current.trackId);
    if (idx === -1) return ctx[1] ?? null;
    return ctx[nextIndexInContext(ctx, idx, shuffle)] ?? null;
  })();

  const value: PlayerContextValue = {
    current,
    track,
    playing,
    progress,
    shuffle,
    repeat,
    volume,
    muted,
    liked,
    queueOpen,
    fullOpen,
    contextName,
    contextKind,
    upNext,
    likedTracks,
    getContextTracks,
    playTrack,
    playContext,
    togglePlay: () => setPlaying((p) => !p),
    seek: setProgress,
    next,
    prev,
    toggleShuffle: () => setShuffle((s) => !s),
    cycleRepeat: () =>
      setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off")),
    setVolume: (v) => {
      setVolumeState(v);
      setMuted(v === 0);
    },
    toggleMute: () => setMuted((m) => !m),
    toggleLike,
    setQueueOpen,
    openFull: () => setFullOpen(true),
    closeFull: () => setFullOpen(false),
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

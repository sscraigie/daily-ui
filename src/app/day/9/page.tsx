"use client";
// Day 9 - Music Player
// Inspiration: https://dribbble.com/shots/20569277-Music-Player-UI-Design
// Full-featured music player with animated vinyl, waveform, and playlist

import { motion, AnimatePresence, useAnimation } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import { RequireDarkMode } from "@/components/ThemeProvider";

const tracks = [
  {
    id: 1,
    title: "Midnight Bloom",
    artist: "Neon Drift",
    album: "Synthetic Horizons",
    duration: 214,
    color: ["#f953c6", "#b91d73"],
    bg: "#1a0012",
  },
  {
    id: 2,
    title: "Solar Tides",
    artist: "The Velvets",
    album: "Ocean Drive",
    duration: 187,
    color: ["#4facfe", "#00f2fe"],
    bg: "#001a2b",
  },
  {
    id: 3,
    title: "Golden Hour",
    artist: "Kira Lake",
    album: "Pacific Dusk",
    duration: 243,
    color: ["#f7971e", "#ffd200"],
    bg: "#1a1200",
  },
  {
    id: 4,
    title: "Vapor Cathedral",
    artist: "Echo Chamber",
    album: "Architectures",
    duration: 196,
    color: ["#a18cd1", "#fbc2eb"],
    bg: "#130018",
  },
  {
    id: 5,
    title: "Deep Forest",
    artist: "Mossy Oak",
    album: "Roots",
    duration: 228,
    color: ["#43e97b", "#38f9d7"],
    bg: "#001a0e",
  },
];

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function BarWaveform({ color, playing }: { color: string[]; playing: boolean }) {
  const bars = Array.from({ length: 32 });
  return (
    <div className="flex items-end gap-[2px] h-10">
      {bars.map((_, i) => {
        const base = 20 + Math.sin(i * 0.7) * 18 + Math.cos(i * 0.3) * 10;
        return (
          <motion.div
            key={i}
            className="w-1 rounded-full"
            style={{
              background: `linear-gradient(180deg, ${color[0]}, ${color[1]})`,
              opacity: 0.7,
            }}
            animate={
              playing
                ? {
                    height: [
                      base,
                      base * (0.4 + Math.random() * 0.8),
                      base * (0.5 + Math.random() * 0.9),
                      base,
                    ],
                  }
                : { height: base * 0.3 }
            }
            transition={
              playing
                ? {
                    repeat: Infinity,
                    duration: 0.6 + Math.random() * 0.4,
                    delay: i * 0.02,
                    ease: "easeInOut",
                  }
                : { duration: 0.4 }
            }
          />
        );
      })}
    </div>
  );
}

function VinylDisc({
  color,
  playing,
}: {
  color: string[];
  playing: boolean;
}) {
  return (
    <motion.div
      animate={{ rotate: playing ? 360 : 0 }}
      transition={
        playing
          ? { repeat: Infinity, duration: 3, ease: "linear" }
          : { duration: 0 }
      }
      className="relative flex-shrink-0"
      style={{ width: 200, height: 200 }}
    >
      {/* Outer vinyl */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, #1a1a1a, #2d2d2d, #1a1a1a, #2d2d2d, #1a1a1a)",
          boxShadow: `0 0 40px 8px ${color[0]}55`,
        }}
      />
      {/* Groove rings */}
      {[70, 80, 90].map((r) => (
        <div
          key={r}
          className="absolute rounded-full"
          style={{
            inset: `${(200 - r * 2) / 2}px`,
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        />
      ))}
      {/* Label center */}
      <div
        className="absolute rounded-full flex items-center justify-center"
        style={{
          inset: "62px",
          background: `linear-gradient(135deg, ${color[0]}, ${color[1]})`,
        }}
      >
        {/* Center hole */}
        <div className="w-5 h-5 rounded-full bg-black" />
      </div>
      {/* Shine */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)",
        }}
      />
    </motion.div>
  );
}

export default function Day9() {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState<Set<number>>(new Set([1]));
  const [volume, setVolume] = useState(75);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const track = tracks[currentTrack];

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= track.duration) {
            next();
            return 0;
          }
          return p + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, currentTrack]);

  const next = () => {
    setCurrentTrack((p) => (p + 1) % tracks.length);
    setProgress(0);
  };
  const prev = () => {
    setCurrentTrack((p) => (p - 1 + tracks.length) % tracks.length);
    setProgress(0);
  };
  const toggleLike = (id: number) => {
    setLiked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <>
      <RequireDarkMode />
      <div
        className="h-full w-full flex items-center justify-center p-4 overflow-hidden"
        style={{ background: track.bg, transition: "background 0.8s ease" }}
      >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: `0 40px 80px -20px ${track.color[0]}44`,
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-6">
          <button
            onClick={() => setShowPlaylist((p) => !p)}
            className="flex items-center gap-2 text-xs font-semibold border-none bg-transparent cursor-pointer"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10" />
            </svg>
            Playlist
          </button>

          <div
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${track.color[0]}, ${track.color[1]})`,
              color: "#fff",
            }}
          >
            NOW PLAYING
          </div>

          <button
            onClick={() => toggleLike(track.id)}
            className="border-none bg-transparent cursor-pointer p-0"
          >
            <motion.svg
              animate={liked.has(track.id) ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
              className="w-5 h-5"
              fill={liked.has(track.id) ? track.color[0] : "none"}
              stroke={liked.has(track.id) ? track.color[0] : "rgba(255,255,255,0.5)"}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </motion.svg>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* Playlist overlay */}
          {showPlaylist ? (
            <motion.div
              key="playlist"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="px-6 py-4 flex flex-col gap-2"
              style={{ minHeight: 380 }}
            >
              <h3 className="text-white text-base font-bold m-0 mb-2">Up Next</h3>
              {tracks.map((t, i) => (
                <motion.button
                  key={t.id}
                  onClick={() => {
                    setCurrentTrack(i);
                    setProgress(0);
                    setShowPlaylist(false);
                  }}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border-none cursor-pointer w-full text-left"
                  style={{
                    background:
                      i === currentTrack
                        ? "rgba(255,255,255,0.12)"
                        : "transparent",
                  }}
                >
                  {/* Mini vinyl */}
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${t.color[0]}, ${t.color[1]})`,
                    }}
                  >
                    {i === currentTrack && playing ? (
                      <div className="flex gap-0.5 items-end h-4">
                        {[1, 2, 3].map((b) => (
                          <motion.div
                            key={b}
                            className="w-[3px] bg-white rounded-full"
                            animate={{ height: [4, 8, 4] }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.5,
                              delay: b * 0.15,
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-sm font-semibold text-white truncate">{t.title}</p>
                    <p className="m-0 text-xs text-gray-400 truncate">{t.artist}</p>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">{fmt(t.duration)}</span>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="player"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center px-6 pb-6 pt-4"
            >
              {/* Vinyl */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={track.id}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <VinylDisc color={track.color} playing={playing} />
                </motion.div>
              </AnimatePresence>

              {/* Track info */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center mt-6 mb-4"
                >
                  <h2 className="text-white text-xl font-bold m-0">{track.title}</h2>
                  <p className="text-gray-400 text-sm m-0 mt-1">
                    {track.artist} · {track.album}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Waveform */}
              <div className="mb-4 w-full flex justify-center">
                <BarWaveform color={track.color} playing={playing} />
              </div>

              {/* Progress */}
              <div className="w-full mb-4">
                <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute h-full rounded-full"
                    style={{
                      width: `${(progress / track.duration) * 100}%`,
                      background: `linear-gradient(90deg, ${track.color[0]}, ${track.color[1]})`,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={track.duration}
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs text-gray-500">{fmt(progress)}</span>
                  <span className="text-xs text-gray-500">{fmt(track.duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between w-full mb-5">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={prev}
                  className="border-none bg-transparent cursor-pointer p-2"
                >
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.445 14.832A1 1 0 0010 14v-4.798l5.445 3.63A1 1 0 0017 12V8a1 1 0 00-1.555-.832L10 10.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                  </svg>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setPlaying((p) => !p)}
                  className="flex items-center justify-center w-14 h-14 rounded-full border-none cursor-pointer shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${track.color[0]}, ${track.color[1]})`,
                    boxShadow: `0 8px 25px ${track.color[0]}66`,
                  }}
                >
                  {playing ? (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  )}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={next}
                  className="border-none bg-transparent cursor-pointer p-2"
                >
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z" />
                  </svg>
                </motion.button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3 w-full">
                <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072" />
                </svg>
                <div className="flex-1 relative h-1 bg-white/10 rounded-full">
                  <div
                    className="absolute h-full rounded-full"
                    style={{
                      width: `${volume}%`,
                      background: `linear-gradient(90deg, ${track.color[0]}, ${track.color[1]})`,
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      </div>
    </>
  );
}

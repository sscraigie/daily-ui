"use client";
// Day 5 - App Icon

import { motion } from "framer-motion";
import React, { useState } from "react";

const ALL_ICONS: {
  id: number;
  label: string;
  gradient: [string, string];
  symbol: string;
  description: string;
}[] = [
  {
    id: 1,
    label: "Pulse",
    gradient: ["#f953c6", "#b91d73"],
    symbol: "❤",
    description: "Health & Fitness",
  },
  {
    id: 2,
    label: "Atlas",
    gradient: ["#4facfe", "#00f2fe"],
    symbol: "🌐",
    description: "Travel & Maps",
  },
  {
    id: 3,
    label: "Forge",
    gradient: ["#f7971e", "#ffd200"],
    symbol: "⚡",
    description: "Productivity",
  },
  {
    id: 4,
    label: "Veil",
    gradient: ["#a18cd1", "#fbc2eb"],
    symbol: "✦",
    description: "Privacy & Security",
  },
  {
    id: 5,
    label: "Nova",
    gradient: ["#43e97b", "#38f9d7"],
    symbol: "✦",
    description: "Meditation & Focus",
  },
  {
    id: 6,
    label: "Haze",
    gradient: ["#f093fb", "#f5576c"],
    symbol: "◉",
    description: "Social Media",
  },
  {
    id: 7,
    label: "Stack",
    gradient: ["#4481eb", "#04befe"],
    symbol: "▦",
    description: "File Storage",
  },
  {
    id: 8,
    label: "Drift",
    gradient: ["#fa709a", "#fee140"],
    symbol: "▶",
    description: "Music & Audio",
  },
  {
    id: 9,
    label: "Prism",
    gradient: ["#30cfd0", "#667eea"],
    symbol: "◈",
    description: "Photo & Video",
  },
];

const AppIcon = ({
  icon,
  index,
}: {
  icon: (typeof ALL_ICONS)[0];
  index: number;
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.07,
        type: "spring",
        stiffness: 120,
      }}
      className="flex flex-col items-center gap-2"
    >
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        animate={hovered ? { y: -8, scale: 1.08 } : { y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative cursor-pointer select-none"
        style={{ width: 96, height: 96 }}
      >
        {/* Shadow layer */}
        <motion.div
          animate={
            hovered
              ? { opacity: 0.6, scale: 1.15, y: 12 }
              : { opacity: 0.25, scale: 1, y: 8 }
          }
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="absolute inset-0 rounded-[22px] blur-xl"
          style={{
            background: `linear-gradient(135deg, ${icon.gradient[0]}, ${icon.gradient[1]})`,
            zIndex: 0,
          }}
        />
        {/* Icon body */}
        <div
          className="relative flex h-full w-full items-center justify-center rounded-[22px] overflow-hidden"
          style={{
            background: `linear-gradient(145deg, ${icon.gradient[0]}, ${icon.gradient[1]})`,
            zIndex: 1,
          }}
        >
          {/* Inner gloss */}
          <div
            className="absolute top-0 left-0 right-0 h-1/2 rounded-t-[22px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)",
              zIndex: 2,
            }}
          />
          {/* Symbol */}
          <span
            className="text-white select-none relative"
            style={{
              fontSize: 38,
              textShadow: "0 2px 12px rgba(0,0,0,0.18)",
              zIndex: 3,
              fontFamily: "system-ui, sans-serif",
              lineHeight: 1,
            }}
          >
            {icon.symbol}
          </span>
          {/* Shimmer on hover */}
          <motion.div
            animate={hovered ? { x: "200%" } : { x: "-200%" }}
            initial={{ x: "-200%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.4) 50%, transparent 80%)",
              zIndex: 4,
            }}
          />
        </div>
        {/* Notification dot on some icons */}
        {[1, 5, 8].includes(icon.id) && (
          <motion.div
            animate={hovered ? { scale: 1.2 } : { scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center"
            style={{ zIndex: 5 }}
          >
            <span className="text-white text-[9px] font-bold leading-none">
              {icon.id === 1 ? "3" : icon.id === 5 ? "1" : "9+"}
            </span>
          </motion.div>
        )}
      </motion.div>
      <motion.p
        animate={hovered ? { opacity: 1 } : { opacity: 0.7 }}
        className="text-sm font-semibold text-gray-700 m-0"
        style={{ letterSpacing: 0.2 }}
      >
        {icon.label}
      </motion.p>
      <motion.p
        animate={hovered ? { opacity: 0.85, y: 0 } : { opacity: 0, y: 4 }}
        transition={{ duration: 0.2 }}
        className="text-xs text-gray-400 m-0 -mt-1 whitespace-nowrap"
      >
        {icon.description}
      </motion.p>
    </motion.div>
  );
};

export default function Day5() {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? ALL_ICONS.filter(
        (icon) =>
          icon.label.toLowerCase().includes(query.toLowerCase()) ||
          icon.description.toLowerCase().includes(query.toLowerCase()),
      )
    : ALL_ICONS;

  return (
    <div
      className="flex-1 w-full flex flex-col items-center justify-center py-6 px-4 overflow-hidden relative"
      style={{ background: "#f5f7ff" }}
    >
      {/* Colour blobs */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: 0,
          background: [
            "radial-gradient(ellipse 70% 50% at 10% 15%, rgba(167,139,250,0.28) 0%, transparent 70%)",
            "radial-gradient(ellipse 60% 45% at 90% 10%, rgba(96,165,250,0.22) 0%, transparent 65%)",
            "radial-gradient(ellipse 55% 45% at 80% 90%, rgba(52,211,153,0.18) 0%, transparent 65%)",
            "radial-gradient(ellipse 65% 50% at 15% 85%, rgba(251,146,60,0.16) 0%, transparent 65%)",
            "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(248,113,113,0.1) 0%, transparent 60%)",
          ].join(", "),
        }}
      />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-5"
      >
        <p className="text-blue-500 text-sm font-semibold tracking-widest uppercase m-0 mb-1">
          App Collection
        </p>
        <h1 className="text-gray-800 text-4xl font-extrabold m-0">
          Your Apps
        </h1>
      </motion.div>

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6 w-full max-w-sm"
      >
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <svg
            className="w-4 h-4 text-gray-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search apps..."
            className="border-none flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-gray-400 hover:text-gray-600 text-xs leading-none"
            >
              ✕
            </button>
          )}
        </div>
      </motion.div>

      {/* Icons grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-x-6 gap-y-6 max-w-2xl">
        {filtered.length > 0 ? (
          filtered.map((icon, i) => (
            <AppIcon key={icon.id} icon={icon} index={i} />
          ))
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-5 text-center text-gray-400 text-sm py-8"
          >
            No apps found for &ldquo;{query}&rdquo;
          </motion.p>
        )}
      </div>

      {/* Dock */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-8 flex gap-5 px-7 py-3.5 rounded-3xl items-center"
        style={{
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        {ALL_ICONS.slice(0, 4).map((icon) => (
          <motion.div
            key={icon.id}
            whileHover={{ scale: 1.2, y: -6 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="relative cursor-pointer"
            style={{ width: 52, height: 52 }}
          >
            <div
              className="absolute inset-0 rounded-[14px] blur-lg opacity-40"
              style={{
                background: `linear-gradient(135deg, ${icon.gradient[0]}, ${icon.gradient[1]})`,
              }}
            />
            <div
              className="relative flex h-full w-full items-center justify-center rounded-[14px] overflow-hidden"
              style={{
                background: `linear-gradient(145deg, ${icon.gradient[0]}, ${icon.gradient[1]})`,
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1/2 rounded-t-[14px]"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)",
                }}
              />
              <span
                className="text-white relative"
                style={{ fontSize: 22, lineHeight: 1 }}
              >
                {icon.symbol}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

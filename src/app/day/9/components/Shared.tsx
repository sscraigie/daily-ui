"use client";

import React from "react";
import { motion } from "framer-motion";

export function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function fmtLong(totalSec: number) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.round((totalSec % 3600) / 60);
  return h > 0 ? `${h} hr ${m} min` : `${m} min`;
}

export function fmtCompact(n: number) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}

export const scrollY =
  "[scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-track]:bg-transparent";

export const scrollX =
  "[scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-track]:bg-transparent";

export const Cover = ({
  colors,
  className = "",
  children,
}: {
  colors: [string, string];
  className?: string;
  children?: React.ReactNode;
}) => (
  <div
    className={"relative shrink-0 overflow-hidden " + className}
    style={{
      background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
    }}
  >
    <div className="absolute -bottom-1/4 -right-1/4 h-3/4 w-3/4 rounded-full bg-white/15 blur-[2px]" />
    <div className="absolute -left-1/5 -top-1/5 h-1/2 w-1/2 rounded-full bg-black/20 blur-[2px]" />
    {children}
  </div>
);

export const Equalizer = ({ className = "h-3.5" }: { className?: string }) => (
  <div className={`flex items-end gap-[2px] ${className}`} aria-hidden>
    {[0, 1, 2, 3].map((i) => (
      <motion.span
        key={i}
        className="w-[3px] rounded-[1px] bg-[#1DB954]"
        animate={{ height: ["25%", "100%", "45%", "80%", "25%"] }}
        transition={{
          repeat: Infinity,
          duration: 0.8 + i * 0.13,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

export const Slider = ({
  value,
  max,
  onChange,
  className = "",
  ariaLabel,
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
  className?: string;
  ariaLabel: string;
}) => {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className={`group relative h-3 w-full ${className}`}>
      <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-[#4d4d4d]">
        <div
          className="h-full rounded-full bg-white transition-colors group-hover:bg-[#1DB954]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div
        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover:opacity-100"
        style={{ left: `${pct}%` }}
      />
      <input
        aria-label={ariaLabel}
        type="range"
        min={0}
        max={max}
        step={max <= 1 ? 0.01 : 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  );
};

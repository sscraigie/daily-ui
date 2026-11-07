"use client";

// Modeled on the real Roku wand: slim capsule body, molded purple cross
// D-pad, rounded-rectangle back/home and play buttons, a round
// replay/mic/star row, 2x2 channel shortcut pads, and the volume rocker
// mounted on the right edge of the body.

import React from "react";
import type { RemoteKey } from "./types";
import {
  ArrowLeftIcon,
  FfwdIcon,
  HomeIcon,
  MicIcon,
  PauseIcon,
  PlayIcon,
  PowerIcon,
  ReplayIcon,
  RewindIcon,
  StarIcon,
} from "./icons";
import { SHORTCUTS } from "./data";

const ARM = "linear-gradient(180deg, #8b46e8 0%, #7b33f5 60%, #6d2be0 100%)";

const CHEVRON = (path: string) => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={path} />
  </svg>
);

export default function Remote({ onPress, blink }: { onPress: (k: RemoteKey) => void; blink: number }) {
  const Key = ({
    label,
    title,
    className = "",
    children,
  }: {
    label: RemoteKey;
    title: string;
    className?: string;
    children?: React.ReactNode;
  }) => (
    <button
      type="button"
      aria-label={title}
      title={title}
      className={
        "relative flex select-none items-center justify-center text-white/90 " +
        "bg-[#46464d] shadow-[inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-2px_5px_rgba(0,0,0,0.45),0_2px_5px_rgba(0,0,0,0.5)] " +
        "transition-[transform,filter,background-color] duration-75 " +
        "active:scale-[0.92] active:bg-[#585863] hover:brightness-110 " +
        className
      }
      onPointerDown={(e) => {
        e.preventDefault();
        onPress(label);
      }}
    >
      {children}
    </button>
  );

  // A D-pad arm: transparent over the purple cross, with a chevron.
  const Pad = ({
    label,
    title,
    className,
    path,
  }: {
    label: RemoteKey;
    title: string;
    className: string;
    path: string;
  }) => (
    <button
      type="button"
      aria-label={title}
      title={title}
      className={`absolute flex select-none items-center justify-center rounded-full text-white/90 transition-transform duration-75 hover:bg-white/10 active:scale-[0.94] ${className}`}
      onPointerDown={(e) => {
        e.preventDefault();
        onPress(label);
      }}
    >
      {CHEVRON(path)}
    </button>
  );

  return (
    <div
      className="relative w-[188px] shrink-0 select-none rounded-full px-3.5 pb-44 pt-10"
      style={{
        background: "linear-gradient(172deg, #3a3a40 0%, #29292e 40%, #1a1a1e 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -10px 30px rgba(0,0,0,0.45), 0 30px 70px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.6)",
      }}
    >
      {/* side-mounted volume rocker */}
      <div className="absolute right-0 top-[148px] flex translate-x-[45%] flex-col gap-[3px]">
        <Key label="volUp" title="Volume up ( ] )" className="h-10 w-3 rounded-[5px] !bg-[#161619] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_2px_4px_rgba(0,0,0,0.6)]" />
        <Key label="volDown" title="Volume down ( [ )" className="h-10 w-3 rounded-[5px] !bg-[#161619] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_2px_4px_rgba(0,0,0,0.6)]" />
      </div>

      {/* status LED + power */}
      <div className="relative flex items-center justify-center gap-2.5">
        <span
          key={blink}
          className="block h-[5px] w-[5px] rounded-full"
          style={{
            background: "#a06bff",
            opacity: blink > 0 ? undefined : 0.3,
            boxShadow: blink > 0 ? "0 0 8px 2px rgba(124,58,237,0.6)" : "none",
            animation: blink > 0 ? "day25-led 650ms ease-out forwards" : undefined,
          }}
        />
        <Key label="power" title="Power (P)" className="h-10 w-10 rounded-full !bg-[#3b3b41] text-[#ff4b4b]">
          <PowerIcon className="h-5 w-5" />
        </Key>
      </div>

      {/* back + home */}
      <div className="mt-4 flex items-center justify-center gap-2.5">
        <Key label="back" title="Back (Esc)" className="h-[30px] w-[56px] rounded-[10px]">
          <ArrowLeftIcon className="h-[18px] w-[18px]" />
        </Key>
        <Key label="home" title="Home (H)" className="h-[30px] w-[56px] rounded-[10px]">
          <HomeIcon className="h-4 w-4" />
        </Key>
      </div>

      {/* purple cross D-pad with center OK */}
      <div
        className="relative mx-auto mt-5 h-[150px] w-[150px]"
        style={{ filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.45))" }}
      >
        <div
          className="absolute left-1/2 top-0 h-full w-[52px] -translate-x-1/2 rounded-full"
          style={{ background: ARM }}
        />
        <div
          className="absolute left-0 top-1/2 h-[52px] w-full -translate-y-1/2 rounded-full"
          style={{ background: ARM }}
        />
        <Pad label="up" title="Up (↑)" className="left-1/2 top-0 h-[58px] w-[52px] -translate-x-1/2" path="M6 15l6-6 6 6" />
        <Pad label="left" title="Left (←)" className="left-0 top-1/2 h-[52px] w-[58px] -translate-y-1/2" path="M15 6l-6 6 6 6" />
        <Pad label="right" title="Right (→)" className="right-0 top-1/2 h-[52px] w-[58px] -translate-y-1/2" path="M9 6l6 6-6 6" />
        <Pad label="down" title="Down (↓)" className="bottom-0 left-1/2 h-[58px] w-[52px] -translate-x-1/2" path="M6 9l6 6 6-6" />
        <button
          type="button"
          aria-label="OK (Enter)"
          title="OK (Enter)"
          onPointerDown={(e) => {
            e.preventDefault();
            onPress("ok");
          }}
          className="absolute left-1/2 top-1/2 flex h-[54px] w-[54px] -translate-x-1/2 -translate-y-1/2 select-none items-center justify-center rounded-full text-[12px] font-bold tracking-wide text-white transition-transform duration-75 active:scale-[0.92]"
          style={{
            background: "radial-gradient(circle at 35% 30%, #9252ef, #6d2be4 78%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28), 0 0 0 2px rgba(0,0,0,0.18), 0 2px 5px rgba(0,0,0,0.35)",
          }}
        >
          OK
        </button>
      </div>

      {/* replay · mic · options */}
      <div className="mt-5 flex items-center justify-center gap-3.5">
        <Key label="replay" title="Instant replay (R)" className="h-9 w-9 rounded-full">
          <ReplayIcon className="h-4 w-4" />
        </Key>
        <Key label="voice" title="Voice search" className="h-9 w-9 rounded-full">
          <MicIcon className="h-4 w-4" />
        </Key>
        <Key label="star" title="Options (★)" className="h-9 w-9 rounded-full">
          <StarIcon className="h-4 w-4" />
        </Key>
      </div>

      {/* transport */}
      <div className="mt-4 flex items-center justify-center gap-2.5">
        <Key label="rew" title="Rewind (J)" className="h-[30px] w-[30px] rounded-full">
          <RewindIcon className="h-4 w-4" />
        </Key>
        <Key label="play" title="Play / pause (Space)" className="h-[30px] w-[56px] rounded-[10px]">
          <span className="flex items-center gap-[3px]">
            <PlayIcon className="h-3 w-3" />
            <PauseIcon className="h-3 w-3" />
          </span>
        </Key>
        <Key label="ffwd" title="Fast forward (L)" className="h-[30px] w-[30px] rounded-full">
          <FfwdIcon className="h-4 w-4" />
        </Key>
      </div>

      {/* channel shortcuts */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        {SHORTCUTS.map((s) => (
          <button
            key={s.key}
            type="button"
            aria-label={s.label}
            title={`${s.label} — watch now`}
            onPointerDown={(e) => {
              e.preventDefault();
              onPress(s.key as RemoteKey);
            }}
            className="flex h-[27px] select-none items-center justify-center rounded-[8px] text-[10px] font-extrabold tracking-tight shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.45)] transition-transform duration-75 active:scale-[0.93]"
            style={{ background: s.bg, color: s.fg }}
          >
            {s.text}
          </button>
        ))}
      </div>
    </div>
  );
}

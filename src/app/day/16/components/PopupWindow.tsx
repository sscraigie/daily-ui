"use client";

import React, { useEffect, useState } from "react";
import { motion, useDragControls } from "framer-motion";

export type PopupKind =
  | "winner"
  | "virus"
  | "ram"
  | "singles"
  | "crypto"
  | "survey"
  | "download"
  | "rude"
  | "kidding";

export type PopupData = {
  id: number;
  kind: PopupKind;
  x: number;
  y: number;
  w: number;
  z: number;
  rot: number;
  msg?: string;
};

type PopupActions = {
  spawn: (kind?: PopupKind, msg?: string) => void;
  close: () => void;
};

export const META: Record<
  PopupKind,
  { title: string; bar: string; accent: string }
> = {
  winner: {
    title: "🎉 CONGRATULATIONS!!!",
    bar: "linear-gradient(90deg,#7b2ff7,#f107a3)",
    accent: "#fef08a",
  },
  virus: {
    title: "PC Medic 2000",
    bar: "linear-gradient(90deg,#7f1d1d,#ef4444)",
    accent: "#fecaca",
  },
  ram: {
    title: "RAM Boost Pro 2011",
    bar: "linear-gradient(90deg,#0f766e,#22d3ee)",
    accent: "#ccfbf1",
  },
  singles: {
    title: "LoveLink 4.0",
    bar: "linear-gradient(90deg,#be185d,#fb7185)",
    accent: "#ffe4e6",
  },
  crypto: {
    title: "CryptoKingz(tm)",
    bar: "linear-gradient(90deg,#166534,#a3e635)",
    accent: "#ecfccb",
  },
  survey: {
    title: "Quick Survey (required)",
    bar: "linear-gradient(90deg,#0c4a6e,#38bdf8)",
    accent: "#e0f2fe",
  },
  download: {
    title: "Download Manager PRO",
    bar: "linear-gradient(90deg,#1e3a8a,#3b82f6)",
    accent: "#dbeafe",
  },
  rude: {
    title: "Popup",
    bar: "linear-gradient(90deg,#3f3f46,#a1a1aa)",
    accent: "#fafafa",
  },
  kidding: {
    title: "Popup Blocker Pro",
    bar: "linear-gradient(90deg,#14532d,#4ade80)",
    accent: "#dcfce7",
  },
};

function BeveledButton({
  children,
  onClick,
  color = "#d4d0c8",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  color?: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`font-comic cursor-pointer px-3 py-1.5 text-sm font-bold text-black transition-transform active:translate-y-px ${className}`}
      style={{
        background: color,
        border: "3px outset #fff",
        boxShadow: "1px 1px 0 #000",
      }}
    >
      {children}
    </button>
  );
}

function ProgressBar({
  pct,
  color = "#22c55e",
  striped = true,
}: {
  pct: number;
  color?: string;
  striped?: boolean;
}) {
  return (
    <div
      className="h-4 w-full overflow-hidden border-2 border-black bg-black/80"
      style={{ borderStyle: "inset" }}
    >
      <div
        className="h-full transition-all duration-200"
        style={{
          width: `${pct}%`,
          background: striped
            ? `repeating-linear-gradient(45deg,${color} 0 8px,${color}99 8px 16px)`
            : color,
        }}
      />
    </div>
  );
}

function WinnerBody({ spawn, close }: PopupActions) {
  const [secs, setSecs] = useState(9);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s <= 0 ? 9 : s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="font-comic p-3 text-center text-black" style={{ background: META.winner.accent }}>
      <div className="text-xl font-black leading-tight">
        You are our 1,000,000<sup>th</sup> visitor!!!
      </div>
      <div className="my-2 flex justify-center gap-2 text-3xl">
        <span className="inline-block animate-bounce">🎉</span>
        <span className="inline-block animate-spin" style={{ animationDuration: "3s" }}>💰</span>
        <span className="inline-block animate-bounce [animation-delay:150ms]">🏆</span>
      </div>
      <p className="text-xs font-bold">
        Your FREE* iPhone 18 Pro Ultra (*plus shipping, taxes, and your soul)
        is ready to claim!!
      </p>
      {secs > 0 ? (
        <div className="mt-2 border-2 border-black bg-black px-2 py-1 font-mono text-sm font-bold text-lime-400">
          OFFER EXPIRES IN 00:00:{String(secs).padStart(2, "0")}
        </div>
      ) : (
        <div className="mt-2 animate-pulse border-2 border-black bg-red-700 px-2 py-1 font-mono text-sm font-bold text-white">
          EXPIRED!! ...just kidding, you have 9 more seconds
        </div>
      )}
      <div className="mt-3 flex justify-center gap-2">
        <BeveledButton color="#4ade80" onClick={() => { spawn("download"); close(); }}>
          CLAIM NOW!!!
        </BeveledButton>
        <BeveledButton onClick={close}>no :(</BeveledButton>
      </div>
    </div>
  );
}

const VIRUS_FILES = [
  "C:\\WINDOWS\\system32\\definitely_not_a_virus.dll",
  "C:\\WINDOWS\\system32\\steal_browser_history.sys",
  "C:\\WINDOWS\\system32\\free_iphone_real.scr",
  "C:\\Program Files\\GarysToolb4r\\toolbar.dll",
  "C:\\WINDOWS\\system32\\minecraft_free_download.exe",
  "C:\\WINDOWS\\system32\\kernel32.dll (probably fine)",
  "C:\\WINDOWS\\system32\\my_mixtape_1999.mp3.exe",
];

function VirusBody({ spawn, close }: PopupActions) {
  const [fileIdx, setFileIdx] = useState(0);
  const [pct, setPct] = useState(3);
  const [found, setFound] = useState(19);
  useEffect(() => {
    const f = setInterval(() => setFileIdx((i) => (i + 1) % VIRUS_FILES.length), 650);
    const p = setInterval(() => setPct((v) => (v >= 99 ? 3 : v + 1)), 130);
    return () => {
      clearInterval(f);
      clearInterval(p);
    };
  }, []);
  return (
    <div className="p-3 text-black" style={{ background: META.virus.accent }}>
      <div className="font-comic text-center text-base font-black text-red-700">
        ⚠️ {found} VIRUSES DETECTED!! ⚠️
      </div>
      <div className="mt-2 overflow-hidden border border-black bg-white px-1 py-0.5 font-mono text-[10px] whitespace-nowrap">
        Scanning: {VIRUS_FILES[fileIdx]}
      </div>
      <div className="mt-2">
        <ProgressBar pct={pct} color="#ef4444" />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] font-bold">
        <span>{pct}% complete</span>
        <span>threats: infinite</span>
      </div>
      <div className="mt-3 flex justify-center">
        <BeveledButton color="#fecaca" onClick={() => { spawn("virus", undefined); close(); }}>
          RUN CERTIFIED DEEP SCAN
        </BeveledButton>
      </div>
      <p className="mt-2 text-center font-comic text-[10px] font-bold text-gray-700">
        (deep scan finds 4 more viruses. every time. forever.)
      </p>
    </div>
  );
}

function RamBody({ spawn, close }: PopupActions) {
  return (
    <div className="font-comic p-3 text-center text-black" style={{ background: META.ram.accent }}>
      <div className="text-lg font-black">Your PC is 89% SLOW!!</div>
      <div className="my-2 text-4xl animate-bounce">🐏</div>
      <p className="text-xs font-bold">{"RAM doesn't grow on trees. But it CAN grow on your PC!"}</p>
      <div className="mt-3">
        <BeveledButton color="#22d3ee" onClick={() => { spawn("download"); close(); }}>
          DOWNLOAD MORE RAM
        </BeveledButton>
      </div>
      <p className="mt-2 text-[10px] font-bold text-gray-600">
        Works with any PC made after 1987.*
      </p>
    </div>
  );
}

function SinglesBody({ spawn, close }: PopupActions) {
  return (
    <div className="font-comic p-3 text-center text-black" style={{ background: META.singles.accent }}>
      <div className="text-base font-black leading-tight">
        🔥 3 HOT SINGLES 🔥 in your area want to discuss TypeScript!!
      </div>
      <div className="my-3 flex justify-center gap-3">
        {["👩‍💻", "🧑‍💻", "👨‍💻"].map((e, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-white text-2xl animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            >
              {e}
            </div>
            <span className="text-[9px] font-bold">definitely_real_{42 + i}</span>
          </div>
        ))}
      </div>
      <BeveledButton color="#fb7185" onClick={() => { spawn("survey"); close(); }}>
        CHAT NOW!!!
      </BeveledButton>
      <p className="mt-2 text-[10px] font-bold text-gray-600">
        100% real people* (*may be Gary in a wig)
      </p>
    </div>
  );
}

function CryptoBody({ spawn, close }: PopupActions) {
  return (
    <div className="font-comic p-3 text-center text-black" style={{ background: META.crypto.accent }}>
      <div className="text-base font-black leading-tight">
        I made $48,201.42 THIS MONTH from my bathtub 🛁
      </div>
      <svg viewBox="0 0 200 60" className="mx-auto my-2 h-14 w-full border-2 border-black bg-white">
        <polyline
          points="0,52 20,48 40,50 60,38 80,42 100,28 120,32 140,18 160,22 180,8 200,4"
          fill="none"
          stroke="#16a34a"
          strokeWidth="3"
        />
        <polygon points="180,2 194,10 180,18" fill="#16a34a" />
      </svg>
      <BeveledButton color="#a3e635" onClick={() => { spawn("survey"); close(); }}>
        COPY MY EXACT STRATEGY →
      </BeveledButton>
      <p className="mt-2 text-[10px] font-bold text-gray-600">
        Not financial advice. Definitely not a pyramid.
      </p>
    </div>
  );
}

function SurveyBody({ spawn, close }: PopupActions) {
  return (
    <div className="font-comic p-3 text-center text-black" style={{ background: META.survey.accent }}>
      <div className="text-sm font-black">
        📋 1-QUESTION SURVEY!! (required to unlock your download)
      </div>
      <div className="mt-3 border-2 border-black bg-white p-2 text-sm font-bold">
        Is a hot dog a sandwich?
      </div>
      <div className="mt-3 flex justify-center gap-2">
        <BeveledButton onClick={() => { spawn("download"); close(); }}>YES</BeveledButton>
        <BeveledButton onClick={() => { spawn("download"); close(); }}>NO</BeveledButton>
        <BeveledButton onClick={() => { spawn("download"); close(); }}>{"DEFINE \"SANDWICH\""}</BeveledButton>
      </div>
      <p className="mt-2 text-[10px] font-bold text-gray-600">
        Your answer will be sold to 47 advertisers.
      </p>
    </div>
  );
}

function DownloadBody({ spawn, close, msg }: PopupActions & { msg?: string }) {
  return (
    <div className="font-comic p-3 text-center text-black" style={{ background: META.download.accent }}>
      {msg ? (
        <>
          <div className="text-base font-black leading-tight">{msg}</div>
          <div className="mt-3 flex justify-center">
            <BeveledButton color="#4ade80" onClick={close}>AWESOME!!</BeveledButton>
          </div>
        </>
      ) : (
        <>
          <div className="text-sm font-black">⬇ Your download is ready!! ⬇</div>
          <div className="mt-2 border-2 border-black bg-white px-2 py-1.5 font-mono text-[11px] font-bold">
            totally_free_iphone.exe — 4.2 MB
            <br />
            <span className="text-gray-500">(4.2 MB of ads)</span>
          </div>
          <div className="mt-3 flex justify-center gap-2">
            <BeveledButton color="#4ade80" onClick={() => { spawn("virus"); close(); }}>
              RUN (RECOMMENDED)
            </BeveledButton>
            <BeveledButton onClick={close}>Cancel (bad idea)</BeveledButton>
          </div>
          <p className="mt-2 text-[10px] font-bold text-gray-600">
            By clicking RUN you agree to donate one (1) kidney.
          </p>
        </>
      )}
    </div>
  );
}

const RUDE_FALLBACK = "RUDE. Fine. Here is another one.";

function MsgBody({ msg, close, label }: { msg?: string; close: () => void; label: string }) {
  return (
    <div className="font-comic p-4 text-center text-black" style={{ background: META.rude.accent }}>
      <div className="text-base font-black leading-snug">{msg ?? RUDE_FALLBACK}</div>
      <div className="mt-3">
        <BeveledButton onClick={close}>{label}</BeveledButton>
      </div>
    </div>
  );
}

export default function PopupWindow({
  data,
  constraints,
  onClose,
  spawn,
}: {
  data: PopupData;
  constraints: React.RefObject<HTMLDivElement>;
  onClose: () => void;
  spawn: (kind?: PopupKind, msg?: string) => void;
}) {
  const controls = useDragControls();
  const meta = META[data.kind];
  const actions: PopupActions = { spawn, close: onClose };

  return (
    <motion.div
      drag
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={constraints}
      initial={{ opacity: 0, scale: 0.5, y: -30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.6, y: 20, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      className="absolute"
      style={{ left: data.x, top: data.y, width: data.w, zIndex: data.z }}
    >
      <div style={{ transform: `rotate(${data.rot}deg)` }}>
        <div
          className="border-2 bg-[#d4d0c8] shadow-[4px_4px_0_rgba(0,0,0,0.55)]"
          style={{ borderStyle: "outset", borderWidth: 3 }}
        >
          <div
            className="flex select-none items-center justify-between px-1.5 py-1"
            style={{ background: meta.bar }}
            onPointerDown={(e) => controls.start(e)}
          >
            <span className="font-comic truncate text-[11px] font-bold text-white drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)]">
              {meta.title}
            </span>
            <button
              aria-label="Close popup"
              onClick={onClose}
              className="ml-2 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center font-comic text-[11px] font-black text-black"
              style={{ background: "#d4d0c8", border: "2px outset #fff" }}
            >
              ✕
            </button>
          </div>
          <div className="border-t-2 border-t-[#808080]">
            {data.kind === "winner" && <WinnerBody {...actions} />}
            {data.kind === "virus" && <VirusBody {...actions} />}
            {data.kind === "ram" && <RamBody {...actions} />}
            {data.kind === "singles" && <SinglesBody {...actions} />}
            {data.kind === "crypto" && <CryptoBody {...actions} />}
            {data.kind === "survey" && <SurveyBody {...actions} />}
            {data.kind === "download" && <DownloadBody {...actions} msg={data.msg} />}
            {data.kind === "rude" && <MsgBody {...actions} msg={data.msg} label="OK FINE 😒" />}
            {data.kind === "kidding" && (
              <MsgBody
                {...actions}
                msg={data.msg ?? "Popup Blocker Pro is ACTIVE. Ahhh… silence."}
                label="aww ok 🥺"
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

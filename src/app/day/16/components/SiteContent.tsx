"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { PopupKind } from "./PopupWindow";

type Props = {
  chaos: (n?: number, kind?: PopupKind) => void;
  blockerActive: boolean;
};

const DOWNLOADS: {
  name: string;
  size: string;
  emoji: string;
  stars: string;
  reviews: string;
  bg: string;
  kind: PopupKind;
}[] = [
  {
    name: "RAM-Doubler-2011.zip",
    size: "42.5 MB",
    emoji: "🐏",
    stars: "★★★★★",
    reviews: "3,204 reviews (all by Gary)",
    bg: "linear-gradient(135deg,#155e75,#67e8f9)",
    kind: "ram",
  },
  {
    name: "totally_not_a_virus.exe",
    size: "0.4 MB",
    emoji: "🦠",
    stars: "★☆☆☆☆",
    reviews: '1 review: "it is a virus" — Gary',
    bg: "linear-gradient(135deg,#7f1d1d,#fca5a5)",
    kind: "virus",
  },
  {
    name: "free_iphone_FINAL_v2(1).scr",
    size: "66.6 MB",
    emoji: "📱",
    stars: "★★★★★",
    reviews: "10/10 — totally legit source",
    bg: "linear-gradient(135deg,#6b21a8,#e9d5ff)",
    kind: "winner",
  },
];

const TESTIMONIALS = [
  { quote: "I downloaded more RAM and now my PC has 512GB!!", by: "— Dave, real person" },
  { quote: "My antivirus says thanks for the workout.", by: "— Karen" },
  { quote: "I clicked RUN and now I own a boat?? 5 stars.", by: "— Gary, webmaster" },
];

function Bevel({
  children,
  onClick,
  className = "",
  style,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      className={`font-comic cursor-pointer text-black active:translate-y-px ${className}`}
      style={{ border: "3px outset #f1f5f9", background: "#d4d0c8", ...style }}
    >
      {children}
    </button>
  );
}

function Marquee({ text }: { text: string }) {
  return (
    <div className="overflow-hidden border-y-4 border-black bg-yellow-300 py-1">
      <div className="marquee-track whitespace-nowrap">
        <span className="font-comic pr-8 text-sm font-black text-black">
          {text} ★ {text} ★
        </span>
        <span className="font-comic pr-8 text-sm font-black text-black" aria-hidden>
          {text} ★ {text} ★
        </span>
      </div>
    </div>
  );
}

function VisitorCounter() {
  const [count, setCount] = useState(999942);
  useEffect(() => {
    const t = setInterval(() => setCount((c) => c + 1 + Math.floor(Math.random() * 7)), 1400);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="inline-flex gap-0.5 border-2 border-black bg-black px-1 py-0.5 font-mono text-sm font-bold text-lime-400">
      {String(count).split("").map((d, i) => (
        <span key={i} className="bg-black px-0.5">
          {d}
        </span>
      ))}
    </span>
  );
}

export default function SiteContent({ chaos, blockerActive }: Props) {
  return (
    <div
      className="starfield h-full overflow-y-auto"
      style={{
        backgroundColor: "#0a0640",
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.85) 1px, transparent 1.6px), radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1.6px)",
        backgroundSize: "28px 28px, 44px 44px",
        backgroundPosition: "0 0, 14px 14px",
      }}
    >
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-4 sm:pt-6">
        <button
          onClick={() => chaos(1, "winner")}
          className="flash-border font-comic block w-full cursor-pointer border-4 bg-black px-3 py-2 text-center text-xs font-black text-lime-400 sm:text-sm"
        >
          🔥🔥 FREE iPhone 18 PRO ULTRA (18+ ONLY) 🔥🔥 0.0001% CASHBACK ON ALL DOWNLOADS 🔥🔥
          CLICK HERE NOW 🔥🔥 <span className="animate-blink text-yellow-300">HOT!!</span> 🔥🔥
        </button>

        <header className="mt-6 text-center">
          <h1
            className="font-comic text-4xl font-black tracking-tight sm:text-6xl rainbow-text"
            style={{ WebkitTextStroke: "1px black" }}
          >
            SKETCHY-DOWNLOADZ.EXE
          </h1>
          <p className="font-comic mt-1 text-xs font-bold text-yellow-300 sm:text-sm">
            ✨ v9.9.9 (definitely not beta) ✨ — 100% VIRUS-FREE* <span className="text-[10px] text-white/70">(*we do not check)</span>
          </p>
        </header>

        <div className="mt-4">
          <Marquee text="WELCOME TO SKETCHY-DOWNLOADZ ★ NOW WITH 300% MORE POPUPS ★ BEST VIEWED IN NETSCAPE NAVIGATOR 4.0 ★ ALL YOUR DOWNLOAD ARE BELONG TO US" />
        </div>

        <section className="mt-6 border-4 border-[#d4d0c8] bg-[#000048]/90 p-4 text-center shadow-[6px_6px_0_rgba(0,0,0,0.5)]">
          <h2 className="font-comic text-2xl font-black text-white sm:text-3xl">
            DOWNLOAD <span className="animate-blink text-lime-400">ANY FILE</span> EVER MADE!!
          </h2>
          <p className="font-comic mt-1 text-sm font-bold text-yellow-300">
            FREE!! NO SIGNUP** <span className="text-[10px] text-white/60">(**there is signup)</span>
          </p>
          <div className="mx-auto mt-4 flex max-w-md flex-col gap-2 sm:flex-row">
            <input
              placeholder="Search 4,203,917 files..."
              className="font-comic min-w-0 flex-1 border-2 border-black bg-white px-2 py-1.5 text-sm text-black placeholder-gray-500"
            />
            <Bevel onClick={() => chaos(1, "survey")} className="px-4 py-1.5 text-sm font-black">
              SEARCH!!
            </Bevel>
          </div>
          <motion.button
            whileTap={{ rotate: [0, -3, 3, -2, 2, 0], scale: 0.97 }}
            onClick={() => chaos(2)}
            className="font-comic mt-5 inline-flex cursor-pointer items-center gap-2 px-8 py-3 text-xl font-black text-black shadow-[4px_4px_0_rgba(0,0,0,0.6)] sm:text-2xl"
            style={{
              border: "5px outset #86efac",
              background: "linear-gradient(180deg,#4ade80,#16a34a)",
            }}
          >
            <span className="inline-block animate-spin" style={{ animationDuration: "2.5s" }}>
              💾
            </span>
            MEGA DOWNLOAD BUTTON
            <span className="inline-block animate-spin" style={{ animationDuration: "2.5s" }}>
              💾
            </span>
          </motion.button>
          <p className="font-comic mt-2 text-[10px] font-bold text-white/60">
            (clicking the big button is a great idea, promise)
          </p>
        </section>

        <section className="mt-6">
          <h3 className="font-comic text-center text-lg font-black text-yellow-300 sm:text-xl">
            ⭐ FEATURED DOWNLOADS ⭐
          </h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {DOWNLOADS.map((d) => (
              <div
                key={d.name}
                className="border-[3px] border-[#d4d0c8] bg-[#d4d0c8] p-1.5 shadow-[4px_4px_0_rgba(0,0,0,0.5)]"
                style={{ borderStyle: "outset" }}
              >
                <div
                  className="flex h-24 items-center justify-center border-2 border-black text-5xl"
                  style={{ background: d.bg }}
                >
                  <span className="animate-bounce">{d.emoji}</span>
                </div>
                <div className="p-1.5 text-center">
                  <p className="truncate font-mono text-[10px] font-bold text-black" title={d.name}>
                    {d.name}
                  </p>
                  <p className="font-comic text-[10px] font-bold text-gray-800">
                    {d.size} — <span className="text-yellow-600">{d.stars}</span>
                  </p>
                  <p className="font-comic text-[9px] text-gray-700">{d.reviews}</p>
                  <Bevel
                    onClick={() => chaos(1, d.kind)}
                    className="mt-2 w-full px-2 py-1 text-xs font-black"
                  >
                    ⬇ DOWNLOAD
                  </Bevel>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 border-4 border-[#d4d0c8] bg-[#d4d0c8] p-3" style={{ borderStyle: "outset" }}>
          <h3 className="font-comic text-center text-sm font-black text-black">
            💬 WHAT REAL USERS ARE SAYING 💬
          </h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.by} className="border-2 border-black bg-white p-2 text-center">
                <p className="text-yellow-500">★★★★★</p>
                <p className="font-comic mt-1 text-[11px] font-bold text-black">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="font-comic mt-1 text-[10px] text-gray-600">{t.by}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {[
            "NETSCAPE NOW! 4.0",
            "IE5 CERTIFIED™",
            "SSL (Sorta Safe Layer)",
            "MADE WITH NOTPAD",
            "HTML 3.2 APPROVED",
          ].map((b, i) => (
            <div
              key={b}
              className="font-comic border-2 border-black bg-gradient-to-b from-blue-700 to-blue-950 px-2 py-1 text-[9px] font-black text-white"
              style={{ transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)` }}
            >
              {b}
            </div>
          ))}
        </section>

        <footer className="mt-8 border-t-4 border-dotted border-white/40 pt-4 text-center">
          <p className="font-comic text-[11px] font-bold text-white/80">
            © 1999–2026 Sketchy-Downloadz Inc. | Webmaster: <span className="text-lime-400">Gary</span> | 🚧
            UNDER CONSTRUCTION SINCE 2003 🚧
          </p>
          <p className="font-comic mt-2 text-xs font-bold text-white">
            You are visitor number: <VisitorCounter />
          </p>
          <Bevel onClick={() => chaos(1, "singles")} className="mt-3 px-3 py-1 text-xs font-black">
            ✍ SIGN OUR GUESTBOOK!!
          </Bevel>
          <p className="font-comic mt-4 text-[9px] text-white/50">
            *This is a parody. No iPhones were harmed. Gary is doing his best.
            {blockerActive ? " Popup Blocker Pro is working. Enjoy." : ""}
          </p>
        </footer>
      </div>
    </div>
  );
}

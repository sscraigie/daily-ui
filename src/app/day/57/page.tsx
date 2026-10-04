"use client";
// Day 57 - Video Player
// Inspiration: https://netflix.com (web player)
// Netflix-style streaming player: procedurally rendered canvas "footage",
// red scrub bar with hover thumbnails, skip intro, episode drawer, subtitles
// and playback speed menus, auto-hiding controls and a next-episode countdown.

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { RequireDarkMode } from "@/components/ThemeProvider";

const RED = "#e50914";
const SHOW = "Shadow Protocol";

type Palette = {
  sky: [string, string, string];
  moon: string;
  ridge: [string, string, string];
  accent: string;
  aurora?: boolean;
  lightning?: boolean;
};

type Subtitle = { start: number; end: number; text: string };

type Episode = {
  id: number;
  title: string;
  desc: string;
  duration: number;
  palette: Palette;
  subtitles: Subtitle[];
};

const EPISODES: Episode[] = [
  {
    id: 1,
    title: "Cold Open",
    desc: "A decommissioned listening station picks up a signal that shouldn't exist.",
    duration: 96,
    palette: {
      sky: ["#02040c", "#0a1230", "#1b2a5e"],
      moon: "#cdd7ff",
      ridge: ["#131c3c", "#0d142c", "#070b1a"],
      accent: "#4facfe",
    },
    subtitles: [
      { start: 6, end: 11, text: "Somewhere above the Arctic Circle..." },
      { start: 13, end: 18, text: "Station K-7 has been dark for eleven years." },
      { start: 24, end: 29, text: "— Say that again. Slowly." },
      { start: 32, end: 37, text: "— It's addressed to you, Commander." },
      { start: 44, end: 50, text: "By morning, everyone in the valley knew." },
      { start: 58, end: 64, text: "— We don't get to choose what wakes up." },
      { start: 71, end: 77, text: "— Then we choose what happens next." },
      { start: 84, end: 92, text: "Shadow Protocol — episode one." },
    ],
  },
  {
    id: 2,
    title: "Aurora",
    desc: "The team goes dark to hunt the source of the signal through the aurora.",
    duration: 110,
    palette: {
      sky: ["#010a14", "#07202a", "#0e3d38"],
      moon: "#b8ffe9",
      ridge: ["#0c2b26", "#071b18", "#030d0c"],
      accent: "#43e97b",
      aurora: true,
    },
    subtitles: [
      { start: 6, end: 11, text: "— The lights don't lie. Something is moving up there." },
      { start: 18, end: 24, text: "— Sector nine went silent at 03:14." },
      { start: 30, end: 36, text: "— Then we go dark too. Eyes only." },
      { start: 48, end: 54, text: "Every scan came back empty. Every dream came back full." },
      { start: 66, end: 72, text: "— If it reached the relay, it reached the mainland." },
      { start: 84, end: 90, text: "— Twenty minutes. Then we burn the array." },
      { start: 98, end: 106, text: "Aurora borealis over Station K-7 — night two." },
    ],
  },
  {
    id: 3,
    title: "Ashfall",
    desc: "A burnt valley hides the first physical evidence — and the first casualty.",
    duration: 104,
    palette: {
      sky: ["#14030a", "#3a0f14", "#7a2418"],
      moon: "#ffca7a",
      ridge: ["#2a1013", "#180a0d", "#0a0406"],
      accent: "#f953c6",
    },
    subtitles: [
      { start: 6, end: 12, text: "— The valley's gone. Just... ash." },
      { start: 20, end: 26, text: "— Whatever it was, it left in a hurry." },
      { start: 34, end: 40, text: "— Footprints don't walk themselves, Commander." },
      { start: 52, end: 58, text: "The fire came before the frost. Nobody expected the frost." },
      { start: 70, end: 76, text: "— Two hours to the ridge. Maybe less." },
      { start: 88, end: 96, text: "Ashfall — episode three of Shadow Protocol." },
    ],
  },
  {
    id: 4,
    title: "The Long Dark",
    desc: "With winter locking in, the protocol finally has a name.",
    duration: 118,
    palette: {
      sky: ["#05070d", "#0d1522", "#1a2436"],
      moon: "#8fa3c8",
      ridge: ["#161e2e", "#0e1420", "#070b12"],
      accent: "#8fa3c8",
      lightning: true,
    },
    subtitles: [
      { start: 6, end: 12, text: "— We stay. We finish it. That's the protocol." },
      { start: 22, end: 28, text: "— The protocol was written by people who left." },
      { start: 40, end: 46, text: "Ninety-one days without sunrise. Counting." },
      { start: 58, end: 64, text: "— If the signal sings again, we answer it. Together." },
      { start: 76, end: 82, text: "— Nothing out here answers twice." },
      { start: 94, end: 100, text: "— Then we make sure it only has to ask once." },
      { start: 108, end: 116, text: "The Long Dark — the season finale." },
    ],
  },
];

const RATES = [0.5, 0.75, 1, 1.25, 1.5];
const SUB_OPTIONS = ["Off", "English", "English (SDH)", "Español"];

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  pal: Palette
) {
  const horizon = h * 0.62;

  const sky = ctx.createLinearGradient(0, 0, 0, horizon * 1.15);
  sky.addColorStop(0, pal.sky[0]);
  sky.addColorStop(0.55, pal.sky[1]);
  sky.addColorStop(1, pal.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 110; i++) {
    const x = (hash(i * 3.7) * w + t * 1.4) % w;
    const y = hash(i * 7.3) * horizon * 0.9;
    const r = 0.5 + hash(i * 13.1) * 1.4;
    const a =
      0.25 +
      0.65 *
        (0.5 + 0.5 * Math.sin(t * (0.4 + hash(i * 2.9) * 1.6) + hash(i) * 6.28));
    ctx.globalAlpha = a;
    ctx.fillStyle = "#dbe4ff";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  if (pal.aurora) {
    for (let b = 0; b < 3; b++) {
      const off = b * 2.1;
      const grad = ctx.createLinearGradient(0, h * 0.05, 0, horizon * 0.85);
      grad.addColorStop(0, "rgba(67,233,123,0)");
      grad.addColorStop(
        0.5,
        b % 2 ? "rgba(67,233,123,0.16)" : "rgba(79,172,254,0.14)"
      );
      grad.addColorStop(1, "rgba(67,233,123,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-60, h * 0.1);
      for (let x = 0; x <= w + 60; x += 40) {
        const u = x / w;
        const y =
          h * 0.12 +
          Math.sin(u * 3 + t * 0.35 + off) * h * 0.07 +
          Math.sin(u * 7 - t * 0.2) * h * 0.03;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w + 60, h * 0.42);
      ctx.lineTo(-60, h * 0.42);
      ctx.closePath();
      ctx.fill();
    }
  }

  if (pal.lightning) {
    const f = (t / 9) % 1;
    let flash = 0;
    if (f > 0.965) flash = (f - 0.965) / 0.035;
    else if (f > 0.94 && f < 0.955) flash = 0.6;
    if (flash > 0) {
      ctx.fillStyle = `rgba(220,232,255,${0.28 * Math.min(1, flash)})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  const mx = w * 0.76 - t * 0.4;
  const my = h * 0.18;
  const mr = Math.min(w, h) * 0.05;
  const glow = ctx.createRadialGradient(mx, my, mr * 0.4, mx, my, mr * 4.2);
  glow.addColorStop(0, `${pal.moon}55`);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(mx - mr * 4.2, my - mr * 4.2, mr * 8.4, mr * 8.4);
  ctx.fillStyle = pal.moon;
  ctx.beginPath();
  ctx.arc(mx, my, mr, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.arc(mx - mr * 0.3, my - mr * 0.2, mr * 0.5, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 4; i++) {
    const fx = ((t * 10 + i * w * 0.4) % (w + 400)) - 200;
    const fy = horizon - i * 8;
    const fg = ctx.createRadialGradient(fx, fy, 10, fx, fy, w * 0.22);
    fg.addColorStop(0, `rgba(180,200,230,${0.07 - i * 0.01})`);
    fg.addColorStop(1, "rgba(180,200,230,0)");
    ctx.fillStyle = fg;
    ctx.fillRect(0, 0, w, h);
  }

  const layers = [
    { amp: (h - horizon) * 0.62, y0: horizon + 6, speed: 14, col: pal.ridge[0] },
    {
      amp: (h - horizon) * 0.44,
      y0: horizon + (h - horizon) * 0.26,
      speed: 26,
      col: pal.ridge[1],
    },
    {
      amp: (h - horizon) * 0.3,
      y0: horizon + (h - horizon) * 0.52,
      speed: 44,
      col: pal.ridge[2],
    },
  ];
  layers.forEach((L, k) => {
    ctx.fillStyle = L.col;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 6) {
      const u = x / w;
      const y =
        L.y0 -
        L.amp *
          (0.55 +
            0.3 * Math.sin(u * 4 + t * L.speed * 0.02 + k * 2) +
            0.18 * Math.sin(u * 9 + 2 - t * L.speed * 0.013 + k) +
            0.09 * Math.sin(u * 17 + 4 + k * 0.5));
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  });

  ctx.globalAlpha = 0.05;
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 140; i++) {
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
  }
  ctx.globalAlpha = 1;
}

const I = {
  chevronLeft: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path
        d="M15.5 4.5 8 12l7.5 7.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  play: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M7 4.5v15c0 .8.9 1.3 1.6.9l12-7.5a1.05 1.05 0 0 0 0-1.8l-12-7.5c-.7-.4-1.6.1-1.6.9z" />
    </svg>
  ),
  pause: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M6.5 4h4v16h-4zM13.5 4h4v16h-4z" />
    </svg>
  ),
  back10: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" {...p}>
      <path
        d="M12 4.5a8 8 0 1 1-7.4 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path fill="currentColor" d="M6.2 2.9 3.4 10l7.1-2.8z" />
      <text
        x="12"
        y="16.5"
        textAnchor="middle"
        fontSize="6"
        fontWeight="700"
        fill="currentColor"
      >
        10
      </text>
    </svg>
  ),
  fwd10: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" {...p}>
      <path
        d="M12 4.5a8 8 0 1 0 7.4 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path fill="currentColor" d="M17.8 2.9 20.6 10l-7.1-2.8z" />
      <text
        x="12"
        y="16.5"
        textAnchor="middle"
        fontSize="6"
        fontWeight="700"
        fill="currentColor"
      >
        10
      </text>
    </svg>
  ),
  volHigh: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" {...p}>
      <path
        fill="currentColor"
        d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4z"
      />
      <path
        d="M15.2 9a4.2 4.2 0 0 1 0 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M17.6 6.6a7.6 7.6 0 0 1 0 10.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  volLow: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" {...p}>
      <path fill="currentColor" d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4z" />
      <path
        d="M15.2 9a4.2 4.2 0 0 1 0 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  volMute: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" {...p}>
      <path fill="currentColor" d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4z" />
      <path
        d="m16 9.5 5 5m0-5-5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  list: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" {...p}>
      <path
        d="M4 6h16M4 12h16M4 18h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  cc: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" {...p}>
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M10.4 10.3a2.3 2.3 0 1 0 0 3.4M16.6 10.3a2.3 2.3 0 1 0 0 3.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  speed: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" {...p}>
      <circle
        cx="12"
        cy="13.5"
        r="7.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 13.5l3-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9.5 2.5h5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  fs: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" {...p}>
      <path
        d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  fsExit: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" {...p}>
      <path
        d="M9 4v3.5A1.5 1.5 0 0 1 7.5 9H4M20 9h-3.5A1.5 1.5 0 0 1 15 7.5V4M15 20v-3.5a1.5 1.5 0 0 1 1.5-1.5H20M4 15h3.5A1.5 1.5 0 0 1 9 16.5V20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  check: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" {...p}>
      <path
        d="M5 12.5l4.5 4.5L19 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  x: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" {...p}>
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  replay: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" {...p}>
      <path
        d="M12 5a7 7 0 1 1-6.6 4.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path fill="currentColor" d="M7.6 2.6 4.2 9.9l7.3-3.2z" />
    </svg>
  ),
};

const Ident = () => (
  <motion.div
    className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black"
    exit={{ opacity: 0 }}
    transition={{ duration: 0.6 }}
  >
    <motion.div
      className="relative h-28 w-20 md:h-36 md:w-24"
      style={{ filter: `drop-shadow(0 0 24px ${RED}66)` }}
      exit={{ scale: 0.8, opacity: 0 }}
    >
      <motion.div
        className="absolute left-0 top-0 h-full w-[22%] origin-top bg-[#e50914]"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <motion.div
        className="absolute right-0 top-0 h-full w-[22%] origin-top bg-[#e50914]"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
      />
      <motion.div
        className="absolute left-[10%] top-0 h-full w-[80%] origin-left bg-[#f6121d]"
        style={{ clipPath: "polygon(0 0, 45% 0, 100% 100%, 55% 100%)" }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.45, delay: 0.35, ease: "easeOut" }}
      />
    </motion.div>
    <motion.div
      className="mt-7 text-2xl font-black tracking-[0.35em] text-[#e50914]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.65, duration: 0.4 }}
      exit={{ opacity: 0 }}
    >
      NETFLIX
    </motion.div>
  </motion.div>
);

const Buffering = () => (
  <motion.div
    className="absolute inset-0 z-[60] flex items-center justify-center bg-black"
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4 }}
  >
    <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/15 border-t-[#e50914]" />
  </motion.div>
);

const HoverThumb = ({ t, palette }: { t: number; palette: Palette }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext("2d");
    if (c && ctx) drawScene(ctx, 320, 180, t, palette);
  }, [t, palette]);
  return (
    <canvas
      ref={ref}
      width={320}
      height={180}
      className="h-[90px] w-[160px] rounded-sm"
    />
  );
};

export default function VideoPlayerPage() {
  const [phase, setPhase] = useState<"ident" | "buffering" | "ready">("ident");
  const [episodeIdx, setEpisodeIdx] = useState(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [uiHidden, setUiHidden] = useState(false);
  const [barHot, setBarHot] = useState(false);
  const [hover, setHover] = useState<{ t: number; x: number } | null>(null);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [subLang, setSubLang] = useState<string | null>("English");
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuTab, setMenuTab] = useState<"subs" | "speed">("subs");
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFs, setIsFs] = useState(false);
  const [sizeVer, setSizeVer] = useState(0);

  const ep = EPISODES[episodeIdx];
  const isLast = episodeIdx >= EPISODES.length - 1;

  const timeRef = useRef(0);
  const playingRef = useRef(false);
  const endedRef = useRef(false);
  const rateRef = useRef(1);
  const episodeIdxRef = useRef(0);
  const overlayRef = useRef(false);
  const dragRef = useRef(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef({ w: 2, h: 2 });

  const draw = useCallback(
    (t: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        drawScene(ctx, sizeRef.current.w, sizeRef.current.h, t, EPISODES[episodeIdx].palette);
      }
    },
    [episodeIdx]
  );

  const poke = useCallback(() => {
    setUiHidden(false);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (playingRef.current && !endedRef.current && !overlayRef.current) {
        setUiHidden(true);
      }
    }, 3000);
  }, []);

  const seek = useCallback((t: number) => {
    const e = EPISODES[episodeIdxRef.current];
    timeRef.current = clamp(t, 0, e.duration);
    setTime(timeRef.current);
    if (timeRef.current < e.duration) setEnded(false);
  }, []);

  const seekBy = useCallback(
    (delta: number) => {
      seek(timeRef.current + delta);
    },
    [seek]
  );

  const replay = useCallback(() => {
    setEnded(false);
    setCountdown(null);
    seek(0);
    setPlaying(true);
    poke();
  }, [seek, poke]);

  const playNext = useCallback(() => {
    const next = episodeIdxRef.current + 1;
    if (next >= EPISODES.length) return;
    setEpisodeIdx(next);
    timeRef.current = 0;
    setTime(0);
    setEnded(false);
    setCountdown(null);
    setShowEpisodes(false);
    setMenuOpen(false);
    setPlaying(true);
    poke();
  }, [poke]);

  const togglePlay = useCallback(() => {
    if (endedRef.current) {
      replayRef.current();
      return;
    }
    setPlaying((p) => !p);
  }, []);

  const toggleFs = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
      setIsFs(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFs(false);
    }
    poke();
  }, [poke]);

  const selectEpisode = useCallback(
    (i: number) => {
      if (i === episodeIdxRef.current) {
        setShowEpisodes(false);
        return;
      }
      setEpisodeIdx(i);
      timeRef.current = 0;
      setTime(0);
      setEnded(false);
      setCountdown(null);
      setShowEpisodes(false);
      setMenuOpen(false);
      setPlaying(true);
      poke();
    },
    [poke]
  );

  const togglePlayRef = useRef(togglePlay);
  const seekByRef = useRef(seekBy);
  const toggleFsRef = useRef(toggleFs);
  const replayRef = useRef(replay);
  const playNextRef = useRef(playNext);
  const pokeRef = useRef(poke);
  togglePlayRef.current = togglePlay;
  seekByRef.current = seekBy;
  toggleFsRef.current = toggleFs;
  replayRef.current = replay;
  playNextRef.current = playNext;
  pokeRef.current = poke;
  playingRef.current = playing;
  endedRef.current = ended;
  rateRef.current = rate;
  episodeIdxRef.current = episodeIdx;
  overlayRef.current = showEpisodes || menuOpen;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("buffering"), 2300);
    const t2 = setTimeout(() => {
      setPhase("ready");
      setPlaying(true);
    }, 3100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      const r = el.getBoundingClientRect();
      const w = Math.max(2, Math.round(r.width * dpr));
      const h = Math.max(2, Math.round(r.height * dpr));
      canvas.width = w;
      canvas.height = h;
      sizeRef.current = { w, h };
      setSizeVer((v) => v + 1);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    draw(timeRef.current);
  }, [draw, sizeVer]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let uiAcc = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!playingRef.current) return;
      const e = EPISODES[episodeIdxRef.current];
      let nt = timeRef.current + dt * rateRef.current;
      if (nt >= e.duration) {
        timeRef.current = e.duration;
        setTime(e.duration);
        setPlaying(false);
        setEnded(true);
        return;
      }
      timeRef.current = nt;
      draw(nt);
      uiAcc += dt;
      if (uiAcc >= 1 / 30) {
        uiAcc = 0;
        setTime(nt);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [draw]);

  useEffect(() => {
    if (!ended || isLast) return;
    setCountdown(8);
    const iv = setInterval(
      () => setCountdown((c) => (c === null ? null : c - 1)),
      1000
    );
    return () => clearInterval(iv);
  }, [ended, isLast]);

  useEffect(() => {
    if (countdown !== null && countdown <= 0) playNextRef.current();
  }, [countdown]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowEpisodes(false);
        setMenuOpen(false);
        return;
      }
      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlayRef.current();
          break;
        case "arrowleft":
          e.preventDefault();
          seekByRef.current(-10);
          break;
        case "arrowright":
          e.preventDefault();
          seekByRef.current(10);
          break;
        case "arrowup":
          setVolume((v) => clamp(v + 0.1, 0, 1));
          break;
        case "arrowdown":
          setVolume((v) => clamp(v - 0.1, 0, 1));
          break;
        case "f":
          toggleFsRef.current();
          break;
        case "m":
          setMuted((m) => !m);
          break;
        default:
          return;
      }
      pokeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onFs = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(
    () => () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    },
    []
  );

  const timePct = (time / ep.duration) * 100;
  const bufPct = clamp(((time + 25) / ep.duration) * 100, 0, 100);
  const remaining = ep.duration - time;
  const activeSub = ep.subtitles.find((s) => time >= s.start && time < s.end);
  const showSkipIntro = time >= 3 && time < 16 && !ended;
  const showNextEp = time >= ep.duration - 25 && !ended && !isLast;
  const effVolume = muted ? 0 : volume;

  const posFromEvent = (clientX: number) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return clamp(((clientX - rect.left) / rect.width) * ep.duration, 0, ep.duration);
  };
  const onBarMove = (e: React.PointerEvent) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return;
    const t = posFromEvent(e.clientX);
    setBarHot(true);
    setHover({ t, x: clamp(e.clientX - rect.left, 84, rect.width - 84) });
    if (dragRef.current) seek(t);
  };

  const nextEp = EPISODES[episodeIdx + 1];

  return (
    <div
      ref={containerRef}
      onMouseMove={poke}
      onTouchStart={poke}
      className={`relative flex flex-1 select-none overflow-hidden bg-black ${
        isFs ? "fixed inset-0 z-[70] m-0 h-screen w-screen" : ""
      } ${uiHidden && playing ? "cursor-none" : ""}`}
    >
      <RequireDarkMode />

      <canvas ref={canvasRef} className="absolute inset-0 z-0 h-full w-full" />
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <div
        className="absolute inset-0 z-[2]"
        onClick={() => phase === "ready" && togglePlay()}
        onDoubleClick={toggleFs}
      />

      <AnimatePresence>
        {time < 6 && !ended && (
          <motion.div
            key="titlecard"
            className="pointer-events-none absolute bottom-[110px] left-[6%] z-[3] md:bottom-[130px]"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-[#e50914] md:text-sm">
              {SHOW}
            </div>
            <div className="mt-1 text-3xl font-black text-white drop-shadow-lg md:text-5xl">
              {ep.title}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeSub && subLang !== "Off" && (
          <motion.div
            key="subs"
            className="pointer-events-none absolute bottom-[92px] left-1/2 z-[3] w-[80%] max-w-2xl -translate-x-1/2 text-center md:bottom-[104px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span
              className="text-base font-medium text-white md:text-xl"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.9)" }}
            >
              {activeSub.text}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 bg-gradient-to-b from-black/80 to-transparent"
        animate={{ opacity: uiHidden ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      />
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-36 bg-gradient-to-t from-black/90 to-transparent"
        animate={{ opacity: uiHidden ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      />

      <motion.div
        className="absolute inset-x-0 top-0 z-20 flex h-16 items-center gap-3 px-4 md:gap-5 md:px-8"
        animate={{ opacity: uiHidden ? 0 : 1, y: uiHidden ? -8 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href="/portfolio"
          className="rounded-full p-1.5 text-white/90 transition hover:scale-110 hover:text-white"
          title="Back to browse"
        >
          <I.chevronLeft className="h-7 w-7" />
        </Link>
        <span className="hidden text-xl font-black tracking-[0.18em] text-[#e50914] sm:block md:text-2xl">
          NETFLIX
        </span>
        <span className="hidden h-6 w-px bg-white/30 sm:block" />
        <span className="truncate text-sm text-white/90 md:text-base">
          S1:E{ep.id} &middot; {ep.title}
        </span>
      </motion.div>

      <AnimatePresence>
        {showSkipIntro && !uiHidden && (
          <motion.button
            key="skipintro"
            className="absolute bottom-28 right-6 z-30 rounded border border-white/60 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-black md:bottom-32 md:right-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => {
              seek(16);
              poke();
            }}
          >
            Skip Intro
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNextEp && !uiHidden && !ended && (
          <motion.button
            key="nextep"
            className="absolute bottom-28 right-6 z-30 flex items-center gap-2 rounded bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25 md:bottom-32 md:right-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={playNext}
          >
            <I.play className="h-4 w-4" /> Next Episode
          </motion.button>
        )}
      </AnimatePresence>

      <motion.div
        className="absolute inset-x-0 bottom-0 z-20 px-3 pb-3 md:px-6 md:pb-4"
        animate={{ opacity: uiHidden ? 0 : 1, y: uiHidden ? 12 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div
          ref={barRef}
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={ep.duration}
          aria-valuenow={Math.floor(time)}
          tabIndex={0}
          className="flex h-10 w-full cursor-pointer items-center px-1"
          onPointerEnter={() => setBarHot(true)}
          onPointerLeave={() => {
            if (!dragRef.current) {
              setBarHot(false);
              setHover(null);
            }
          }}
          onPointerMove={onBarMove}
          onPointerDown={(e) => {
            dragRef.current = true;
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            setBarHot(true);
            seek(posFromEvent(e.clientX));
            poke();
          }}
          onPointerUp={() => {
            dragRef.current = false;
          }}
          onPointerCancel={() => {
            dragRef.current = false;
          }}
        >
          <div
            className="relative w-full rounded-full bg-white/25 transition-[height] duration-150"
            style={{ height: barHot ? 6 : 3 }}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-white/30"
              style={{ width: `${bufPct}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${timePct}%`, background: RED }}
            />
            <div
              className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow transition-transform duration-150"
              style={{
                left: `${timePct}%`,
                background: RED,
                transform: `translate(-50%, -50%) scale(${barHot ? 1 : 0})`,
              }}
            />
          </div>

          <AnimatePresence>
            {hover && (
              <motion.div
                key="tooltip"
                className="pointer-events-none absolute bottom-full mb-1 flex w-[164px] -translate-x-1/2 flex-col items-center gap-1"
                style={{ left: hover.x }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
              >
                <HoverThumb t={hover.t} palette={ep.palette} />
                <span className="text-xs font-medium text-white">
                  {fmt(hover.t)}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-1 flex items-center gap-0.5 md:gap-1">
          <button
            className="p-2 text-white/90 transition hover:scale-110 hover:text-white"
            onClick={() => {
              togglePlay();
              poke();
            }}
            title={playing ? "Pause" : "Play"}
          >
            {playing ? <I.pause className="h-7 w-7" /> : <I.play className="h-7 w-7" />}
          </button>
          <button
            className="p-2 text-white/90 transition hover:scale-110 hover:text-white"
            onClick={() => {
              seekBy(-10);
              poke();
            }}
            title="Back 10 seconds"
          >
            <I.back10 className="h-6 w-6" />
          </button>
          <button
            className="p-2 text-white/90 transition hover:scale-110 hover:text-white"
            onClick={() => {
              seekBy(10);
              poke();
            }}
            title="Forward 10 seconds"
          >
            <I.fwd10 className="h-6 w-6" />
          </button>

          <div className="group/vol flex items-center">
            <button
              className="p-2 text-white/90 transition hover:scale-110 hover:text-white"
              onClick={() => {
                setMuted((m) => !m);
                poke();
              }}
              title={muted || volume === 0 ? "Unmute" : "Mute"}
            >
              {effVolume === 0 ? (
                <I.volMute className="h-6 w-6" />
              ) : effVolume < 0.5 ? (
                <I.volLow className="h-6 w-6" />
              ) : (
                <I.volHigh className="h-6 w-6" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={effVolume}
              onChange={(e) => {
                const v = Number(e.target.value);
                setVolume(v);
                setMuted(v === 0);
                poke();
              }}
              className="h-1 w-0 cursor-pointer accent-[#e50914] opacity-0 transition-all duration-200 group-hover/vol:w-20 group-hover/vol:opacity-100"
            />
          </div>

          <span className="mx-2 whitespace-nowrap text-xs text-white/85 tabular-nums md:text-sm">
            {fmt(time)} <span className="text-white/50">/ {fmt(ep.duration)}</span>
          </span>

          <div className="flex-1" />

          <button
            className="p-2 text-white/90 transition hover:scale-110 hover:text-white"
            onClick={() => {
              setMenuOpen(false);
              setShowEpisodes((s) => !s);
              poke();
            }}
            title="Episodes"
          >
            <I.list className="h-6 w-6" />
          </button>
          <button
            className={`p-2 transition hover:scale-110 ${
              menuOpen && menuTab === "subs" ? "text-white" : "text-white/90 hover:text-white"
            }`}
            onClick={() => {
              setShowEpisodes(false);
              setMenuTab("subs");
              setMenuOpen(true);
              poke();
            }}
            title="Subtitles & audio"
          >
            <I.cc className="h-6 w-6" />
          </button>
          <button
            className={`p-2 transition hover:scale-110 ${
              menuOpen && menuTab === "speed" ? "text-white" : "text-white/90 hover:text-white"
            }`}
            onClick={() => {
              setShowEpisodes(false);
              setMenuTab("speed");
              setMenuOpen(true);
              poke();
            }}
            title="Playback speed"
          >
            <I.speed className="h-6 w-6" />
          </button>
          <button
            className="p-2 text-white/90 transition hover:scale-110 hover:text-white"
            onClick={toggleFs}
            title={isFs ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFs ? <I.fsExit className="h-6 w-6" /> : <I.fs className="h-6 w-6" />}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="menu"
            className="absolute bottom-20 right-4 z-40 w-64 overflow-hidden rounded-md border border-white/15 bg-[#0b0b0f]/95 shadow-2xl backdrop-blur-md md:right-8 md:bottom-24"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex border-b border-white/10">
              {(["subs", "speed"] as const).map((tab) => (
                <button
                  key={tab}
                  className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
                    menuTab === tab
                      ? "border-b-2 text-white"
                      : "text-white/50 hover:text-white/80"
                  }`}
                  style={{
                    borderColor: menuTab === tab ? RED : "transparent",
                  }}
                  onClick={() => setMenuTab(tab)}
                >
                  {tab === "subs" ? "Subtitles" : "Speed"}
                </button>
              ))}
            </div>
            <div className="max-h-72 overflow-y-auto py-1">
              {menuTab === "subs"
                ? SUB_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                      onClick={() => {
                        setSubLang(opt === "Off" ? null : opt);
                        setMenuOpen(false);
                        poke();
                      }}
                    >
                      {opt}
                      {(opt === "Off" && subLang === null) || opt === subLang ? (
                        <I.check className="h-4 w-4" style={{ color: RED }} />
                      ) : null}
                    </button>
                  ))
                : RATES.map((r) => (
                    <button
                      key={r}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                      onClick={() => {
                        setRate(r);
                        setMenuOpen(false);
                        poke();
                      }}
                    >
                      {r === 1 ? "Normal (1x)" : `${r}x`}
                      {rate === r && (
                        <I.check className="h-4 w-4" style={{ color: RED }} />
                      )}
                    </button>
                  ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEpisodes && (
          <>
            <motion.div
              key="drawer-backdrop"
              className="absolute inset-0 z-30 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEpisodes(false)}
            />
            <motion.div
              key="drawer"
              className="absolute right-0 top-0 z-40 flex h-full w-[380px] max-w-[92vw] flex-col border-l border-white/10 bg-[#141519]/95 backdrop-blur-md"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
            >
              <div className="flex items-start justify-between p-5 pb-3">
                <div>
                  <h2 className="m-0 text-lg font-bold text-white">Episodes</h2>
                  <p className="m-0 mt-0.5 text-xs uppercase tracking-widest text-white/40">
                    {SHOW} &middot; Season 1
                  </p>
                </div>
                <button
                  className="p-1 text-white/60 transition hover:text-white"
                  onClick={() => setShowEpisodes(false)}
                  title="Close"
                >
                  <I.x className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-4">
                {EPISODES.map((e, i) => {
                  const pct = i === episodeIdx ? timePct : 0;
                  return (
                    <button
                      key={e.id}
                      className={`flex w-full items-start gap-3 rounded-md p-3 text-left transition hover:bg-white/5 ${
                        i === episodeIdx ? "bg-white/5" : ""
                      }`}
                      onClick={() => selectEpisode(i)}
                    >
                      <span
                        className={`mt-6 w-5 text-center text-sm ${
                          i === episodeIdx ? "font-bold text-[#e50914]" : "text-white/50"
                        }`}
                      >
                        {e.id}
                      </span>
                      <div
                        className="relative h-16 w-28 shrink-0 rounded"
                        style={{
                          background: `linear-gradient(135deg, ${e.palette.sky[2]}, ${e.palette.accent})`,
                        }}
                      >
                        <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 text-[10px] text-white/90">
                          {fmt(e.duration)}
                        </span>
                        {pct > 0 && (
                          <span className="absolute inset-x-1 bottom-0 h-[3px] rounded bg-white/25">
                            <span
                              className="block h-full rounded"
                              style={{ width: `${pct}%`, background: RED }}
                            />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div
                          className={`truncate text-sm font-semibold ${
                            i === episodeIdx ? "text-[#e50914]" : "text-white"
                          }`}
                        >
                          {e.title}
                        </div>
                        <div className="mt-1 line-clamp-2 text-xs leading-snug text-white/50">
                          {e.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {ended && (
          <motion.div
            key="ended"
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="mx-4 w-full max-w-md rounded-lg border border-white/10 bg-[#141519]/90 p-6 shadow-2xl"
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              {isLast ? (
                <>
                  <div className="text-xs font-bold uppercase tracking-[0.3em] text-[#e50914]">
                    That&apos;s a wrap
                  </div>
                  <h3 className="mb-1 mt-2 text-2xl font-bold text-white">
                    Season 1 complete
                  </h3>
                  <p className="text-sm text-white/60">
                    Thanks for watching {SHOW}. The protocol lives on.
                  </p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <button
                      className="flex flex-1 items-center justify-center gap-2 rounded bg-[#e50914] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#f6121d]"
                      onClick={replay}
                    >
                      <I.replay className="h-4 w-4" /> Replay season
                    </button>
                    <Link
                      href="/portfolio"
                      className="flex flex-1 items-center justify-center gap-2 rounded bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/20"
                    >
                      Back to browse
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex gap-4">
                    <div
                      className="h-20 w-36 shrink-0 rounded"
                      style={{
                        background: `linear-gradient(135deg, ${nextEp.palette.sky[2]}, ${nextEp.palette.accent})`,
                      }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#e50914]">
                        Next episode
                      </div>
                      <h3 className="m-0 mt-1 truncate text-lg font-bold text-white">
                        S1:E{nextEp.id} {nextEp.title}
                      </h3>
                      <p className="m-0 mt-1 text-xs text-white/50">
                        {fmt(nextEp.duration)} &middot; {SHOW}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-snug text-white/60">
                    {nextEp.desc}
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <button
                      className="flex flex-1 items-center justify-center gap-2 rounded bg-[#e50914] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#f6121d]"
                      onClick={playNext}
                    >
                      <I.play className="h-4 w-4" /> Play now
                    </button>
                    <button
                      className="flex items-center justify-center gap-2 rounded bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/20"
                      onClick={() => {
                        setCountdown(null);
                        replay();
                      }}
                    >
                      <I.replay className="h-4 w-4" /> Replay
                    </button>
                    <div className="relative h-11 w-11 shrink-0" title="Auto-playing in">
                      <svg viewBox="0 0 44 44" className="h-11 w-11 -rotate-90">
                        <circle
                          cx="22"
                          cy="22"
                          r="18"
                          fill="none"
                          stroke="rgba(255,255,255,0.15)"
                          strokeWidth="3"
                        />
                        <circle
                          cx="22"
                          cy="22"
                          r="18"
                          fill="none"
                          stroke={RED}
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 18}
                          strokeDashoffset={2 * Math.PI * 18 * (1 - (countdown ?? 0) / 8)}
                          style={{ transition: "stroke-dashoffset 1s linear" }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white tabular-nums">
                        {countdown ?? 8}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "ident" && <Ident key="ident" />}
        {phase === "buffering" && <Buffering key="buffering" />}
      </AnimatePresence>
    </div>
  );
}

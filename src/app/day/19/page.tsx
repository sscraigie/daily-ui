"use client";
// Day 19 - Leaderboard
// Video game themed: "AETHERFALL" — a clean game-style trophy ladder: league
// shields, a top-3 shield podium, live trophy gains with animated rank swaps,
// and a LEGEND league celebration.

import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { RequireDarkMode } from "@/components/ThemeProvider";

/* ---------------------------------- utils --------------------------------- */

function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hashOf = (tag: string) =>
  tag.split("").reduce((a, c) => a + c.charCodeAt(0) * 7, 11);

const fmtT = (n: number) => n.toLocaleString("en-US");

/* ----------------------------------- data --------------------------------- */

type Player = {
  id: string;
  tag: string;
  trophies: number;
  level: number;
  winRate: number;
  clan?: boolean;
  you?: boolean;
  flash: number;
  flashKey: number;
};

type Move = Record<string, number>;
type Scope = "global" | "clan";

const ME = "spence";
const LEGEND_MIN = 5000;

const ROSTER_SEED: Omit<Player, "flash" | "flashKey">[] = [
  { id: "void", tag: "VOID_RIPPER", trophies: 5620, level: 87, winRate: 71 },
  { id: "nyx", tag: "NyxRose", trophies: 5487, level: 92, winRate: 68 },
  { id: "kaisen", tag: "KaiseN", trophies: 5391, level: 78, winRate: 66 },
  { id: "ghost", tag: "Ghostwalkez", trophies: 5240, level: 81, winRate: 63, clan: true },
  { id: "mid", tag: "M1DNIGHT", trophies: 5188, level: 74, winRate: 61 },
  { id: "photon", tag: "PhantomJr", trophies: 5123, level: 69, winRate: 59 },
  { id: "sable", tag: "SableDrift", trophies: 5086, level: 77, winRate: 57 },
  { id: "havok", tag: "Havok99", trophies: 5054, level: 65, winRate: 55, clan: true },
  { id: "luna", tag: "Lunaclipse", trophies: 5031, level: 71, winRate: 54, clan: true },
  { id: "razor", tag: "RazorFlint", trophies: 5012, level: 62, winRate: 52 },
  { id: ME, tag: "SPENCE", trophies: 4890, level: 58, winRate: 51, clan: true, you: true },
  { id: "drift", tag: "DriftK1ng", trophies: 4841, level: 60, winRate: 49, clan: true },
  { id: "ekko", tag: "EkkoPrime", trophies: 4762, level: 55, winRate: 47 },
  { id: "nora", tag: "NoScope_Nora", trophies: 4703, level: 52, winRate: 45, clan: true },
  { id: "pixel", tag: "PixelWarden", trophies: 4655, level: 49, winRate: 44 },
  { id: "static", tag: "StaticByte", trophies: 4598, level: 46, winRate: 42 },
];

const INITIAL_PLAYERS: Player[] = ROSTER_SEED.map((p) => ({
  ...p,
  flash: 0,
  flashKey: 0,
}));

/* --------------------------------- leagues -------------------------------- */

type League = {
  name: string;
  min: number;
  outer: string;
  inner: string;
  deep: string;
  emblem: "star" | "flame" | "crown" | "zap" | "gem";
};

const LEAGUES: League[] = [
  { name: "LEGEND", min: 5000, outer: "#f5c542", inner: "#8b5cf6", deep: "#6d28d9", emblem: "star" },
  { name: "TITAN", min: 4500, outer: "#dc2626", inner: "#f87171", deep: "#b91c1c", emblem: "flame" },
  { name: "CHAMPION", min: 4000, outer: "#2563eb", inner: "#60a5fa", deep: "#1e3a8a", emblem: "crown" },
  { name: "MASTER", min: 3500, outer: "#0891b2", inner: "#22d3ee", deep: "#0e7490", emblem: "zap" },
  { name: "CRYSTAL", min: 3000, outer: "#9333ea", inner: "#c084fc", deep: "#6d28d9", emblem: "gem" },
  { name: "GOLD", min: 2500, outer: "#f59e0b", inner: "#fbbf24", deep: "#b45309", emblem: "star" },
  { name: "SILVER", min: 2000, outer: "#94a3b8", inner: "#e2e8f0", deep: "#64748b", emblem: "star" },
  { name: "BRONZE", min: 0, outer: "#b45309", inner: "#d97706", deep: "#92400e", emblem: "star" },
];

const leagueOf = (t: number) => LEAGUES.find((l) => t >= l.min) ?? LEAGUES[LEAGUES.length - 1];

const SHIELD_CLIP =
  "polygon(50% 0%, 93% 5%, 100% 28%, 100% 58%, 50% 100%, 0% 58%, 0% 28%, 7% 5%)";

/* ---------------------------------- icons --------------------------------- */

const Emblem = ({ kind, color, className }: { kind: League["emblem"]; color: string; className: string }) => {
  const common = { fill: color, className };
  switch (kind) {
    case "star":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 2l2.9 6.2 6.6.8-4.9 4.6 1.3 6.6L12 16.9 6.1 20.2l1.3-6.6L2.5 9l6.6-.8L12 2z" />
        </svg>
      );
    case "flame":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 2c1.5 3.5-1 5-2.2 7-1.3 2.3-.3 5.5 2.2 5.5 2.4 0 3.8-2.3 2.9-5.2 2.8 1.6 4.6 4 4.6 6.7a7.5 7.5 0 1 1-15 0c0-5 3.5-7.5 7.5-14z" />
        </svg>
      );
    case "crown":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M3 19h18l1.5-10.5-5.5 3.5-5-7-5 7-5.5-3.5L3 19z" />
        </svg>
      );
    case "zap":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
        </svg>
      );
    case "gem":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 2 21 9.5 12 22 3 9.5 12 2z" />
        </svg>
      );
  }
};

const IconTrophy = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <g fill="#ffc83d" stroke="#92610a" strokeWidth="1.2" strokeLinejoin="round">
      <path d="M7 3h10v5a5 5 0 0 1-10 0V3z" />
      <path d="M7 4H4v1a4 4 0 0 0 4 4" fill="none" />
      <path d="M17 4h3v1a4 4 0 0 1-4 4" fill="none" />
      <path d="M11 12.5h2V17h-2z" />
      <path d="M8 17h8v2.5H8z" />
    </g>
  </svg>
);

const IconCrown = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M3 19h18l1.5-10.5-5.5 3.5-5-7-5 7-5.5-3.5L3 19z" />
  </svg>
);

const IconTimer = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="h-3.5 w-3.5">
    <path d="M10 2h4M12 14l3-3" />
    <circle cx="12" cy="14" r="8" />
  </svg>
);

const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-4 w-4">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

const LiveDot = () => (
  <motion.span
    className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400"
    style={{ boxShadow: "0 0 6px #34d399" }}
    animate={{ opacity: [1, 0.3, 1] }}
    transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
  />
);

/* --------------------------------- shields -------------------------------- */

const LeagueBadge = ({
  trophies,
  size = "sm",
}: {
  trophies: number;
  size?: "sm" | "lg" | "xl";
}) => {
  const lg = leagueOf(trophies);
  const box = size === "xl" ? "h-24 w-[4.5rem]" : size === "lg" ? "h-16 w-12" : "h-8 w-6";
  const inset = size === "xl" ? "inset-[3px]" : "inset-[2px]";
  const emb = size === "xl" ? "h-10 w-10" : size === "lg" ? "h-7 w-7" : "h-3.5 w-3.5";
  const embColor = lg.name === "LEGEND" ? "#ffd700" : "#ffffff";
  return (
    <div className={`relative flex-shrink-0 ${box}`} title={`${lg.name} League`}>
      <div className="absolute inset-0" style={{ clipPath: SHIELD_CLIP, background: lg.outer }} />
      <div
        className={`absolute ${inset}`}
        style={{ clipPath: SHIELD_CLIP, background: `linear-gradient(180deg, ${lg.inner}, ${lg.deep})` }}
      />
      <div className="absolute inset-x-0 top-[22%] flex justify-center">
        <Emblem kind={lg.emblem} color={embColor} className={emb} />
      </div>
    </div>
  );
};

/* --------------------------------- podium --------------------------------- */

const PLACES = [
  { block: "pt-6 pb-4", metal: "#f5c542" },
  { block: "pt-3 pb-2.5", metal: "#cbd5e1" },
  { block: "pt-2 pb-2", metal: "#f59e0b" },
];

const PodiumShield = ({
  player,
  place,
  delay,
}: {
  player: Player;
  place: number;
  delay: number;
}) => {
  const isTop = place === 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 110, damping: 16, delay }}
      className={`relative flex w-28 flex-col items-center sm:w-36 ${isTop ? "z-10" : ""}`}
    >
      {isTop && (
        <motion.div
          className="absolute -top-7 z-10 text-amber-300 drop-shadow-[0_2px_8px_rgba(251,191,36,0.55)]"
          animate={{ y: [-2, -6, -2], rotate: [-3, 3, -3] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <IconCrown className="h-7 w-7" />
        </motion.div>
      )}
      {isTop && (
        <div className="absolute top-6 h-20 w-24 rounded-full bg-amber-400/20 blur-2xl" />
      )}
      <LeagueBadge trophies={player.trophies} size={isTop ? "xl" : "lg"} />
      <div className="z-10 -mt-2 max-w-full truncate rounded-lg border border-[#343c6b] bg-[#141830] px-2.5 py-1 shadow-lg">
        <span
          className={`text-[11px] font-black uppercase italic tracking-wide sm:text-xs ${
            isTop ? "text-amber-300" : "text-slate-100"
          }`}
        >
          {player.tag}
        </span>
      </div>
      <div
        className={`w-full rounded-b-xl border border-t-4 border-[#343c6b] bg-gradient-to-b from-[#232b56] to-[#171b34] ${PLACES[place].block}`}
        style={{ borderTopColor: PLACES[place].metal }}
      >
        <div className="flex items-center justify-center gap-1">
          <IconTrophy className="h-4 w-4" />
          <span
            className={`text-sm font-black tabular-nums ${
              isTop ? "text-amber-300" : "text-slate-200"
            }`}
          >
            {fmtT(player.trophies)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

/* --------------------------------- pieces --------------------------------- */

const PANEL =
  "rounded-2xl border border-[#343c6b] bg-[#1c2244]/90 shadow-[0_12px_32px_rgba(0,0,0,0.35)]";

const GREEN_BTN =
  "rounded-lg bg-gradient-to-b from-emerald-400 to-emerald-600 px-4 py-2 text-[11px] font-black uppercase italic tracking-wider text-white shadow-[0_3px_0_#065f46] transition-transform active:translate-y-0.5 active:shadow-[0_1px_0_#065f46]";

const MoveChip = ({ move }: { move: number }) => {
  if (move > 0)
    return <span className="text-[9px] font-black text-emerald-400">▲{move}</span>;
  if (move < 0)
    return <span className="text-[9px] font-black text-red-400">▼{Math.abs(move)}</span>;
  return <span className="text-[9px] font-bold text-slate-600">–</span>;
};

/* ---------------------------------- modal --------------------------------- */

const StatBox = ({ label, value, gold }: { label: string; value: string; gold?: boolean }) => (
  <div className="rounded-lg border border-[#2c3360] bg-[#171b34] px-3 py-2 text-left">
    <p className="m-0 text-[9px] font-bold uppercase tracking-wider text-slate-500">
      {label}
    </p>
    <p className={`m-0 text-sm font-black ${gold ? "text-amber-300" : "text-slate-100"}`}>
      {value}
    </p>
  </div>
);

const InspectModal = ({ player, onClose }: { player: Player; onClose: () => void }) => {
  const rand = useMemo(() => mulberry32(hashOf(player.tag)), [player.tag]);
  const stats = useMemo(() => {
    const battles = 800 + Math.floor(rand() * 1400);
    return {
      battles,
      wins: Math.floor((battles * player.winRate) / 100),
      best: player.trophies + 120 + Math.floor(rand() * 300),
      three: Math.floor(rand() * 80),
    };
  }, [rand, player.winRate, player.trophies]);
  const form = useMemo(
    () => Array.from({ length: 6 }, () => (rand() < player.winRate / 100 ? "W" : "L")),
    [rand, player.winRate],
  );
  const lg = leagueOf(player.trophies);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 12, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm overflow-hidden ${PANEL} ${
          player.you ? "!border-amber-300/50 shadow-[0_0_44px_rgba(251,191,36,0.2)]" : ""
        }`}
      >
        <div className="relative border-b border-[#2c3360] bg-[#171b34]/70 p-4">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-10 rounded-lg border border-[#343c6b] bg-[#202750] p-1.5 text-slate-400 transition hover:bg-[#2a3260] hover:text-white"
            aria-label="Close player card"
          >
            <IconClose />
          </button>

          <div className="flex items-center gap-4 pr-10">
            <LeagueBadge trophies={player.trophies} size="xl" />
            <div className="min-w-0">
              <p className="m-0 truncate text-xl font-black uppercase italic tracking-wide text-slate-50">
                {player.tag}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-0.5 text-[9px] font-black tracking-widest text-amber-300">
                  {lg.name} LEAGUE
                </span>
                <span className="rounded bg-[#262d52] px-1.5 py-0.5 text-[9px] font-black text-slate-300">
                  LV {player.level}
                </span>
                {player.you && (
                  <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-black text-rose-300">
                    YOU
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-1">
                <IconTrophy className="h-4 w-4" />
                <span className="text-base font-black tabular-nums text-amber-300">
                  {fmtT(player.trophies)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 p-3">
          <StatBox label="Trophies" value={fmtT(player.trophies)} gold />
          <StatBox label="Personal Best" value={fmtT(stats.best)} />
          <StatBox label="Win Rate" value={`${player.winRate}%`} />
          <StatBox label="Battles" value={fmtT(stats.battles)} />
          <StatBox label="Wins" value={fmtT(stats.wins)} />
          <StatBox label="3-Star Wins" value={fmtT(stats.three)} />
        </div>

        <div className="flex items-center gap-2 border-t border-[#2c3360] px-4 py-3">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
            Recent Form
          </span>
          <div className="flex gap-1">
            {form.map((r, i) => (
              <span
                key={i}
                className={`flex h-5 w-5 items-center justify-center rounded-md border text-[10px] font-black ${
                  r === "W"
                    ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-400"
                    : "border-red-400/30 bg-red-500/15 text-red-400"
                }`}
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ----------------------------------- page --------------------------------- */

type Roster = { players: Player[]; moves: Move };

const SCOPES: { id: Scope; label: string; board: string }[] = [
  { id: "global", label: "Global", board: "World Rankings" },
  { id: "clan", label: "Clan", board: "Clan Rankings" },
];

export default function Day19() {
  const [roster, setRoster] = useState<Roster>({
    players: INITIAL_PLAYERS,
    moves: {},
  });
  const [scope, setScope] = useState<Scope>("global");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState("--d --:--:--");
  const [online, setOnline] = useState("12,482");
  const [legendBanner, setLegendBanner] = useState(false);
  const topReached = useRef(false);
  const seasonEnd = useRef(Date.now() + ((2 * 24 + 11) * 3600 + 42 * 60 + 18) * 1000);

  const players = roster.players;
  const moves = roster.moves;
  const you = players.find((p) => p.you)!;
  const selected = players.find((p) => p.id === selectedId) ?? null;
  const inLegend = you.trophies >= LEGEND_MIN;

  const filtered = useMemo(() => {
    const list = [...players].sort((a, b) => b.trophies - a.trophies);
    return scope === "clan" ? list.filter((p) => p.clan) : list;
  }, [players, scope]);

  const podium = filtered.slice(0, 3);
  const rows = filtered.slice(3);

  /* ------------------------------ live ticks ------------------------------ */

  useEffect(() => {
    const trophyTick = setInterval(() => {
      setRoster((prev) => {
        const before = [...prev.players].sort((a, b) => b.trophies - a.trophies).map((p) => p.id);
        const deltas = new Map<string, number>();

        const others = prev.players.filter((p) => !p.you);
        const gainers = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < gainers; i++) {
          const g = others[Math.floor(Math.random() * others.length)];
          deltas.set(g.id, (deltas.get(g.id) ?? 0) + 4 + Math.floor(Math.random() * 16));
        }
        if (Math.random() < 0.3) {
          const l = others[Math.floor(Math.random() * others.length)];
          deltas.set(l.id, (deltas.get(l.id) ?? 0) - (3 + Math.floor(Math.random() * 12)));
        }
        if (Math.random() < 0.85) {
          deltas.set(ME, (deltas.get(ME) ?? 0) + 18 + Math.floor(Math.random() * 28));
        }

        const nextPlayers = prev.players.map((p) => {
          const d = deltas.get(p.id);
          if (!d) return p;
          const t = p.trophies + d;
          return { ...p, trophies: t, flash: d, flashKey: p.flashKey + 1 };
        });

        const after = [...nextPlayers].sort((a, b) => b.trophies - a.trophies).map((p) => p.id);
        const nextMoves: Move = {};
        after.forEach((id, i) => {
          nextMoves[id] = before.indexOf(id) - i;
        });

        return { players: nextPlayers, moves: nextMoves };
      });
    }, 2000);

    const clockTick = setInterval(() => {
      const ms = Math.max(0, seasonEnd.current - Date.now());
      const d = Math.floor(ms / 86400000);
      const h = Math.floor((ms % 86400000) / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      const pad = (n: number) => String(n).padStart(2, "0");
      setCountdown(`${d}d ${pad(h)}:${pad(m)}:${pad(s)}`);
    }, 1000);

    const onlineTick = setInterval(() => {
      setOnline((prev) => {
        const n = parseInt(prev.replace(/,/g, ""), 10);
        return (n + Math.floor((Math.random() - 0.45) * 60)).toLocaleString("en-US");
      });
    }, 3000);

    return () => {
      clearInterval(trophyTick);
      clearInterval(clockTick);
      clearInterval(onlineTick);
    };
  }, []);

  /* --------------------------- legend celebration --------------------------- */

  useEffect(() => {
    if (inLegend && !topReached.current) {
      topReached.current = true;
      confetti({
        particleCount: 160,
        spread: 85,
        origin: { x: 0.5, y: 0.6 },
        colors: ["#ffd166", "#f5b31b", "#22d3ee", "#a78bfa", "#34d399"],
      });
      setLegendBanner(true);
    }
  }, [inLegend]);

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden font-sans text-slate-200"
      style={{
        background:
          "radial-gradient(900px 380px at 50% -80px, rgba(139,92,246,0.16), transparent), radial-gradient(700px 300px at 85% 110%, rgba(34,211,238,0.07), transparent), linear-gradient(180deg, #141830 0%, #191e3c 55%, #202650 100%)",
      }}
    >
      <RequireDarkMode />

      {/* header */}
      <header className="relative z-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[#2c3360] bg-[#141830]/90 px-4 py-3">
        <div className="flex items-center gap-3">
          <LeagueBadge trophies={9999} size="lg" />
          <div className="leading-tight">
            <p className="m-0 bg-gradient-to-r from-amber-200 via-amber-300 to-amber-500 bg-clip-text text-lg font-black uppercase italic tracking-widest text-transparent sm:text-xl">
              Aetherfall
            </p>
            <p className="m-0 text-[9px] font-black tracking-[0.25em] text-slate-500">
              TROPHY LEAGUE · SEASON 47
            </p>
          </div>
        </div>

        <div className="flex gap-1 rounded-xl border border-[#2c3360] bg-[#141830] p-1">
          {SCOPES.map((s) => (
            <button
              key={s.id}
              onClick={() => setScope(s.id)}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-black uppercase italic tracking-wider transition ${
                scope === s.id
                  ? "bg-gradient-to-b from-amber-300 to-amber-500 text-amber-950 shadow-[0_2px_0_#92610a]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-lg border border-[#2c3360] bg-[#141830] px-3 py-1.5 sm:flex">
            <span className="text-amber-300">
              <IconTimer />
            </span>
            <span className="text-[9px] font-black tracking-wider text-slate-500">
              SEASON ENDS
            </span>
            <span className="text-xs font-black tabular-nums text-slate-100">
              {countdown}
            </span>
          </div>
<motion.button
            whileTap={{ scale: 0.94 }}
            className={GREEN_BTN}
            onClick={() => {
              confetti({
                particleCount: 130,
                spread: 100,
                startVelocity: 45,
                origin: { x: 0.5, y: 0.55 },
                colors: ["#ffd166", "#f5b31b", "#34d399", "#22d3ee", "#a78bfa"],
              });
              confetti({
                particleCount: 50,
                spread: 130,
                startVelocity: 32,
                scalar: 1.3,
                origin: { x: 0.5, y: 0.55 },
                colors: ["#ffd166", "#f5b31b", "#34d399"],
                shapes: ["star"],
              });
            }}
          >
            Find Match
          </motion.button>
        </div>
      </header>

      {/* body */}
      <main className="relative z-10 min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-3 py-6">
          {/* legend banner */}
          <AnimatePresence>
            {legendBanner && (
              <motion.div
                initial={{ y: -30, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                className="flex items-center gap-2 rounded-xl border border-amber-300/40 bg-gradient-to-b from-amber-300 to-amber-500 px-4 py-2 shadow-[0_4px_24px_rgba(251,191,36,0.35)]"
              >
                <IconTrophy className="h-5 w-5" />
                <span className="text-xs font-black uppercase italic tracking-widest text-amber-950">
                  Legend League Reached!
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* podium */}
          <div className="flex items-end justify-center gap-2 sm:gap-4">
            {podium[1] && <PodiumShield player={podium[1]} place={1} delay={0.12} />}
            {podium[0] && <PodiumShield player={podium[0]} place={0} delay={0} />}
            {podium[2] && <PodiumShield player={podium[2]} place={2} delay={0.24} />}
          </div>

          {/* board */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100, damping: 18 }}
            className={`w-full ${PANEL}`}
          >
            <div className="flex items-center justify-center border-b border-[#2c3360] px-4 py-2.5">
              <span className="rounded-full border border-[#343c6b] bg-[#141830] px-4 py-1 text-[10px] font-black uppercase italic tracking-[0.2em] text-amber-300">
                {SCOPES.find((s) => s.id === scope)?.board}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 p-2.5">
              <AnimatePresence initial={false}>
                {rows.map((p, i) => {
                  const move = moves[p.id] ?? 0;
                  return (
                    <motion.button
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 420, damping: 38 }}
                      onClick={() => setSelectedId(p.id)}
                      className={`grid w-full grid-cols-[38px_28px_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors hover:border-[#3d4680] ${
                        p.you
                          ? "border-amber-300/60 bg-gradient-to-b from-amber-300/15 to-amber-400/5 shadow-[0_0_20px_rgba(251,191,36,0.18)]"
                          : i % 2 === 0
                            ? "border-[#2c3360] bg-[#1b2140]"
                            : "border-[#2c3360] bg-[#202750]"
                      }`}
                    >
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-sm font-black text-slate-400">
                          #{i + 4}
                        </span>
                        <MoveChip move={move} />
                      </div>
                      <LeagueBadge trophies={p.trophies} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p
                            className={`m-0 truncate text-[15px] font-bold uppercase tracking-wide ${
                              p.you ? "text-amber-300" : "text-slate-100"
                            }`}
                          >
                            {p.tag}
                          </p>
                          {p.you && (
                            <span className="rounded bg-rose-500/20 px-1 py-px text-[8px] font-black text-rose-300">
                              YOU
                            </span>
                          )}
                          {p.clan && !p.you && (
                            <span className="rounded bg-violet-500/20 px-1 py-px text-[8px] font-black text-violet-300">
                              CLAN
                            </span>
                          )}
                        </div>
                        <p className="m-0 text-[10px] font-bold text-slate-500">
                          LV {p.level}
                          {p.you &&
                            (inLegend
                              ? " · LEGEND LEAGUE"
                              : ` · ${fmtT(LEGEND_MIN - p.trophies)} TO LEGEND`)}
                        </p>
                        </div>
                      <div className="relative flex items-center gap-1">
                        <IconTrophy className="h-4 w-4" />
                        <span className="text-base font-black tabular-nums text-amber-300">
                          {fmtT(p.trophies)}
                        </span>
                        {p.flash !== 0 && (
                          <motion.span
                            key={p.flashKey}
                            initial={{ opacity: 1, y: 0 }}
                            animate={{ opacity: 0, y: -16 }}
                            transition={{ duration: 1.1, ease: "easeOut" }}
                            className={`pointer-events-none absolute -top-3 right-0 text-[10px] font-black ${
                              p.flash > 0 ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {p.flash > 0 ? `+${p.flash}` : p.flash}
                          </motion.span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </main>

      {/* footer */}
      <footer className="relative z-10 flex items-center justify-between border-t border-[#2c3360] bg-[#141830]/90 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
        <span>Aetherfall · Day 19 · Leaderboard</span>
        <span className="flex items-center gap-1.5">
          <LiveDot /> <span className="text-slate-300">{online}</span> online
        </span>
      </footer>

      {/* celebrations */}
      <AnimatePresence>
        {selected && (
          <InspectModal
            key={selected.id}
            player={selected}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
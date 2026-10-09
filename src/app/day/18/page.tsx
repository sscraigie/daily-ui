"use client";
// Day 18 - Analytics Dashboard
// Software engineer themed: "Pulse" - a production monitoring dashboard with
// live traffic charts, a deploy pipeline, service health, resource gauges and a
// streaming log console.

import { motion, AnimatePresence } from "framer-motion";
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

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

const fmtK = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${Math.round(n)}`;

const fmtAgo = (min: number) => {
  if (min < 1) return "now";
  if (min < 60) return `-${Math.round(min)}m`;
  if (min < 1440) return `-${Math.round(min / 60)}h`;
  return `-${Math.round(min / 1440)}d`;
};

/* ----------------------------------- data --------------------------------- */

const RANGES = [
  { id: "1H", step: 1.25, seed: 11 },
  { id: "6H", step: 7.5, seed: 22 },
  { id: "24H", step: 30, seed: 33 },
  { id: "7D", step: 210, seed: 44 },
] as const;

type RangeId = (typeof RANGES)[number]["id"];

const N_POINTS = 48;
const TRAFFIC_BASE = 24000;

type ChartPoint = { v: number; e: number };

function genSeries(seed: number): ChartPoint[] {
  const rand = mulberry32(seed);
  const pts: ChartPoint[] = [];
  let v = TRAFFIC_BASE;
  for (let i = 0; i < N_POINTS; i++) {
    v += (rand() - 0.5) * TRAFFIC_BASE * 0.05;
    v = clamp(v, TRAFFIC_BASE * 0.55, TRAFFIC_BASE * 1.55);
    const wave = Math.sin(i / 6) * TRAFFIC_BASE * 0.12;
    let e = rand() < 0.82 ? rand() * 28 : 40 + rand() * 130;
    if (i % 16 === 7) e += 60 + rand() * 120;
    pts.push({
      v: Math.round(v + wave),
      e: Math.round(e * 10) / 10,
    });
  }
  return pts;
}

const INITIAL_SERIES: Record<RangeId, ChartPoint[]> = {
  "1H": genSeries(11),
  "6H": genSeries(22),
  "24H": genSeries(33),
  "7D": genSeries(44),
};

const rangeStep = (id: RangeId) =>
  RANGES.find((r) => r.id === id)?.step ?? 1.25;

const initialLatency = () => {
  const rand = mulberry32(7);
  return Array.from({ length: 24 }, () =>
    Math.round(130 + rand() * 30),
  );
};

type DeployStatus = "success" | "failed";

type Deploy = {
  sha: string;
  msg: string;
  author: string;
  branch: string;
  ago: string;
  status: DeployStatus;
  dur: string;
};

const INITIAL_DEPLOYS: Deploy[] = [
  {
    sha: "a3f9c2e",
    msg: "feat: streaming SSE for dashboards",
    author: "kira",
    branch: "main",
    ago: "2m",
    status: "success",
    dur: "3m 42s",
  },
  {
    sha: "91bd07f",
    msg: "fix: retry storm in billing-worker",
    author: "spence",
    branch: "hotfix/billing",
    ago: "1h",
    status: "success",
    dur: "4m 10s",
  },
  {
    sha: "d4e11aa",
    msg: "chore: bump node to 20.9.0",
    author: "lena",
    branch: "main",
    ago: "5h",
    status: "success",
    dur: "2m 58s",
  },
  {
    sha: "77c0e9b",
    msg: "feat: audit log export (csv)",
    author: "kira",
    branch: "main",
    ago: "9h",
    status: "success",
    dur: "3m 21s",
  },
  {
    sha: "2b81f5c",
    msg: "perf: cache warmup on cold start",
    author: "spence",
    branch: "main",
    ago: "14h",
    status: "failed",
    dur: "5m 04s",
  },
];

type ServiceStatus = "operational" | "degraded";

const SERVICES: {
  name: string;
  kind: string;
  status: ServiceStatus;
  uptime: string;
  p95: string;
  load: number;
}[] = [
  {
    name: "api-gateway",
    kind: "edge · 12 pods",
    status: "operational",
    uptime: "99.99%",
    p95: "124ms",
    load: 72,
  },
  {
    name: "auth-service",
    kind: "core · 6 pods",
    status: "operational",
    uptime: "100%",
    p95: "87ms",
    load: 41,
  },
  {
    name: "billing-worker",
    kind: "queue · 4 pods",
    status: "degraded",
    uptime: "99.72%",
    p95: "431ms",
    load: 93,
  },
  {
    name: "postgres-primary",
    kind: "db · rds 4xlarge",
    status: "operational",
    uptime: "99.99%",
    p95: "12ms",
    load: 58,
  },
  {
    name: "redis-cache",
    kind: "cache · 3 nodes",
    status: "operational",
    uptime: "100%",
    p95: "1.2ms",
    load: 34,
  },
  {
    name: "edge-cdn",
    kind: "cdn · 210 pops",
    status: "operational",
    uptime: "99.98%",
    p95: "38ms",
    load: 66,
  },
];

const uptimeBars = (() => {
  const rand = mulberry32(99);
  return Array.from({ length: 30 }, () => (rand() < 0.06 ? "warn" : "ok"));
})();

type LogLevel = "INFO" | "WARN" | "ERROR";

const LOG_POOL: { level: LogLevel; src: string; msg: string }[] = [
  { level: "INFO", src: "api-gateway", msg: "GET /v2/metrics 200 · 41ms" },
  { level: "INFO", src: "api-gateway", msg: "GET /v2/traffic?range=1h 200 · 63ms" },
  { level: "INFO", src: "auth-service", msg: "POST /session 201 · 88ms" },
  { level: "INFO", src: "edge-cdn", msg: "cache hit ratio 96.4%" },
  { level: "INFO", src: "scheduler", msg: "worker heartbeat ok (billing-worker)" },
  { level: "INFO", src: "postgres", msg: "autovacuum: done in 1.8s" },
  { level: "INFO", src: "redis", msg: "keyspace warm: 1,204 keys" },
  { level: "INFO", src: "autoscaler", msg: "scale api-gateway 12 to 14 pods" },
  { level: "WARN", src: "billing-worker", msg: "p95 latency 431ms over 400ms budget" },
  { level: "WARN", src: "api-gateway", msg: "connection pool at 82% capacity" },
  { level: "WARN", src: "edge-cdn", msg: "retrying stripe webhook (attempt 2/5)" },
  { level: "ERROR", src: "billing-worker", msg: "POST /v2/checkout 502 upstream timeout" },
  { level: "ERROR", src: "api-gateway", msg: "worker exited unexpectedly (code 137)" },
];

type LogLine = {
  id: number;
  time: string;
  level: LogLevel;
  src: string;
  msg: string;
};

const INITIAL_LOGS: LogLine[] = [
  { id: 1, time: "14:02:31", level: "INFO", src: "deploy", msg: "v2.4.11 healthchecks passed (12/12)" },
  { id: 2, time: "14:02:58", level: "INFO", src: "edge-cdn", msg: "cache purged for 41 keys" },
  { id: 3, time: "14:03:12", level: "WARN", src: "billing-worker", msg: "p95 latency 431ms over 400ms budget" },
  { id: 4, time: "14:03:44", level: "INFO", src: "api-gateway", msg: "GET /v2/metrics 200 · 41ms" },
  { id: 5, time: "14:04:02", level: "INFO", src: "scheduler", msg: "worker heartbeat ok (billing-worker)" },
];

const STAGES = ["Install", "Lint", "Build", "Test", "Rollout"];

const PANEL =
  "rounded-xl border border-[#1c2530] bg-[#10151c] shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]";

const PanelHeader = ({
  icon,
  title,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  right?: React.ReactNode;
}) => (
  <div className="flex items-center gap-2 border-b border-[#1c2530] px-4 py-2.5">
    <span className="text-slate-500">{icon}</span>
    <h2 className="m-0 font-mono text-xs font-medium tracking-wide text-slate-300">
      {title}
    </h2>
    {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
  </div>
);

const StatusDot = ({ status }: { status: "ok" | "warn" | "bad" | "live" }) => {
  const color =
    status === "ok"
      ? "#34d399"
      : status === "warn"
        ? "#fbbf24"
        : status === "bad"
          ? "#f87171"
          : "#22d3ee";
  return (
    <motion.span
      className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
      style={{ background: color, boxShadow: `0 0 6px ${color}` }}
      animate={status === "live" ? { opacity: [1, 0.35, 1] } : undefined}
      transition={
        status === "live"
          ? { repeat: Infinity, duration: 1.6, ease: "easeInOut" }
          : undefined
      }
    />
  );
};

const Sparkline = ({
  data,
  color,
  className = "",
}: {
  data: number[];
  color: string;
  className?: string;
}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = Math.max(1, max - min);
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 22 - ((v - min) / span) * 20;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      viewBox="0 0 100 24"
      preserveAspectRatio="none"
      className={`w-full ${className}`}
      aria-hidden
    >
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

const Delta = ({ pct, goodDown }: { pct: number; goodDown?: boolean }) => {
  const up = pct >= 0;
  const good = goodDown ? !up : up;
  return (
    <span
      className={`font-mono text-[10px] ${good ? "text-emerald-400" : "text-red-400"}`}
    >
      {up ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
    </span>
  );
};

/* --------------------------------- charts --------------------------------- */

const W = 600;
const H = 240;

const TrafficChart = ({
  series,
  step,
}: {
  series: ChartPoint[];
  step: number;
}) => {
  const [hover, setHover] = useState<number | null>(null);

  const yMax = useMemo(
    () =>
      Math.ceil(
        (Math.max(...series.map((p) => p.v)) * 1.15) / 5000,
      ) * 5000,
    [series],
  );
  const errMax = useMemo(
    () => Math.max(30, Math.max(...series.map((p) => p.e)) * 1.4),
    [series],
  );

  const paths = useMemo(() => {
    const n = series.length;
    const x = (i: number) => (i / (n - 1)) * W;
    const y = (v: number) => H - (v / yMax) * H;
    const yErr = (e: number) => H - (e / errMax) * (H * 0.5);
    const line = series
      .map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(2)},${y(p.v).toFixed(2)}`)
      .join(" ");
    const area = `${line} L${W},${H} L0,${H} Z`;
    const errLine = series
      .map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(2)},${yErr(p.e).toFixed(2)}`)
      .join(" ");
    return { line, area, errLine, x, y };
  }, [series, yMax, errMax]);

  const n = series.length;
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const idx = Math.round(((e.clientX - rect.left) / rect.width) * (n - 1));
    setHover(clamp(idx, 0, n - 1));
  };

  const xTicks = [0, 9, 19, 29, 39, n - 1];
  const hoverPt = hover !== null ? series[hover] : null;
  const hoverPct = hover !== null ? (hover / (n - 1)) * 100 : 0;

  return (
    <div className="px-4 pb-3 pt-4">
      <div className="mb-2 flex items-center gap-4 font-mono text-[10px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-3 rounded-full bg-cyan-400" />
          requests/min
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-3 rounded-full bg-red-400" />
          errors
        </span>
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 flex h-48 w-9 flex-col justify-between font-mono text-[10px] text-slate-600 sm:h-60">
          <span>{fmtK(yMax)}</span>
          <span>{fmtK(yMax / 2)}</span>
          <span>0</span>
        </div>
        <div
          className="relative ml-11 h-48 sm:h-60"
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <defs>
              <linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((f) => (
              <line
                key={f}
                x1="0"
                x2={W}
                y1={H * f}
                y2={H * f}
                stroke="#1c2530"
                strokeDasharray="3 6"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <path d={paths.area} fill="url(#trafficFill)" />
            <path
              d={paths.line}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="2"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={paths.errLine}
              fill="none"
              stroke="#f87171"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {hover !== null && (
            <>
              <div
                className="pointer-events-none absolute inset-y-0 w-px bg-slate-500/50"
                style={{ left: `${hoverPct}%` }}
              />
              <span
                className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#10151c] bg-cyan-400"
                style={{
                  left: `${hoverPct}%`,
                  top: `${(paths.y(series[hover].v) / H) * 100}%`,
                }}
              />
            </>
          )}
          {hoverPt && (
            <div
              className="pointer-events-none absolute top-1 z-10 min-w-[128px] rounded-lg border border-[#263140] bg-[#0b0f14]/95 px-3 py-2 font-mono text-[10px] leading-relaxed shadow-xl"
              style={{
                left: `${clamp(hoverPct, 14, 86)}%`,
                transform: "translateX(-50%)",
              }}
            >
              <div className="mb-1 text-slate-500">{fmtAgo((n - 1 - (hover ?? 0)) * step)} ago</div>
              <div className="flex items-center gap-1.5 text-cyan-300">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                {fmtK(hoverPt.v)} rpm
              </div>
              <div className="flex items-center gap-1.5 text-red-300">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                {Math.round(hoverPt.e)} errors
              </div>
            </div>
          )}
        </div>
        <div className="ml-11 mt-1 flex justify-between font-mono text-[10px] text-slate-600">
          {xTicks.map((i) => (
            <span key={i}>{fmtAgo((n - 1 - i) * step)}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

const Gauge = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke="#1c2530"
            strokeWidth="7"
          />
          <motion.circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${c} ${c}`}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c * (1 - value / 100) }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
            transform="rotate(-90 36 36)"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono text-sm text-slate-200">
          {Math.round(value)}%
        </span>
      </div>
      <span className="font-mono text-[10px] tracking-wider text-slate-500">
        {label}
      </span>
    </div>
  );
};

/* ---------------------------------- icons --------------------------------- */

const icon = "h-3.5 w-3.5";
const IconPulse = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M3 12h4l3-8 4 16 3-8h4" />
  </svg>
);
const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={icon}>
    <path d="M3 12h4l3-8 4 16 3-8h4" />
  </svg>
);
const IconRocket = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={icon}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
  </svg>
);
const IconServer = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={icon}>
    <rect x="3" y="4" width="18" height="7" rx="2" />
    <rect x="3" y="13" width="18" height="7" rx="2" />
    <path d="M7 7.5h.01M7 16.5h.01" />
  </svg>
);
const IconCpu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={icon}>
    <rect x="5" y="5" width="14" height="14" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
  </svg>
);
const IconTerminal = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={icon}>
    <path d="m4 6 5 6-5 6M12 18h8" />
  </svg>
);
const IconBranch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={icon}>
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="6" cy="18" r="2.5" />
    <circle cx="18" cy="8" r="2.5" />
    <path d="M6 8.5v7M18 10.5c0 3-3 4-7.5 4.5" />
  </svg>
);

/* ---------------------------------- page ---------------------------------- */

const levelColor: Record<LogLevel, string> = {
  INFO: "text-cyan-400",
  WARN: "text-amber-400",
  ERROR: "text-red-400",
};

export default function Day18() {
  const [rangeId, setRangeId] = useState<RangeId>("1H");
  const [series, setSeries] = useState<ChartPoint[]>(INITIAL_SERIES["1H"]);
  const [latencyHist, setLatencyHist] = useState<number[]>(initialLatency);
  const [cpu, setCpu] = useState(46);
  const [mem, setMem] = useState(63);
  const [deploys, setDeploys] = useState<Deploy[]>(INITIAL_DEPLOYS);
  const [logs, setLogs] = useState<LogLine[]>(INITIAL_LOGS);
  const [version, setVersion] = useState("2.4.11");
  const [deploy, setDeploy] = useState({ running: false, stage: 0 });
  const [clock, setClock] = useState("--:--:--");
  const logRef = useRef<HTMLDivElement>(null);
  const logId = useRef(INITIAL_LOGS.length + 1);

  useEffect(() => {
    const tick = setInterval(() => {
      setSeries((prev) => {
        const last = prev[prev.length - 1];
        const next: ChartPoint = {
          v: Math.round(
            clamp(
              last.v + (Math.random() - 0.48) * TRAFFIC_BASE * 0.05,
              TRAFFIC_BASE * 0.55,
              TRAFFIC_BASE * 1.55,
            ),
          ),
          e:
            Math.random() < 0.12
              ? Math.round((40 + Math.random() * 150) * 10) / 10
              : Math.round(Math.random() * 28 * 10) / 10,
        };
        return [...prev.slice(1), next];
      });
      setLatencyHist((prev) => {
        const next = clamp(
          prev[prev.length - 1] + (Math.random() - 0.5) * 16,
          88,
          380,
        );
        return [...prev.slice(1), Math.round(next)];
      });
      setCpu((c) => clamp(c + (Math.random() - 0.5) * 10, 18, 88));
      setMem((m) => clamp(m + (Math.random() - 0.5) * 4, 45, 80));
    }, 2200);

    const logTick = setInterval(() => {
      const r = Math.random();
      const pool =
        r < 0.68
          ? LOG_POOL.slice(0, 8)
          : r < 0.92
            ? LOG_POOL.slice(8, 11)
            : LOG_POOL.slice(11);
      const tpl = pool[Math.floor(Math.random() * pool.length)];
      setLogs((prev) =>
        [
          ...prev,
          {
            id: logId.current++,
            time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
            level: tpl.level,
            src: tpl.src,
            msg: tpl.msg,
          },
        ].slice(-40),
      );
    }, 1500);

    const clockTick = setInterval(() => {
      setClock(new Date().toLocaleTimeString("en-GB", { hour12: false }));
    }, 1000);

    return () => {
      clearInterval(tick);
      clearInterval(logTick);
      clearInterval(clockTick);
    };
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [logs]);

  useEffect(() => {
    if (!deploy.running) return;
    const t = setTimeout(
      () => {
        if (deploy.stage < STAGES.length - 1) {
          setDeploy((d) => ({ ...d, stage: d.stage + 1 }));
        } else {
          const sha = Math.random().toString(16).slice(2, 9);
          const nextPatch = parseInt(version.split(".")[2], 10) + 1;
          const nextVersion = `2.4.${nextPatch}`;
          setVersion(nextVersion);
          setDeploys((prev) =>
            [
              {
                sha,
                msg: `chore: release v${nextVersion}`,
                author: "you",
                branch: "main",
                ago: "now",
                status: "success" as DeployStatus,
                dur: "3m 12s",
              },
              ...prev,
            ].slice(0, 6),
          );
          setLogs((prev) =>
            [
              ...prev,
              {
                id: logId.current++,
                time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
                level: "INFO" as LogLevel,
                src: "deploy",
                msg: `v${nextVersion} rolled out to 12 edge regions`,
              },
              {
                id: logId.current++,
                time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
                level: "INFO" as LogLevel,
                src: "deploy",
                msg: "healthchecks passed (12/12)",
              },
            ].slice(-40),
          );
          setDeploy({ running: false, stage: 0 });
        }
      },
      900 + Math.random() * 500,
    );
    return () => clearTimeout(t);
  }, [deploy, version]);

  const setRange = (id: RangeId) => {
    setRangeId(id);
    setSeries(INITIAL_SERIES[id]);
  };

  const last = series[series.length - 1];
  const window = series.slice(-24);
  const mean = (arr: number[]) =>
    arr.reduce((a, b) => a + b, 0) / Math.max(1, arr.length);
  const meanReq = mean(window.map((p) => p.v));
  const meanRate =
    mean(window.map((p) => p.e / p.v)) || last.e / last.v;
  const reqDelta = ((last.v - meanReq) / meanReq) * 100;
  const errRate = (last.e / last.v) * 100;
  const errDelta = ((errRate / 100 - meanRate) / meanRate) * 100;
  const p95 = latencyHist[latencyHist.length - 1];
  const p95Delta = ((p95 - mean(latencyHist)) / mean(latencyHist)) * 100;

  const progress = ((deploy.stage + 1) / STAGES.length) * 100;

  return (
    <div
      className="flex h-full flex-col font-sans text-slate-200"
      style={{
        background:
          "radial-gradient(1100px 380px at 50% -120px, rgba(139,92,246,0.1), transparent), #0b0f14",
      }}
    >
      <RequireDarkMode />
      {/* header */}
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-[#1c2530] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400 to-fuchsia-500 text-white shadow-[0_0_16px_rgba(167,139,250,0.45)]">
            <IconPulse />
          </div>
          <span className="font-mono text-sm font-semibold tracking-tight">
            Pulse
          </span>
          <span className="rounded border border-[#263140] bg-[#0d1420] px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
            production
          </span>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-[#1c2530] bg-[#0d1420] px-3 py-1 md:flex">
          <StatusDot status="ok" />
          <span className="font-mono text-[10px] text-emerald-400">
            All systems operational
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex rounded-lg border border-[#1c2530] bg-[#0d1420] p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors ${
                  rangeId === r.id
                    ? "bg-cyan-500/15 text-cyan-300"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {r.id}
              </button>
            ))}
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => !deploy.running && setDeploy({ running: true, stage: 0 })}
            disabled={deploy.running}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[11px] font-medium ${
              deploy.running
                ? "cursor-wait bg-[#152130] text-cyan-300"
                : "bg-gradient-to-r from-emerald-500 to-cyan-500 text-[#06121a] hover:brightness-110"
            }`}
          >
            {deploy.running ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                className="inline-block h-3 w-3 rounded-full border-2 border-cyan-300/30 border-t-cyan-300"
              />
            ) : (
              <IconRocket />
            )}
            {deploy.running ? "Deploying" : "Deploy"}
          </motion.button>
        </div>
      </header>

      {/* deploy progress */}
      <AnimatePresence>
        {deploy.running && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 26, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-[#1c2530]"
          >
            <div className="flex items-center gap-3 px-4">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#152130]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", stiffness: 80, damping: 20 }}
                />
              </div>
              <span className="font-mono text-[10px] text-slate-400">
                {STAGES[deploy.stage]}
                <span className="text-slate-600">
                  {" "}
                  ({deploy.stage + 1}/{STAGES.length})
                </span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* body */}
      <main
        className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4"
        style={{
          backgroundImage:
            "radial-gradient(rgba(148,163,184,0.05) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${PANEL} col-span-1 p-4`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-wider text-slate-500">
                REQUESTS / MIN
              </span>
              <Delta pct={reqDelta} />
            </div>
            <p className="mb-2 mt-1 font-mono text-2xl text-slate-100">
              {fmtK(last.v)}
            </p>
            <Sparkline
              data={series.slice(-24).map((p) => p.v)}
              color="#22d3ee"
              className="h-7"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={`${PANEL} col-span-1 p-4`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-wider text-slate-500">
                P95 LATENCY
              </span>
              <Delta pct={p95Delta} goodDown />
            </div>
            <p className="mb-2 mt-1 font-mono text-2xl text-slate-100">
              {p95}
              <span className="text-sm text-slate-500">ms</span>
            </p>
            <Sparkline data={latencyHist} color="#a78bfa" className="h-7" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${PANEL} col-span-1 p-4`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-wider text-slate-500">
                ERROR RATE
              </span>
              <Delta pct={errDelta} goodDown />
            </div>
            <p className="mb-2 mt-1 font-mono text-2xl text-slate-100">
              {errRate.toFixed(2)}
              <span className="text-sm text-slate-500">%</span>
            </p>
            <Sparkline
              data={series.slice(-24).map((p) => p.e)}
              color="#f87171"
              className="h-7"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`${PANEL} col-span-2 p-4 lg:col-span-1`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-wider text-slate-500">
                UPTIME · 30D
              </span>
              <span className="font-mono text-[10px] text-emerald-400">
                SLA ✓
              </span>
            </div>
            <p className="mb-2 mt-1 font-mono text-2xl text-slate-100">
              99.98
              <span className="text-sm text-slate-500">%</span>
            </p>
            <div className="flex h-7 items-end gap-[3px]">
              {uptimeBars.map((b, i) => (
                <span
                  key={i}
                  className={`h-5 w-1.5 rounded-sm ${
                    b === "ok" ? "bg-emerald-400/80" : "bg-amber-400/90"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${PANEL} lg:col-span-2`}
          >
            <PanelHeader
              icon={<IconChart />}
              title="traffic / api-gateway"
              right={
                <span className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
                  <StatusDot status="live" /> live
                </span>
              }
            />
            <TrafficChart series={series} step={rangeStep(rangeId)} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={`${PANEL} flex flex-col`}
          >
            <PanelHeader
              icon={<IconRocket />}
              title="recent deploys"
              right={
                <span className="font-mono text-[10px] text-slate-500">
                  main @ {deploys[0].sha}
                </span>
              }
            />
            <div className="flex-1 divide-y divide-[#161d27]">
              {deploys.map((d) => (
                <div key={d.sha} className="flex items-center gap-3 px-4 py-2.5">
                  {d.status === "success" ? (
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15 font-mono text-[10px] text-emerald-400">
                      ✓
                    </span>
                  ) : (
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-500/15 font-mono text-[10px] text-red-400">
                      ✕
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate font-mono text-[11px] text-slate-300">
                      {d.msg}
                    </p>
                    <p className="m-0 font-mono text-[10px] text-slate-500">
                      {d.sha} · {d.author} · {d.branch}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right font-mono text-[10px] text-slate-500">
                    <p className="m-0 text-slate-400">{d.ago}</p>
                    <p className="m-0">{d.dur}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${PANEL}`}
          >
            <PanelHeader
              icon={<IconServer />}
              title="services"
              right={
                <span className="font-mono text-[10px] text-slate-500">
                  5/6 healthy
                </span>
              }
            />
            <div className="divide-y divide-[#161d27]">
              {SERVICES.map((s) => (
                <div key={s.name} className="flex items-center gap-2.5 px-4 py-2">
                  <StatusDot
                    status={s.status === "operational" ? "ok" : "warn"}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate font-mono text-[11px] text-slate-300">
                      {s.name}
                    </p>
                    <p className="m-0 font-mono text-[10px] text-slate-500">
                      {s.kind}
                    </p>
                  </div>
                  <span className="hidden font-mono text-[10px] text-slate-400 sm:inline">
                    {s.uptime}
                  </span>
                  <span className="hidden w-12 text-right font-mono text-[10px] text-slate-400 sm:inline">
                    {s.p95}
                  </span>
                  <div className="h-1 w-10 overflow-hidden rounded-full bg-[#152130]">
                    <div
                      className={`h-full rounded-full ${
                        s.load > 85
                          ? "bg-amber-400"
                          : "bg-cyan-400/80"
                      }`}
                      style={{ width: `${s.load}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className={`${PANEL}`}
          >
            <PanelHeader
              icon={<IconCpu />}
              title="resources"
              right={
                <span className="font-mono text-[10px] text-slate-500">
                  us-east-1
                </span>
              }
            />
            <div className="flex items-center justify-around px-4 py-5">
              <Gauge label="CPU" value={cpu} color="#22d3ee" />
              <Gauge label="MEM" value={mem} color="#a78bfa" />
              <Gauge label="DISK" value={61} color="#34d399" />
            </div>
            <div className="border-t border-[#161d27] px-4 py-2.5 font-mono text-[10px] text-slate-500">
              c5.2xlarge · 8 vCPU · 16 GB · autoscaling on
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`${PANEL} flex flex-col`}
          >
            <PanelHeader
              icon={<IconTerminal />}
              title="logs — prod/us-east-1"
              right={
                <span className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
                  <StatusDot status="live" /> streaming
                </span>
              }
            />
            <div
              ref={logRef}
              className="h-56 flex-1 overflow-y-auto px-3 py-2 font-mono text-[11px] leading-relaxed"
            >
              {logs.map((l) => (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-2 rounded px-1 py-0.5 ${
                    l.level === "ERROR" ? "bg-red-500/5" : ""
                  }`}
                >
                  <span className="flex-shrink-0 text-slate-600">{l.time}</span>
                  <span
                    className={`flex-shrink-0 w-11 ${levelColor[l.level]}`}
                  >
                    {l.level}
                  </span>
                  <span className="hidden flex-shrink-0 text-slate-500 sm:inline">
                    {l.src}
                  </span>
                  <span className="text-slate-300">{l.msg}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      {/* status bar */}
      <footer className="flex items-center justify-between border-t border-[#1c2530] px-4 py-2 font-mono text-[10px] text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-400">
            <IconBranch /> main ⇡2
          </span>
          <span className="hidden items-center gap-1.5 sm:flex">
            <StatusDot status="ok" /> production · us-east-1
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">p95 {p95}ms</span>
          <span className="hidden text-violet-300 sm:inline">v{version}</span>
          <span className="text-slate-400">{clock}</span>
        </div>
      </footer>
    </div>
  );
}
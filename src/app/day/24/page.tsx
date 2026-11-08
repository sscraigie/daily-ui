"use client";

// Day 24 - Boarding Pass
// A premium boarding pass for "Meridian Air" rendered as an interactive card:
// 3D tilt that follows the cursor, a live boarding countdown, a route strip
// with a plane that taxis forward once you scan, a perforated stub with a
// seeded barcode + QR code, a flip side with flight details, and a
// gate-scanner simulation that stamps the pass "BOARDED".

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { RequireDarkMode } from "@/components/ThemeProvider";

/* --------------------------------- data ----------------------------------- */

const FLIGHT = {
  airline: "MERIDIAN AIR",
  number: "MR 247",
  from: {
    code: "SFO",
    city: "San Francisco",
    terminal: "International Terminal A",
  },
  to: { code: "HND", city: "Tokyo Haneda", terminal: "Terminal 3" },
  passenger: "ALEXANDER J. MORGAN",
  shortName: "A. MORGAN",
  klass: "Polaris Suite",
  seat: "4A",
  gate: "G14",
  group: "1",
  flightTime: "11h 05m",
  distance: "5,150 mi",
  aircraft: "Boeing 787-9 Dreamliner",
  bags: "2 × 23 kg",
  lounge: "Meridian Lounge · Concourse G",
  wifi: "Meridian Wi-Fi, gate to gate",
  meal: "Pacific coastal tasting menu",
};

/* ------------------------------- utilities -------------------------------- */

/** Tiny deterministic hash → pseudo-random stream, so barcodes/QRs are
 *  stable across renders and server/client without a library. */
function makeRng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

const Barcode = ({ seed }: { seed: string }) => {
  const bars = useMemo(() => {
    const rng = makeRng(seed);
    return Array.from({ length: 46 }, () => {
      const r = rng();
      return r < 0.42 ? 2 : r < 0.78 ? 4 : 7;
    });
  }, [seed]);
  return (
    <div className="flex h-9 w-full items-stretch gap-[2px] sm:h-12">
      {bars.map((w, i) => (
        <div key={i} style={{ flexGrow: w }} className="bg-[#1c1c22]" />
      ))}
    </div>
  );
};

const QR = ({ seed, size = 105 }: { seed: string; size?: number }) => {
  const grid = useMemo(() => {
    const n = 21;
    const rng = makeRng(seed);
    const cells: boolean[][] = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => rng() > 0.5),
    );
    // Draw the three finder patterns over the random noise.
    const finder = (r0: number, c0: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const d = Math.max(Math.abs(r - 3), Math.abs(c - 3));
          cells[r0 + r][c0 + c] = d === 3 || d <= 1;
        }
      }
    };
    finder(0, 0);
    finder(0, n - 7);
    finder(n - 7, 0);
    return cells;
  }, [seed]);
  const cell = size / 21;
  return (
    <div
      style={{ width: size, height: size }}
      className="flex flex-col bg-white p-[4px]"
    >
      {grid.map((row, r) => (
        <div key={r} className="flex" style={{ height: cell }}>
          {row.map((on, c) => (
            <div
              key={c}
              style={{
                width: cell,
                backgroundColor: on ? "#1c1c22" : "#ffffff",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const PlaneMark = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden
  >
    <path d="M12 2.5c.6 0 1.1.5 1.1 1.2v6l7.4 4.3c.3.2.5.5.5.9v1.3l-7.9-2.4v4.6l2.4 1.9v1.5L12 21.2l-3.5 1.6v-1.5l2.4-1.9v-4.6L3 17.2v-1.3c0-.4.2-.7.5-.9L10.9 9.7v-6c0-.7.5-1.2 1.1-1.2z" />
  </svg>
);

/* ------------------------------ small pieces ------------------------------ */

const Label = ({
  children,
  dark = true,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) => (
  <p
    className={
      "text-[9px] font-bold uppercase tracking-[0.18em] " +
      (dark ? "text-slate-500" : "text-[#8a8577]")
    }
  >
    {children}
  </p>
);

const Value = ({
  children,
  size = "text-xl",
  dark = true,
  mono = false,
}: {
  children: React.ReactNode;
  size?: string;
  dark?: boolean;
  mono?: boolean;
}) => (
  <p
    className={
      `${size} font-black leading-tight ` +
      (dark ? "text-slate-100 " : "text-[#1c1c22] ") +
      (mono ? "tracking-wide" : "")
    }
    style={{ fontVariantNumeric: "tabular-nums" }}
  >
    {children}
  </p>
);

/* --------------------------------- page ----------------------------------- */

type Status = "idle" | "scanning" | "boarded";

export default function Day24() {
  return (
    <>
      <RequireDarkMode />
      <Pass />
    </>
  );
}

function Pass() {
  // Time-dependent values are computed only after mount. Rendering them
  // during SSR caused hydration mismatches (server timezone vs browser
  // timezone), so until the effect runs both server and client render
  // the same deterministic placeholders.
  const [tick, setTick] = useState(0);
  const [schedule, setSchedule] = useState<{
    boardingAt: number;
    today: string;
  } | null>(null);

  useEffect(() => {
    setSchedule({
      // Demo schedule: boarding in ~7 minutes, departure 40 minutes later.
      boardingAt: Date.now() + 7 * 60_000 + 20_000,
      today: new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    });
    setTick(Date.now());
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const boardingAt = schedule?.boardingAt ?? 0;
  const departureAt = boardingAt + 40 * 60_000;
  const today = schedule?.today ?? "—";

  const [status, setStatus] = useState<Status>("idle");
  const [flipped, setFlipped] = useState(false);
  const [progress, setProgress] = useState(14); // plane position along route, %

  /* ---- cursor tilt ---- */
  const wrapRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 140, damping: 18 });
  const sy = useSpring(my, { stiffness: 140, damping: 18 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [7, -7]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [-6, 6]);

  const onMove = (e: React.MouseEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  /* ---- countdown ---- */
  const ready = schedule !== null && tick > 0;
  const secsToBoarding = ready
    ? Math.max(0, Math.floor((boardingAt - tick) / 1000))
    : 0;
  const mm = String(Math.floor(secsToBoarding / 60)).padStart(2, "0");
  const ss = String(secsToBoarding % 60).padStart(2, "0");
  const countdown = !ready
    ? "Preparing…"
    : secsToBoarding > 0
    ? `Boarding in ${mm}:${ss}`
    : status === "boarded"
    ? "Welcome aboard"
    : "Final call";
  const urgency = ready && secsToBoarding === 0 && status !== "boarded";

  /* ---- scan ---- */
  const scan = () => {
    if (status !== "idle") return;
    setStatus("scanning");
    setTimeout(() => {
      setStatus("boarded");
      setProgress(64);
    }, 1700);
  };

  const fmtTime = (t: number) =>
    new Date(t).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  const boardingTime = ready ? fmtTime(boardingAt) : "--:--";
  const departureTime = ready ? fmtTime(departureAt) : "--:--";

  return (
    <div
      className="relative flex h-full flex-col items-center overflow-y-auto overflow-x-hidden px-4 py-6 sm:py-10"
      style={{
        background:
          "radial-gradient(1200px 600px at 50% -10%, #131b36 0%, #090d1c 45%, #05070f 100%)",
      }}
    >
      {/* runway lights sweeping in the background */}
      {[18, 42, 66, 90].map((top, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute h-px w-40"
          style={{
            top: `${top}%`,
            background:
              "linear-gradient(90deg, transparent, rgba(232,182,76,0.35), transparent)",
          }}
          animate={{ x: ["-15vw", "110vw"] }}
          transition={{
            duration: 14 + i * 4,
            repeat: Infinity,
            ease: "linear",
            delay: i * 3,
          }}
        />
      ))}

      <div className="my-auto flex w-full max-w-[860px] flex-col">
        {/* header */}
        <header className="mb-4 flex w-full items-center justify-between sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e8b64c]/40 bg-[#e8b64c]/10">
              <PlaneMark className="h-4 w-4 text-[#e8b64c]" />
            </div>
            <div>
              <p className="text-sm font-black tracking-[0.3em] text-slate-100">
                MERIDIAN AIR
              </p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
                Departures · Gate information
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
              Flight
            </p>
            <p
              className="text-lg font-black text-[#e8b64c]"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              MR 247
            </p>
          </div>
        </header>

        {/* pass wrapper: tilt + flip */}
        <div
          ref={wrapRef}
          onMouseMove={onMove}
          onMouseLeave={() => {
            mx.set(0);
            my.set(0);
          }}
          style={{ perspective: 1400 }}
          className="w-full"
        >
          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          >
            <motion.div
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 160, damping: 20 }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative"
            >
              {/* ------------------------------- FRONT ------------------------------ */}
              <div
                className="relative flex flex-col overflow-hidden rounded-3xl border border-white/10 sm:h-[430px] sm:flex-row"
                style={{
                  background:
                    "linear-gradient(150deg, #161d33 0%, #10152b 55%, #0b1022 100%)",
                  boxShadow:
                    "0 30px 80px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
                  backfaceVisibility: "hidden",
                }}
              >
                {/* gold top hairline */}
                <div
                  className="absolute inset-x-0 top-0 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(232,182,76,0.8), transparent)",
                  }}
                />

                {/* main body */}
                <div className="flex min-w-0 flex-1 flex-col p-6 sm:p-8">
                  {/* airline row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <PlaneMark className="h-5 w-5 text-[#e8b64c]" />
                      <span className="text-[11px] font-black tracking-[0.3em] text-slate-200">
                        {FLIGHT.airline}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
                      Boarding pass
                    </span>
                  </div>

                  {/* route strip */}
                  <div className="relative mt-7 flex items-end justify-between sm:mt-8">
                    <div>
                      <Value size="text-3xl sm:text-5xl">
                        {FLIGHT.from.code}
                      </Value>
                      <p className="mt-1 max-w-[130px] text-[11px] font-semibold text-slate-400">
                        {FLIGHT.from.city}
                      </p>
                    </div>

                    <div className="relative mx-4 mb-4 hidden flex-1 sm:block">
                      <div
                        className="h-px w-full"
                        style={{
                          background:
                            "repeating-linear-gradient(90deg, rgba(232,182,76,0.55) 0 8px, transparent 8px 16px)",
                        }}
                      />
                      {/* origin + destination dots */}
                      <div className="absolute left-0 top-1/2 h-2 w-2 -translate-x-1 -translate-y-1/2 rounded-full bg-[#e8b64c]" />
                      <div className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 translate-x-1 rounded-full border border-[#e8b64c]" />
                      {/* the plane taxis along the strip */}
                      <motion.div
                        className="absolute top-1/2"
                        style={{ left: `${progress}%`, x: "-50%", y: "-50%" }}
                        animate={{ left: `${progress}%` }}
                        transition={{
                          type: "spring",
                          stiffness: 50,
                          damping: 16,
                        }}
                      >
                        <motion.div
                          animate={{ y: [-2, 0, -2] }}
                          transition={{
                            duration: 2.4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e8b64c]/30 bg-[#141b33] shadow-[0_0_18px_rgba(232,182,76,0.25)]"
                        >
                          <PlaneMark className="h-3.5 w-3.5 rotate-90 text-[#e8b64c]" />
                        </motion.div>
                      </motion.div>
                    </div>

                    <div className="text-right">
                      <Value size="text-3xl sm:text-5xl">
                        {FLIGHT.to.code}
                      </Value>
                      <p className="mt-1 text-right text-[11px] font-semibold text-slate-400">
                        {FLIGHT.to.city}
                      </p>
                    </div>
                  </div>
                  {/* route strip on mobile (inline) */}
                  <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-slate-500 sm:hidden">
                    <span>{FLIGHT.from.city}</span>
                    <PlaneMark className="h-3 w-3 rotate-90 text-[#e8b64c]" />
                    <span>{FLIGHT.to.city}</span>
                  </div>

                  {/* detail grid */}
                  <div className="mt-5 grid grid-cols-3 gap-x-3 gap-y-3 sm:mt-auto sm:grid-cols-5 sm:gap-x-4 sm:gap-y-0 sm:pt-8">
                    <div>
                      <Label>Passenger</Label>
                      <p className="mt-1 text-xs font-bold leading-snug text-slate-100 sm:text-sm">
                        {FLIGHT.passenger}
                      </p>
                    </div>
                    <div>
                      <Label>Date</Label>
                      <p
                        className="mt-1 text-xs font-bold text-slate-100 sm:text-sm"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {today}
                      </p>
                    </div>
                    <div>
                      <Label>Class</Label>
                      <p className="mt-1 text-xs font-bold text-slate-100 sm:text-sm">
                        {FLIGHT.klass}
                      </p>
                    </div>
                    <div>
                      <Label>Boarding</Label>
                      <Value size="text-lg sm:text-xl">{boardingTime}</Value>
                    </div>
                    <div>
                      <Label>Departs</Label>
                      <Value size="text-lg sm:text-xl">{departureTime}</Value>
                    </div>
                  </div>

                  {/* action row */}
                  <div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-8 sm:gap-3">
                    <motion.button
                      onClick={scan}
                      disabled={status !== "idle"}
                      whileTap={status === "idle" ? { scale: 0.96 } : undefined}
                      className={
                        "relative overflow-hidden rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-colors sm:px-5 sm:py-2.5 sm:text-[11px] sm:tracking-[0.2em] " +
                        (status === "boarded"
                          ? "bg-emerald-400/15 cursor-default text-emerald-300"
                          : status === "scanning"
                          ? "bg-[#e8b64c]/20 text-[#e8b64c]"
                          : "bg-[#e8b64c] text-[#1a1408] hover:bg-[#f2c75c]")
                      }
                    >
                      {status === "idle" && "Scan at gate"}
                      {status === "scanning" && "Scanning…"}
                      {status === "boarded" && "Checked in ✓"}
                    </motion.button>

                    <button
                      onClick={() => setFlipped((f) => !f)}
                      className="border-white/15 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-300 transition-colors hover:border-[#e8b64c]/50 hover:text-[#e8b64c] sm:px-5 sm:py-2.5 sm:text-[11px] sm:tracking-[0.2em]"
                    >
                      Flight details
                    </button>

                    {/* live countdown */}
                    <motion.div
                      animate={
                        urgency ? { opacity: [1, 0.45, 1] } : { opacity: 1 }
                      }
                      transition={{
                        duration: 1.1,
                        repeat: urgency ? Infinity : 0,
                      }}
                      className="ml-auto text-right"
                    >
                      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        {urgency ? "Final call · Gate closes" : "Gate status"}
                      </p>
                      <p
                        className={
                          "text-xs font-black " +
                          (status === "boarded"
                            ? "text-emerald-300"
                            : urgency
                            ? "text-amber-400"
                            : "text-slate-200")
                        }
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {countdown} · {FLIGHT.gate}
                      </p>
                    </motion.div>
                  </div>
                </div>

                {/* perforation + notches */}
                <div className="relative shrink-0 sm:w-[230px]">
                  {/* vertical perforation (desktop) */}
                  <div
                    className="absolute left-0 top-0 hidden h-full w-px sm:block"
                    style={{
                      background:
                        "repeating-linear-gradient(180deg, rgba(232,182,76,0.4) 0 10px, transparent 10px 20px)",
                    }}
                  />
                  {/* horizontal perforation (mobile) */}
                  <div
                    className="absolute left-0 right-0 top-0 h-px sm:hidden"
                    style={{
                      background:
                        "repeating-linear-gradient(90deg, rgba(232,182,76,0.4) 0 10px, transparent 10px 20px)",
                    }}
                  />
                  <Stub status={status} />
                </div>
              </div>

              {/* -------------------------------- BACK ------------------------------ */}
              <div
                className="absolute inset-0 flex flex-col overflow-hidden rounded-3xl border border-white/10 p-6 sm:p-8"
                style={{
                  background:
                    "linear-gradient(150deg, #1a2138 0%, #10152b 60%, #0b1022 100%)",
                  boxShadow: "0 30px 80px -20px rgba(0,0,0,0.7)",
                  transform: "rotateY(180deg)",
                  backfaceVisibility: "hidden",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
                    Flight details · MR 247
                  </span>
                  <button
                    onClick={() => setFlipped(false)}
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e8b64c] hover:text-[#f2c75c]"
                  >
                    Back to pass
                  </button>
                </div>

                <div className="mt-6 grid flex-1 grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
                  {[
                    ["Aircraft", FLIGHT.aircraft],
                    ["Flight time", FLIGHT.flightTime],
                    ["Distance", FLIGHT.distance],
                    ["Terminal", FLIGHT.from.terminal],
                    ["Arrival", FLIGHT.to.terminal],
                    ["Cabin baggage", FLIGHT.bags],
                    ["Lounge access", FLIGHT.lounge],
                    ["On board", FLIGHT.wifi],
                    ["Dining", FLIGHT.meal],
                  ].map(([k, v]) => (
                    <div key={k as string}>
                      <Label>{k}</Label>
                      <p className="mt-1 text-[13px] font-bold leading-snug text-slate-100">
                        {v}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#e8b64c]/20 bg-[#e8b64c]/5 p-4">
                  <PlaneMark className="h-5 w-5 shrink-0 text-[#e8b64c]" />
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    Cabin doors close{" "}
                    <b className="text-slate-100">
                      10 minutes prior to departure
                    </b>
                    . Please arrive at the gate no later than {boardingTime} —
                    pre-boarding for Group {FLIGHT.group} begins {boardingTime}.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <p className="mt-4 text-[10px] tracking-wide text-slate-600 sm:mt-8 sm:text-[11px]">
          Move your cursor over the pass to tilt it · scan to board · flip for
          flight details
        </p>
      </div>
    </div>
  );
}

/* --------------------------------- stub ----------------------------------- */

function Stub({ status }: { status: Status }) {
  return (
    <motion.div
      animate={
        status === "boarded"
          ? {
              boxShadow: [
                "0 0 0 0 rgba(52,211,153,0.5)",
                "0 0 0 14px rgba(52,211,153,0)",
              ],
            }
          : { boxShadow: "0 0 0 0 rgba(0,0,0,0)" }
      }
      transition={{ duration: 0.9 }}
      className="relative flex h-full flex-col items-center gap-2 bg-[#f4efe4] p-4 sm:min-h-[260px] sm:gap-3 sm:p-6"
    >
      {/* notch cutouts */}
      <div className="absolute left-1/2 top-0 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0a0e1d] sm:hidden" />
      <div className="absolute left-0 top-1/2 hidden h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0a0e1d] sm:block" />
      <div className="absolute bottom-0 left-1/2 h-5 w-5 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#0a0e1d] sm:hidden" />

      <div className="w-full">
        <Label dark={false}>Flight</Label>
        <div className="mt-1 flex items-baseline justify-between">
          <p className="text-xl font-black text-[#1c1c22]">MR 247</p>
          <p
            className="text-xs font-bold text-[#8a8577]"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            SFO → HND
          </p>
        </div>
      </div>

      <div className="grid w-full grid-cols-2 gap-2 sm:gap-3">
        <div>
          <Label dark={false}>Seat</Label>
          <p className="text-xl font-black leading-tight text-[#1c1c22] sm:text-2xl">
            4A
          </p>
        </div>
        <div>
          <Label dark={false}>Gate</Label>
          <p className="text-xl font-black leading-tight text-[#1c1c22] sm:text-2xl">
            G14
          </p>
        </div>
        <div>
          <Label dark={false}>Group</Label>
          <p className="text-lg font-black leading-tight text-[#1c1c22]">1</p>
        </div>
        <div>
          <Label dark={false}>Class</Label>
          <p className="text-[13px] font-black uppercase leading-tight text-[#1c1c22]">
            Polaris
          </p>
        </div>
      </div>

      {/* scan target */}
      <div className="mt-auto flex w-full items-end justify-between gap-3">
        <div className="relative min-w-0 flex-1 overflow-hidden rounded-md">
          <Barcode seed="MR247-4A-G14" />
          {/* scanner sweep */}
          <AnimatePresence>
            {status === "scanning" && (
              <motion.div
                key="scanline"
                initial={{ top: "-10%" }}
                animate={{ top: "105%" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
                className="absolute left-0 right-0 h-1.5"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #ef4444, transparent)",
                  boxShadow: "0 0 14px 3px rgba(239,68,68,0.55)",
                }}
              />
            )}
          </AnimatePresence>
        </div>
        <QR seed="MERIDIAN-MR247" size={64} />
      </div>

      <p className="w-full text-center text-[8px] font-bold uppercase tracking-[0.2em] text-[#8a8577]">
        Meridianair.com · valid form of ID required
      </p>

      {/* BOARDED stamp */}
      <AnimatePresence>
        {status === "boarded" && (
          <motion.div
            initial={{ opacity: 0, scale: 2.4, rotate: -18 }}
            animate={{ opacity: 1, scale: 1, rotate: -12 }}
            transition={{ type: "spring", stiffness: 260, damping: 14 }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="rounded-lg border-[3px] border-emerald-600/80 px-4 py-2">
              <p className="text-xl font-black uppercase tracking-[0.2em] text-emerald-600/90">
                Boarded
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

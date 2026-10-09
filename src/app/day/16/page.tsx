"use client";

// Day 16 - Pop-Up / Overlay
// A lovingly terrible parody of a sketchy 90s download site: popups spawn
// constantly, and sneaking the cursor toward any edge of the page (i.e. trying
// to leave) triggers a full exit-intent takeover. The only way out is
// "Popup Blocker Pro".

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactCanvasConfetti from "react-canvas-confetti";
import type { CreateTypes, Options } from "canvas-confetti";
import SiteContent from "./components/SiteContent";
import PopupWindow, { META, type PopupData, type PopupKind } from "./components/PopupWindow";
import ExitIntent from "./components/ExitIntent";

const MAX_ALIVE = 12;
const EDGE_PX = 30;
const SPAWN_MS = 6200;
const TAKEOVER_COOLDOWN_MS = 9000;

const RANDOM_KINDS: PopupKind[] = [
  "winner",
  "virus",
  "ram",
  "singles",
  "crypto",
  "survey",
  "download",
];

const RUDE_MSGS = [
  "RUDE. Fine. Here is another one.",
  "You can't close me. I'm persistent.",
  "lol nope.",
  "Your PC misses me already.",
  "I told Gary you closed me. He's disappointed.",
  "Are you SURE? I was about to give you a FREE iPhone*",
];

const DAY_16_CSS = `
.font-comic { font-family: 'Comic Sans MS','Comic Sans','Chalkboard SE','Segoe Print',cursive; }
.reset90s h1, .reset90s h2, .reset90s h3, .reset90s p { margin: 0; }
.rainbow-text {
  background: linear-gradient(90deg,#ff00ff,#00ffff,#ffff00,#ff00ff);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: hue 3s linear infinite;
}
@keyframes hue { to { filter: hue-rotate(360deg); } }
.animate-blink { animation: blink90s 1s steps(2, start) infinite; }
@keyframes blink90s { to { visibility: hidden; } }
.marquee-track { display: inline-flex; animation: marquee90s 22s linear infinite; }
@keyframes marquee90s { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.flash-border { animation: flashborder 0.7s linear infinite; }
@keyframes flashborder {
  0% { border-color: #ff0; } 25% { border-color: #f0f; }
  50% { border-color: #0ff; } 75% { border-color: #f00; } 100% { border-color: #ff0; }
}
.shimmer { position: relative; overflow: hidden; }
.shimmer::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(100deg, transparent 20%, rgba(255,255,255,0.75) 50%, transparent 80%);
  animation: shimmermove 1.2s linear infinite;
}
@keyframes shimmermove { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
`;

function OneShotConfetti() {
  const confettiRef = useRef<CreateTypes | null>(null);
  useEffect(() => {
    const confetti = confettiRef.current;
    if (!confetti) return;
    const shot = (ratio: number, options: Options) =>
      confetti({ ...options, origin: { y: 0.6 }, particleCount: Math.floor(180 * ratio) });
    shot(0.25, { spread: 26, startVelocity: 55 });
    shot(0.2, { spread: 60 });
    shot(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    shot(0.2, { spread: 120, startVelocity: 45 });
    return () => confettiRef.current?.reset();
  }, []);
  return (
    <ReactCanvasConfetti
      refConfetti={(instance) => {
        confettiRef.current = instance;
      }}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 400,
      }}
    />
  );
}

export default function PopupOverlay() {
  const [popups, setPopups] = useState<PopupData[]>([]);
  const [closedCount, setClosedCount] = useState(0);
  const [blocker, setBlocker] = useState<"locked" | "available" | "installing" | "active">(
    "locked"
  );
  const [blockerPct, setBlockerPct] = useState(0);
  const [takeoverOpen, setTakeoverOpen] = useState(false);
  const [showSilence, setShowSilence] = useState(false);
  const [confettiOn, setConfettiOn] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const zRef = useRef(40);
  const cooldownRef = useRef(0);
  const fallbackCooldownRef = useRef(0);
  const hasMouseRef = useRef(false);
  const popupsRef = useRef<PopupData[]>([]);
  const blockerRef = useRef(blocker);
  const takeoverRef = useRef(takeoverOpen);
  const closedRef = useRef(closedCount);

  useEffect(() => {
    popupsRef.current = popups;
  }, [popups]);
  useEffect(() => {
    blockerRef.current = blocker;
  }, [blocker]);
  useEffect(() => {
    takeoverRef.current = takeoverOpen;
  }, [takeoverOpen]);
  useEffect(() => {
    closedRef.current = closedCount;
  }, [closedCount]);

  const spawnOne = useCallback((kind?: PopupKind, msg?: string) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const w = rect?.width ?? 1200;
    const h = rect?.height ?? 700;
    const pw = Math.min(330, Math.max(200, w - 24));
    const margin = 56;
    const x = margin + Math.random() * Math.max(1, w - pw - margin * 2);
    const yMax = Math.max(margin, h - 390);
    const y = margin + Math.random() * Math.max(1, yMax - margin);
    const finalKind =
      kind ?? RANDOM_KINDS[Math.floor(Math.random() * RANDOM_KINDS.length)];
    const data: PopupData = {
      id: ++idRef.current,
      kind: finalKind,
      x,
      y,
      w: pw,
      z: ++zRef.current,
      rot: Math.random() * 4 - 2,
      msg,
    };
    setPopups((prev) => (prev.length >= MAX_ALIVE ? prev : [...prev, data]));
  }, []);

  const chaos = useCallback(
    (n = 1, kind?: PopupKind) => {
      for (let i = 0; i < n; i++) spawnOne(kind);
    },
    [spawnOne]
  );

  const closePopup = useCallback(
    (id: number) => {
      const p = popupsRef.current.find((x) => x.id === id);
      setPopups((prev) => prev.filter((x) => x.id !== id));
      setClosedCount((c) => c + 1);
      if (blockerRef.current === "active" || !p) return;
      if (p.kind === "virus" && Math.random() < 0.4) {
        spawnOne("virus");
      } else if (p.kind !== "rude" && p.kind !== "kidding" && Math.random() < 0.3) {
        spawnOne("rude", RUDE_MSGS[Math.floor(Math.random() * RUDE_MSGS.length)]);
      }
    },
    [spawnOne]
  );

  const triggerTakeover = useCallback(() => {
    const now = Date.now();
    if (takeoverRef.current) return;
    if (blockerRef.current !== "locked" && blockerRef.current !== "available") return;
    if (now < cooldownRef.current) return;
    cooldownRef.current = now + TAKEOVER_COOLDOWN_MS;
    setTakeoverOpen(true);
  }, []);

  const installRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pctRef = useRef(0);

  const installBlocker = useCallback(() => {
    if (blockerRef.current !== "available") return;
    pctRef.current = 0;
    setBlockerPct(0);
    setBlocker("installing");
    installRef.current = setInterval(() => {
      pctRef.current = Math.min(
        100,
        pctRef.current + 2 + Math.floor(Math.random() * 5)
      );
      setBlockerPct(pctRef.current);
      if (pctRef.current >= 100 && installRef.current) {
        clearInterval(installRef.current);
        installRef.current = null;
        setPopups([]);
        setBlocker("active");
      }
    }, 70);
  }, []);

  useEffect(() => {
    if (blocker !== "active") return;
    setConfettiOn(true);
    setShowSilence(true);
    const t1 = setTimeout(() => setConfettiOn(false), 2600);
    const t2 = setTimeout(() => {
      spawnOne(
        "kidding",
        `Popup Blocker Pro activated! You closed ${closedRef.current} popups. Ahhh… silence. (No more will spawn. Probably.)`
      );
    }, 3400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [blocker, spawnOne]);

  useEffect(() => {
    if (closedCount >= 8 && blocker === "locked") setBlocker("available");
  }, [closedCount, blocker]);

  useEffect(
    () => () => {
      if (installRef.current) clearInterval(installRef.current);
    },
    []
  );

  useEffect(() => {
    const first = setTimeout(() => spawnOne("winner"), 1100);
    return () => clearTimeout(first);
  }, [spawnOne]);

  useEffect(() => {
    if (takeoverOpen || blocker === "active" || blocker === "installing") return;
    const t = setInterval(() => {
      if (takeoverRef.current) return;
      if (blockerRef.current !== "locked" && blockerRef.current !== "available") return;
      if (popupsRef.current.length < MAX_ALIVE) spawnOne();
    }, SPAWN_MS);
    return () => clearInterval(t);
  }, [takeoverOpen, blocker, spawnOne]);

  useEffect(() => {
    const mountAt = Date.now();
    const onMove = (e: MouseEvent) => {
      hasMouseRef.current = true;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const { clientX: x, clientY: y } = e;
      const near =
        x < rect.left + EDGE_PX ||
        x > rect.right - EDGE_PX ||
        y < rect.top + EDGE_PX ||
        y > rect.bottom - EDGE_PX;
      if (near) triggerTakeover();
    };
    const onLeave = () => {
      hasMouseRef.current = true;
      triggerTakeover();
    };
    const fallback = setInterval(() => {
      if (hasMouseRef.current) return;
      if (Date.now() - mountAt < 15000) return;
      if (Date.now() < fallbackCooldownRef.current) return;
      fallbackCooldownRef.current = Date.now() + 45000;
      triggerTakeover();
    }, 3000);
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      clearInterval(fallback);
    };
  }, [triggerTakeover]);

  const handleTakeoverClose = useCallback(
    (punished: boolean) => {
      setTakeoverOpen(false);
      cooldownRef.current = Date.now() + TAKEOVER_COOLDOWN_MS;
      if (punished) chaos(3);
    },
    [chaos]
  );

  const focusPopup = useCallback((id: number) => {
    setPopups((prev) =>
      prev.map((p) => (p.id === id ? { ...p, z: ++zRef.current } : p))
    );
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full select-none overflow-hidden bg-black"
    >
      <style dangerouslySetInnerHTML={{ __html: DAY_16_CSS }} />

      <div className="reset90s h-full w-full">
        <SiteContent chaos={chaos} blockerActive={blocker === "active"} />
      </div>

      <AnimatePresence>
        {popups.map((p) => (
          <PopupWindow
            key={p.id}
            data={p}
            constraints={containerRef}
            onClose={() => closePopup(p.id)}
            spawn={(kind, msg) => spawnOne(kind, msg)}
          />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {takeoverOpen && <ExitIntent onClose={handleTakeoverClose} />}
      </AnimatePresence>

      <AnimatePresence>
        {showSilence && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="pointer-events-none absolute inset-0 z-[280] flex items-center justify-center p-4"
          >
            <div
              className="pointer-events-auto max-w-sm border-[3px] bg-[#d4d0c8] p-1 text-center shadow-[6px_6px_0_rgba(0,0,0,0.6)]"
              style={{ borderStyle: "outset" }}
            >
              <div
                className="flex items-center justify-between px-1.5 py-1"
                style={{ background: "linear-gradient(90deg,#14532d,#4ade80)" }}
              >
                <span className="font-comic text-[11px] font-bold text-white">
                  Popup Blocker Pro
                </span>
                <span className="font-comic text-[11px] font-bold text-white">🛡</span>
              </div>
              <div className="font-comic p-4 text-black">
                <div className="text-3xl">🛡</div>
                <div className="mt-2 text-base font-black">AHHH… SILENCE.</div>
                <p className="mt-1 text-xs font-bold">
                  You closed {closedCount} popups to get here. Hero.
                </p>
                <button
                  onClick={() => setShowSilence(false)}
                  className="mt-3 cursor-pointer px-3 py-1.5 text-sm font-bold"
                  style={{ border: "3px outset #fff", background: "#d4d0c8" }}
                >
                  enjoy it
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {confettiOn && <OneShotConfetti />}

      <div
        className="absolute inset-x-0 bottom-0 z-[220] flex items-center gap-1 border-t-2 border-t-white bg-[#c0c0c0] px-1 py-1"
        style={{ boxShadow: "0 -2px 6px rgba(0,0,0,0.5)" }}
      >
        <button
          title="seriously, don't."
          onClick={() => chaos(1)}
          className="font-comic shrink-0 cursor-pointer px-2 py-0.5 text-xs font-black text-black active:translate-y-px"
          style={{ border: "2px outset #fff", background: "#d4d0c8" }}
        >
          ⊞ START
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {popups.map((p) => (
            <button
              key={p.id}
              onClick={() => focusPopup(p.id)}
              className="font-comic max-w-[140px] shrink-0 cursor-pointer truncate px-2 py-0.5 text-[10px] font-bold text-black active:translate-y-px"
              style={{ border: "2px outset #fff", background: "#d4d0c8" }}
              title={META[p.kind].title}
            >
              {META[p.kind].title}
            </button>
          ))}
        </div>
        {blocker === "available" && (
          <button
            onClick={installBlocker}
            className="font-comic shrink-0 animate-blink cursor-pointer px-2 py-0.5 text-[11px] font-black text-white active:translate-y-px"
            style={{ border: "2px outset #86efac", background: "#16a34a" }}
          >
            🛡 POPUP BLOCKER PRO — FREE!!
          </button>
        )}
        {blocker === "installing" && (
          <span className="font-comic shrink-0 px-2 py-0.5 text-[11px] font-black text-black">
            Installing… {blockerPct}%
          </span>
        )}
        {blocker === "active" && (
          <span
            className="font-comic shrink-0 px-2 py-0.5 text-[11px] font-black text-white"
            style={{ border: "2px outset #86efac", background: "#16a34a" }}
          >
            🛡 PROTECTED ✓
          </span>
        )}
        <span className="font-comic shrink-0 px-2 py-0.5 text-[10px] font-bold text-black">
          ☠ CLOSED: {closedCount}
        </span>
      </div>
    </div>
  );
}

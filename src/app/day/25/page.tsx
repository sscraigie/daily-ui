"use client";

// Day 25 - TV Remote
// A Roku-style remote and a simulated Roku TV that actually obey it:
// boot sequence, home channel grid, playback with speed control, volume
// OSD, options menus, screensaver, voice button and channel shortcuts.
// Keyboard shortcuts mirror the remote (arrows, Enter, Esc, Space…).

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { RequireDarkMode } from "@/components/ThemeProvider";
import Remote from "./Remote";
import Tv from "./Tv";
import { CHANNELS, FEATURED, type Channel } from "./data";
import type { MenuState, Phase, PlayingState, RemoteKey, Toast } from "./types";

const KEYFRAMES = `
@keyframes day25-led { 0% { opacity: 1; box-shadow: 0 0 10px 3px rgba(124,58,237,0.8); } 100% { opacity: 0.28; box-shadow: none; } }
@keyframes day25-bounce { from { transform: translateY(1.1cqw); } to { transform: translateY(-1.6cqw); } }
@keyframes day25-fadein { to { opacity: 1; } }
@keyframes day25-drift-a { 0% { transform: translate(0, 0) scale(1); } 50% { transform: translate(14%, 12%) scale(1.25); } 100% { transform: translate(0, 0) scale(1); } }
@keyframes day25-drift-b { 0% { transform: translate(0, 0) scale(1.1); } 50% { transform: translate(-16%, -10%) scale(0.9); } 100% { transform: translate(0, 0) scale(1.1); } }
@keyframes day25-drift-c { 0% { transform: translate(0, 0) scale(0.95); } 50% { transform: translate(10%, -14%) scale(1.2); } 100% { transform: translate(0, 0) scale(0.95); } }
@keyframes day25-wave { from { transform: scaleY(0.25); } to { transform: scaleY(1); } }
@keyframes day25-ss-x { from { transform: translateX(-34cqw); } to { transform: translateX(34cqw); } }
@keyframes day25-ss-y { from { transform: translateY(-16cqw); } to { transform: translateY(16cqw); } }
`;

const ROW_LENS = [1, 3, 3, 3];

const toRC = (idx: number): [number, number] => {
  if (idx <= 0) return [0, 0];
  const k = idx - 1;
  return [1 + Math.floor(k / 3), k % 3];
};

const toIdx = (r: number, c: number): number => {
  if (r <= 0) return 0;
  return 1 + (r - 1) * 3 + Math.min(c, ROW_LENS[r] - 1);
};

const clampIdx = (r: number, c: number): number =>
  toIdx(Math.max(0, Math.min(ROW_LENS.length - 1, r)), c);

export default function Day25() {
  const [power, setPower] = useState(false);
  const [phase, setPhase] = useState<Phase>("home");
  const [focus, setFocus] = useState(0);
  const [playing, setPlaying] = useState<PlayingState | null>(null);
  const [volume, setVolume] = useState(60);
  const [muted, setMuted] = useState(false);
  const [osdKind, setOsdKind] = useState<"volume" | "transport" | null>(null);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [screensaver, setScreensaver] = useState(false);
  const [listening, setListening] = useState(false);
  const [showHints, setShowHints] = useState(true);
  const [blink, setBlink] = useState(0);
  const [clock, setClock] = useState("");

  const bootT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const osdT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivity = useRef(Date.now());
  const playingRef = useRef<PlayingState | null>(null);

  const snap = { power, phase, focus, playing, menu, screensaver, listening };
  const stateRef = useRef(snap);
  stateRef.current = snap;
  playingRef.current = playing;

  /* -------------------------------- helpers -------------------------------- */

  const clearTimers = () => {
    [bootT, loadT, osdT, voiceT].forEach((t) => {
      if (t.current) clearTimeout(t.current);
      t.current = null;
    });
  };

  const toast = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3600);
  }, []);

  const showOsd = useCallback((kind: "volume" | "transport", ms: number) => {
    setOsdKind(kind);
    if (osdT.current) clearTimeout(osdT.current);
    osdT.current = setTimeout(() => setOsdKind(null), ms);
  }, []);

  const openChannel = useCallback(
    (channel: Channel, ep = 0) => {
      if (loadT.current) clearTimeout(loadT.current);
      setMenu(null);
      setPlaying({ channel, ep, progress: 0, speed: 1, paused: false });
      setPhase("loading");
      loadT.current = setTimeout(() => {
        setPhase("playing");
        showOsd("transport", 3200);
      }, 1500);
    },
    [showOsd],
  );

  const goHome = useCallback(() => {
    if (loadT.current) clearTimeout(loadT.current);
    setMenu(null);
    setPlaying(null);
    setPhase("home");
  }, []);

  const powerToggle = useCallback(() => {
    clearTimers();
    setMenu(null);
    setOsdKind(null);
    setListening(false);
    setScreensaver(false);
    if (stateRef.current.power) {
      setPower(false);
      setPlaying(null);
    } else {
      setPower(true);
      setPhase("boot");
      bootT.current = setTimeout(() => setPhase("home"), 2600);
    }
  }, []);

  const moveFocus = useCallback((dir: "up" | "down" | "left" | "right") => {
    setFocus((f) => {
      const [r, c] = toRC(f);
      if (dir === "left") return r === 0 ? 0 : clampIdx(r, c - 1);
      if (dir === "right") return r === 0 ? 0 : clampIdx(r, c + 1);
      if (dir === "up") return clampIdx(r - 1, c);
      return clampIdx(r + 1, c);
    });
  }, []);

  const openMenu = useCallback(() => {
    const s = stateRef.current;
    if (s.phase === "playing" && s.playing) {
      setMenu({
        title: "Episode options",
        focus: 0,
        items: [
          { label: "Captions", value: "Off", action: () => toast("Captions aren't wired up in this demo") },
          { label: "Audio", value: "Stereo", action: () => toast("Stereo it is — there's no sound here anyway") },
          {
            label: "Skip intro",
            value: "+85s",
            action: () => {
              setPlaying((p) =>
                p ? { ...p, progress: Math.min(p.channel.duration - 1, p.progress + 85) } : p,
              );
              showOsd("transport", 2600);
            },
          },
          {
            label: "Restart episode",
            action: () => {
              setPlaying((p) => (p ? { ...p, progress: 0, speed: 1 } : p));
              showOsd("transport", 2600);
            },
          },
          { label: "Back to home", action: () => goHome() },
        ],
      });
    } else {
      setMenu({
        title: "Options",
        focus: 0,
        items: [
          { label: "About this build", action: () => toast("Day 25 of 100 — a Roku-style remote, built from scratch") },
          { label: "Screensaver", value: "Now", action: () => setScreensaver(true) },
          {
            label: "Keyboard shortcuts",
            value: showHints ? "Shown" : "Hidden",
            action: () => setShowHints((v) => !v),
          },
          { label: "Power off", danger: true, action: () => powerToggle() },
        ],
      });
    }
  }, [goHome, powerToggle, showHints, showOsd, toast]);

  /* ------------------------------ the handler ------------------------------ */

  const press = useCallback(
    (key: RemoteKey) => {
      setBlink((b) => b + 1);
      lastActivity.current = Date.now();
      const s = stateRef.current;

      if (s.screensaver) {
        setScreensaver(false);
        return;
      }
      if (key === "power") {
        powerToggle();
        return;
      }
      if (!s.power) return;

      switch (key) {
        case "up":
        case "down":
        case "left":
        case "right":
          if (menu) {
            if (key === "up" || key === "down") {
              setMenu((m) =>
                m
                  ? {
                      ...m,
                      focus: (m.focus + (key === "down" ? 1 : -1) + m.items.length) % m.items.length,
                    }
                  : m,
              );
            }
            break;
          }
          if (s.listening) break;
          if (s.phase === "home") {
            moveFocus(key);
          } else if (s.phase === "playing" && s.playing) {
            if (key === "left" || key === "right") {
              const delta = key === "left" ? -30 : 30;
              setPlaying((p) =>
                p ? { ...p, progress: Math.max(0, Math.min(p.channel.duration - 1, p.progress + delta)) } : p,
              );
            }
            showOsd("transport", 2600);
          }
          break;

        case "ok":
          if (menu) {
            const item = menu.items[menu.focus];
            setMenu(null);
            item?.action();
          } else if (s.phase === "home") {
            openChannel(s.focus === 0 ? FEATURED : CHANNELS[s.focus - 1]);
          } else if (s.phase === "playing" && s.playing) {
            setPlaying((p) => (p ? { ...p, paused: !p.paused, speed: 1 } : p));
            showOsd("transport", s.playing.paused ? 2800 : 2400);
          }
          break;

        case "back":
          if (menu) {
            setMenu(null);
          } else if (s.listening) {
            if (voiceT.current) clearTimeout(voiceT.current);
            setListening(false);
          } else if (s.phase === "playing" || s.phase === "loading") {
            goHome();
          } else if (s.phase === "boot") {
            if (bootT.current) clearTimeout(bootT.current);
            setPhase("home");
          } else if (s.phase === "home") {
            toast("You're home — pick a channel with the D-pad");
          }
          break;

        case "home":
          if (s.phase !== "boot") goHome();
          break;

        case "star":
          if (menu) setMenu(null);
          else if (!s.listening) openMenu();
          break;

        case "play":
          if (menu) return;
          if (s.phase === "home" && (s.focus === 0 || s.focus <= CHANNELS.length)) {
            openChannel(s.focus === 0 ? FEATURED : CHANNELS[s.focus - 1]);
          } else if (s.phase === "playing" && s.playing) {
            const wasPaused = s.playing.paused;
            setPlaying((p) => (p ? { ...p, paused: !p.paused, speed: 1 } : p));
            if (!wasPaused) setOsdKind(null);
            else showOsd("transport", 2800);
          }
          break;

        case "rew":
        case "ffwd":
          if (menu || !s.playing || s.phase !== "playing") break;
          if (s.playing.paused) setPlaying((p) => (p ? { ...p, paused: false } : p));
          setPlaying((p) => {
            if (!p) return p;
            const cur = p.speed;
            let next: number;
            if (key === "ffwd") next = cur < 0 ? 2 : cur >= 8 ? 1 : cur * 2;
            else next = cur > 0 ? -2 : cur <= -8 ? 1 : cur * 2;
            return { ...p, speed: next };
          });
          showOsd("transport", 2800);
          break;

        case "replay":
          if (s.phase === "playing" && s.playing) {
            setPlaying((p) => (p ? { ...p, progress: Math.max(0, p.progress - 10) } : p));
            showOsd("transport", 2400);
          } else if (s.phase === "home") {
            toast("Instant replay works during playback — press OK to watch something");
          }
          break;

        case "volUp":
        case "volDown": {
          const delta = key === "volUp" ? 5 : -5;
          setVolume((v) => Math.max(0, Math.min(100, v + delta)));
          setMuted(false);
          showOsd("volume", 2000);
          break;
        }

        case "mute":
          setMuted((m) => !m);
          showOsd("volume", 2000);
          break;

        case "voice":
          if (s.listening) break;
          setListening(true);
          voiceT.current = setTimeout(() => {
            setListening(false);
            toast("Voice search isn't wired up — the buttons are, though");
          }, 2300);
          break;

        default:
            if (key.startsWith("ch:")) {
              const id = key.slice(3);
              const channel = CHANNELS.find((c) => c.id === id) ?? (id === "rokuch" ? FEATURED : undefined);
              if (channel) openChannel(channel);
            }
      }
    },
    [goHome, menu, moveFocus, openChannel, openMenu, powerToggle, showOsd, toast],
  );

  /* ------------------------------- side effects ---------------------------- */

  // clock
  useEffect(() => {
    const tick = () =>
      setClock(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    tick();
    const t = setInterval(tick, 10000);
    return () => clearInterval(t);
  }, []);

  // playback progress
  useEffect(() => {
    if (!power || phase !== "playing") return;
    const t = setInterval(() => {
      const p = playingRef.current;
      if (!p || p.paused) return;
      const next = p.progress + p.speed;
      if (next >= p.channel.duration) {
        const ep = (p.ep + 1) % p.channel.episodes.length;
        setPlaying({ ...p, ep, progress: 0, speed: 1 });
        toast(`Up next: “${p.channel.episodes[ep]}”`);
      } else if (next <= 0) {
        setPlaying({ ...p, progress: 0, speed: 1 });
      } else {
        setPlaying({ ...p, progress: next });
      }
    }, 1000);
    return () => clearInterval(t);
  }, [power, phase, toast]);

  // idle screensaver
  useEffect(() => {
    const t = setInterval(() => {
      const s = stateRef.current;
      if (s.power && s.phase === "home" && !s.menu && !s.screensaver && Date.now() - lastActivity.current > 70000) {
        setScreensaver(true);
      }
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // keyboard shortcuts mirror the remote
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      const map: Record<string, RemoteKey> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        Enter: "ok",
        Escape: "back",
        Backspace: "back",
        " ": "play",
        h: "home",
        p: "power",
        m: "mute",
        r: "replay",
        j: "rew",
        l: "ffwd",
        "]": "volUp",
        "[": "volDown",
      };
      const key = map[e.key] ?? (e.key.length === 1 ? map[e.key.toLowerCase()] : undefined);
      if (!key) return;
      e.preventDefault();
      press(key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  useEffect(() => clearTimers, []);

  /* --------------------------------- render -------------------------------- */

  const glow =
    !power
      ? "rgba(24,20,42,0.5)"
      : phase === "playing" && playing
        ? `${playing.channel.palette.accent}55`
        : "#662d9166";

  return (
    <div
      className="relative h-full w-full select-none overflow-x-hidden overflow-y-auto text-white lg:overflow-hidden"
      style={{
        background:
          "radial-gradient(1100px 520px at 50% -8%, #191231 0%, #0b0916 55%, #060509 100%)",
      }}
    >
      <RequireDarkMode />
      <style>{KEYFRAMES}</style>

      {/* room vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 100% at 50% 0%, transparent 55%, rgba(0,0,0,0.55) 100%)" }}
      />

      <div className="relative z-10 flex h-full min-h-full w-full flex-col items-center justify-start gap-9 px-4 py-7 lg:flex-row lg:justify-center lg:gap-14">
        {/* TV + ambient glow */}
        <div className="relative w-[min(92vw,calc((100dvh-200px)*1.5))] lg:w-[min(880px,calc((100dvh-180px)*1.5))]">
          <motion.div
            className="absolute -inset-10 rounded-[5rem] blur-3xl"
            animate={{ backgroundColor: glow }}
            transition={{ duration: 1.2 }}
            style={{ opacity: 0.5 }}
          />
          <Tv
            power={power}
            phase={phase}
            clock={clock}
            focus={focus}
            playing={playing}
            osdKind={osdKind}
            volume={volume}
            muted={muted}
            menu={menu}
            toasts={toasts}
            screensaver={screensaver}
            listening={listening}
            onTileOpen={(i) => {
              setFocus(i);
              openChannel(i === 0 ? FEATURED : CHANNELS[i - 1]);
            }}
            onMenuItemClick={(i) => {
              const item = menu?.items[i];
              setMenu(null);
              item?.action();
            }}
            onWake={() => {
              setScreensaver(false);
              setBlink((b) => b + 1);
              lastActivity.current = Date.now();
            }}
          />
        </div>

        <Remote onPress={press} blink={blink} />
      </div>

      {/* keyboard hints */}
      {showHints ? (
        <div className="absolute bottom-4 left-4 z-20 hidden max-w-[290px] rounded-2xl border border-white/10 bg-black/55 px-4 py-3 text-[11px] leading-relaxed text-white/70 backdrop-blur md:block">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-semibold uppercase tracking-wider text-white/45">Keyboard</span>
            <button
              type="button"
              onClick={() => setShowHints(false)}
              className="rounded-full bg-white/10 px-2 text-white/60 hover:text-white"
              aria-label="Hide keyboard shortcuts"
            >
              ✕
            </button>
          </div>
          <div>↑ ↓ ← → Navigate · <b>Enter</b> OK · <b>Esc</b> Back</div>
          <div><b>Space</b> Play/pause · <b>J</b>/<b>L</b> Rew/FF · <b>R</b> Replay</div>
          <div><b>H</b> Home · <b>P</b> Power · <b>M</b> Mute · <b>[</b> <b>]</b> Volume</div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowHints(true)}
          className="absolute bottom-4 left-4 z-20 hidden h-8 w-8 rounded-full border border-white/10 bg-black/55 text-[13px] text-white/70 backdrop-blur hover:text-white md:block"
          aria-label="Show keyboard shortcuts"
        >
          ?
        </button>
      )}
    </div>
  );
}

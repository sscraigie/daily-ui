"use client";

// Day 23 - On/Off Switch
// A physical toggle light switch: textured wall, white wall plate with slotted
// screws, and a small paddle switch built from three stacked layers - a static
// body, a sliding mid-section, and a front cap that flips over with a springy
// snap (construction after scrimothy's "Pure CSS Light Switch"). ON/OFF is
// marked on the plate and on the switch itself, and flipping it off dims the
// room. No red glow - the plastic stays ivory in both states.

import { motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { IconVolume, IconVolumeOff } from "@tabler/icons-react";

/* --------------------------------- audio ---------------------------------- */

function useToggleSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  return useCallback(() => {
    if (!enabled) return;
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") void ctx.resume();
      const t = ctx.currentTime;
      const tick = (at: number, gain: number, freq: number) => {
        const osc = ctx.createOscillator();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, at);
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 1800;
        const g = ctx.createGain();
        g.gain.setValueAtTime(gain, at);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.03);
        osc.connect(hp);
        hp.connect(g);
        g.connect(ctx.destination);
        osc.start(at);
        osc.stop(at + 0.04);
      };
      const thock = (at: number, gain: number, freq: number) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, at);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, at + 0.06);
        const g = ctx.createGain();
        g.gain.setValueAtTime(gain, at);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.07);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(at);
        osc.stop(at + 0.08);
      };
      tick(t, 0.1, 3200);
      thock(t + 0.012, 0.09, 230);
      tick(t + 0.055, 0.05, 2800);
    } catch {
      /* audio unavailable - stay silent */
    }
  }, [enabled]);
}

/* --------------------------------- pieces --------------------------------- */

const NOISE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E";

const MOTTLE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='420' height='420'%3E%3Cfilter id='m'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='3' seed='7' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='420' height='420' filter='url(%23m)' opacity='0.5'/%3E%3C/svg%3E";

function Screw({ rot }: { rot: number }) {
  return (
    <div
      className="relative h-[15px] w-[15px] rounded-full"
      style={{
        background:
          "radial-gradient(circle at 35% 30%, #f4f3f0, #d8d6d1 55%, #b6b3ad)",
        boxShadow:
          "inset 0 1px 2px rgba(0,0,0,.28), inset 0 -1px 1px rgba(255,255,255,.65), 0 1px 1.5px rgba(0,0,0,.28)",
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 h-[2px] w-[10px] rounded-full bg-[#7d7a74]"
        style={{ transform: `translate(-50%,-50%) rotate(${rot}deg)` }}
      />
    </div>
  );
}

/* ------------------------------ toggle switch ----------------------------- */

/* Three stacked layers, after scrimothy's pen: a static body, a mid-section
   that slides down, and a front cap that travels to the other end while
   tilting over (rotateX +-30deg). Constant width throughout. */
function ToggleSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  const flip = { type: "spring" as const, stiffness: 800, damping: 32 };
  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ perspective: 300 }}
    >
      <div className="relative h-[116px] w-[36px]">
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={on ? "Turn the light off" : "Turn the light on"}
          onClick={onToggle}
          className="absolute -inset-x-4 -inset-y-6 z-30 cursor-pointer rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-stone-400/50"
        />

        {/* static body */}
        <div
          className="absolute left-0 top-[34px] h-[64px] w-full rounded-[3px]"
          style={{
            background: "#e5e3e0",
            boxShadow:
              "1px 2px 3px 1px rgba(0,0,0,.32), inset 0 1px 1px rgba(255,255,255,.75), inset -1px -4px 5px rgba(0,0,0,.14)",
          }}
        />

        {/* mid-section: slides down with the cap */}
        <motion.div
          initial={false}
          animate={{ y: on ? 0 : 36 }}
          transition={flip}
          className="absolute left-0 top-[22px] h-[36px] w-full rounded-[3px]"
          style={{
            background:
              "linear-gradient(to bottom, #dedcd8 0%, #9c948b 30%, #beb7ae 82%, #e5e3e0 100%)",
            boxShadow:
              "inset 0 1px 1px rgba(255,255,255,.55), inset 0 -1px 1px rgba(0,0,0,.1)",
          }}
        />

        {/* front cap: flips to the other end, tilting over as it travels */}
        <motion.div
          initial={false}
          animate={{ y: on ? 0 : 86, rotateX: on ? 30 : -30 }}
          transition={flip}
          className="absolute left-0 top-0 z-10 h-[28px] w-full rounded-[3px]"
          style={{
            transformOrigin: "50% 50%",
            background: "#ebeae8",
            boxShadow:
              "inset 1px 1px 4px rgba(255,255,255,.95), inset -1px -2px 4px rgba(0,0,0,.26), 0 1px 2px rgba(0,0,0,.18)",
          }}
        >
          {/* contact shadow the cap casts below itself */}
          <div className="absolute -bottom-1 left-[3px] right-[3px] h-[5px] rounded-full bg-black/25 blur-[2px]" />
        </motion.div>

        {/* state marking on the switch itself - glides to the exposed part of the
            body as the mid-section slides */}
        <motion.span
          initial={false}
          animate={{ y: on ? 0 : -28 }}
          transition={flip}
          className={`absolute left-0 top-[70px] w-full text-center text-[8px] font-bold uppercase tracking-[0.15em] transition-colors duration-300 ${
            on ? "text-[#6f6a61]" : "text-[#8f8b83]"
          }`}
          style={{ textShadow: "0 1px 0 rgba(255,255,255,.65)" }}
        >
          {on ? "On" : "Off"}
        </motion.span>
      </div>
    </div>
  );
}

/* ---------------------------------- page ---------------------------------- */

export default function Day23() {
  const [on, setOn] = useState(true);
  const [touched, setTouched] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const play = useToggleSound(soundOn);

  const toggle = useCallback(() => {
    play();
    setOn((v) => !v);
    setTouched(true);
  }, [play]);

  return (
    <div className="relative h-full w-full select-none overflow-hidden">
      {/* Wall: cross-fades from softly lit to dim when switched off */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 100% at 50% 0%, #e6e0d5 0%, #dcd5c9 55%, #cdc5b9 100%)",
        }}
      />
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: on ? 0 : 1,
          background:
            "radial-gradient(130% 100% at 50% 0%, #d8d4cc 0%, #ccc8c0 70%, #bebab2 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: on ? 1 : 0,
          background:
            "radial-gradient(55% 45% at 50% 32%, rgba(255,205,145,0.12), transparent 70%)",
        }}
      />

      {/* Wall texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.09] mix-blend-multiply"
        style={{ backgroundImage: `url("${NOISE}")` }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{ backgroundImage: `url("${MOTTLE}")` }}
      />

      {/* Switch plate */}
      <div className="absolute left-1/2 top-[46%] z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <div
          className="relative flex h-[370px] w-[228px] flex-col items-center justify-between rounded-[14px] py-[30px]"
          style={{
            background:
              "linear-gradient(155deg,#ffffff 0%,#f7f6f3 55%,#e9e7e2 100%)",
            boxShadow:
              "0 1px 2px rgba(0,0,0,.10), 0 14px 32px rgba(0,0,0,.17), 0 3px 6px rgba(0,0,0,.08), inset 0 1px 1px rgba(255,255,255,.95), inset 0 -2px 3px rgba(0,0,0,.07)",
          }}
        >
          <Screw rot={24} />
          <Screw rot={-18} />

          {/* Engraved ON / OFF markings flanking the toggle */}
          <span
            className={`absolute left-1/2 top-[88px] -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.3em] transition-colors duration-300 ${
              on ? "text-[#7d7869]" : "text-[#b3afa6]"
            }`}
            style={{ textShadow: "0 1px 0 rgba(255,255,255,.8)" }}
          >
            On
          </span>
          <span
            className={`absolute left-1/2 top-[272px] -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.3em] transition-colors duration-300 ${
              on ? "text-[#b3afa6]" : "text-[#7d7869]"
            }`}
            style={{ textShadow: "0 1px 0 rgba(255,255,255,.8)" }}
          >
            Off
          </span>

          {/* Warm light tint on the plate while on */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[14px] transition-opacity duration-700"
            style={{
              opacity: on ? 1 : 0,
              background:
                "linear-gradient(180deg, rgba(255,190,110,.12), transparent 65%)",
            }}
          />

          {/* Soft shadow where the switch meets the plate */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2">
            <motion.div
              initial={false}
              animate={{
                y: on ? 46 : 62,
                opacity: on ? 0.45 : 0.6,
              }}
              transition={{ duration: 0.2 }}
              className="h-[8px] w-[42px] rounded-full bg-black/[0.2] blur-[3px]"
            />
          </div>

          <ToggleSwitch on={on} onToggle={toggle} />
        </div>

        <motion.p
          key={on ? "on" : "off"}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className={`mt-8 text-[10px] font-semibold uppercase tracking-[0.35em] ${
            on ? "text-amber-700/60" : "text-stone-500/70"
          }`}
        >
          {on ? "Lights on" : "Lights off"}
        </motion.p>
      </div>

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 40%, transparent 60%, rgba(0,0,0,0.14) 100%)",
        }}
      />

      <p
        className={`pointer-events-none absolute inset-x-0 bottom-7 z-20 text-center text-[10px] font-semibold uppercase tracking-[0.4em] text-stone-500/70 transition-opacity duration-700 ${
          touched ? "opacity-0" : "opacity-100"
        }`}
      >
        Click the switch
      </p>

      <button
        type="button"
        aria-label={soundOn ? "Mute switch sound" : "Unmute switch sound"}
        onClick={() => setSoundOn((s) => !s)}
        className="absolute bottom-6 right-6 z-30 flex h-9 w-9 items-center justify-center rounded-full text-stone-500/40 transition hover:text-stone-600/80 focus-visible:ring-2 focus-visible:ring-stone-400/50"
      >
        {soundOn ? <IconVolume size={17} /> : <IconVolumeOff size={17} />}
      </button>
    </div>
  );
}
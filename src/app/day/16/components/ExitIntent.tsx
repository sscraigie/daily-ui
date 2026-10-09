"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ReactCanvasConfetti from "react-canvas-confetti";
import type { CreateTypes, Options } from "canvas-confetti";

export default function ExitIntent({
  onClose,
}: {
  onClose: (punished: boolean) => void;
}) {
  const [dodges, setDodges] = useState(0);
  const [xPos, setXPos] = useState(88);
  const [secs, setSecs] = useState(9);
  const confettiRef = useRef<CreateTypes | null>(null);
  const claimedRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s <= 0 ? 9 : s - 1)), 1000);
    const giveUp = setTimeout(() => setDodges(3), 7000);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearInterval(t);
      clearTimeout(giveUp);
      window.removeEventListener("keydown", onKey);
      confettiRef.current?.reset();
    };
  }, [onClose]);

  const dodge = () => {
    if (dodges >= 3) return;
    setXPos((cur) => {
      let next = Math.random() * 80;
      if (Math.abs(next - cur) < 25) next = (cur + 40 + Math.random() * 30) % 80;
      return next;
    });
    setDodges((d) => d + 1);
  };

  const claim = () => {
    if (claimedRef.current) return;
    claimedRef.current = true;
    const confetti = confettiRef.current;
    if (confetti) {
      const shot = (ratio: number, options: Options) =>
        confetti({ ...options, origin: { y: 0.6 }, particleCount: Math.floor(180 * ratio) });
      shot(0.25, { spread: 26, startVelocity: 55 });
      shot(0.2, { spread: 60 });
      shot(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      shot(0.2, { spread: 120, startVelocity: 45 });
    }
    setTimeout(() => onClose(false), 1100);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[300] flex items-center justify-center bg-black/80 p-4"
    >
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
      <motion.div
        initial={{ scale: 0.4, y: 80, rotate: -4 }}
        animate={{ scale: 1, y: 0, rotate: 0 }}
        exit={{ scale: 0.5, y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="relative w-full max-w-xl"
        style={{ border: "5px solid #facc15", background: "#fff7ed" }}
      >
        <div
          className="flex select-none items-center justify-between px-2 py-1.5"
          style={{ background: "linear-gradient(90deg,#7f1d1d,#f87171)" }}
        >
          <span className="font-comic text-xs font-black text-white drop-shadow">
            ⚠️ CRITICAL SYSTEM ALERT — DO NOT CLOSE ⚠️
          </span>
          <button
            aria-label="Close"
            onMouseEnter={dodge}
            onClick={() => {
              if (dodges >= 3) onClose(false);
            }}
            title={dodges >= 3 ? "fine. you win." : undefined}
            className="absolute flex h-7 w-7 items-center justify-center bg-[#d4d0c8] font-comic text-sm font-black text-black shadow-md transition-transform"
            style={{
              top: -14,
              left: `${xPos}%`,
              border: "3px outset #fff",
              transform: `rotate(${dodges < 3 ? -8 + dodges * 8 : 0}deg)`,
              cursor: dodges >= 3 ? "pointer" : "not-allowed",
            }}
          >
            ✕
          </button>
        </div>

        <div className="p-5 text-center font-comic text-black">
          <div className="animate-blink text-3xl font-black text-red-600 sm:text-4xl">
            {"😱 WAIT!!! DON'T GO!!! 😱"}
          </div>
          <p className="mt-3 text-sm font-bold leading-snug sm:text-base">
            Your <span className="text-purple-700">FREE iPhone 18 Pro Ultra</span> is{" "}
            <span className="animate-blink font-black text-red-600">99% RESERVED</span> and will
            be released back into the wild if you leave!!!
          </p>
          <p className="mt-1 text-[10px] font-bold text-gray-500">
            (*or a slightly used toothbrush — see terms & conditions, page 847)
          </p>

          <div className="mx-auto mt-4 max-w-sm">
            <div className="flex justify-between font-mono text-[11px] font-bold">
              <span>Reserving your winnings…</span>
              <span>99%</span>
            </div>
            <div className="mt-1 h-5 overflow-hidden border-2 border-black bg-black/85">
              <div
                className="h-full w-[99%] shimmer"
                style={{
                  background:
                    "repeating-linear-gradient(45deg,#22c55e 0 10px,#86efac 10px 20px)",
                }}
              />
            </div>
            <div className="mt-3 border-2 border-black bg-black px-3 py-1.5 font-mono text-lg font-black tracking-widest text-lime-400">
              {secs > 0 ? (
                <>OFFER EXPIRES IN 00:00:{String(secs).padStart(2, "0")}</>
              ) : (
                <span className="animate-blink text-red-400">EXPIRED! …jk, resetting timer</span>
              )}
            </div>
          </div>

          <button
            onClick={claim}
            className="font-comic mx-auto mt-5 block w-full cursor-pointer px-4 py-3 text-lg font-black text-white shadow-[3px_3px_0_rgba(0,0,0,0.6)] transition-transform hover:scale-[1.02] active:translate-y-0.5 sm:text-xl"
            style={{
              background: "linear-gradient(180deg,#4ade80,#16a34a)",
              border: "4px outset #86efac",
              textShadow: "1px 2px 0 rgba(0,0,0,0.45)",
            }}
          >
            ✅ YES!!! CLAIM MY FREE iPHONE!!!
          </button>
          <button
            onClick={() => onClose(true)}
            className="mx-auto mt-3 block cursor-pointer text-[11px] font-bold text-gray-500 underline hover:text-gray-700"
          >
            no thanks, I hate free stuff and joy
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

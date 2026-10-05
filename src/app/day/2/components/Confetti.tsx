"use client";

import React, { useCallback, useEffect, useRef } from "react";
import ReactCanvasConfetti from "react-canvas-confetti";
import type { CreateTypes, Options } from "canvas-confetti";

export default function Confetti() {
  const confettiRef = useRef<CreateTypes | null>(null);

  const fire = useCallback(() => {
    const confetti = confettiRef.current;
    if (!confetti) return;

    const shot = (ratio: number, options: Options) => {
      confetti({
        ...options,
        origin: { y: 0.7 },
        particleCount: Math.floor(200 * ratio),
      });
    };

    shot(0.25, { spread: 26, startVelocity: 55 });
    shot(0.2, { spread: 60 });
    shot(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    shot(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    shot(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  useEffect(() => {
    fire();
    return () => confettiRef.current?.reset();
  }, [fire]);

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
        zIndex: 50,
      }}
    />
  );
}

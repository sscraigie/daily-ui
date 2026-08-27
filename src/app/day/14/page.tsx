"use client";
// Day 14 - Countdown Timer
// Inspiration: https://dribbble.com/shots/20413985-Countdown-Timer
// Event countdown with animated flip cards, particles, and customizable target date

import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { RequireDarkMode } from "@/components/ThemeProvider";

type TimeUnit = { value: number; label: string };

function FlipCard({ value, label }: TimeUnit) {
  const display = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3">
      <div className="relative w-14 h-16 sm:w-[90px] sm:h-[100px]">
        {/* Back face */}
        <div
          className="absolute inset-0 rounded-xl sm:rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(160deg, #1e1b4b 0%, #312e81 100%)",
            boxShadow: "0 8px 32px rgba(99,102,241,0.3)",
          }}
        >
          <span
            className="text-white font-black text-2xl sm:text-5xl"
            style={{ lineHeight: 1, letterSpacing: -1 }}
          >
            {display}
          </span>
        </div>
        {/* Divider line */}
        <div
          className="absolute left-0 right-0 z-10"
          style={{
            height: 2,
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(0,0,0,0.4)",
          }}
        />
        {/* Top shine */}
        <div
          className="absolute top-0 left-0 right-0 rounded-t-2xl"
          style={{
            height: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />
      </div>
      <span className="text-indigo-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

function Particle() {
  const size = 4 + Math.random() * 8;
  const startX = Math.random() * 100;
  const col = ["#818cf8", "#c084fc", "#f9a8d4", "#6ee7b7"][
    Math.floor(Math.random() * 4)
  ];
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, background: col, left: `${startX}%`, bottom: 0 }}
      initial={{ y: 0, opacity: 0.8 }}
      animate={{ y: -500 - Math.random() * 300, opacity: 0, x: (Math.random() - 0.5) * 200 }}
      transition={{ duration: 4 + Math.random() * 4, ease: "easeOut", repeat: Infinity, delay: Math.random() * 5 }}
    />
  );
}

const events = [
  { id: "launch", label: "🚀 Product Launch", date: new Date(Date.now() + 86400 * 10 * 1000) },
  { id: "newyear", label: "🎆 New Year 2027", date: new Date("2027-01-01T00:00:00") },
  { id: "custom", label: "📅 Custom Event", date: new Date(Date.now() + 86400 * 30 * 1000) },
];

function calcTime(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: diff <= 0,
  };
}

export default function Day14() {
  const [selectedEvent, setSelectedEvent] = useState(events[0]);
  const [time, setTime] = useState(calcTime(events[0].date));
  const [exploded, setExploded] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      const t = calcTime(selectedEvent.date);
      setTime(t);
      if (t.done && !exploded) setExploded(true);
    }, 1000);
    return () => clearInterval(id);
  }, [selectedEvent]);

  const units: TimeUnit[] = [
    { value: time.days, label: "Days" },
    { value: time.hours, label: "Hours" },
    { value: time.minutes, label: "Minutes" },
    { value: time.seconds, label: "Seconds" },
  ];

  return (
    <div
      className="min-h-full w-full flex flex-col items-center justify-center relative overflow-hidden p-6"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #0f172a 60%, #020617 100%)",
      }}
    >
      <RequireDarkMode />
      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <Particle key={i} />
        ))}
      </div>

      {/* Glow orb */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 400,
          height: 400,
          background:
            "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          filter: "blur(40px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 flex flex-col items-center gap-10"
      >
        {/* Event selector */}
        <div className="flex gap-3 flex-wrap justify-center">
          {events.map((e) => (
            <motion.button
              key={e.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedEvent(e);
                setExploded(false);
                setTime(calcTime(e.date));
              }}
              className="px-4 py-2 rounded-full text-sm font-semibold border-none cursor-pointer"
              style={{
                background:
                  selectedEvent.id === e.id
                    ? "linear-gradient(90deg, #6366f1, #8b5cf6)"
                    : "rgba(255,255,255,0.08)",
                color:
                  selectedEvent.id === e.id ? "#fff" : "rgba(255,255,255,0.7)",
                border:
                  selectedEvent.id === e.id
                    ? "none"
                    : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {e.label}
            </motion.button>
          ))}
        </div>

        {/* Title */}
        <div className="text-center">
          <motion.h2
            key={selectedEvent.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white text-4xl font-extrabold m-0 mb-2"
          >
            {selectedEvent.label}
          </motion.h2>
          <p className="text-indigo-300 text-sm m-0">
            {selectedEvent.date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Countdown digits */}
        <AnimatePresence mode="wait">
          {time.done ? (
            <motion.div
              key="done"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-center"
            >
              <div className="text-7xl mb-4">🎉</div>
              <h3 className="text-white text-3xl font-black m-0">It's here!</h3>
              <p className="text-indigo-300 text-base mt-2 m-0">The moment has arrived</p>
            </motion.div>
          ) : (
            <motion.div
              key="counting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-2 sm:gap-6 flex-wrap justify-center"
            >
              {units.map((u, i) => (
                <React.Fragment key={u.label}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={u.value}
                      initial={{ rotateX: -90, opacity: 0 }}
                      animate={{ rotateX: 0, opacity: 1 }}
                      exit={{ rotateX: 90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FlipCard value={u.value} label={u.label} />
                    </motion.div>
                  </AnimatePresence>
                  {i < units.length - 1 && (
                    <div className="flex flex-col items-center justify-center gap-2 sm:gap-4 mt-0 pb-5 sm:pb-7">
                      {[0, 1].map((d) => (
                        <motion.div
                          key={d}
                          animate={{ opacity: [1, 0.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                          style={{ background: "#6366f1" }}
                        />
                      ))}
                    </div>
                  )}
                </React.Fragment>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        {!time.done && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="flex justify-between text-xs text-indigo-400 mb-2">
              <span>Start</span>
              <span>
                {(
                  ((selectedEvent.date.getTime() - Date.now()) / (selectedEvent.date.getTime() - (Date.now() + time.seconds * -1000))) *
                  100
                ).toFixed(0)}% remaining
              </span>
              <span>Finish</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6, #c084fc)" }}
                animate={{ width: `${Math.random() * 40 + 30}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

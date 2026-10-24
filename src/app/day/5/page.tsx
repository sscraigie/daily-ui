"use client";
// Day 5 - App Icon
// Rebuilt as a working iPhone home screen: device frame with Dynamic
// Island and a live status bar, two swipeable pages of apps over an
// iOS-style wallpaper, notification badges, a translucent dock, a
// Spotlight search overlay, app icons that spring open into simple
// app screens, and long-press edit mode with removable apps.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { INITIAL_DOCK, INITIAL_PAGES, PHONE_APPS, type PhoneApp } from "./data";

const SCREEN_W = 390;
const SCREEN_H = 844;
const BEZEL = 11;
const SCREEN_RADIUS = 54;
const ICON_RADIUS = 13.5;
const OPEN_SPRING = { type: "spring", duration: 0.5, bounce: 0.16 };

const APPS = new Map(PHONE_APPS.map((app) => [app.id, app]));

const SKELETON_WIDTHS = [88, 72, 80, 64];

const HOURLY: [string, string, string][] = [
  ["Now", "☀", "18°"],
  ["11AM", "⛅", "19°"],
  ["12PM", "⛅", "20°"],
  ["1PM", "☁", "19°"],
  ["2PM", "🌧", "18°"],
];

const fmtTime = (d: Date) =>
  `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")}`;

/* --------------------------------- pieces --------------------------------- */

const MagnifierGlyph = ({ size = 15 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

const CellularGlyph = () => (
  <svg width="19" height="12" viewBox="0 0 19 12" fill="white">
    <rect x="0" y="7.5" width="3.4" height="4.5" rx="1" />
    <rect x="5.2" y="5" width="3.4" height="7" rx="1" />
    <rect x="10.4" y="2.5" width="3.4" height="9.5" rx="1" />
    <rect x="15.6" y="0" width="3.4" height="12" rx="1" fillOpacity="0.35" />
  </svg>
);

const WifiGlyph = () => (
  <svg width="18" height="13" viewBox="0 0 18 13" fill="none">
    <path
      d="M2 4.5a10.5 10.5 0 0 1 14 0"
      stroke="white"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M4.8 7.7a6.4 6.4 0 0 1 8.4 0"
      stroke="white"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <circle cx="9" cy="10.9" r="1.5" fill="white" />
  </svg>
);

const BatteryGlyph = () => (
  <svg width="28" height="13" viewBox="0 0 28 13" fill="none">
    <rect
      x="0.75"
      y="0.75"
      width="22.5"
      height="11.5"
      rx="3.5"
      stroke="white"
      strokeOpacity="0.4"
      strokeWidth="1.1"
    />
    <rect x="2.4" y="2.4" width="16.5" height="8.2" rx="1.8" fill="white" />
    <path
      d="M25.2 4.4v4.2c1.1-.35 1.8-1.1 1.8-2.1s-.7-1.75-1.8-2.1z"
      fill="white"
      fillOpacity="0.4"
    />
  </svg>
);

const DynamicIsland = () => (
  <div className="pointer-events-none absolute left-1/2 top-[11px] z-50 h-[36px] w-[122px] -translate-x-1/2 rounded-full bg-black">
    <div className="absolute right-[15px] top-1/2 h-[11px] w-[11px] -translate-y-1/2 rounded-full bg-[#101014]">
      <div className="absolute inset-[3px] rounded-full bg-[#1c2030]" />
    </div>
  </div>
);

const StatusBar = ({ now }: { now: Date }) => (
  <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex h-[54px] items-end justify-between px-[30px] pb-[13px] text-white">
    <span
      className="w-[60px] text-[16px] font-semibold leading-none tracking-[0.01em]"
      style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
    >
      {fmtTime(now)}
    </span>
    <span
      className="flex items-center gap-[6px]"
      style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}
    >
      <CellularGlyph />
      <WifiGlyph />
      <BatteryGlyph />
    </span>
  </div>
);

const Widget = ({ now }: { now: Date }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.12, type: "spring", stiffness: 200, damping: 24 }}
    className="mx-[26px] mb-[22px] flex h-[158px] flex-col justify-between overflow-hidden rounded-[26px] px-[18px] py-[16px] text-white backdrop-blur-xl"
    style={{
      background:
        "linear-gradient(140deg, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.08) 100%)",
      boxShadow:
        "inset 0 0 0 1px rgba(255,255,255,0.16), 0 12px 30px rgba(0,0,0,0.2)",
    }}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="m-0 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/70">
          {now.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <p
          className="m-0 mt-[4px] text-[46px] font-extralight leading-none tracking-tight"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {fmtTime(now)}
        </p>
      </div>
      <div className="text-right">
        <p className="m-0 text-[36px] font-semibold leading-none">18°</p>
        <p className="m-0 mt-[5px] text-[12px] font-medium text-white/80">
          Partly Cloudy
        </p>
        <p className="m-0 mt-[2px] text-[12px] text-white/60">H:21° L:12°</p>
      </div>
    </div>
    <div className="flex items-end justify-between px-[4px]">
      {HOURLY.map(([hour, glyph, temp]) => (
        <div key={hour} className="flex flex-col items-center gap-[5px]">
          <span className="text-[11px] font-medium text-white/60">{hour}</span>
          <span className="text-[15px] leading-none">{glyph}</span>
          <span className="text-[12px] font-semibold">{temp}</span>
        </div>
      ))}
    </div>
  </motion.div>
);

/* -------------------------------- app icon -------------------------------- */

type HomeIconProps = {
  app: PhoneApp;
  index: number;
  editing: boolean;
  active: boolean;
  showLabel: boolean;
  suppressTapRef: React.MutableRefObject<boolean>;
  onOpen: (id: string) => void;
  onLongPress: () => void;
  onDelete: (id: string) => void;
};

const HomeIcon = ({
  app,
  index,
  editing,
  active,
  showLabel,
  suppressTapRef,
  onOpen,
  onLongPress,
  onDelete,
}: HomeIconProps) => {
  const press = useRef<{
    timer: number | null;
    origin: { x: number; y: number } | null;
    fired: boolean;
  }>({
    timer: null,
    origin: null,
    fired: false,
  });

  const clearPress = () => {
    if (press.current.timer !== null) window.clearTimeout(press.current.timer);
    press.current.timer = null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.55, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 22,
        delay: index * 0.045,
      }}
      className="relative flex flex-col items-center"
    >
      <motion.button
        type="button"
        aria-label={showLabel ? app.label : `${app.label} — ${app.description}`}
        className="relative h-[60px] w-[60px] cursor-pointer select-none outline-none"
        onPointerDown={(e) => {
          press.current.origin = { x: e.clientX, y: e.clientY };
          press.current.fired = false;
          press.current.timer = window.setTimeout(() => {
            press.current.fired = true;
            onLongPress();
          }, 420);
        }}
        onPointerMove={(e) => {
          if (press.current.origin) {
            const dx = e.clientX - press.current.origin.x;
            const dy = e.clientY - press.current.origin.y;
            if (Math.hypot(dx, dy) > 8) {
              clearPress();
              press.current.origin = null;
            }
          }
        }}
        onPointerUp={clearPress}
        onPointerLeave={() => {
          clearPress();
          press.current.origin = null;
        }}
        onPointerCancel={clearPress}
        onClick={() => {
          if (suppressTapRef.current || press.current.fired) {
            press.current.fired = false;
            return;
          }
          if (!editing) onOpen(app.id);
        }}
        whileTap={editing ? undefined : { scale: 0.86 }}
      >
        <motion.div
          className="absolute inset-0"
          animate={editing ? { rotate: [-2, 2, -2] } : { rotate: 0 }}
          transition={
            editing
              ? {
                  duration: 0.28,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: (index % 6) * 0.035,
                }
              : { duration: 0.25 }
          }
        >
          <motion.div
            layoutId={`app-${app.id}`}
            className="absolute inset-0 overflow-hidden"
            style={{
              background: `linear-gradient(150deg, ${app.gradient[0]}, ${app.gradient[1]})`,
              borderRadius: ICON_RADIUS,
              boxShadow: "inset 0 1px 1px rgba(255,255,255,0.28)",
            }}
          />
          <motion.div
            className="absolute inset-0 overflow-hidden"
            style={{ borderRadius: ICON_RADIUS }}
            initial="idle"
            animate={active ? "active" : "idle"}
            variants={{
              idle: { opacity: 1, transition: { duration: 0.25, delay: 0.28 } },
              active: {
                opacity: 0,
                transition: { duration: 0.12, delay: 0.04 },
              },
            }}
          >
            <app.Icon />
          </motion.div>
          {app.badge != null && (
            <span className="absolute -right-[7px] -top-[6px] flex h-[21px] min-w-[21px] items-center justify-center rounded-full bg-[#ff3b30] px-[5px] text-[11px] font-bold leading-none text-white shadow-md">
              {app.badge}
            </span>
          )}
          <AnimatePresence>
            {editing && (
              <motion.button
                key="minus"
                type="button"
                aria-label={`Remove ${app.label}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(app.id);
                }}
                className="absolute -left-[8px] -top-[8px] flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#e9e9ee] text-[#5b5b60] shadow-md outline-none"
              >
                <svg width="10" height="2" viewBox="0 0 10 2">
                  <rect width="10" height="2" rx="1" fill="currentColor" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.button>
      {showLabel && (
        <span
          className="mt-[7px] max-w-[78px] truncate text-[11px] font-medium leading-none text-white"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
        >
          {app.label}
        </span>
      )}
    </motion.div>
  );
};

/* ---------------------------------- page ---------------------------------- */

export default function Day5() {
  const [pages, setPages] = useState<string[][]>(() =>
    INITIAL_PAGES.map((p) => [...p]),
  );
  const [dock, setDock] = useState<string[]>(() => [...INITIAL_DOCK]);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [spotlight, setSpotlight] = useState(false);
  const [openAppId, setOpenAppId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [scale, setScale] = useState(1);

  const stageRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const suppressTap = useRef(false);

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const fit = () => {
      const rect = el.getBoundingClientRect();
      const s = Math.min(
        rect.width / (SCREEN_W + BEZEL * 2),
        rect.height / (SCREEN_H + BEZEL * 2),
      );
      setScale(Math.max(0.3, Math.min(s, 1)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (openAppId) setOpenAppId(null);
      else if (spotlight) setSpotlight(false);
      else if (editing) setEditing(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openAppId, spotlight, editing]);

  useEffect(() => {
    if (spotlight) searchRef.current?.focus();
  }, [spotlight]);

  const openApp = (id: string) => {
    setEditing(false);
    setSpotlight(false);
    setOpenAppId(id);
  };

  const removeApp = (id: string) => {
    setPages((prev) => prev.map((p) => p.filter((x) => x !== id)));
    setDock((prev) => prev.filter((x) => x !== id));
  };

  const resetLayout = () => {
    setPages(INITIAL_PAGES.map((p) => [...p]));
    setDock([...INITIAL_DOCK]);
  };

  const dirty = useMemo(
    () =>
      JSON.stringify([pages, dock]) !==
      JSON.stringify([INITIAL_PAGES, INITIAL_DOCK]),
    [pages, dock],
  );

  const installed = useMemo(() => [...pages.flat(), ...dock], [pages, dock]);
  const pool = useMemo(
    () =>
      installed
        .map((id) => APPS.get(id))
        .filter((a): a is PhoneApp => Boolean(a)),
    [installed],
  );
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pool.slice(0, 8);
    return pool.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q),
    );
  }, [pool, query]);

  const openAppData = openAppId ? APPS.get(openAppId) : undefined;
  const pageCount = pages.length;

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #FBFBFD 0%, #EFF1F7 60%, #E9EBF2 100%)",
      }}
    >
      {/* soft color washes echoing the wallpaper */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(42% 34% at 18% 12%, rgba(167,139,250,0.16) 0%, transparent 70%)",
            "radial-gradient(40% 32% at 84% 10%, rgba(96,165,250,0.14) 0%, transparent 70%)",
            "radial-gradient(36% 30% at 88% 88%, rgba(255,110,196,0.1) 0%, transparent 70%)",
            "radial-gradient(34% 28% at 12% 86%, rgba(52,211,153,0.09) 0%, transparent 70%)",
          ].join(", "),
        }}
      />
      {/* ambient glow behind the phone */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[62%] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px]"
        style={{ background: "rgba(139,92,246,0.2)" }}
      />
      <div
        ref={stageRef}
        className="flex min-h-0 w-full flex-1 items-center justify-center"
      >
        <div
          className="relative"
          style={{ width: SCREEN_W * scale, height: SCREEN_H * scale }}
        >
          <div
            className="absolute left-0 top-0"
            style={{
              width: SCREEN_W,
              height: SCREEN_H,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            {/* device */}
            <div
              className="absolute -inset-[11px] rounded-[64px] bg-[#050507] p-[11px]"
              style={{
                boxShadow:
                  "0 50px 110px -25px rgba(30,20,60,0.45), 0 0 0 1px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(255,255,255,0.05)",
              }}
            >
              {/* side buttons */}
              <div className="absolute -left-[2.5px] top-[168px] h-[30px] w-[3px] rounded-l-[2px] bg-[#2c2c31]" />
              <div className="absolute -left-[2.5px] top-[228px] h-[56px] w-[3px] rounded-l-[2px] bg-[#2c2c31]" />
              <div className="absolute -left-[2.5px] top-[298px] h-[56px] w-[3px] rounded-l-[2px] bg-[#2c2c31]" />
              <div className="absolute -right-[2.5px] top-[248px] h-[88px] w-[3px] rounded-r-[2px] bg-[#2c2c31]" />

              <div
                className="relative h-full w-full overflow-hidden bg-black"
                style={{
                  borderRadius: SCREEN_RADIUS,
                  fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Inter, sans-serif",
                }}
              >
                {/* wallpaper */}
                <motion.div
                  className="absolute inset-0"
                  animate={{ scale: openAppId ? 1.07 : 1 }}
                  transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(170deg, #1b0f3b 0%, #3b1a6e 38%, #6d2aa8 72%, #a63ec5 100%)",
                    }}
                  />
                  <div
                    className="absolute -right-[60px] -top-[40px] h-[320px] w-[320px] rounded-full blur-[70px]"
                    style={{ background: "rgba(255,110,196,0.45)" }}
                  />
                  <div
                    className="absolute -left-[80px] top-[290px] h-[300px] w-[300px] rounded-full blur-[80px]"
                    style={{ background: "rgba(79,172,254,0.35)" }}
                  />
                  <div
                    className="absolute bottom-[130px] right-[20px] h-[260px] w-[260px] rounded-full blur-[70px]"
                    style={{ background: "rgba(255,190,80,0.28)" }}
                  />
                  <div
                    className="absolute -bottom-[60px] -left-[40px] h-[280px] w-[280px] rounded-full blur-[80px]"
                    style={{ background: "rgba(67,233,123,0.22)" }}
                  />
                </motion.div>

                {/* dim while an app is open */}
                <motion.div
                  className="pointer-events-none absolute inset-0 z-20 bg-black"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: openAppId ? 0.28 : 0 }}
                  transition={{ duration: 0.35 }}
                />

                {/* home screen layer */}
                <motion.div
                  className="absolute inset-0 z-10"
                  animate={{
                    opacity: openAppId ? 0 : 1,
                    scale: openAppId ? 1.02 : 1,
                  }}
                  transition={{
                    duration: openAppId ? 0.2 : 0.35,
                    delay: openAppId ? 0 : 0.12,
                  }}
                  style={{ pointerEvents: openAppId ? "none" : "auto" }}
                >
                  {/* swipeable pages */}
                  <motion.div
                    className="absolute inset-y-0 left-0 flex"
                    style={{ width: SCREEN_W * pageCount }}
                    animate={{ x: -page * SCREEN_W }}
                    transition={{ type: "spring", stiffness: 260, damping: 30 }}
                    drag="x"
                    dragConstraints={{
                      left: -(pageCount - 1) * SCREEN_W,
                      right: 0,
                    }}
                    dragElastic={0.07}
                    onDragStart={() => {
                      suppressTap.current = true;
                    }}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -60 || info.velocity.x < -450) {
                        setPage((p) => Math.min(p + 1, pageCount - 1));
                      } else if (info.offset.x > 60 || info.velocity.x > 450) {
                        setPage((p) => Math.max(p - 1, 0));
                      }
                      window.setTimeout(
                        () => (suppressTap.current = false),
                        90,
                      );
                    }}
                  >
                    {pages.map((ids, pi) => (
                      <motion.div
                        key={pi}
                        className="relative h-full w-[390px] shrink-0"
                        animate={{ paddingTop: editing ? 106 : 64 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        {pi === 0 && <Widget now={now} />}
                        <div className="grid grid-cols-4 gap-x-[12px] gap-y-[26px] px-[26px]">
                          {ids.map((id, i) => {
                            const app = APPS.get(id);
                            if (!app) return null;
                            return (
                              <HomeIcon
                                key={id}
                                app={app}
                                index={i + pi * 8}
                                editing={editing}
                                active={openAppId === app.id}
                                showLabel
                                suppressTapRef={suppressTap}
                                onOpen={openApp}
                                onLongPress={() => setEditing(true)}
                                onDelete={removeApp}
                              />
                            );
                          })}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* bottom stack: page dots, search pill, dock */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.5 }}
                    className="absolute inset-x-0 bottom-[26px] flex flex-col items-center"
                  >
                    <div className="mb-[16px] flex items-center gap-[7px]">
                      {pages.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          aria-label={`Page ${i + 1}`}
                          onClick={() => setPage(i)}
                          className="h-[7px] w-[7px] rounded-full outline-none transition-colors duration-200"
                          style={{
                            backgroundColor:
                              i === page
                                ? "rgba(255,255,255,0.95)"
                                : "rgba(255,255,255,0.35)",
                          }}
                        />
                      ))}
                    </div>
                    {editing ? (
                      <p
                        className="mb-[14px] flex h-[36px] items-center text-[12px] font-medium text-white/75"
                        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
                      >
                        Tap ✕ to remove an app
                      </p>
                    ) : (
                      <motion.button
                        type="button"
                        onClick={() => {
                          setQuery("");
                          setSpotlight(true);
                        }}
                        whileTap={{ scale: 0.94 }}
                        className="mb-[14px] flex h-[36px] items-center gap-[6px] rounded-full px-[18px] text-white/90 outline-none backdrop-blur-xl"
                        style={{
                          background: "rgba(255,255,255,0.18)",
                          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.14)",
                        }}
                      >
                        <MagnifierGlyph />
                        <span className="text-[15px] font-medium">Search</span>
                      </motion.button>
                    )}
                    <div
                      className="flex items-center gap-[18px] rounded-[30px] px-[16px] py-[14px] backdrop-blur-2xl"
                      style={{
                        background: "rgba(255,255,255,0.16)",
                        boxShadow:
                          "inset 0 0 0 1px rgba(255,255,255,0.14), 0 10px 30px rgba(0,0,0,0.18)",
                      }}
                    >
                      {dock.map((id, i) => {
                        const app = APPS.get(id);
                        if (!app) return null;
                        return (
                          <HomeIcon
                            key={id}
                            app={app}
                            index={i}
                            editing={editing}
                            active={openAppId === app.id}
                            showLabel={false}
                            suppressTapRef={suppressTap}
                            onOpen={openApp}
                            onLongPress={() => setEditing(true)}
                            onDelete={removeApp}
                          />
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* edit-mode toolbar */}
                  <AnimatePresence>
                    {editing && (
                      <motion.div
                        key="edit-toolbar"
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25 }}
                        className="absolute right-[20px] top-[64px] z-[45] flex items-center gap-[10px]"
                      >
                        {dirty && (
                          <button
                            type="button"
                            onClick={resetLayout}
                            className="bg-white/15 rounded-full px-[14px] py-[7px] text-[13px] font-semibold text-white/90 outline-none backdrop-blur-xl"
                          >
                            Reset
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditing(false)}
                          className="rounded-full bg-white px-[16px] py-[7px] text-[13px] font-semibold text-gray-900 shadow-md outline-none"
                        >
                          Done
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* opened app */}
                <AnimatePresence>
                  {openAppData && (
                    <motion.div
                      key={`app-screen-${openAppData.id}`}
                      className="absolute inset-0 z-30"
                      exit={{
                        opacity: 0,
                        transition: { duration: 0.16, delay: 0.08 },
                      }}
                    >
                      <motion.div
                        layoutId={`app-${openAppData.id}`}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.4}
                        onDragEnd={(_, info) => {
                          if (info.offset.y < -80) setOpenAppId(null);
                        }}
                        className="absolute inset-0 overflow-hidden"
                        style={{
                          background: `linear-gradient(165deg, ${
                            (openAppData.screen ?? openAppData.gradient)[0]
                          }, ${
                            (openAppData.screen ?? openAppData.gradient)[1]
                          })`,
                          borderRadius: SCREEN_RADIUS,
                          boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
                        }}
                        transition={OPEN_SPRING}
                      >
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.42) 100%)",
                          }}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            transition: { delay: 0.16, duration: 0.3 },
                          }}
                          exit={{ opacity: 0 }}
                          className="relative flex min-h-0 flex-1 flex-col px-[26px] pb-[64px] pt-[78px] text-white"
                          style={{ height: SCREEN_H }}
                        >
                          <div className="flex items-center gap-[16px]">
                            <div
                              className="flex h-[54px] w-[54px] items-center justify-center overflow-hidden rounded-[14px]"
                              style={{
                                background: `linear-gradient(150deg, ${openAppData.gradient[0]}, ${openAppData.gradient[1]})`,
                                boxShadow:
                                  "inset 0 0 0 1px rgba(255,255,255,0.25)",
                              }}
                            >
                              <openAppData.Icon />
                            </div>
                            <div>
                              <h2 className="m-0 text-[26px] font-bold leading-tight">
                                {openAppData.label}
                              </h2>
                              <p className="m-0 text-[13px] font-medium text-white/70">
                                {openAppData.description}
                              </p>
                            </div>
                          </div>
                          <div className="mt-[26px] flex flex-col gap-[14px]">
                            {SKELETON_WIDTHS.map((w, i) => (
                              <div
                                key={i}
                                className="flex h-[72px] items-center gap-[14px] rounded-[20px] px-[16px]"
                                style={{
                                  background: "rgba(255,255,255,0.16)",
                                  boxShadow:
                                    "inset 0 0 0 1px rgba(255,255,255,0.14)",
                                }}
                              >
                                <div className="h-[40px] w-[40px] shrink-0 rounded-full bg-white/25" />
                                <div className="flex flex-1 flex-col gap-[9px]">
                                  <div
                                    className="bg-white/35 h-[9px] rounded-full"
                                    style={{ width: `${w}%` }}
                                  />
                                  <div
                                    className="h-[9px] rounded-full bg-white/20"
                                    style={{
                                      width: `${Math.max(w - 22, 18)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="mb-0 mt-auto text-center text-[12px] font-medium text-white/70">
                            Swipe up from the bottom to close
                          </p>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Spotlight */}
                <AnimatePresence>
                  {spotlight && (
                    <motion.div
                      key="spotlight"
                      className="absolute inset-0 z-40"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.15 } }}
                      style={{
                        background: "rgba(12,10,24,0.4)",
                        backdropFilter: "blur(28px) saturate(1.4)",
                        WebkitBackdropFilter: "blur(28px) saturate(1.4)",
                      }}
                      onClick={(e) => {
                        if (e.target === e.currentTarget) setSpotlight(false);
                      }}
                    >
                      <div className="px-[24px] pt-[66px]">
                        <div
                          className="flex h-[40px] items-center gap-[10px] rounded-[12px] px-[12px]"
                          style={{
                            background: "rgba(255,255,255,0.18)",
                            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.16)",
                          }}
                        >
                          <span className="text-white/70">
                            <MagnifierGlyph size={16} />
                          </span>
                          <input
                            ref={searchRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search"
                            className="border-none bg-transparent text-[16px] text-white outline-none placeholder:text-white/50"
                          />
                          {query && (
                            <button
                              type="button"
                              onClick={() => setQuery("")}
                              aria-label="Clear search"
                              className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white/25 text-[10px] leading-none text-white/90 outline-none"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <p className="mb-[14px] mt-[20px] text-[12px] font-semibold uppercase tracking-[0.12em] text-white/50">
                          {query.trim() ? "Results" : "Siri Suggestions"}
                        </p>
                        {results.length > 0 ? (
                          <div className="grid grid-cols-4 gap-y-[18px]">
                            {results.map((app, i) => (
                              <motion.button
                                key={app.id}
                                type="button"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                  transition: { delay: i * 0.03 },
                                }}
                                onClick={() => openApp(app.id)}
                                className="flex flex-col items-center gap-[6px] outline-none"
                              >
                                <div
                                  className="h-[44px] w-[44px] overflow-hidden rounded-[10.5px]"
                                  style={{
                                    background: `linear-gradient(150deg, ${app.gradient[0]}, ${app.gradient[1]})`,
                                    boxShadow:
                                      "inset 0 1px 1px rgba(255,255,255,0.28)",
                                  }}
                                >
                                  <app.Icon />
                                </div>
                                <span
                                  className="max-w-[74px] truncate text-[10.5px] font-medium text-white/90"
                                  style={{
                                    textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                                  }}
                                >
                                  {app.label}
                                </span>
                              </motion.button>
                            ))}
                          </div>
                        ) : (
                          <p className="py-[36px] text-center text-[13px] text-white/60">
                            No results for &ldquo;{query}&rdquo;
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <DynamicIsland />
                <StatusBar now={now} />

                {/* home bar — drag up (or tap) to close the open app / Spotlight */}
                  <motion.div
                    className="absolute inset-x-0 bottom-0 z-[55] flex h-[90px] touch-none select-none items-end justify-center pb-[10px] active:cursor-grabbing"
                  style={{
                    pointerEvents: openAppId || spotlight ? "auto" : "none",
                    cursor: openAppId || spotlight ? "grab" : "default",
                  }}
                  drag={openAppId || spotlight ? "y" : false}
                  dragSnapToOrigin
                  onDragEnd={(_, info) => {
                    if (info.offset.y < -55) {
                      if (openAppId) setOpenAppId(null);
                      if (spotlight) setSpotlight(false);
                    }
                  }}
                  onClick={() => {
                    if (openAppId) setOpenAppId(null);
                    if (spotlight) setSpotlight(false);
                  }}
                  aria-label="Home"
                  role="button"
                >
                  <div
                    className="h-[5px] w-[140px] rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.95)",
                      boxShadow: "0 0 4px rgba(0,0,0,0.3)",
                    }}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="pointer-events-none m-0 shrink-0 pb-[10px] pt-[8px] text-center text-[12px] text-gray-400">
        Tap an app to open it · drag sideways to change pages · hold an icon to
        edit · Search opens Spotlight
      </p>
    </div>
  );
}

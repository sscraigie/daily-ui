"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CHANNELS, FEATURED, fmtTime, type Channel } from "./data";
import type { MenuState, Phase, PlayingState, Toast } from "./types";
import {
  ChevronLeftIcon,
  GearIcon,
  MicIcon,
  MuteIcon,
  PauseIcon,
  PlayIcon,
  StarIcon,
  VolHighIcon,
  WifiIcon,
} from "./icons";

export type TvProps = {
  power: boolean;
  phase: Phase;
  clock: string;
  focus: number;
  playing: PlayingState | null;
  osdKind: "volume" | "transport" | null;
  volume: number;
  muted: boolean;
  menu: MenuState | null;
  toasts: Toast[];
  screensaver: boolean;
  listening: boolean;
  onTileOpen: (index: number) => void;
  onMenuItemClick: (i: number) => void;
  onWake: () => void;
};

const focusShadow = "0 0 0 0.4cqw rgba(255,255,255,0.95), 0 1cqw 2.6cqw rgba(0,0,0,0.55)";

/* ------------------------------- boot screen ------------------------------ */

function BootScreen() {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-[4cqw]"
      style={{ background: "linear-gradient(160deg, #1b0b33 0%, #3d1170 55%, #120722 100%)" }}
    >
      <div className="flex items-end gap-[2.4cqw]">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block h-[6cqw] w-[6cqw] rounded-full"
            style={{
              background: "radial-gradient(circle at 32% 28%, #c9a6ff 0%, #8b46e8 45%, #4c1d95 100%)",
              boxShadow: "0 0 3cqw rgba(139,70,232,0.6)",
              animation: `day25-bounce 1.05s ease-in-out ${i * 0.16}s infinite alternate`,
            }}
          />
        ))}
      </div>
      <span
        className="text-[4.6cqw] font-black tracking-[0.5em] text-white"
        style={{ animation: "day25-fadein 0.6s ease-out 1.5s both" }}
      >
        ROKU
      </span>
    </div>
  );
}

/* ------------------------------ loading screen ---------------------------- */

function LoadingScreen({ channel }: { channel: Channel }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-[2.4cqw] bg-black">
      <span
        className="block h-[8cqw] w-[8cqw] animate-pulse rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 30%, ${channel.palette.accent}, ${channel.palette.via} 60%, transparent)`,
          boxShadow: `0 0 6cqw ${channel.palette.accent}66`,
        }}
      />
      <span className="text-[2.8cqw] font-bold" style={{ color: channel.palette.accent }}>
        {channel.mark}
      </span>
      <span className="text-[2cqw] text-white/50">Loading…</span>
    </div>
  );
}

/* -------------------------------- home screen ----------------------------- */

function Tile({
  index,
  focused,
  onOpen,
  children,
  style,
  className = "",
}: {
  index: number;
  focused: boolean;
  onOpen: (i: number) => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      className={`relative overflow-hidden rounded-[1cqw] border border-white/5 text-left transition-transform duration-150 ${className}`}
      style={{
        ...style,
        transform: focused ? "scale(1.045)" : undefined,
        boxShadow: focused ? focusShadow : "inset 0 0 0 1px rgba(255,255,255,0.04)",
        zIndex: focused ? 1 : 0,
      }}
    >
      {children}
    </button>
  );
}

function HomeScreen({
  clock,
  focus,
  onTileOpen,
}: {
  clock: string;
  focus: number;
  onTileOpen: (i: number) => void;
}) {
  return (
    <div className="absolute inset-0 flex flex-col px-[3cqw] pb-[2.6cqw] pt-[2.4cqw]">
      {/* header */}
      <div className="mb-[1.4cqw] flex items-center justify-between">
        <div className="flex items-center gap-[1cqw]">
          <span
            className="block h-[2.6cqw] w-[2.6cqw] rounded-full"
            style={{ background: "radial-gradient(circle at 32% 28%, #c9a6ff, #8b46e8 55%, #4c1d95)" }}
          />
          <span className="text-[2.5cqw] font-bold text-white/90">Home</span>
        </div>
        <div className="flex items-center gap-[1.8cqw] text-white/60">
          <WifiIcon className="h-[2.3cqw] w-[2.3cqw]" />
          <GearIcon className="h-[2.3cqw] w-[2.3cqw]" />
          <span className="text-[2.2cqw] font-semibold tabular-nums">{clock}</span>
        </div>
      </div>

      {/* featured tile */}
      <Tile
        index={0}
        focused={focus === 0}
        onOpen={onTileOpen}
        className="h-[15cqw] w-full shrink-0"
        style={{
          background: `linear-gradient(105deg, ${FEATURED.palette.from} 0%, ${FEATURED.palette.via} 58%, #140b26 100%)`,
        }}
      >
        <div
          className="absolute inset-y-0 right-0 w-[38%] opacity-70"
          style={{
            background: `radial-gradient(80% 90% at 78% 40%, ${FEATURED.palette.accent}55, transparent 70%)`,
          }}
        />
        <div className="relative flex h-full flex-col justify-center gap-[0.7cqw] px-[2.6cqw]">
          <div className="flex items-center gap-[1.2cqw]">
            <span
              className="rounded-full px-[1.2cqw] py-[0.4cqw] text-[1.5cqw] font-bold uppercase tracking-[0.18em]"
              style={{ background: "rgba(124,58,237,0.35)", color: "#e6d6ff" }}
            >
              Featured · {FEATURED.name}
            </span>
            <span className="text-[1.7cqw] text-white/55">
              {FEATURED.genre} · {FEATURED.rating}
            </span>
          </div>
          <span className="text-[4cqw] font-black leading-none text-white">{FEATURED.show}</span>
          <span className="text-[2cqw] text-white/65">
            Season 1 now streaming · {FEATURED.episodes.length} episodes
          </span>
        </div>
        <div
          className="absolute right-[2.4cqw] top-1/2 flex -translate-y-1/2 items-center gap-[0.8cqw] rounded-full px-[1.8cqw] py-[1cqw] text-[1.8cqw] font-semibold text-white"
          style={{
            background: "rgba(124,58,237,0.5)",
            opacity: focus === 0 ? 1 : 0.45,
            transition: "opacity 0.2s",
          }}
        >
          <PlayIcon className="h-[1.8cqw] w-[1.8cqw]" /> Watch
        </div>
      </Tile>

      {/* channel grid */}
      <div className="mt-[1.4cqw] grid min-h-0 flex-1 grid-cols-4 grid-rows-2 gap-[1.2cqw]">
        {CHANNELS.map((c, i) => (
          <Tile
            key={c.id}
            index={i + 1}
            focused={focus === i + 1}
            onOpen={onTileOpen}
            style={{ background: c.tile }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[2.5cqw]" style={c.markStyle}>
                {c.mark}
              </span>
            </div>
            <span className="absolute bottom-[0.9cqw] left-[1.2cqw] text-[1.5cqw] text-white/40">
              {c.genre}
            </span>
            <div
              className="absolute inset-x-0 top-0 h-[40%]"
              style={{ background: `linear-gradient(180deg, ${c.palette.accent}22, transparent)` }}
            />
          </Tile>
        ))}
      </div>

      {/* footer hints */}
      <div className="mt-[1.2cqw] flex items-center gap-[2.4cqw] text-[1.7cqw] text-white/40">
        <span>OK Select</span>
        <span>← → ↑ ↓ Browse</span>
        <span>★ Options</span>
        <span>H Home</span>
      </div>
    </div>
  );
}

/* ------------------------------- playing screen ---------------------------- */

function Scene({ channel }: { channel: Channel }) {
  const p = channel.palette;
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${p.from}, ${p.to})` }} />
      <div
        className="absolute left-[-10%] top-[-20%] h-[80%] w-[70%] rounded-full opacity-70"
        style={{ background: `radial-gradient(closest-side, ${p.via}b3, transparent 72%)`, animation: "day25-drift-a 26s ease-in-out infinite" }}
      />
      <div
        className="absolute right-[-14%] top-[30%] h-[75%] w-[60%] rounded-full opacity-60"
        style={{ background: `radial-gradient(closest-side, ${p.accent}80, transparent 70%)`, animation: "day25-drift-b 33s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-[-24%] left-[24%] h-[70%] w-[55%] rounded-full opacity-50"
        style={{ background: `radial-gradient(closest-side, ${p.via}99, transparent 70%)`, animation: "day25-drift-c 21s ease-in-out infinite" }}
      />
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 115%, rgba(0,0,0,0.6), transparent 60%)" }} />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.9) 0.5px, transparent 0.5px), radial-gradient(rgba(255,255,255,0.55) 0.5px, transparent 0.5px)",
          backgroundSize: "3.2cqw 3.2cqw, 5.4cqw 5.4cqw",
          backgroundPosition: "0 0, 1.7cqw 2.6cqw",
        }}
      />
    </div>
  );
}

function PlayingScreen({ playing, showTransport }: { playing: PlayingState; showTransport: boolean }) {
  const c = playing.channel;
  return (
    <div className="absolute inset-0">
      <Scene channel={c} />

      {/* back chip */}
      <div className="absolute left-[3cqw] top-[2.6cqw] flex items-center gap-[0.8cqw] text-[1.9cqw] text-white/70">
        <ChevronLeftIcon className="h-[2.2cqw] w-[2.2cqw]" /> Back
      </div>

      {/* paused badge */}
      <AnimatePresence>
        {playing.paused && (
          <motion.div
            key="paused-badge"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className="absolute left-1/2 top-[8cqw] flex -translate-x-1/2 items-center gap-[1.2cqw] rounded-full bg-black/60 px-[2.4cqw] py-[1.2cqw] backdrop-blur"
          >
            <PauseIcon className="h-[2.6cqw] w-[2.6cqw] text-white" />
            <span className="text-[2cqw] font-semibold text-white">Paused</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* lower third */}
      <div className="absolute bottom-[3cqw] left-[3.5cqw] flex flex-col gap-[0.8cqw]">
        <div className="flex items-center gap-[1.2cqw]">
          <span
            className="rounded-[0.7cqw] px-[1.1cqw] py-[0.45cqw] text-[1.6cqw] font-bold"
            style={{ background: `${c.palette.accent}33`, color: c.palette.accent }}
          >
            {c.mark}
          </span>
          <span className="text-[1.7cqw] text-white/55">
            S1 · E{playing.ep + 1} · {c.rating}
          </span>
        </div>
        <span className="text-[3.2cqw] font-black leading-tight text-white drop-shadow">{c.show}</span>
        <span className="text-[2.1cqw] text-white/75">“{c.episodes[playing.ep]}”</span>
      </div>

      {/* transport OSD */}
      <AnimatePresence>
        {showTransport && (
          <motion.div
            key="transport"
            initial={{ opacity: 0, y: "2cqw" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "2cqw" }}
            transition={{ duration: 0.22 }}
            className="absolute inset-x-[2.5cqw] bottom-[13cqw] rounded-[1.1cqw] border border-white/10 bg-black/75 px-[2cqw] py-[1.4cqw] backdrop-blur"
          >
            <div className="mb-[1cqw] flex items-center gap-[1.4cqw]">
              {playing.paused ? (
                <PlayIcon className="h-[2.6cqw] w-[2.6cqw] shrink-0 text-white" />
              ) : (
                <PauseIcon className="h-[2.6cqw] w-[2.6cqw] shrink-0 text-white" />
              )}
              <span className="min-w-0 flex-1 truncate text-[1.9cqw] text-white/85">
                {c.episodes[playing.ep]}
              </span>
              {playing.speed !== 1 && (
                <span
                  className="rounded-full px-[1.2cqw] py-[0.4cqw] text-[1.6cqw] font-bold"
                  style={{ background: "rgba(124,58,237,0.4)", color: "#e6d6ff" }}
                >
                  {playing.speed < 0 ? `REW ${-playing.speed}×` : `FF ${playing.speed}×`}
                </span>
              )}
            </div>
            <div className="relative h-[1cqw] w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-white"
                style={{ width: `${Math.min(100, (playing.progress / c.duration) * 100)}%` }}
              />
            </div>
            <div className="mt-[0.8cqw] flex justify-between text-[1.6cqw] tabular-nums text-white/60">
              <span>{fmtTime(playing.progress)}</span>
              <span>{fmtTime(c.duration - playing.progress)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* --------------------------------- overlays -------------------------------- */

function VolumeOsd({ volume, muted }: { volume: number; muted: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: "-1.5cqw" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "-1.5cqw" }}
      transition={{ duration: 0.2 }}
      className="absolute left-[3cqw] top-[3cqw] flex items-center gap-[1.4cqw] rounded-[1.1cqw] border border-white/10 bg-black/75 px-[1.8cqw] py-[1.3cqw] backdrop-blur"
    >
      {muted ? (
        <MuteIcon className="h-[2.6cqw] w-[2.6cqw] text-[#ff6b6b]" />
      ) : (
        <VolHighIcon className="h-[2.6cqw] w-[2.6cqw] text-white" />
      )}
      <div className="h-[1.3cqw] w-[20cqw] overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full rounded-full"
          style={{ width: `${muted ? 0 : volume}%`, background: muted ? "#ff6b6b" : "#ffffff" }}
        />
      </div>
      <span className="w-[5cqw] text-right text-[1.9cqw] font-semibold tabular-nums text-white/80">
        {muted ? "Mute" : volume}
      </span>
    </motion.div>
  );
}

function OptionsMenu({
  menu,
  onItem,
}: {
  menu: MenuState;
  onItem: (i: number) => void;
}) {
  return (
    <motion.div
      key="menu"
      initial={{ opacity: 0, x: "4cqw" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "4cqw" }}
      transition={{ duration: 0.22 }}
      className="absolute inset-y-0 right-0 flex w-[36cqw] flex-col border-l border-white/10 backdrop-blur-xl"
      style={{ background: "rgba(10,8,19,0.88)" }}
    >
      <div className="flex items-center justify-between px-[2.4cqw] pb-[1.4cqw] pt-[2.4cqw]">
        <span className="text-[2.6cqw] font-bold text-white">{menu.title}</span>
        <span
          className="flex h-[3cqw] w-[3cqw] items-center justify-center rounded-full bg-white/10 text-[2cqw] text-white/70"
          title="Close (Esc)"
        >
          ✕
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {menu.items.map((item, i) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onItem(i)}
            className="relative flex w-full items-center justify-between gap-[1cqw] px-[2.4cqw] py-[1.7cqw] text-left"
            style={{
              background: i === menu.focus ? "rgba(255,255,255,0.10)" : "transparent",
              transition: "background 0.12s",
            }}
          >
            {i === menu.focus && (
              <span className="absolute inset-y-[0.6cqw] left-0 w-[0.5cqw] rounded-full bg-[#a06bff]" />
            )}
            <span className={`text-[2.3cqw] ${item.danger ? "text-[#ff6b6b]" : "text-white/90"}`}>
              {item.label}
            </span>
            {item.value && <span className="text-[2cqw] text-white/50">{item.value}</span>}
          </button>
        ))}
      </div>
      <div className="px-[2.4cqw] pb-[2.2cqw] text-[1.7cqw] text-white/40">
        ↑↓ Move · OK Select · Back Close
      </div>
    </motion.div>
  );
}

function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="pointer-events-none absolute bottom-[3cqw] left-[3cqw] flex flex-col gap-[1cqw]">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex items-center gap-[1cqw] rounded-full border border-white/10 bg-black/80 px-[2cqw] py-[1.1cqw] backdrop-blur"
          >
            <StarIcon className="h-[2cqw] w-[2cqw] text-[#a06bff]" />
            <span className="text-[1.9cqw] text-white/90">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function Screensaver({ clock, onWake }: { clock: string; onWake: () => void }) {
  return (
    <motion.div
      key="screensaver"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 z-20 cursor-pointer bg-black/95"
      onClick={onWake}
    >
      <div className="absolute inset-0" style={{ background: "radial-gradient(90% 70% at 50% 45%, rgba(102,45,145,0.16), transparent 70%)" }} />
      <div className="absolute left-1/2 top-1/2" style={{ animation: "day25-ss-x 17s linear infinite alternate" }}>
        <div style={{ animation: "day25-ss-y 11s ease-in-out infinite alternate" }}>
          <span
            className="block h-[9cqw] w-[9cqw] rounded-full"
            style={{
              background: "radial-gradient(circle at 32% 28%, #c9a6ff 0%, #8b46e8 45%, #3b1470 100%)",
              boxShadow: "0 0 4cqw rgba(139,70,232,0.55)",
            }}
          />
        </div>
      </div>
      <span className="absolute bottom-[3cqw] right-[3.5cqw] text-[5.5cqw] font-black tabular-nums text-white/15">
        {clock}
      </span>
      <span className="absolute bottom-[3.4cqw] left-[3.5cqw] text-[2cqw] text-white/35">
        Press any button to wake the TV
      </span>
    </motion.div>
  );
}

function ListeningOverlay() {
  return (
    <motion.div
      key="listening"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-[1.8cqw] rounded-[2cqw] border border-white/10 bg-black/80 px-[5cqw] py-[3.2cqw]">
        <MicIcon className="h-[5cqw] w-[5cqw] text-[#a06bff]" />
        <div className="flex h-[3.4cqw] items-center gap-[0.9cqw]">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="block w-[0.9cqw] rounded-full bg-[#a06bff]"
              style={{
                height: "100%",
                transformOrigin: "center",
                animation: `day25-wave ${(0.55 + i * 0.09).toFixed(2)}s ease-in-out infinite alternate`,
              }}
            />
          ))}
        </div>
        <span className="text-[2.2cqw] font-semibold text-white/85">Listening…</span>
      </div>
    </motion.div>
  );
}

/* ----------------------------------- tv ------------------------------------ */

export default function Tv(props: TvProps) {
  const { power, phase, playing, osdKind, menu, toasts, screensaver, listening } = props;
  const showTransport = phase === "playing" && playing && (playing.paused || osdKind === "transport");

  return (
    <div className="relative">
      {/* bezel */}
      <div
        className="rounded-[1.5rem] border border-white/10 p-[10px] pb-[7px]"
        style={{
          background: "linear-gradient(165deg, #101013, #050506 60%)",
          boxShadow: "0 34px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <div className="relative aspect-video w-full overflow-hidden rounded-[0.9rem] bg-black [container-type:inline-size]">
          <AnimatePresence mode="wait">
            {!power ? (
              <motion.div
                key="off"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(115deg, transparent 38%, rgba(255,255,255,0.045) 45%, transparent 54%), #020203",
                  }}
                />
              </motion.div>
            ) : phase === "boot" ? (
              <motion.div key="boot" {...screenFade}>
                <BootScreen />
              </motion.div>
            ) : phase === "home" ? (
              <motion.div key="home" {...screenFade}>
                <HomeScreen clock={props.clock} focus={props.focus} onTileOpen={props.onTileOpen} />
              </motion.div>
            ) : phase === "loading" && playing ? (
              <motion.div key="loading" {...screenFade}>
                <LoadingScreen channel={playing.channel} />
              </motion.div>
            ) : playing ? (
              <motion.div key="playing" {...screenFade}>
                <PlayingScreen playing={playing} showTransport={!!showTransport} />
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* overlays */}
          <AnimatePresence>{osdKind === "volume" && power && <VolumeOsd volume={props.volume} muted={props.muted} />}</AnimatePresence>
          <AnimatePresence>{menu && power && <OptionsMenu menu={menu} onItem={props.onMenuItemClick} />}</AnimatePresence>
          <Toasts toasts={power ? toasts : []} />
          <AnimatePresence>{screensaver && power && <Screensaver clock={props.clock} onWake={props.onWake} />}</AnimatePresence>
          <AnimatePresence>{listening && power && <ListeningOverlay />}</AnimatePresence>
        </div>

        {/* chin: brand + standby LED */}
        <div className="flex items-center justify-between px-[1.2cqw] pb-[2px] pt-[6px]">
          <span className="text-[9px] font-bold tracking-[0.3em] text-white/25 sm:text-[10px]">
            ROKU · SELECT SERIES
          </span>
          <span
            className="block h-[6px] w-[6px] rounded-full"
            style={
              power
                ? { background: "#e9e4ff", boxShadow: "0 0 8px 1px rgba(160,107,255,0.8)" }
                : { background: "#ff3b30", boxShadow: "0 0 6px 1px rgba(255,59,48,0.55)", opacity: 0.85 }
            }
          />
        </div>
      </div>

      {/* stand */}
      <div className="relative mx-auto flex flex-col items-center">
        <div className="h-[14px] w-[70px] bg-gradient-to-b from-[#0b0b0e] to-[#141318]" />
        <div className="h-[10px] w-[210px] rounded-[50%] bg-gradient-to-b from-[#191821] to-[#08080b] shadow-[0_10px_24px_rgba(0,0,0,0.6)]" />
      </div>
    </div>
  );
}

const screenFade = {
  initial: { opacity: 0, scale: 0.985 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.99 },
  transition: { duration: 0.35 },
} as const;

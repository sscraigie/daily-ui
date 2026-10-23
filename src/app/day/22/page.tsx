"use client";

// Day 22 - Search Component
// A recreation of macOS Spotlight inside a small desktop environment:
// menu bar with a live clock, a magnifying dock, desktop files that
// deep-link into search, a working Calculator app window, notification
// toasts, and the Spotlight panel itself (fuzzy search across this
// challenge's 100 projects, apps, documents, folders, contacts, plus an
// inline calculator, unit/currency conversions, dictionary lookups, and
// web-search fallbacks).

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { RequireDarkMode } from "@/components/ThemeProvider";
import Spotlight, { type SpotlightAction } from "./Spotlight";
import {
  FinderIcon,
  LaunchpadIcon,
  SafariIcon,
  MailIcon,
  NotesIcon,
  MapsIcon,
  PhotosIcon,
  MusicIcon,
  CalculatorAppIcon,
  CalendarIcon,
  TerminalIcon,
  SettingsIcon,
  TrashIcon,
  FolderIcon,
  MagnifierIcon,
  ItemIcon,
  type IconId,
} from "./icons";

/* ------------------------------ notifications ----------------------------- */

type Toast = { id: number; message: string; icon?: IconId };

/* --------------------------------- page ----------------------------------- */

export default function Day22() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [calcOpen, setCalcOpen] = useState(false);
  const [prefill, setPrefill] = useState<{ value: string; nonce: number } | null>(null);
  const [recents, setRecents] = useState<string[]>([]);

  // auto-open shortly after landing so the demo showcases itself
  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 700);
    return () => clearTimeout(t);
  }, []);

  // restore recents
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("day22-spotlight-recents");
      if (raw) setRecents(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const pushRecents = useCallback((id: string) => {
    setRecents((prev) => {
      const next =
        id === "__clear__" ? [] : [id, ...prev.filter((r) => r !== id)].slice(0, 8);
      try {
        window.localStorage.setItem("day22-spotlight-recents", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const notify = useCallback((message: string, icon?: IconId) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { id, message, icon }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3400);
  }, []);

  const handleAction = useCallback(
    (a: SpotlightAction) => {
      switch (a.type) {
        case "navigate":
          setOpen(false);
          router.push(a.href);
          break;
        case "copy":
          navigator.clipboard?.writeText(a.text).catch(() => {});
          notify(`Copied “${a.text.length > 34 ? `${a.text.slice(0, 34)}…` : a.text}” to the clipboard`, typeof a.text === "string" && /[0-9]/.test(a.text[0] ?? "") ? "calculator" : "book");
          break;
        case "open-app":
          if (a.special === "calculator") {
            setOpen(false);
            setCalcOpen(true);
            break;
          }
          if (a.special === "launchpad") {
            setPrefill({ value: "", nonce: Date.now() });
            notify("Everything is one search away", "siri");
            break;
          }
          if (a.special === "spotlight") {
            setPrefill({ value: "", nonce: Date.now() });
            notify("You're already in Spotlight — try a search", "finder");
            break;
          }
          setOpen(false);
          notify(`“${a.name}” isn't wired up in this demo — Spotlight is the star`);
          break;
        case "web":
          window.open(a.url, "_blank", "noopener");
          setOpen(false);
          break;
        case "notify":
          notify(a.message, a.icon);
          break;
      }
    },
    [notify, router],
  );

  // global shortcuts: ⌘K / ⌘Space toggle, "/" opens
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if ((e.metaKey || e.ctrlKey) && e.code === "Space") {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "/" && !open) {
        const t = e.target as HTMLElement;
        if (t.tagName !== "INPUT" && t.tagName !== "TEXTAREA") {
          e.preventDefault();
          setOpen(true);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative h-full w-full select-none overflow-hidden font-sans text-white">
      <RequireDarkMode />

      {/* wallpaper */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 82% 108%, rgba(255,149,0,0.34), transparent 62%)," +
            "radial-gradient(90% 70% at 12% 92%, rgba(255,45,85,0.30), transparent 60%)," +
            "radial-gradient(120% 100% at 88% 12%, rgba(94,92,230,0.45), transparent 64%)," +
            "radial-gradient(110% 85% at 18% 8%, rgba(10,132,255,0.38), transparent 60%)," +
            "linear-gradient(180deg, #0a0c18 0%, #121627 55%, #191030 100%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute left-[8%] top-[18%] h-64 w-64 rounded-full bg-[#5e5ce6] opacity-25 blur-[110px]" />
        <div className="absolute bottom-[12%] right-[14%] h-72 w-72 rounded-full bg-[#ff2d55] opacity-20 blur-[120px]" />
        <div className="absolute bottom-[30%] left-[38%] h-56 w-56 rounded-full bg-[#0a84ff] opacity-20 blur-[100px]" />
      </div>

      <MenuBar onSearch={() => setOpen(true)} />

      {/* desktop files */}
      <DesktopIcons
        onOpen={(q) => {
          setPrefill({ value: q, nonce: Date.now() });
          setOpen(true);
        }}
      />

      {/* reopen hint (shown whenever Spotlight is closed) */}
      <AnimatePresence>
        {!open && (
          <div key="spotlight-hint" className="absolute left-1/2 top-[42%] z-10 -translate-x-1/2">
            <motion.button
              type="button"
              onClick={() => setOpen(true)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-[13px] text-white/90 shadow-lg backdrop-blur-xl transition hover:bg-white/15"
            >
              <MagnifierIcon className="h-4 w-4" />
              <span>
                Press <Kbd>⌘K</Kbd> or <Kbd>⌘Space</Kbd> to open Spotlight
              </span>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* calculator app window */}
      <AnimatePresence>{calcOpen && <CalculatorWindow onClose={() => setCalcOpen(false)} />}</AnimatePresence>

      <Dock
        onOpenSpotlight={() => {
          setOpen(true);
        }}
        onOpenCalculator={() => setCalcOpen(true)}
        onNotify={notify}
      />

      <Spotlight
        open={open}
        onClose={() => setOpen(false)}
        onAction={handleAction}
        recents={recents}
        onRecent={pushRecents}
        prefill={prefill}
      />

      {/* notifications */}
      <div className="pointer-events-none absolute right-3 top-10 z-[60] flex w-72 flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/10 bg-[#2a2a2e]/90 p-3 shadow-xl backdrop-blur-xl"
            >
              <ItemIcon id={t.icon ?? "siri"} className="h-9 w-9 shrink-0" />
              <p className="text-[12px] leading-snug text-white/90">{t.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="rounded-[5px] border border-white/20 bg-white/10 px-1.5 py-0.5 text-[11px] font-medium leading-none">{children}</kbd>
);

/* -------------------------------- menu bar -------------------------------- */

const MenuBar = ({ onSearch }: { onSearch: () => void }) => {
  // start with a deterministic placeholder so SSR and hydration match,
  // then switch to the live clock once mounted
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);

  const date = now
    ? now
        .toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
        .replace(",", "")
    : "Mon Jan 9";
  const time = now ? now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "9:41 AM";

  return (
    <div className="relative z-10 flex h-7 items-center justify-between bg-black/35 px-3 text-[12.5px] text-white/90 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <AppleLogo className="h-[15px] w-[15px]" />
        <span className="font-semibold">Finder</span>
        {["File", "Edit", "View", "Go", "Window", "Help"].map((m) => (
          <span key={m} className="hidden cursor-default opacity-80 transition hover:opacity-100 lg:inline">
            {m}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span className="hidden text-[11px] sm:inline">87%</span>
          <svg viewBox="0 0 26 12" className="h-3 w-6" aria-hidden="true">
            <rect x="0.5" y="0.5" width="21" height="11" rx="3" fill="none" stroke="white" strokeOpacity="0.6" />
            <rect x="2" y="2" width="15" height="8" rx="1.6" fill="white" fillOpacity="0.9" />
            <path d="M23 4v4c1.2-.4 1.2-3.6 0-4Z" fill="white" fillOpacity="0.6" />
          </svg>
        </span>
        <WifiIcon className="h-[15px] w-[15px]" />
        <button type="button" onClick={onSearch} aria-label="Open Spotlight" className="rounded p-0.5 transition hover:bg-white/15">
          <MagnifierIcon className="h-[15px] w-[15px]" />
        </button>
        <ControlCenterIcon className="hidden h-[15px] w-[15px] sm:inline" />
        <span className="hidden sm:inline">{date}</span>
        <span className="tabular-nums">{time}</span>
      </div>
    </div>
  );
};

const AppleLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M17.05 12.54c-.03-2.44 1.99-3.61 2.08-3.67-1.13-1.66-2.9-1.89-3.53-1.92-1.5-.15-2.93.88-3.69.88-.76 0-1.93-.86-3.18-.83-1.63.02-3.14.95-3.98 2.41-1.7 2.95-.43 7.32 1.22 9.72.81 1.17 1.78 2.49 3.05 2.44 1.22-.05 1.68-.79 3.16-.79 1.47 0 1.89.79 3.18.77 1.31-.02 2.14-1.19 2.94-2.37.93-1.36 1.31-2.68 1.33-2.75-.03-.01-2.55-.98-2.58-3.89ZM14.56 5.36c.67-.82 1.13-1.95 1-3.08-.97.04-2.14.65-2.84 1.46-.62.72-1.17 1.87-1.02 2.97 1.08.08 2.19-.55 2.86-1.35Z" />
  </svg>
);

const WifiIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M2.5 9.5C8 4.5 16 4.5 21.5 9.5" />
    <path d="M5.5 13C9.5 9.5 14.5 9.5 18.5 13" />
    <path d="M8.5 16.5c2-1.8 5-1.8 7 0" />
    <circle cx="12" cy="19.5" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

const ControlCenterIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <rect x="3" y="4.5" width="18" height="6.5" rx="3.25" />
    <circle cx="7" cy="7.75" r="1.6" fill="currentColor" stroke="none" />
    <rect x="3" y="13" width="18" height="6.5" rx="3.25" />
    <circle cx="17" cy="16.25" r="1.6" fill="currentColor" stroke="none" />
  </svg>
);

/* ------------------------------ desktop icons ------------------------------ */

const DesktopIcons = ({ onOpen }: { onOpen: (query: string) => void }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const items = [
    { id: "desk-folder", label: "daily-ui", icon: "folder" as IconId, query: "daily-ui" },
    { id: "desk-readme", label: "README.md", icon: "markdown" as IconId, query: "README" },
  ];
  return (
    <div className="absolute left-4 top-12 z-0 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelected(it.id);
          }}
          onDoubleClick={() => onOpen(it.query)}
          className={`flex w-20 flex-col items-center gap-1 rounded-lg p-2 transition ${selected === it.id ? "bg-white/20" : "hover:bg-white/10"}`}
        >
          <ItemIcon id={it.icon} className="h-14 w-14 drop-shadow-lg" />
          <span className="w-full truncate rounded px-1 text-center text-[11px] text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">{it.label}</span>
        </button>
      ))}
    </div>
  );
};

/* ---------------------------------- dock ---------------------------------- */

const DOCK_ITEMS: { id: string; name: string; icon: IconId; special?: "calculator" | "launchpad"; mobileHide?: boolean }[] = [
  { id: "dock-finder", name: "Finder", icon: "finder" },
  { id: "dock-launchpad", name: "Launchpad", icon: "launchpad", special: "launchpad", mobileHide: true },
  { id: "dock-safari", name: "Safari", icon: "safari" },
  { id: "dock-mail", name: "Mail", icon: "mail" },
  { id: "dock-notes", name: "Notes", icon: "notes" },
  { id: "dock-maps", name: "Maps", icon: "maps", mobileHide: true },
  { id: "dock-photos", name: "Photos", icon: "photos", mobileHide: true },
  { id: "dock-music", name: "Music", icon: "music" },
  { id: "dock-calculator", name: "Calculator", icon: "calculator", special: "calculator" },
  { id: "dock-calendar", name: "Calendar", icon: "calendar", mobileHide: true },
  { id: "dock-terminal", name: "Terminal", icon: "terminal" },
  { id: "dock-settings", name: "System Settings", icon: "settings", mobileHide: true },
  { id: "dock-trash", name: "Trash", icon: "trash" },
];

const Dock = ({
  onOpenSpotlight,
  onOpenCalculator,
  onNotify,
}: {
  onOpenSpotlight: () => void;
  onOpenCalculator: () => void;
  onNotify: (message: string, icon?: IconId) => void;
}) => {
  const iconRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [scales, setScales] = useState<number[]>(() => DOCK_ITEMS.map(() => 1));
  const raf = useRef<number | null>(null);

  const handleMove = (e: React.MouseEvent) => {
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = null;
      const cx = e.clientX;
      setScales(
        DOCK_ITEMS.map((_, i) => {
          const el = iconRefs.current[i];
          if (!el) return 1;
          const r = el.getBoundingClientRect();
          const d = Math.abs(r.left + r.width / 2 - cx);
          return 1 + 0.3 * Math.max(0, 1 - d / 110);
        }),
      );
    });
  };

  const handleLeave = () => setScales(DOCK_ITEMS.map(() => 1));

  return (
    <div className="absolute bottom-2.5 left-1/2 z-10 -translate-x-1/2">
      <div
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="flex items-end gap-1 rounded-[22px] border border-white/15 bg-white/10 px-2 pb-1.5 pt-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:gap-1.5"
      >
        {DOCK_ITEMS.map((it, i) => (
          <React.Fragment key={it.id}>
            {it.id === "dock-trash" && <div className="mx-1 h-11 w-px self-center bg-white/20" />}
            <button
              type="button"
              ref={(el) => {
                iconRefs.current[i] = el;
              }}
              aria-label={it.name}
              onClick={() => {
                if (it.special === "calculator") onOpenCalculator();
                else if (it.special === "launchpad") onOpenSpotlight();
                else onNotify(`“${it.name}” is just for show — Spotlight (⌘K) is the real demo`, it.icon);
              }}
              style={{ transform: `scale(${scales[i]}) translateY(${-(scales[i] - 1) * 9}px)`, transformOrigin: "bottom center" }}
              className={`flex flex-col items-center transition-transform duration-100 ease-out ${it.mobileHide ? "hidden sm:flex" : ""}`}
            >
              <ItemIcon id={it.icon} className="h-10 w-10 drop-shadow-lg sm:h-[46px] sm:w-[46px]" />
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

/* ----------------------------- calculator window --------------------------- */

const CALC_LAYOUT = [
  ["AC", "±", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "="],
];

const CalculatorWindow = ({ onClose }: { onClose: () => void }) => {
  const [display, setDisplay] = useState("0");
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);
  const [error, setError] = useState(false);

  const compute = (a: number, o: string, b: number): number => {
    switch (o) {
      case "+":
        return a + b;
      case "−":
        return a - b;
      case "×":
        return a * b;
      default:
        return b === 0 ? NaN : a / b;
    }
  };

  const fmt = (n: number) => {
    if (!isFinite(n) || isNaN(n)) return "Error";
    const rounded = Number(n.toPrecision(12));
    return String(rounded);
  };

  const press = (key: string) => {
    if (error && key !== "AC") return;
    if (key === "AC") {
      setDisplay("0");
      setAcc(null);
      setOp(null);
      setFresh(true);
      setError(false);
      return;
    }
    if (key === "±") {
      setDisplay((d) => (d.startsWith("-") ? d.slice(1) : d === "0" ? d : `-${d}`));
      return;
    }
    if (key === "%") {
      setDisplay((d) => fmt(parseFloat(d) / 100));
      setFresh(true);
      return;
    }
    if (key === "." ) {
      if (fresh) {
        setDisplay("0.");
        setFresh(false);
      } else if (!display.includes(".")) setDisplay(`${display}.`);
      return;
    }
    if ("÷×−+".includes(key)) {
      const current = parseFloat(display);
      if (acc !== null && op && !fresh) {
        const result = compute(acc, op, current);
        if (isNaN(result)) {
          setError(true);
          setDisplay("Error");
          return;
        }
        setAcc(result);
        setDisplay(fmt(result));
      } else {
        setAcc(current);
      }
      setOp(key);
      setFresh(true);
      return;
    }
    if (key === "=") {
      if (acc !== null && op) {
        const result = compute(acc, op, parseFloat(display));
        if (isNaN(result)) {
          setError(true);
          setDisplay("Error");
          return;
        }
        setDisplay(fmt(result));
        setAcc(null);
        setOp(null);
        setFresh(true);
      }
      return;
    }
    // digit
    setDisplay((d) => {
      if (fresh) return key;
      return d === "0" ? key : d + key;
    });
    setFresh(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 12 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      className="absolute right-8 top-16 z-20 w-[236px] overflow-hidden rounded-xl border border-white/15 bg-[#202022]/95 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
        <button type="button" onClick={onClose} aria-label="Close Calculator" className="h-3 w-3 rounded-full bg-[#ff5f57] transition hover:brightness-110" />
        <div className="h-3 w-3 rounded-full bg-[#febc2e] opacity-70" />
        <div className="h-3 w-3 rounded-full bg-[#28c840] opacity-70" />
        <span className="flex-1 text-center text-[12px] font-medium text-white/80">Calculator</span>
        <div className="w-9" />
      </div>
      <div className="px-4 pb-2 pt-3">
        <p className={`truncate text-right text-[34px] font-light leading-none tabular-nums ${error ? "text-[#ff453a]" : "text-white"}`}>{display}</p>
      </div>
      <div className="grid grid-cols-4 gap-[1px] bg-white/5 p-[1px]">
        {CALC_LAYOUT.flatMap((row, r) =>
          row.map((key) => {
            const isOpCol = key === "÷" || key === "×" || key === "−" || key === "+" || key === "=";
            const isFn = key === "AC" || key === "±" || key === "%";
            const wide = key === "0";
            return (
              <button
                key={key}
                type="button"
                onClick={() => press(key)}
                className={`flex h-[46px] items-center justify-center text-[17px] font-medium transition active:brightness-125 ${
                  wide ? "col-span-2" : ""
                } ${isOpCol ? "bg-[#ff9f0a] text-white hover:bg-[#ffb02e]" : isFn ? "bg-[#a5a5a5] text-black hover:bg-[#c0c0c0]" : "bg-[#333336] text-white hover:bg-[#454549]"}`}
              >
                {key}
              </button>
            );
          }),
        )}
      </div>
    </motion.div>
  );
};

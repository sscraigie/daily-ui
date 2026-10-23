"use client";

/**
 * Day 22 — Spotlight.
 * A recreation of macOS Sonoma's Spotlight search: fuzzy matching across the
 * search index, inline calculator / unit conversions / dictionary lookups,
 * web search fallbacks, a live preview pane, and full keyboard navigation.
 */

import React, { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ItemIcon, MagnifierIcon, type IconId } from "./icons";
import { DICTIONARY, SEARCH_INDEX, SUGGESTED_APP_IDS, EXAMPLE_CHIPS, getItem, type SearchItem } from "./data";
import { evalExpression, formatNumber, tryConvert, type Conversion } from "./evaluate";

/* --------------------------------- types --------------------------------- */

export type SpotlightAction =
  | { type: "navigate"; href: string }
  | { type: "copy"; text: string }
  | { type: "open-app"; name: string; special?: "calculator" | "launchpad" | "spotlight" }
  | { type: "web"; url: string }
  | { type: "notify"; message: string; icon?: IconId };

type MatchResult = { score: number; indices: number[] };

type ResultRow =
  | { type: "item"; item: SearchItem; match: MatchResult }
  | { type: "calc"; expr: string; value: number }
  | { type: "convert"; conversion: Conversion }
  | { type: "define"; word: string }
  | { type: "web"; query: string; label: string; url: string; icon: IconId; host: string };

type Section = { title: string; rows: ResultRow[]; clearRecents?: () => void };

type Props = {
  open: boolean;
  onClose: () => void;
  onAction: (action: SpotlightAction) => void;
  recents: string[];
  onRecent: (id: string) => void;
  /** lets the desktop deep-link a query into the panel (e.g. double-clicking a file) */
  prefill?: { value: string; nonce: number } | null;
};

/* ----------------------------- fuzzy matching ----------------------------- */

function matchText(query: string, text: string): MatchResult | null {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (!q) return null;

  const idx = t.indexOf(q);
  if (idx >= 0) {
    const score =
      1000 - Math.min(idx, 60) * 2 - Math.min(Math.max(t.length - q.length, 0), 50) + (idx === 0 ? 120 : 0) + (idx === 0 || /[^a-z0-9]/.test(t[idx - 1] ?? "") ? 60 : 0);
    const indices = Array.from({ length: q.length }, (_, i) => idx + i);
    return { score, indices };
  }

  // subsequence fallback
  const indices: number[] = [];
  let from = 0;
  for (const ch of q) {
    const found = t.indexOf(ch, from);
    if (found === -1) return null;
    indices.push(found);
    from = found + 1;
  }
  let score = 260;
  for (let i = 0; i < indices.length; i += 1) {
    if (i > 0 && indices[i] === indices[i - 1] + 1) score += 24;
    if (i === 0 || /[^a-z0-9]/.test(t[indices[i] - 1] ?? "")) score += 16;
  }
  return { score, indices };
}

function matchItem(query: string, item: SearchItem): MatchResult | null {
  // exact day-number boost: "12" jumps straight to Day 12
  if (item.kind === "project" && /^\d{1,3}$/.test(query.trim()) && item.id === `day-${Number(query.trim())}`) {
    return { score: 5000, indices: [] };
  }
  const title = matchText(query, item.title);
  let best = title?.score ?? -1;
  let bestIndices = title?.indices ?? [];
  for (const kw of item.keywords) {
    const m = matchText(query, kw);
    if (m && m.score * 0.62 > best) {
      best = m.score * 0.62;
      bestIndices = []; // keywords aren't rendered, so no highlight
    }
  }
  return best >= 0 ? { score: best, indices: bestIndices } : null;
}

/* ------------------------------ subcomponents ----------------------------- */

const Highlight = ({ text, indices }: { text: string; indices: number[] }) => {
  if (!indices.length) return <>{text}</>;
  const set = new Set(indices);
  const parts: React.ReactNode[] = [];
  let buf = "";
  let bold = false;
  const flush = () => {
    if (!buf) return;
    parts.push(
      bold ? (
        <span key={parts.length} className="font-bold">
          {buf}
        </span>
      ) : (
        <span key={parts.length}>{buf}</span>
      ),
    );
    buf = "";
  };
  for (let i = 0; i < text.length; i += 1) {
    const isBold = set.has(i);
    if (isBold !== bold) {
      flush();
      bold = isBold;
    }
    buf += text[i];
  }
  flush();
  return <>{parts}</>;
};

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="rounded-[5px] border border-white/15 bg-white/10 px-[5px] py-[2px] font-sans text-[10px] font-medium leading-none text-[#dedee4]">
    {children}
  </kbd>
);

const rowKey = (row: ResultRow): string =>
  row.type === "item" ? `i-${row.item.id}` : row.type === "web" ? `w-${row.url}` : row.type === "calc" ? "calc" : row.type === "convert" ? `c-${row.conversion.from}-${row.conversion.to}` : `d-${row.word}`;

/* ------------------------------- spotlight -------------------------------- */

export default function Spotlight({ open, onClose, onAction, recents, onRecent, prefill }: Props) {
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const sections = useMemo<Section[]>(() => {
    if (!query.trim()) {
      const sugg: Section = {
        title: "Siri Suggestions",
        rows: SUGGESTED_APP_IDS.map((id) => getItem(id))
          .filter((i): i is SearchItem => Boolean(i))
          .map((item) => ({ type: "item" as const, item, match: { score: 0, indices: [] } })),
      };
      const out: Section[] = [sugg];
      if (recents.length) {
        out.push({
          title: "Recents",
          clearRecents: () => onRecent("__clear__"),
          rows: recents
            .slice(0, 6)
            .map((id) => getItem(id))
            .filter((i): i is SearchItem => Boolean(i))
            .map((item) => ({ type: "item" as const, item, match: { score: 0, indices: [] } })),
        });
      }
      out.push({
        title: "Daily UI Projects",
        rows: SEARCH_INDEX.filter((i) => i.kind === "project" && i.built)
          .slice(-6)
          .reverse()
          .map((item) => ({ type: "item" as const, item, match: { score: 0, indices: [] } })),
      });
      return out;
    }

    const q = query.trim();
    const out: Section[] = [];

    // inline calculator
    const value = evalExpression(q);
    if (value !== null && /[+\-*/^%]|sqrt|sin|cos|tan|log|ln|abs|round|floor|ceil|pi|phi|tau/.test(q.toLowerCase())) {
      out.push({ title: "Calculator", rows: [{ type: "calc", expr: q, value }] });
    }

    // unit + currency conversion
    const conversion = tryConvert(q);
    if (conversion) {
      out.push({ title: "Conversion", rows: [{ type: "convert", conversion }] });
    }

    // dictionary
    const defineMatch = /^(?:define|definition of)\s+(.+)$/i.exec(q);
    const word = (defineMatch ? defineMatch[1] : q).trim().toLowerCase();
    const entry = DICTIONARY.find((d) => d.word === word);
    if (entry) {
      out.push({ title: "Dictionary", rows: [{ type: "define", word: entry.word }] });
    }

    // indexed items
    const scored = SEARCH_INDEX.map((item) => ({ item, match: matchItem(q, item) }))
      .filter((r): r is { item: SearchItem; match: MatchResult } => r.match !== null)
      .sort((a, b) => b.match.score - a.match.score);

    const topHits = scored.slice(0, 3).filter((r) => r.match.score >= 420).map((r) => ({ type: "item" as const, item: r.item, match: r.match }));
    if (topHits.length) out.push({ title: "Top Hits", rows: topHits });
    const topHitIds = new Set(topHits.map((r) => r.item.id));

    const byKind = (kind: SearchItem["kind"], cap: number) =>
      scored
        .filter((r) => r.item.kind === kind && !topHitIds.has(r.item.id))
        .slice(0, cap)
        .map((r) => ({ type: "item" as const, item: r.item, match: r.match }));

    const appRows = byKind("app", 6);
    if (appRows.length) out.push({ title: "Applications", rows: appRows });
    const projectRows = byKind("project", 8);
    if (projectRows.length) out.push({ title: "Daily UI Projects", rows: projectRows });
    const docRows = byKind("document", 5);
    if (docRows.length) out.push({ title: "Documents", rows: docRows });
    const folderRows = byKind("folder", 3);
    if (folderRows.length) out.push({ title: "Folders", rows: folderRows });
    const contactRows = byKind("contact", 2);
    if (contactRows.length) out.push({ title: "Contacts", rows: contactRows });
    const pageRows = byKind("page", 2);
    if (pageRows.length) out.push({ title: "Pages", rows: pageRows });

    if (q.length >= 2) {
      out.push({
        title: "Websites",
        rows: [
          { type: "web", query: q, label: `Search the web for “${q}”`, url: `https://www.google.com/search?q=${encodeURIComponent(q)}`, icon: "globe", host: "google.com" },
          { type: "web", query: q, label: `Search Wikipedia for “${q}”`, url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q)}`, icon: "globe", host: "wikipedia.org" },
        ],
      });
    }
    return out;
  }, [query, recents, onRecent]);

  const flatRows = useMemo(() => sections.flatMap((s) => s.rows), [sections]);
  const flatStart = useMemo(() => {
    let n = 0;
    return sections.map((s) => {
      const start = n;
      n += s.rows.length;
      return start;
    });
  }, [sections]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    if (selected >= flatRows.length) setSelected(Math.max(0, flatRows.length - 1));
  }, [flatRows.length, selected]);

  // scroll selected row into view
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-row="${selected}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selected, flatRows.length]);

  // focus input when opened
  useEffect(() => {
    if (open) {
      setSelected(0);
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  // deep-linked query from the desktop (e.g. double-click a file)
  useEffect(() => {
    if (!open || !prefill) return;
    setQuery(prefill.value);
    setSelected(0);
    const t = setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(prefill.value.length, prefill.value.length);
    }, 30);
    return () => clearTimeout(t);
  }, [open, prefill]);

  const activate = (row: ResultRow | undefined) => {
    if (!row) return;
    if (row.type === "item") onRecent(row.item.id);
    switch (row.type) {
      case "calc":
        onAction({ type: "copy", text: formatNumber(row.value) });
        break;
      case "convert":
        onAction({ type: "copy", text: row.conversion.output });
        break;
      case "define": {
        const def = DICTIONARY.find((d) => d.word === row.word);
        if (def) onAction({ type: "copy", text: `${def.word} — ${def.defs[0]}` });
        break;
      }
      case "web":
        onAction({ type: "web", url: row.url });
        break;
    }
  };

  const activateItem = (item: SearchItem) => {
    if (item.kind === "app") {
      onAction({ type: "open-app", name: item.title, special: item.action as "calculator" | "launchpad" | "spotlight" | undefined });
      return;
    }
    if (item.kind === "page") {
      onAction({ type: "navigate", href: item.href ?? "/" });
      return;
    }
    if (item.kind === "project") {
      if (item.built) onAction({ type: "navigate", href: item.href ?? "/" });
      else onAction({ type: "notify", message: `Day ${item.id.replace("day-", "")} isn't built yet — 22 of 100 done` });
      return;
    }
    onAction({ type: "notify", message: `“${item.title}” is a mock — nothing to open` });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => (flatRows.length ? (s + 1) % flatRows.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => (flatRows.length ? (s - 1 + flatRows.length) % flatRows.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const row = flatRows[selected];
      if (row?.type === "item") activateItem(row.item);
      else activate(row);
    }
  };

  // Escape works regardless of what's focused while the panel is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      if (query) {
        setQuery("");
        inputRef.current?.focus();
      } else {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, query, onClose]);

  const selectedRow = flatRows[selected];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="spotlight-backdrop"
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/15 px-3 pt-[10vh] sm:pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          role="dialog"
          aria-label="Spotlight Search"
        >
          <motion.div
            className="relative w-[min(92vw,640px)] overflow-hidden rounded-[24px] border border-white/25 bg-white/[0.08] shadow-[0_25px_80px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.25)] backdrop-blur-3xl backdrop-saturate-150"
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ type: "spring", stiffness: 520, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* liquid-glass sheen: diagonal specular highlight + inner edge light */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 rounded-[24px] bg-[linear-gradient(140deg,rgba(255,255,255,0.22),rgba(255,255,255,0.03)_38%,rgba(255,255,255,0.08)_72%,rgba(255,255,255,0.20))] shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(255,255,255,0.12),inset_1px_0_0_rgba(255,255,255,0.10),inset_-1px_0_0_rgba(255,255,255,0.10),inset_0_0_30px_rgba(255,255,255,0.06)]"
            />

            {/* search field */}
            <div className="flex items-center gap-3 px-4 pb-1 pt-3.5">
              <MagnifierIcon className="h-[22px] w-[22px] shrink-0 text-[#d6d6dd]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Spotlight Search"
                spellCheck={false}
                autoComplete="off"
                aria-activedescendant={flatRows.length ? `spotlight-row-${selected}` : undefined}
                aria-label="Spotlight Search"
                className="min-w-0 flex-1 bg-transparent text-[20px] font-light text-white caret-[#0a84ff] outline-none placeholder:text-[#b2b2bb]"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#48484d] text-[#e2e2e7] transition hover:bg-[#5a5a60]"
                >
                  <svg viewBox="0 0 10 10" className="h-[9px] w-[9px]" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M1.5 1.5 8.5 8.5 M8.5 1.5 1.5 8.5" />
                  </svg>
                </button>
              )}
            </div>
            <div className="mx-0 border-t border-white/10" />

            <div className="flex min-h-0">
              {/* results */}
              <div ref={listRef} role="listbox" aria-label="Search results" className="max-h-[min(52vh,460px)] min-w-0 flex-1 overflow-y-auto overscroll-contain px-1.5 pb-2 pt-1 [scrollbar-width:thin]">
                {!query.trim() && (
                  <div className="flex flex-wrap gap-1.5 px-2.5 pb-1 pt-2">
                    {EXAMPLE_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => {
                          setQuery(chip);
                          inputRef.current?.focus();
                        }}
                        className="rounded-full border border-white/10 bg-white/[0.07] px-2.5 py-1 text-[11px] text-[#e2e2e7] transition hover:bg-white/15 hover:text-white"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}

                {flatRows.length === 0 && (
                  <div className="flex flex-col items-center gap-1 py-10 text-center">
                    <p className="text-[14px] font-semibold text-white">No Results</p>
                    <p className="text-[12px] text-[#d6d6dd]">Try a different search</p>
                  </div>
                )}

                {sections.map((section, s) =>
                  section.rows.length === 0 ? null : (
                    <div key={section.title} className="pb-1.5">
                      <div className="flex items-center justify-between px-2.5 pb-1 pt-2">
                        <span className="text-[11px] font-semibold text-[#cacad2]">{section.title}</span>
                        {section.clearRecents && recents.length > 0 && (
                          <button type="button" onClick={section.clearRecents} className="text-[11px] text-[#4aa3ff] transition hover:underline">
                            Clear
                          </button>
                        )}
                      </div>
                      {section.rows.map((row) => {
                        const idx = flatRows.indexOf(row);
                        const isSelected = idx === selected;
                        return (
                          <div
                            key={rowKey(row)}
                            id={`spotlight-row-${idx}`}
                            data-row={idx}
                            role="option"
                            aria-selected={isSelected}
                            onMouseMove={() => setSelected(idx)}
                            onClick={() => (row.type === "item" ? activateItem(row.item) : activate(row))}
                            className={`flex h-10 cursor-default items-center gap-2.5 rounded-[9px] px-2.5 text-white transition-colors duration-75 ${
                              isSelected ? "bg-[#0a84ff]" : ""
                            }`}
                          >
                            <ResultIcon row={row} />
                            <span className="min-w-0 flex-1 truncate">
                              <RowTitle row={row} />
                            </span>
                            <RowTrailing row={row} />
                          </div>
                        );
                      })}
                    </div>
                  ),
                )}
              </div>

              {/* preview pane */}
              {selectedRow && (
                <div className="hidden w-[260px] shrink-0 border-l border-white/10 sm:block">
                  <motion.div
                    key={rowKey(selectedRow)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.12 }}
                  >
                    <Preview row={selectedRow} onAction={onAction} />
                  </motion.div>
                </div>
              )}
            </div>

            {/* footer hints */}
            <div className="flex items-center justify-end gap-3 border-t border-white/10 px-4 py-1.5 text-[10.5px] text-[#cacad2]">
              <span className="flex items-center gap-1">
                <Kbd>↑↓</Kbd> navigate
              </span>
              <span className="flex items-center gap-1">
                <Kbd>↩</Kbd> open
              </span>
              <span className="flex items-center gap-1">
                <Kbd>esc</Kbd> {query ? "clear" : "close"}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------ row fragments ----------------------------- */

const ResultIcon = ({ row }: { row: ResultRow }) => (
  <ItemIcon id={row.type === "web" ? "globe" : row.type === "define" ? "book" : row.type === "calc" || row.type === "convert" ? "calculator" : row.item.icon} className="h-6 w-6 shrink-0 drop-shadow-sm" />
);

const RowTitle = ({ row }: { row: ResultRow }) => {
  switch (row.type) {
    case "calc":
      return <span className="text-[13px]">{row.expr}</span>;
    case "convert":
      return <span className="text-[13px]">{row.conversion.input}</span>;
    case "define":
      return <span className="text-[13px]">{row.word}</span>;
    case "web":
      return <span className="text-[13px]">{row.label}</span>;
    case "item": {
      const item = row.item;
      return (
        <span className="text-[13px]">
          <Highlight text={item.title} indices={row.match.indices} />
        </span>
      );
    }
  }
};

const RowTrailing = ({ row }: { row: ResultRow }) => {
  switch (row.type) {
    case "calc":
      return <span className="shrink-0 pl-2 text-[14px] font-medium tabular-nums">{formatNumber(row.value)}</span>;
    case "convert":
      return <span className="shrink-0 pl-2 text-[13px] font-medium">{row.conversion.output}</span>;
    case "item":
      return <span className="shrink-0 truncate pl-2 text-[11px] text-[#d6d6dd]">{row.item.subtitle}</span>;
    default:
      return null;
  }
};

/* -------------------------------- preview -------------------------------- */

const Preview = ({ row, onAction }: { row: ResultRow; onAction: (a: SpotlightAction) => void }) => {
  if (row.type === "calc") {
    return (
      <div className="flex h-full flex-col p-4">
        <ItemIcon id="calculator" className="h-12 w-12" />
        <p className="mt-3 text-[22px] font-semibold tabular-nums text-white">= {formatNumber(row.value)}</p>
        <p className="mt-0.5 text-[12px] text-[#d6d6dd]">{row.expr}</p>
        <div className="mt-auto pt-3">
          <ActionButton label="Copy result" onClick={() => onAction({ type: "copy", text: formatNumber(row.value) })} />
        </div>
      </div>
    );
  }
  if (row.type === "convert") {
    return (
      <div className="flex h-full flex-col p-4">
        <ItemIcon id="calculator" className="h-12 w-12" />
        <p className="mt-3 text-[19px] font-semibold tabular-nums text-white">{row.conversion.output}</p>
        <p className="mt-0.5 text-[12px] text-[#d6d6dd]">{row.conversion.detail}</p>
        <div className="mt-auto pt-3">
          <ActionButton label="Copy result" onClick={() => onAction({ type: "copy", text: row.conversion.output })} />
        </div>
      </div>
    );
  }
  if (row.type === "define") {
    const def = DICTIONARY.find((d) => d.word === row.word);
    if (!def) return null;
    return (
      <div className="flex h-full flex-col p-4">
        <ItemIcon id="book" className="h-12 w-12" />
        <p className="mt-3 text-[17px] font-semibold text-white">{def.word}</p>
        <p className="text-[11.5px] text-[#d6d6dd]">
          {def.phonetic} · {def.part}
        </p>
        <p className="mt-2.5 text-[12.5px] leading-relaxed text-[#e4e4e9]">{def.defs[0]}</p>
        {def.defs[1] && <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#d6d6dd]">{def.defs[1]}</p>}
        <p className="mt-2.5 text-[12px] italic leading-relaxed text-[#cacad2]">{def.example}</p>
        <div className="mt-auto pt-3">
          <ActionButton label="Copy definition" onClick={() => onAction({ type: "copy", text: `${def.word} — ${def.defs[0]}` })} />
        </div>
      </div>
    );
  }
  if (row.type === "web") {
    return (
      <div className="flex h-full flex-col p-4">
        <ItemIcon id="globe" className="h-12 w-12" />
        <p className="mt-3 text-[15px] font-semibold text-white">Web Search</p>
        <p className="mt-0.5 break-all text-[12px] text-[#d6d6dd]">{row.host}</p>
        <p className="mt-3 text-[12.5px] leading-relaxed text-[#e4e4e9]">Opens in your browser — Spotlight hands the query off to the web.</p>
        <div className="mt-auto pt-3">
          <ActionButton label="Search the web" onClick={() => onAction({ type: "web", url: row.url })} />
        </div>
      </div>
    );
  }

  // SearchItem preview
  const item = row.item;
  return (
    <div className="flex h-full flex-col p-4">
      {item.kind === "project" && item.built ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/${item.id.replace("day-", "")}.png`} alt={item.title} className="aspect-[16/10] w-full rounded-xl border border-white/10 object-cover" />
      ) : (
        <ItemIcon id={item.icon} className="h-16 w-16" />
      )}
      <p className="mt-3 text-[15px] font-semibold leading-snug text-white">{item.title}</p>
      <p className="mt-0.5 text-[12px] text-[#d6d6dd]">{item.subtitle ?? "Item"}</p>
      {item.kind === "project" && !item.built && (
        <p className="mt-3 rounded-lg border border-white/10 bg-white/[0.06] p-2.5 text-[12px] leading-relaxed text-[#e2e2e7]">
          This prompt hasn&apos;t been built yet — day {item.meta[1][1].replace(" of 100", "")} of the 100-day challenge.
        </p>
      )}
      <div className="mt-3 space-y-1.5">
        {item.meta.map(([k, v]) => (
          <div key={k} className="flex items-start justify-between gap-2 text-[11.5px]">
            <span className="shrink-0 text-[#cacad2]">{k}</span>
            <span className="text-right text-[#e4e4e9]">{v}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto pt-3">
        {item.kind === "app" && (
          <ActionButton label="Open" onClick={() => onAction({ type: "open-app", name: item.title, special: item.action as "calculator" | "launchpad" | "spotlight" | undefined })} />
        )}
        {item.kind === "project" && item.built && <ActionButton label="Open Project" onClick={() => onAction({ type: "navigate", href: item.href ?? "/" })} />}
        {item.kind === "page" && <ActionButton label="Open Page" onClick={() => onAction({ type: "navigate", href: item.href ?? "/" })} />}
        {(item.kind === "document" || item.kind === "folder" || item.kind === "contact") && (
          <ActionButton label="Open in Finder" onClick={() => onAction({ type: "notify", message: `“${item.title}” is a mock — nothing to open` })} />
        )}
      </div>
    </div>
  );
};

const ActionButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full rounded-[9px] bg-[#0a84ff] py-1.5 text-[12.5px] font-medium text-white transition hover:bg-[#2f97ff] active:scale-[0.98]"
  >
    {label}
  </button>
);

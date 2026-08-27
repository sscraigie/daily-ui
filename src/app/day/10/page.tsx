"use client";
// Day 10 - Social Share
// Inspiration: https://dribbble.com/shots/19427434-Share-Popup
// Animated social share sheet with copy-to-clipboard, share previews and reactions

import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";

const platforms = [
  {
    id: "twitter",
    label: "Twitter",
    color: "#1DA1F2",
    bg: "#E8F5FE",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: "facebook",
    label: "Facebook",
    color: "#1877F2",
    bg: "#E8F0FE",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    color: "#0A66C2",
    bg: "#E7F0FA",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    color: "#25D366",
    bg: "#E8FCF0",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    id: "reddit",
    label: "Reddit",
    color: "#FF4500",
    bg: "#FEF0EB",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
      </svg>
    ),
  },
  {
    id: "email",
    label: "Email",
    color: "#EA4335",
    bg: "#FDECEA",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="h-5 w-5"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

const reactions = ["❤️", "🔥", "🎉", "👏", "😮", "💯"];

export default function Day10() {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState<string | null>(null);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({
    "❤️": 284,
    "🔥": 147,
    "🎉": 93,
    "👏": 211,
    "😮": 56,
    "💯": 138,
  });

  const url = "https://dailyui.dev/day/10";

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleShare = (id: string) => {
    setShared(id);
    setTimeout(() => setShared(null), 1800);
  };

  const handleReact = (r: string) => {
    setReactionCounts((prev) => {
      const alreadyActive = activeReaction === r;
      const counts = { ...prev };
      if (alreadyActive) {
        counts[r] -= 1;
        setActiveReaction(null);
        return counts;
      }
      if (activeReaction) counts[activeReaction] -= 1;
      counts[r] += 1;
      setActiveReaction(r);
      return counts;
    });
  };

  return (
    <div
      className="flex min-h-full w-full flex-col items-center justify-center gap-8 p-6"
      style={{
        background: "linear-gradient(135deg, #f0f4ff 0%, #fdf2ff 100%)",
      }}
    >
      {/* Share card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.15 }}
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-xl"
      >
        <div className="p-6">
          <h3 className="m-0 mb-5 text-base font-bold text-gray-800">
            Share this article
          </h3>

          {/* Platform grid */}
          <div className="mb-5 grid grid-cols-3 gap-3">
            {platforms.map((p, i) => (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.3 + i * 0.07,
                  type: "spring",
                  stiffness: 200,
                }}
                onClick={() => handleShare(p.id)}
                whileHover={{ y: -3, scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-none px-2 py-3 transition-all"
                style={{ background: shared === p.id ? p.bg : "#f9fafb" }}
              >
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ color: p.color, background: p.bg }}
                >
                  {p.icon}
                </div>
                <AnimatePresence mode="wait">
                  {shared === p.id ? (
                    <motion.span
                      key="sent"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-[10px] font-bold"
                      style={{ color: p.color }}
                    >
                      Shared!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="text-[11px] font-medium text-gray-600"
                    >
                      {p.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>

          {/* Copy link */}
          <div
            className="mb-5 flex items-center gap-3 rounded-2xl p-3"
            style={{ background: "#f3f4f6" }}
          >
            <svg
              className="h-4 w-4 flex-shrink-0 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <span className="flex-1 truncate text-sm text-gray-500">{url}</span>
            <motion.button
              onClick={handleCopy}
              whileTap={{ scale: 0.9 }}
              className="flex-shrink-0 cursor-pointer rounded-xl border-none px-4 py-1.5 text-sm font-semibold"
              style={{
                background: copied
                  ? "linear-gradient(90deg, #10b981, #059669)"
                  : "linear-gradient(90deg, #667eea, #764ba2)",
                color: "#fff",
                minWidth: 72,
              }}
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.span
                    key="done"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Copied!
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Copy
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Reactions */}
          <div>
            <p className="m-0 mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Reactions ·{" "}
              {Object.values(reactionCounts).reduce((a, b) => a + b, 0)}
            </p>
            <div className="flex flex-wrap gap-2">
              {reactions.map((r, i) => (
                <motion.button
                  key={r}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  onClick={() => handleReact(r)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.85 }}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full border-none px-3 py-1.5 text-sm font-medium"
                  style={{
                    background: activeReaction === r ? "#ede9fe" : "#f3f4f6",
                    border:
                      activeReaction === r
                        ? "1.5px solid #7c3aed"
                        : "1.5px solid transparent",
                    color: activeReaction === r ? "#7c3aed" : "#374151",
                  }}
                >
                  <motion.span
                    animate={
                      activeReaction === r
                        ? { scale: [1, 1.4, 1], rotate: [-10, 10, 0] }
                        : {}
                    }
                    transition={{ duration: 0.3 }}
                  >
                    {r}
                  </motion.span>
                  <motion.span layout>
                    {reactionCounts[r].toLocaleString()}
                  </motion.span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

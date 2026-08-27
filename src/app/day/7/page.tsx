"use client";
// Day 7 - Settings
// Inspiration: https://dribbble.com/shots/20489414-Settings-Page-UI-Design
// A polished settings panel with animated toggles, sliders, and section transitions

import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useDarkMode } from "@/components/ThemeProvider";

type SettingToggle = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
};

type Section = "account" | "notifications" | "privacy" | "appearance";

const sectionVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.06 } },
  exit: { opacity: 0, x: -20 },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

function Toggle({
  enabled,
  onToggle,
  accent = ["#6366f1", "#8b5cf6"],
  animated = true,
  dark = false,
}: {
  enabled: boolean;
  onToggle: () => void;
  accent?: [string, string];
  animated?: boolean;
  dark?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      className="relative flex-shrink-0 w-12 h-6 rounded-full border-none cursor-pointer p-0"
      style={{
        background: enabled
          ? `linear-gradient(90deg, ${accent[0]}, ${accent[1]})`
          : dark
            ? "#3f4354"
            : "#d1d5db",
      }}
    >
      <motion.div
        animate={{ x: enabled ? 26 : 2 }}
        transition={
          animated
            ? { type: "spring", stiffness: 500, damping: 30 }
            : { duration: 0 }
        }
        className="absolute left-0 top-[2px] w-5 h-5 bg-white rounded-full shadow"
      />
    </button>
  );
}

function Slider({
  label,
  value,
  onChange,
  icon,
  accent = ["#6366f1", "#8b5cf6"],
  dark = false,
  animated = true,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  icon: React.ReactNode;
  accent?: [string, string];
  dark?: boolean;
  animated?: boolean;
}) {
  return (
    <motion.div variants={itemVariants} className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span style={{ color: accent[0] }}>{icon}</span>
          <span
            className="text-[0.875em] font-medium"
            style={{ color: dark ? "#e5e7eb" : "#374151" }}
          >
            {label}
          </span>
        </div>
        <span className="text-[0.875em] font-semibold" style={{ color: accent[0] }}>
          {value}%
        </span>
      </div>
      <div
        className="relative h-2 rounded-full overflow-hidden"
        style={{ background: dark ? "#374151" : "#e5e7eb" }}
      >
        <motion.div
          className="absolute h-full rounded-full"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${accent[0]}, ${accent[1]})`,
          }}
          layout
          transition={animated ? { type: "spring", stiffness: 300 } : { duration: 0 }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </motion.div>
  );
}

const ACCENTS: [string, string][] = [
  ["#6366f1", "#818cf8"],
  ["#ec4899", "#f472b6"],
  ["#10b981", "#34d399"],
  ["#f59e0b", "#fbbf24"],
  ["#ef4444", "#f87171"],
  ["#06b6d4", "#22d3ee"],
];

export default function Day7() {
  const [activeSection, setActiveSection] = useState<Section>("account");
  const [brightness, setBrightness] = useState(72);
  const [volume, setVolume] = useState(55);
  const [fontSize, setFontSize] = useState(65);
  const [accentIndex, setAccentIndex] = useState(0);

  const [toggles, setToggles] = useState<Record<string, SettingToggle[]>>({
    notifications: [
      {
        id: "push",
        label: "Push Notifications",
        description: "Receive alerts for activity",
        enabled: true,
      },
      {
        id: "email",
        label: "Email Digest",
        description: "Daily summary emails",
        enabled: false,
      },
      {
        id: "desktop",
        label: "Desktop Alerts",
        description: "Show banner notifications",
        enabled: true,
      },
      {
        id: "sound",
        label: "Notification Sound",
        description: "Play audio on alerts",
        enabled: false,
      },
    ],
    privacy: [
      {
        id: "location",
        label: "Location Access",
        description: "Allow apps to use your location",
        enabled: false,
      },
      {
        id: "analytics",
        label: "Usage Analytics",
        description: "Share anonymous usage data",
        enabled: true,
      },
      {
        id: "2fa",
        label: "Two-Factor Auth",
        description: "Extra security on sign in",
        enabled: true,
      },
      {
        id: "visible",
        label: "Public Profile",
        description: "Others can find your profile",
        enabled: false,
      },
    ],
    appearance: [
      {
        id: "dark",
        label: "Dark Mode",
        description: "Use a darker color scheme",
        enabled: false,
      },
      {
        id: "animations",
        label: "Animations",
        description: "Enable motion effects",
        enabled: true,
      },
      {
        id: "compact",
        label: "Compact View",
        description: "Reduce whitespace in lists",
        enabled: false,
      },
    ],
  });

  const appearanceToggles = toggles["appearance"];
  const dark = appearanceToggles.find((t) => t.id === "dark")?.enabled ?? false;
  const animated = appearanceToggles.find((t) => t.id === "animations")?.enabled ?? true;
  const compact = appearanceToggles.find((t) => t.id === "compact")?.enabled ?? false;

  const { setDark } = useDarkMode();

  // Mirror the in-page "Dark Mode" toggle onto the site-wide theme.
  useEffect(() => {
    setDark(dark);
  }, [dark, setDark]);

  // Reset the site-wide theme back to light mode as soon as this page is left.
  useEffect(() => {
    return () => setDark(false);
  }, [setDark]);
  const accent = ACCENTS[accentIndex];
  const accentGradient = `linear-gradient(90deg, ${accent[0]}, ${accent[1]})`;
  const accentGradientDiag = `linear-gradient(135deg, ${accent[0]}, ${accent[1]})`;
  const fontScale = 0.85 + (fontSize / 100) * 0.4; // 0.85rem - 1.25rem base scale
  const brightnessFilter = 0.6 + (brightness / 100) * 0.6; // 0.6 - 1.2

  const flip = (section: string, id: string) => {
    setToggles((prev) => ({
      ...prev,
      [section]: prev[section].map((t) =>
        t.id === id ? { ...t, enabled: !t.enabled } : t,
      ),
    }));
  };

  const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
    {
      id: "account",
      label: "Account",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
    {
      id: "privacy",
      label: "Privacy",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className="min-h-full w-full flex items-center justify-center p-4"
      style={{
        background: dark
          ? "linear-gradient(135deg, #1c1e2a 0%, #23263a 50%, #1c1e2a 100%)"
          : "linear-gradient(135deg, #f5f7ff 0%, #e8ebff 50%, #f0f4ff 100%)",
      }}
    >
      <motion.div
        initial={animated ? { opacity: 0, y: 30 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: animated ? 0.6 : 0 }}
        className="w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
        style={{
          minHeight: 540,
          background: dark ? "#1a1c26" : "#ffffff",
          filter: `brightness(${brightnessFilter})`,
          fontSize: `${fontScale}rem`,
          transition: "none",
        }}
      >
        {/* Sidebar */}
        <div
          className={`md:w-56 flex-shrink-0 flex flex-col gap-2 ${compact ? "p-4" : "p-6"}`}
          style={{
            background: accentGradientDiag,
          }}
        >
          <div className={compact ? "mb-3" : "mb-6"}>
            <h2 className="text-white text-[1.25em] font-bold m-0">Settings</h2>
            <p className="text-indigo-100/80 text-[0.75em] mt-1 m-0">Manage your account</p>
          </div>

          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              whileHover={animated ? { x: 4 } : undefined}
              whileTap={animated ? { scale: 0.97 } : undefined}
              className={`flex items-center gap-3 rounded-xl border-none cursor-pointer text-left ${compact ? "px-3 py-1.5" : "px-3 py-2.5"}`}
              style={{
                background:
                  activeSection === item.id
                    ? "rgba(255,255,255,0.25)"
                    : "transparent",
                color: activeSection === item.id ? "#fff" : "rgba(255,255,255,0.65)",
              }}
            >
              {item.icon}
              <span className="text-[0.875em] font-medium">{item.label}</span>
              {activeSection === item.id && (
                <motion.div
                  layoutId={animated ? "activeIndicator" : undefined}
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                />
              )}
            </motion.button>
          ))}

          {/* Avatar area */}
          <div className={`mt-auto ${compact ? "pt-3" : "pt-6"}`}>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-[0.875em] font-bold text-white flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.25)" }}
              >
                SC
              </div>
              <div>
                <p className="m-0 text-white text-[0.75em] font-semibold">Spencer C.</p>
                <p className="m-0 text-indigo-100/80 text-[10px]">Pro Account</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          className={`flex-1 overflow-y-auto ${compact ? "p-4" : "p-7"}`}
          style={{ background: dark ? "#1a1c26" : "#ffffff", transition: "none" }}
        >
          <AnimatePresence mode={animated ? "wait" : undefined}>
            <motion.div
              key={activeSection}
              variants={animated ? sectionVariants : undefined}
              initial={animated ? "hidden" : false}
              animate="visible"
              exit={animated ? "exit" : undefined}
              transition={{ duration: animated ? 0.25 : 0 }}
              className={`flex flex-col ${compact ? "gap-3" : "gap-6"}`}
            >
              {/* Account */}
              {activeSection === "account" && (
                <>
                  <motion.div variants={itemVariants}>
                    <h3
                      className="text-[1.125em] font-bold m-0 mb-1"
                      style={{ color: dark ? "#f3f4f6" : "#1f2937" }}
                    >
                      Account Details
                    </h3>
                    <p className="text-[0.875em] m-0" style={{ color: dark ? "#9ca3af" : "#6b7280" }}>
                      Update your personal information
                    </p>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{ background: dark ? "#232636" : "#eef1ff" }}
                  >
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-[1.5em] font-bold text-white flex-shrink-0"
                      style={{ background: accentGradientDiag }}
                    >
                      SC
                    </div>
                    <div>
                      <p className="m-0 font-bold" style={{ color: dark ? "#f3f4f6" : "#1f2937" }}>
                        Spencer Craigie
                      </p>
                      <p className="m-0 text-[0.875em]" style={{ color: dark ? "#9ca3af" : "#6b7280" }}>
                        me@spencercraigie.com
                      </p>
                      <button
                        className="mt-1 text-[0.75em] font-medium border-none bg-transparent cursor-pointer p-0"
                        style={{ color: accent[0] }}
                      >
                        Change photo →
                      </button>
                    </div>
                  </motion.div>

                  {[
                    { label: "Full Name", value: "Spencer Craigie" },
                    { label: "Username", value: "@sscraigie" },
                    { label: "Email", value: "me@spencercraigie.com" },
                  ].map((field) => (
                    <motion.div key={field.label} variants={itemVariants} className="flex flex-col gap-1">
                      <label
                        className="text-[0.75em] font-semibold uppercase tracking-wide"
                        style={{ color: dark ? "#9ca3af" : "#6b7280" }}
                      >
                        {field.label}
                      </label>
                      <input
                        defaultValue={field.value}
                        className="px-4 py-2.5 rounded-xl border text-[0.875em] focus:outline-none focus:ring-2"
                        style={{
                          borderColor: dark ? "#374151" : "#e5e7eb",
                          background: dark ? "#232636" : "#ffffff",
                          color: dark ? "#f3f4f6" : "#1f2937",
                        }}
                      />
                    </motion.div>
                  ))}

                  <motion.div variants={itemVariants}>
                    <button
                      className="px-6 py-2.5 rounded-xl text-[0.875em] font-semibold text-white border-none cursor-pointer"
                      style={{ background: accentGradient }}
                    >
                      Save Changes
                    </button>
                  </motion.div>
                </>
              )}

              {/* Notifications & Privacy */}
              {(activeSection === "notifications" || activeSection === "privacy") && (
                <>
                  <motion.div variants={itemVariants}>
                    <h3
                      className="text-[1.125em] font-bold m-0 mb-1"
                      style={{ color: dark ? "#f3f4f6" : "#1f2937" }}
                    >
                      {activeSection === "notifications" ? "Notifications" : "Privacy & Security"}
                    </h3>
                    <p className="text-[0.875em] m-0" style={{ color: dark ? "#9ca3af" : "#6b7280" }}>
                      {activeSection === "notifications"
                        ? "Choose how you receive alerts"
                        : "Control your data and security"}
                    </p>
                  </motion.div>

                  <div className="flex flex-col gap-3">
                    {toggles[activeSection].map((t) => (
                      <motion.div
                        key={t.id}
                        variants={itemVariants}
                        className={`flex items-center justify-between rounded-2xl ${compact ? "p-3" : "p-4"}`}
                        style={{ background: dark ? "#232636" : "#f9fafb" }}
                      >
                        <div>
                          <p
                            className="m-0 text-[0.875em] font-semibold"
                            style={{ color: dark ? "#f3f4f6" : "#1f2937" }}
                          >
                            {t.label}
                          </p>
                          <p className="m-0 text-[0.75em] mt-0.5" style={{ color: dark ? "#9ca3af" : "#6b7280" }}>
                            {t.description}
                          </p>
                        </div>
                        <Toggle
                          enabled={t.enabled}
                          onToggle={() => flip(activeSection, t.id)}
                          accent={accent}
                          animated={animated}
                          dark={dark}
                        />
                      </motion.div>
                    ))}
                  </div>
                </>
              )}

              {/* Appearance */}
              {activeSection === "appearance" && (
                <>
                  <motion.div variants={itemVariants}>
                    <h3
                      className="text-[1.125em] font-bold m-0 mb-1"
                      style={{ color: dark ? "#f3f4f6" : "#1f2937" }}
                    >
                      Appearance
                    </h3>
                    <p className="text-[0.875em] m-0" style={{ color: dark ? "#9ca3af" : "#6b7280" }}>
                      Customize your visual experience
                    </p>
                  </motion.div>

                  <div className="flex flex-col gap-4">
                    <Slider
                      label="Brightness"
                      value={brightness}
                      onChange={setBrightness}
                      accent={accent}
                      dark={dark}
                      animated={animated}
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      }
                    />
                    <Slider
                      label="Volume"
                      value={volume}
                      onChange={setVolume}
                      accent={accent}
                      dark={dark}
                      animated={animated}
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072" />
                        </svg>
                      }
                    />
                    <Slider
                      label="Font Size"
                      value={fontSize}
                      onChange={setFontSize}
                      accent={accent}
                      dark={dark}
                      animated={animated}
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    {toggles["appearance"].map((t) => (
                      <motion.div
                        key={t.id}
                        variants={itemVariants}
                        className={`flex items-center justify-between rounded-2xl ${compact ? "p-3" : "p-4"}`}
                        style={{ background: dark ? "#232636" : "#f9fafb" }}
                      >
                        <div>
                          <p
                            className="m-0 text-[0.875em] font-semibold"
                            style={{ color: dark ? "#f3f4f6" : "#1f2937" }}
                          >
                            {t.label}
                          </p>
                          <p className="m-0 text-[0.75em] mt-0.5" style={{ color: dark ? "#9ca3af" : "#6b7280" }}>
                            {t.description}
                          </p>
                        </div>
                        <Toggle
                          enabled={t.enabled}
                          onToggle={() => flip("appearance", t.id)}
                          accent={accent}
                          animated={animated}
                          dark={dark}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Theme Picker */}
                  <motion.div variants={itemVariants}>
                    <p
                      className="m-0 text-[0.75em] font-semibold uppercase tracking-wide mb-3"
                      style={{ color: dark ? "#9ca3af" : "#6b7280" }}
                    >
                      Accent Color
                    </p>
                    <div className="flex gap-3">
                      {ACCENTS.map(([from, to], i) => (
                        <motion.button
                          key={i}
                          onClick={() => setAccentIndex(i)}
                          whileHover={animated ? { scale: 1.2 } : undefined}
                          whileTap={animated ? { scale: 0.9 } : undefined}
                          className="w-8 h-8 rounded-full border-none cursor-pointer shadow"
                          style={{
                            background: `linear-gradient(135deg, ${from}, ${to})`,
                            outline: accentIndex === i ? `2px solid ${dark ? "#f3f4f6" : "#1f2937"}` : "none",
                            outlineOffset: 2,
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

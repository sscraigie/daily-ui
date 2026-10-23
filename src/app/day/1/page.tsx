"use client";
// Day 1 - Sign In
// A ground-up redesign of the original MUI sign-in screen. "Lumen" is a
// fictional developer platform: split-screen auth with an animated aurora
// showcase, live deploy feed, social sign-in, inline validation, a caps-lock
// hint and animated submit states.
// Inspiration: https://collectui.com/designers/siara/sign-up

import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import {
  IconActivity,
  IconAlertCircle,
  IconArrowRight,
  IconBolt,
  IconCheck,
  IconCircleCheck,
  IconEye,
  IconEyeOff,
  IconGitBranch,
  IconLock,
  IconMail,
  IconRocket,
  IconShieldCheck,
} from "@tabler/icons-react";
import { RequireDarkMode } from "@/components/ThemeProvider";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const AUTOFILL_CSS = `
.lumen-auth input:-webkit-autofill,
.lumen-auth input:-webkit-autofill:hover,
.lumen-auth input:-webkit-autofill:focus {
  -webkit-text-fill-color: #e2e8f0;
  -webkit-box-shadow: 0 0 0 1000px #10182b inset;
  caret-color: #e2e8f0;
  transition: background-color 9999s ease-out 0s;
}
`;

const GRID_BG =
  "linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)";
const GRID_MASK =
  "radial-gradient(ellipse 90% 80% at 60% 40%, black 25%, transparent 75%)";

type Status = "idle" | "submitting" | "success";

type ActivityKind = "check" | "rocket" | "branch" | "pulse";

type Activity = { id: number; kind: ActivityKind; text: string; meta: string };

const ACTIVITY: Activity[] = [
  { id: 0, kind: "rocket", text: "Deploy #482 promoted to production", meta: "main · just now" },
  { id: 1, kind: "check", text: "1,284 checks passed on release-2.6", meta: "ci · 3m 12s" },
  { id: 2, kind: "pulse", text: "p95 latency down 18% on edge", meta: "last hour" },
  { id: 3, kind: "branch", text: "Preview env ready for feat-flags", meta: "checkout-api" },
  { id: 4, kind: "check", text: "Canary hit 100% with zero errors", meta: "payments" },
  { id: 5, kind: "rocket", text: "Rollback drill completed in 0.8s", meta: "weekly drill" },
];

const ACT_ICON: Record<ActivityKind, { Icon: typeof IconRocket; color: string }> = {
  check: { Icon: IconCircleCheck, color: "text-emerald-300" },
  rocket: { Icon: IconRocket, color: "text-indigo-300" },
  branch: { Icon: IconGitBranch, color: "text-cyan-300" },
  pulse: { Icon: IconActivity, color: "text-amber-300" },
};

const FEATURES = [
  {
    icon: IconBolt,
    title: "Instant rollbacks",
    desc: "Revert any deploy in under a second, from anywhere.",
  },
  {
    icon: IconShieldCheck,
    title: "Zero-config security",
    desc: "SOC 2 controls and audit logs out of the box.",
  },
  {
    icon: IconGitBranch,
    title: "Pipeline analytics",
    desc: "Every build traced from commit to production.",
  },
];

const STATS = [
  { value: "99.99%", label: "uptime SLA" },
  { value: "4.2k", label: "builds / day" },
  { value: "12ms", label: "p50 overhead" },
];

const TEAM = [
  { initials: "KW", gradient: "from-cyan-500 to-blue-600" },
  { initials: "AT", gradient: "from-fuchsia-500 to-purple-600" },
  { initials: "JM", gradient: "from-amber-400 to-orange-500" },
  { initials: "RS", gradient: "from-emerald-400 to-teal-600" },
];

const prevent = (e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault();

function BrandMark() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor" aria-hidden>
        <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" />
      </svg>
    </div>
  );
}

function FieldError({ id, msg }: { id: string; msg?: string }) {
  return (
    <AnimatePresence initial={false}>
      {msg ? (
        <motion.p
          id={id}
          role="alert"
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          transition={{ duration: 0.18 }}
          className="mt-1.5 flex items-center gap-1.5 overflow-hidden text-[12.5px] text-red-300"
        >
          <IconAlertCircle size={13} className="shrink-0" />
          {msg}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

export default function Day1() {
  const reduce = useReducedMotion() ?? false;
  const shake = useAnimationControls();
  const emailRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [pwTouched, setPwTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [capsOn, setCapsOn] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [feed, setFeed] = useState<Activity[]>(() => ACTIVITY.slice(0, 4));
  const [feedPaused, setFeedPaused] = useState(false);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    []
  );

  useEffect(() => {
    if (feedPaused || reduce) return;
    const id = setInterval(() => {
      setFeed((prev) => [
        ACTIVITY[(prev[0].id + ACTIVITY.length - 1) % ACTIVITY.length],
        ...prev.slice(0, 3),
      ]);
    }, 2800);
    return () => clearInterval(id);
  }, [feedPaused, reduce]);

  const emailError =
    emailTouched || submitAttempted
      ? !email.trim()
        ? "Enter your email address."
        : !EMAIL_RE.test(email.trim())
        ? "That doesn't look like a valid email."
        : undefined
      : undefined;

  const pwError =
    pwTouched || submitAttempted
      ? !password
        ? "Enter your password."
        : password.length < 8
        ? "Passwords are at least 8 characters."
        : undefined
      : undefined;

  const containerV: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.08,
        delayChildren: reduce ? 0 : 0.12,
      },
    },
  };

  const itemV: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: reduce
        ? { duration: 0.25 }
        : { duration: 0.55, ease: EASE },
    },
  };

  const handleCaps = (e: React.KeyboardEvent<HTMLInputElement>) =>
    setCapsOn(e.getModifierState("CapsLock"));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    setSubmitAttempted(true);
    const badEmail = !email.trim() || !EMAIL_RE.test(email.trim());
    const badPw = !password || password.length < 8;
    if (badEmail || badPw) {
      if (!reduce) {
        shake.start({
          x: [0, -10, 10, -6, 6, -2, 0],
          transition: { duration: 0.45, ease: "easeInOut" },
        });
      }
      (badEmail ? emailRef : pwRef).current?.focus();
      return;
    }
    setStatus("submitting");
    later(() => {
      setStatus("success");
      later(() => {
        setStatus("idle");
        setSubmitAttempted(false);
        setEmailTouched(false);
        setPwTouched(false);
        setPassword("");
      }, 3400);
    }, 1600);
  };

  const shell = (invalid: boolean) =>
    `group relative flex h-12 items-center rounded-xl border bg-white/[0.03] transition duration-200 ${
      invalid
        ? "border-red-400/60 focus-within:border-red-400/80 focus-within:ring-2 focus-within:ring-red-500/20"
        : "border-white/10 hover:border-white/20 focus-within:border-indigo-400/70 focus-within:ring-2 focus-within:ring-indigo-500/20"
    }`;

  const busy = status !== "idle";

  return (
    <main className="lumen-auth relative h-full w-full overflow-hidden bg-[#070a13] text-slate-200 antialiased selection:bg-indigo-500/40">
      <RequireDarkMode />
      <style>{AUTOFILL_CSS}</style>

      <div className="grid h-full w-full lg:grid-cols-[1fr_1.05fr]">
        {/* ------------------------------ form side ----------------------------- */}
        <section className="relative flex h-full flex-col overflow-x-hidden overflow-y-auto px-6 py-6 sm:px-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-600/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl"
          />

          <motion.header
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative z-10 flex items-center gap-2.5"
          >
            <BrandMark />
            <span className="text-[15px] font-semibold tracking-tight text-white">
              Lumen
            </span>
            <span className="ml-auto hidden rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-500 sm:block">
              Daily UI · Day 1
            </span>
          </motion.header>

          <div className="relative z-10 flex flex-1 items-center justify-center py-10">
            <motion.div
              variants={containerV}
              initial="hidden"
              animate="show"
              className="w-full max-w-[26rem]"
            >
              <motion.h1
                variants={itemV}
                className="text-3xl font-semibold tracking-tight text-white sm:text-4xl"
              >
                Welcome{" "}
                <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-cyan-200 bg-clip-text text-transparent">
                  back
                </span>
              </motion.h1>
              <motion.p
                variants={itemV}
                className="mt-2 text-[15px] leading-relaxed text-slate-400"
              >
                Sign in to your workspace and pick up right where you left off.
              </motion.p>

              <motion.div variants={itemV}>
                <motion.div animate={shake} initial={false}>
                  <form
                    noValidate
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-5"
                  >
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-1.5 block text-[13px] font-medium text-slate-300"
                      >
                        Email address
                      </label>
                      <div className={shell(!!emailError)}>
                        <IconMail
                          size={18}
                          className="ml-3.5 shrink-0 text-slate-500 transition-colors group-focus-within:text-indigo-300"
                        />
                        <input
                          ref={emailRef}
                          id="email"
                          type="email"
                          autoComplete="email"
                          placeholder="you@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={() => setEmailTouched(true)}
                          disabled={busy}
                          aria-invalid={!!emailError}
                          aria-describedby={
                            emailError ? "email-error" : undefined
                          }
                          className="h-full w-full bg-transparent px-3 text-[15px] text-slate-100 outline-none placeholder:text-slate-600 disabled:opacity-50"
                        />
                      </div>
                      <FieldError id="email-error" msg={emailError} />
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="mb-1.5 block text-[13px] font-medium text-slate-300"
                      >
                        Password
                      </label>
                      <div className={shell(!!pwError)}>
                        <IconLock
                          size={18}
                          className="ml-3.5 shrink-0 text-slate-500 transition-colors group-focus-within:text-indigo-300"
                        />
                        <input
                          ref={pwRef}
                          id="password"
                          type={showPw ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onBlur={() => {
                            setPwTouched(true);
                            setCapsOn(false);
                          }}
                          onKeyUp={handleCaps}
                          onKeyDown={handleCaps}
                          disabled={busy}
                          aria-invalid={!!pwError}
                          aria-describedby={
                            pwError ? "password-error" : undefined
                          }
                          className="h-full w-full bg-transparent px-3 pr-12 text-[15px] text-slate-100 outline-none placeholder:text-slate-600 disabled:opacity-50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((v) => !v)}
                          aria-label={showPw ? "Hide password" : "Show password"}
                          className="absolute right-2.5 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
                        >
                          {showPw ? (
                            <IconEyeOff size={17} />
                          ) : (
                            <IconEye size={17} />
                          )}
                        </button>
                      </div>
                      <FieldError id="password-error" msg={pwError} />
                      <AnimatePresence initial={false}>
                        {capsOn && !pwError && status === "idle" && (
                          <motion.p
                            initial={{ opacity: 0, y: -4, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, y: -4, height: 0 }}
                            transition={{ duration: 0.18 }}
                            className="mt-1.5 flex items-center gap-1.5 overflow-hidden text-[12.5px] text-amber-300/90"
                          >
                            <IconBolt size={13} className="shrink-0" />
                            Caps Lock is on
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={remember}
                        onClick={() => setRemember((v) => !v)}
                        className="group flex items-center gap-2.5 text-[13px] text-slate-400 transition hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070a13] rounded-md"
                      >
                        <span
                          className={`flex h-[18px] w-[18px] items-center justify-center rounded-[6px] border transition-colors duration-200 ${
                            remember
                              ? "border-indigo-400 bg-indigo-500"
                              : "border-white/20 bg-white/5 group-hover:border-white/40"
                          }`}
                        >
                          <AnimatePresence initial={false}>
                            {remember && (
                              <motion.span
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                              >
                                <IconCheck
                                  size={12}
                                  stroke={3}
                                  className="text-white"
                                />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </span>
                        Remember me for 30 days
                      </button>
                      <a
                        href="#"
                        onClick={prevent}
                        className="rounded-md text-[13px] font-medium text-slate-400 underline-offset-4 transition hover:text-indigo-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
                      >
                        Forgot password?
                      </a>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={busy}
                      whileTap={reduce ? undefined : { scale: 0.985 }}
                      className={`relative flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold text-white transition disabled:cursor-default ${
                        status === "success"
                          ? "bg-emerald-500 shadow-[0_8px_30px_rgba(16,185,129,0.35)]"
                          : "bg-gradient-to-r from-indigo-500 to-violet-500 shadow-[0_8px_30px_rgba(99,102,241,0.35)] hover:from-indigo-400 hover:to-violet-400 disabled:opacity-70"
                      }`}
                    >
                      {status === "idle" && (
                        <>
                          Sign in
                          <IconArrowRight size={18} />
                        </>
                      )}
                      {status === "submitting" && (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          Signing in…
                        </>
                      )}
                      {status === "success" && (
                        <>
                          <motion.span
                            initial={reduce ? false : { scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 20,
                            }}
                          >
                            <IconCheck size={18} stroke={3} />
                          </motion.span>
                          Signed in
                        </>
                      )}
                    </motion.button>

                    <AnimatePresence>
                      {status === "success" && (
                        <motion.p
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-center text-[13px] text-emerald-300"
                        >
                          Success — redirecting to your dashboard…
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </form>
                </motion.div>
              </motion.div>

              <motion.div variants={itemV} className="mt-8">
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-white/[0.08]" />
                  <span className="relative bg-[#0a0f1c] px-4 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    or continue with
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[0.06] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-[18px] w-[18px]"
                      aria-hidden
                    >
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                    GitHub
                  </button>
                  <button
                    type="button"
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[0.06] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-[18px] w-[18px]"
                      aria-hidden
                    >
                      <path
                        fill="#EA4335"
                        d="M12 5.04c1.62 0 3.06.56 4.2 1.64l3.12-3.12C17.46 1.8 14.96.75 12 .75 7.62.75 3.84 3.27 2.04 6.88l3.66 2.84C6.6 7.02 9.05 5.04 12 5.04z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.25 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.68 2.85c2.15-1.99 3.5-4.92 3.5-8.67z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.7 14.28A6.9 6.9 0 0 1 5.34 12c0-.79.14-1.56.34-2.28L2.04 6.88A11.22 11.22 0 0 0 .75 12c0 1.85.44 3.6 1.29 5.12l3.66-2.84z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23.25c3.04 0 5.59-1 7.45-2.72l-3.68-2.85c-1.02.69-2.33 1.1-3.77 1.1-2.95 0-5.4-1.98-6.3-4.5l-3.66 2.84c1.8 3.61 5.58 6.13 9.96 6.13z"
                      />
                    </svg>
                    Google
                  </button>
                </div>
              </motion.div>

              <motion.p
                variants={itemV}
                className="mt-8 text-center text-sm text-slate-500"
              >
                New to Lumen?{" "}
                <a
                  href="#"
                  onClick={prevent}
                  className="rounded font-medium text-indigo-300 underline-offset-4 transition hover:text-indigo-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
                >
                  Create an account
                </a>
              </motion.p>
            </motion.div>
          </div>

          <footer className="relative z-10 flex flex-wrap items-center justify-between gap-3 text-[12px] text-slate-600">
            <p>© 2026 Lumen Labs, Inc.</p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                onClick={prevent}
                className="rounded transition hover:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
              >
                Privacy
              </a>
              <a
                href="#"
                onClick={prevent}
                className="rounded transition hover:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
              >
                Terms
              </a>
              <span className="flex items-center gap-1.5 text-emerald-400/80">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                All systems go
              </span>
            </div>
          </footer>
        </section>

        {/* ---------------------------- showcase side --------------------------- */}
        <aside className="relative hidden h-full overflow-hidden border-l border-white/[0.06] px-10 py-12 lg:flex lg:flex-col lg:justify-center xl:px-14">
          <motion.div
            aria-hidden
            className="absolute -top-40 right-[-10%] h-[30rem] w-[30rem] rounded-full bg-indigo-600/25 blur-3xl"
            animate={
              reduce
                ? undefined
                : { x: [0, -50, 20, 0], y: [0, 40, -20, 0], scale: [1, 1.12, 0.95, 1] }
            }
            transition={
              reduce
                ? undefined
                : { duration: 22, repeat: Infinity, ease: "easeInOut" }
            }
          />
          <motion.div
            aria-hidden
            className="absolute bottom-[-20%] left-[-12%] h-[26rem] w-[26rem] rounded-full bg-cyan-500/15 blur-3xl"
            animate={
              reduce
                ? undefined
                : { x: [0, 60, -30, 0], y: [0, -30, 20, 0], scale: [1, 1.08, 0.96, 1] }
            }
            transition={
              reduce
                ? undefined
                : { duration: 26, repeat: Infinity, ease: "easeInOut" }
            }
          />
          <motion.div
            aria-hidden
            className="absolute left-[30%] top-[20%] h-72 w-72 rounded-full bg-violet-600/15 blur-3xl"
            animate={
              reduce ? undefined : { x: [0, -30, 40, 0], y: [0, 25, -25, 0] }
            }
            transition={
              reduce
                ? undefined
                : { duration: 19, repeat: Infinity, ease: "easeInOut" }
            }
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: GRID_BG,
              backgroundSize: "42px 42px",
              maskImage: GRID_MASK,
              WebkitMaskImage: GRID_MASK,
            }}
          />

          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            transition={
              reduce
                ? { duration: 0.3 }
                : { duration: 0.8, ease: EASE, delay: 0.15 }
            }
            className="relative z-10 mx-auto w-full max-w-xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-[12px] font-medium text-indigo-200">
              <IconBolt size={13} />
              Pipeline analytics is here
            </div>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight text-white xl:text-[2.75rem]">
              Ship faster.
              <br />
              <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
                Worry less.
              </span>
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-400">
              Lumen watches every build, deploy and rollback for your team — so
              you can spend launch day doing anything else.
            </p>

            <ul className="mt-7 space-y-4">
              {FEATURES.map((f) => (
                <li key={f.title} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.04] text-indigo-300">
                    <f.icon size={17} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      {f.title}
                    </p>
                    <p className="text-[13px] text-slate-500">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div
              onMouseEnter={() => setFeedPaused(true)}
              onMouseLeave={() => setFeedPaused(false)}
              className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2 text-[13px] font-medium text-slate-300">
                  <IconGitBranch
                    size={15}
                    className="text-indigo-300"
                    aria-hidden
                  />
                  acme/platform
                </div>
                <span className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-emerald-300">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  Live
                </span>
              </div>
              <div className="mt-2">
                <AnimatePresence initial={false} mode="popLayout">
                  {feed.map((item) => {
                    const { Icon, color } = ACT_ICON[item.kind];
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: -14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{
                          opacity: 0,
                          y: 14,
                          transition: { duration: 0.2 },
                        }}
                        transition={
                          reduce
                            ? { duration: 0 }
                            : { duration: 0.4, ease: EASE }
                        }
                        className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/[0.04]"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.04]">
                          <Icon size={16} className={color} aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[13px] text-slate-300">
                          {item.text}
                        </span>
                        <span className="shrink-0 text-[11px] text-slate-500">
                          {item.meta}
                        </span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-center"
                >
                  <p className="text-lg font-semibold text-white">{s.value}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                {TEAM.map((m) => (
                  <span
                    key={m.initials}
                    className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-semibold text-white ring-2 ring-[#070a13] ${m.gradient}`}
                  >
                    {m.initials}
                  </span>
                ))}
              </div>
              <p className="text-[13px] text-slate-400">
                Trusted by{" "}
                <span className="font-medium text-slate-200">
                  2,400+ engineering teams
                </span>
              </p>
            </div>
          </motion.div>
        </aside>
      </div>
    </main>
  );
}

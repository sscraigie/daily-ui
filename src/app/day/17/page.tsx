"use client";
// Day 17 - Email Receipt
// An Amazon order-confirmation receipt, opened inside a recreation of Gmail's
// web client: searchable inbox with category tabs, row selection, star
// toggles, archive/delete with an Undo snackbar, and a working compose window.

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ---------------------------------- data ---------------------------------- */

type Category = "primary" | "social" | "promotions";

type Mail = {
  id: number;
  category: Category;
  fromName: string;
  fromEmail: string;
  initial: string;
  avatarColor: string;
  avatar?: "amazon" | "google";
  subject: string;
  snippet: string;
  received: string;
  unread: boolean;
  starred: boolean;
  body: React.ReactNode;
};

const usd = (n: number) => `$${n.toFixed(2)}`;

const ORDER = {
  number: "114-2938475-6291416",
  placed: "Friday, October 9, 2026",
  arriving: "Monday, October 12",
  card: "Visa ending in 4291",
  address: ["Spencer Craigie", "2598 Market Street, Apt 4B", "Seattle, WA 98107", "United States"],
};

const amazonReceiptBody = (
  <AmazonReceipt
    items={[
      {
        id: "mouse",
        name: "Logitech MX Master 3S Wireless Performance Mouse, Quiet Clicks, Bluetooth, Graphite",
        price: 99.99,
        qty: 1,
        seller: "Amazon.com",
        Thumb: ThumbMouse,
      },
      {
        id: "keyboard",
        name: "Keychron K8 Pro QMK/VIA Wireless Mechanical Keyboard, Hot-Swappable, Bluetooth 5.1/2.4GHz, Brown Switch",
        price: 109.0,
        qty: 1,
        seller: "Amazon.com",
        Thumb: ThumbKeyboard,
      },
      {
        id: "powerbank",
        name: "Anker 737 Power Bank (PowerCore 24K), 24,000mAh 140W 3-Port Portable Charger with Smart Display",
        price: 149.99,
        qty: 1,
        seller: "AnkerDirect",
        Thumb: ThumbBank,
      },
    ]}
  />
);

function simpleBody(lines: React.ReactNode[]) {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-[#3c4043]">
      {lines.map((line, i) => (
        <p key={i} className="m-0">
          {line}
        </p>
      ))}
    </div>
  );
}

const MAILS: Mail[] = [
  {
    id: 1,
    category: "primary",
    fromName: "Amazon.com",
    fromEmail: "shipment-tracking@amazon.com",
    initial: "A",
    avatarColor: "#232f3e",
    avatar: "amazon",
    subject: 'Your Amazon.com order of "Logitech MX Master 3S, Keychron K8 Pro and 1 more item" has been received',
    snippet:
      "Hello Spencer, thanks for your order. We're getting it ready to be shipped. Arriving Monday, October 12 - 3 items, $391.29 total...",
    received: "10:24 AM",
    unread: false,
    starred: true,
    body: amazonReceiptBody,
  },
  {
    id: 2,
    category: "primary",
    fromName: "GitHub",
    fromEmail: "noreply@github.com",
    initial: "G",
    avatarColor: "#24292f",
    subject: "[spencercraigie/daily-ui] Dependabot: bump framer-motion from 10.16.4 to 10.16.9",
    snippet:
      "spencercraigie opened an issue: Bumps framer-motion from 10.16.4 to 10.16.9. Release notes: Sourced from framer-motion's releases...",
    received: "8:47 AM",
    unread: true,
    starred: false,
    body: simpleBody([
      "Bumps framer-motion from 10.16.4 to 10.16.9.",
      <>
        Release notes can be found in the{" "}
        <a href="#" className="text-[#1a73e8] hover:underline">
          changelog
        </a>
        . Dependabot will resolve any conflicts with this PR as long as you don&rsquo;t alter it yourself.
      </>,
    ]),
  },
  {
    id: 3,
    category: "primary",
    fromName: "Google",
    fromEmail: "no-reply@accounts.google.com",
    initial: "G",
    avatarColor: "#ffffff",
    avatar: "google",
    subject: "Security alert for your Google Account spencer@gmail.com",
    snippet:
      "New sign-in on Mac: If this was you, you don't need to do anything. If not, we'll help you secure your account...",
    received: "Oct 8",
    unread: false,
    starred: false,
    body: simpleBody([
      "New sign-in on Mac Book Pro - Seattle, WA",
      <>
        If this was you, you don&rsquo;t need to do anything. If not, we&rsquo;ll help you secure your account in{" "}
        <a href="#" className="text-[#1a73e8] hover:underline">
          Security Checkup
        </a>
        .
      </>,
    ]),
  },
  {
    id: 4,
    category: "promotions",
    fromName: "Figma",
    fromEmail: "team@figma.com",
    initial: "F",
    avatarColor: "#a259ff",
    subject: "This week in Figma: your team shipped 14 updates",
    snippet:
      "Your team published 3 new component libraries, left 27 comments and shared 2 prototypes this week...",
    received: "Oct 7",
    unread: false,
    starred: false,
    body: simpleBody([
      "Hi Spencer, here&rsquo;s what your team got up to in Figma this week:",
      "Published 3 component libraries · 27 comments · 2 shared prototypes.",
    ]),
  },
  {
    id: 5,
    category: "social",
    fromName: "LinkedIn",
    fromEmail: "messages-noreply@linkedin.com",
    initial: "L",
    avatarColor: "#0a66c2",
    subject: "You appeared in 13 searches this week",
    snippet:
      "People from Y Combinator, Stripe and 8 other companies found you. See who's looking at your profile...",
    received: "Oct 5",
    unread: false,
    starred: false,
    body: simpleBody([
      <>
        You appeared in <strong>13 searches</strong> this week.
      </>,
      "People from Y Combinator, Stripe and 8 other companies found you.",
    ]),
  },
  {
    id: 6,
    category: "promotions",
    fromName: "Notion",
    fromEmail: "team@makenotion.com",
    initial: "N",
    avatarColor: "#ffffff",
    subject: "What's new in Notion: October release notes",
    snippet:
      "Introducing Notion AI 2.0, connected databases across teams, and a faster mobile app. Here's everything new...",
    received: "Oct 5",
    unread: false,
    starred: false,
    body: simpleBody([
      "Introducing Notion AI 2.0, connected databases across teams, and a faster mobile app.",
      "Here&rsquo;s everything new in Notion this month.",
    ]),
  },
];

const TABS: { id: Category; label: string }[] = [
  { id: "primary", label: "Primary" },
  { id: "social", label: "Social" },
  { id: "promotions", label: "Promotions" },
];

/* ---------------------------------- icons --------------------------------- */

const dot = (cx: number, cy: number, r = 1.6) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;

const IC = {
  menu: ["M3 6h18", "M3 12h18", "M3 18h18"],
  search: ["M4 11a7 7 0 1 0 14 0a7 7 0 1 0 -14 0", "M20.5 20.5l-4.8-4.8"],
  tune: [
    "M3 7h9.6",
    "M17.4 7H21",
    "M3 17h1.6",
    "M9.4 17H21",
    "M15.2 4.8a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4z",
    "M7.2 14.8a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4z",
  ],
  help: [
    "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
    "M9.4 9.4a2.6 2.6 0 1 1 3.9 2.3c-.9.5-1.3 1.1-1.3 2",
    "M12 16.9h.01",
  ],
  inboxFill:
    "M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12h-4c0 1.66-1.34 3-3 3s-3-1.34-3-3H5V5h14v10z",
  inbox: [
    "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
    "M2 13h5l2 3h6l2-3h5",
  ],
  star: "M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
  clock: ["M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z", "M12 7.5V12l3 1.8"],
  sendFill: "M2.01 21 23 12 2.01 3 2 10l15 2-15 2z",
  draft: "M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z",
  chevD: "M6 9l6 6 6-6",
  refresh: ["M21 12a9 9 0 1 1-2.64-6.36", "M21 3v6h-6"],
  archive: [
    "M3.5 4.5h17V9h-17z",
    "M5 9v9.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9",
    "M12 11v5.5",
    "m9.5 14 2.5 2.5 2.5-2.5",
  ],
  report: [
    "M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3z",
    "M12 7.5V13",
    "M12 16.7h.01",
  ],
  delete: [
    "M4.5 6.5h15",
    "M9 6.5v-2h6v2",
    "M6.5 6.5v12a1.5 1.5 0 0 0 1.5 1.5h8a1.5 1.5 0 0 0 1.5-1.5v-12",
    "M10 10.5v6",
    "M14 10.5v6",
  ],
  mail: [
    "M4 4.5h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2z",
    "m2.5 7.5 9.5 6 9.5-6",
  ],
  print: [
    "M6 9V3h12v6",
    "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",
    "M6 14h12v7H6z",
  ],
  reply: "M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z",
  forward: "M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z",
  close: ["M5 5l14 14", "M19 5 5 19"],
  minimize: "M5 12h14",
  expand: [
    "M8 3H5a2 2 0 0 0-2 2v3",
    "M16 3h3a2 2 0 0 1 2 2v3",
    "M8 21H5a2 2 0 0 1-2-2v-3",
    "M16 21h3a2 2 0 0 0 2-2v-3",
  ],
  back: ["M19 12H5", "m12 19-7-7 7-7"],
  check: "M5 12.5l4.7 4.7L19.5 7",
  clip: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48",
  emoji: [
    "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
    "M8.5 10h.01",
    "M15.5 10h.01",
    "M8.5 14.2s1.2 1.9 3.5 1.9 3.5-1.9 3.5-1.9",
  ],
  moveToInboxFill:
    "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 5-4.3 4.3V8h-3.4v4.3L6 8.7 4.6 10.1 12 17.5l7.4-7.4L18 8.7z",
};

const Ic = ({
  d,
  className = "h-5 w-5",
  filled = false,
}: {
  d: string | string[];
  className?: string;
  filled?: boolean;
}) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill={filled ? "currentColor" : "none"}
    stroke={filled ? "none" : "currentColor"}
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {(Array.isArray(d) ? d : [d]).map((p, i) => (
      <path key={i} d={p} />
    ))}
  </svg>
);

const IconApps = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    {[5, 12, 19].flatMap((y) => [5, 12, 19].map((x) => <path key={`${x}-${y}`} d={dot(x, y, 1.7)} />))}
  </svg>
);

const IconMoreV = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d={dot(12, 5)} />
    <path d={dot(12, 12)} />
    <path d={dot(12, 19)} />
  </svg>
);

/* ---------------------------------- logos --------------------------------- */

const GmailLogo = ({ className = "h-10 w-auto" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="52 42 88 66" className={className} aria-label="Gmail">
    <path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6" />
    <path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15" />
    <path fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2" />
    <path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92" />
    <path fill="#c5221f" d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2" />
  </svg>
);

const AmazonLogo = ({ className = "h-7 w-auto" }: { className?: string }) => (
  <svg viewBox="0 0 72 30" className={className} aria-label="Amazon">
    <text x="1" y="19" fontFamily="Arial, Helvetica, sans-serif" fontWeight="bold" fontSize="20" letterSpacing="-0.5" fill="#0f1111">
      amazon
    </text>
    <path d="M6 22.5C20 28.5 44 28.5 56.5 21.5" fill="none" stroke="#ff9900" strokeWidth="2.7" strokeLinecap="round" />
    <path d="M63 19.8l-7.4-.2 4.5 4.7z" fill="#ff9900" />
  </svg>
);

const AmazonAvatar = ({ className = "h-10 w-10" }: { className?: string }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden>
    <circle cx="24" cy="24" r="24" fill="#232f3e" />
    <text x="24" y="26" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="bold" fontSize="17" fill="#ffffff">
      a
    </text>
    <path d="M14 28.5c6.4 4.4 13.8 4.4 19.8.3" fill="none" stroke="#ff9900" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M32.6 26.6l3.8-1.6-1.7 4z" fill="#ff9900" />
  </svg>
);

const GoogleAvatar = ({ className = "h-10 w-10" }: { className?: string }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden>
    <circle cx="24" cy="24" r="23" fill="#ffffff" stroke="#dadce0" strokeWidth="2" />
    <text x="24" y="31" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="bold" fontSize="21" fill="#4285f4">
      G
    </text>
  </svg>
);

const Avatar = ({ mail, size = 40 }: { mail: Mail; size?: number }) => {
  const cls = size === 40 ? "h-10 w-10" : "h-8 w-8";
  if (mail.avatar === "amazon") return <AmazonAvatar className={cls} />;
  if (mail.avatar === "google") return <GoogleAvatar className={cls} />;
  return (
    <span
      className={`grid flex-shrink-0 place-items-center rounded-full font-medium text-white ${cls}`}
      style={{ background: mail.avatarColor, color: mail.avatarColor === "#ffffff" ? "#0f1111" : "#fff", border: mail.avatarColor === "#ffffff" ? "1px solid #dadce0" : undefined }}
    >
      {mail.initial}
    </span>
  );
};

/* ------------------------------ product thumbs ----------------------------- */

function ThumbMouse() {
  return (
    <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden>
      <ellipse cx="40" cy="70" rx="21" ry="3" fill="#e3e5e5" />
      <rect x="24" y="14" width="32" height="52" rx="16" fill="#3d444c" />
      <path d="M24 30c0-8.8 7.2-16 16-16s16 7.2 16 16v8H24v-8z" fill="#4c545d" />
      <rect x="36.5" y="21" width="7" height="13" rx="3.5" fill="#23282e" />
      <rect x="24" y="34" width="9" height="15" rx="4.5" fill="#2f353c" />
      <circle cx="40" cy="50" r="2.6" fill="#5a636d" />
    </svg>
  );
}

function ThumbKeyboard() {
  return (
    <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden>
      <ellipse cx="40" cy="68" rx="27" ry="3" fill="#e3e5e5" />
      <rect x="7" y="25" width="66" height="30" rx="5" fill="#24282d" />
      <rect x="10" y="28" width="60" height="24" rx="3" fill="#171b20" />
      {[0, 1, 2].map((r) =>
        Array.from({ length: 12 }, (_, c) => (
          <rect key={`${r}-${c}`} x={13.2 + c * 4.7} y={30.5 + r * 6.2} width={3.9} height={4.8} rx={1} fill="#454c55" />
        )),
      )}
      <rect x="13.2" y="30.5" width="3.9" height="4.8" rx="1" fill="#e78a3c" />
      <rect x="22.6" y="42.9" width="27" height="4.8" rx="1" fill="#454c55" />
    </svg>
  );
}

function ThumbBank() {
  return (
    <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden>
      <ellipse cx="40" cy="71" rx="16" ry="2.6" fill="#e3e5e5" />
      <rect x="30" y="10" width="20" height="58" rx="6" fill="#2b3036" />
      <rect x="33" y="18" width="14" height="17" rx="2" fill="#12161a" />
      <text x="40" y="27" textAnchor="middle" fontFamily="Menlo, monospace" fontWeight="bold" fontSize="7" fill="#e8f6ee">
        85%
      </text>
      <rect x="33.5" y="62" width="5.5" height="2.8" rx="1.4" fill="#8a919a" />
      <rect x="41" y="62" width="5.5" height="2.8" rx="1.4" fill="#8a919a" />
    </svg>
  );
}

/* -------------------------------- amazon UI -------------------------------- */

const AmazonButton = ({
  children,
  secondary = false,
  className = "",
}: {
  children: React.ReactNode;
  secondary?: boolean;
  className?: string;
}) => (
  <button
    type="button"
    className={`rounded-lg border px-4 py-2 text-[13px] font-bold shadow-sm transition-colors ${className} ${
      secondary
        ? "border-[#d5d9d9] bg-white text-[#0f1111] hover:bg-[#f7fafa]"
        : "border-[#fcd200] bg-[#ffd814] text-[#0f1111] hover:bg-[#f7ca00]"
    }`}
  >
    {children}
  </button>
);

function AmazonReceipt({
  items,
}: {
  items: { id: string; name: string; price: number; qty: number; seller: string; Thumb: () => React.ReactElement }[];
}) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = 32.31;
  const total = subtotal + tax;

  return (
    <div className="text-[#0f1111]" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div className="mb-5 border-b border-[#e7e7e7] pb-4">
        <AmazonLogo className="h-7 w-auto" />
      </div>

      <p className="m-0 text-sm">Hello Spencer,</p>
      <p className="m-0 mt-2 text-sm leading-relaxed">
        Thank you for shopping with Amazon.com. We&rsquo;ve received your order and are getting it ready to be shipped.
        We&rsquo;ll email you again when it&rsquo;s on its way.
      </p>

      {/* arrival hero */}
      <div className="mt-5 rounded-lg border border-[#d5d9d9] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="m-0 text-[19px] font-bold leading-snug">Arriving {ORDER.arriving}</p>
            <p className="m-0 mt-1 text-xs text-[#565959]">
              Standard Shipping &middot; {items.length} items &middot; {usd(total)} total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AmazonButton>Track package</AmazonButton>
            <AmazonButton secondary>View order</AmazonButton>
          </div>
        </div>
      </div>

      {/* items */}
      <div className="mt-6 border border-[#e7e7e7]">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-b border-[#e7e7e7] bg-[#f7f8f8] px-4 py-2 text-[11px] text-[#565959]">
          <span>Ordered {ORDER.placed}</span>
          <span>Order #{ORDER.number}</span>
          <span className="ml-auto">Order total {usd(total)}</span>
        </div>
        <ul className="m-0 list-none p-0">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4 border-b border-[#e7e7e7] px-4 py-4 last:border-b-0">
              <div className="h-20 w-20 flex-shrink-0 rounded border border-[#e3e6e6] bg-[#f7f8f8] p-1.5">
                <item.Thumb />
              </div>
              <div className="min-w-0 flex-1 pr-2">
                <a href="#" onClick={(e) => e.preventDefault()} className="text-[13px] leading-snug text-[#007185] hover:underline">
                  {item.name}
                </a>
                <p className="m-0 mt-1 text-[11px] text-[#565959]">Sold by {item.seller}</p>
                <p className="m-0 mt-0.5 text-[11px] text-[#565959]">Condition: New</p>
                <p className="m-0 mt-0.5 text-[11px] text-[#565959]">Qty: {item.qty}</p>
              </div>
              <p className="m-0 flex-shrink-0 text-[13px] font-bold">{usd(item.price)}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* summary */}
      <div className="mt-5 flex justify-end">
        <table className="w-72 text-xs">
          <tbody>
            <tr>
              <td className="py-1">Item(s) Subtotal:</td>
              <td className="py-1 text-right">{usd(subtotal)}</td>
            </tr>
            <tr>
              <td className="py-1">Shipping &amp; Handling:</td>
              <td className="py-1 text-right font-bold text-[#067d62]">FREE</td>
            </tr>
            <tr>
              <td className="py-1">Total before tax:</td>
              <td className="py-1 text-right">{usd(subtotal)}</td>
            </tr>
            <tr>
              <td className="py-1">Estimated tax to be collected:</td>
              <td className="py-1 text-right">{usd(tax)}</td>
            </tr>
            <tr className="border-t border-[#e7e7e7]">
              <td className="pt-2 text-sm font-bold">Order Total:</td>
              <td className="pt-2 text-right text-sm font-bold">{usd(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* addresses & payment */}
      <div className="mt-6 grid gap-6 text-xs sm:grid-cols-3">
        <div>
          <h4 className="m-0 mb-1 text-[13px] font-bold">Shipping address</h4>
          <p className="m-0 leading-relaxed text-[#565959]">
            {ORDER.address.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>
        <div>
          <h4 className="m-0 mb-1 text-[13px] font-bold">Billing address</h4>
          <p className="m-0 leading-relaxed text-[#565959]">
            {ORDER.address.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>
        <div>
          <h4 className="m-0 mb-1 text-[13px] font-bold">Payment information</h4>
          <p className="m-0 leading-relaxed text-[#565959]">
            <span className="block">{ORDER.card}</span>
            <span className="block">Billed {usd(total)}</span>
          </p>
        </div>
      </div>

      {/* help strip */}
      <div className="mt-6 rounded-lg border border-[#d5d9d9] bg-[#f7f8f8] p-4 text-xs">
        <p className="m-0 font-bold">Need help with your order?</p>
        <p className="m-0 mt-1 text-[#565959]">
          Track your package, change delivery instructions, or start a return in{" "}
          <a href="#" onClick={(e) => e.preventDefault()} className="text-[#007185] hover:underline">
            Your Orders
          </a>
          .
        </p>
      </div>

      {/* legal footer */}
      <div className="mt-6 border-t border-[#e7e7e7] pt-4 text-[10px] leading-4 text-[#565959]">
        <p className="m-0">
          This email was sent because you placed an order with Amazon.com. To learn more, see our{" "}
          <a href="#" onClick={(e) => e.preventDefault()} className="text-[#007185] hover:underline">
            Privacy Notice
          </a>{" "}
          for information on how we use your data.
        </p>
        <p className="m-0 mt-2">
          Amazon.com &middot;{" "}
          <a href="#" onClick={(e) => e.preventDefault()} className="text-[#007185] hover:underline">
            Conditions of Use
          </a>{" "}
          &middot;{" "}
          <a href="#" onClick={(e) => e.preventDefault()} className="text-[#007185] hover:underline">
            Privacy Notice
          </a>{" "}
          &middot;{" "}
          <a href="#" onClick={(e) => e.preventDefault()} className="text-[#007185] hover:underline">
            Interest-Based Ads
          </a>
          <br />
          &copy; 2026, Amazon.com, Inc. or its affiliates. All rights reserved.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------ gmail widgets ------------------------------ */

const IconBtn = ({
  children,
  label,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  label: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    onClick={onClick}
    className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-full text-[#444746] transition-colors hover:bg-[#e4e7eb] ${className}`}
  >
    {children}
  </button>
);

const DarkIconBtn = ({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    onClick={onClick}
    className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full text-white transition-colors hover:bg-white/15"
  >
    {children}
  </button>
);

const StarBtn = ({ starred, onToggle, className = "" }: { starred: boolean; onToggle: () => void; className?: string }) => (
  <motion.button
    type="button"
    whileTap={{ scale: 0.8 }}
    title={starred ? "Starred" : "Not starred"}
    aria-label={starred ? "Remove star" : "Add star"}
    onClick={(e) => {
      e.stopPropagation();
      onToggle();
    }}
    className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-full transition-colors hover:bg-[#e4e7eb] ${className}`}
  >
    <Ic
      d={IC.star}
      className={`h-[18px] w-[18px] transition-colors ${starred ? "text-[#f9ab00]" : "text-[#444746]"}`}
      filled={starred}
    />
  </motion.button>
);

const CheckBox = ({
  state,
  onToggle,
  className = "",
}: {
  state: "on" | "off";
  onToggle: (e: React.MouseEvent) => void;
  className?: string;
}) => (
  <button
    type="button"
    title="Select"
    aria-label="Select"
    aria-checked={state === "on"}
    role="checkbox"
    onClick={onToggle}
    className={`grid h-[18px] w-[18px] flex-shrink-0 place-items-center rounded-[2px] border-2 transition-colors ${className} ${
      state === "on" ? "border-[#1a73e8] bg-[#1a73e8] text-white" : "border-[#5f6368] bg-transparent text-transparent hover:bg-[#e4e7eb]/60"
    }`}
  >
    <Ic d={IC.check} className="h-3 w-3" />
  </button>
);

/* ------------------------------- compose ---------------------------------- */

const ComposeWindow = ({ onClose, onSend }: { onClose: () => void; onSend: () => void }) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const field = "h-10 w-full border-b border-[#e8eaed] bg-transparent px-4 text-sm text-[#202124] outline-none placeholder:text-[#5f6368] focus:border-[#1a73e8]/60";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className="fixed bottom-0 right-4 z-50 w-[94vw] max-w-[540px] overflow-hidden rounded-t-lg bg-white shadow-[0_8px_28px_rgba(60,64,67,0.4)] sm:right-8"
    >
      <div className="flex h-10 items-center justify-between bg-[#404045] px-4">
        <span className="truncate text-sm text-white/90">New Message</span>
        <div className="flex items-center gap-1">
          <DarkIconBtn label="Minimize" onClick={onClose}>
            <Ic d={IC.minimize} className="h-4 w-4" />
          </DarkIconBtn>
          <DarkIconBtn label="Full screen">
            <Ic d={IC.expand} className="h-4 w-4" />
          </DarkIconBtn>
          <DarkIconBtn label="Save &amp; close" onClick={onClose}>
            <Ic d={IC.close} className="h-4 w-4" />
          </DarkIconBtn>
        </div>
      </div>
      <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="To recipients" className={field} />
      <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className={field} />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="h-44 w-full resize-none bg-transparent px-4 py-3 text-sm leading-relaxed text-[#202124] outline-none"
      />
      <div className="flex items-center gap-1 px-4 pb-4">
        <button
          type="button"
          onClick={() => {
            onSend();
            setTo("");
            setSubject("");
            setBody("");
          }}
          className="flex h-9 items-center gap-2 rounded-full bg-[#0b57d0] px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0a4cb4]"
        >
          Send
          <Ic d={IC.chevD} className="h-4 w-4" />
        </button>
        <IconBtn label="Attach files">
          <Ic d={IC.clip} className="h-[18px] w-[18px]" />
        </IconBtn>
        <IconBtn label="Insert emoji">
          <Ic d={IC.emoji} className="h-[18px] w-[18px]" />
        </IconBtn>
      </div>
    </motion.div>
  );
};

/* ---------------------------------- page ----------------------------------- */

export default function Day17() {
  const [mails, setMails] = useState<Mail[]>(MAILS);
  const [tab, setTab] = useState<Category>("primary");
  // The receipt email is the star of the show - open it by default.
  const [view, setView] = useState<"inbox" | "mail">("mail");
  const [openId, setOpenId] = useState<number | null>(MAILS[0].id);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; undo?: () => void } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = (msg: string, undo?: () => void) => {
    clearTimeout(toastTimer.current);
    setToast({ msg, undo });
    toastTimer.current = setTimeout(() => setToast(null), 6000);
  };

  const unreadCount = mails.filter((m) => m.unread).length;

  const visibleMails = mails.filter((m) => {
    const q = query.trim().toLowerCase();
    const match =
      !q ||
      m.fromName.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.snippet.toLowerCase().includes(q);
    return m.category === tab && match;
  });

  const openMail = (mail: Mail) => {
    setMails((prev) => prev.map((m) => (m.id === mail.id ? { ...m, unread: false } : m)));
    setOpenId(mail.id);
    setView("mail");
  };

  const backToInbox = () => {
    setView("inbox");
    setOpenId(null);
  };

  const toggleStar = (id: number) =>
    setMails((prev) => prev.map((m) => (m.id === id ? { ...m, starred: !m.starred } : m)));

  const toggleSelect = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allVisibleSelected = visibleMails.length > 0 && visibleMails.every((m) => selected.has(m.id));

  const toggleSelectAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleMails.forEach((m) => next.delete(m.id));
        return next;
      }
      visibleMails.forEach((m) => next.add(m.id));
      return next;
    });

  const removeMails = (ids: number[], verb: string) => {
    const removed = mails.filter((m) => ids.includes(m.id));
    setMails((prev) => prev.filter((m) => !ids.includes(m.id)));
    setSelected(new Set<number>());
    if (openId !== null && ids.includes(openId)) backToInbox();
    showToast(
      `${ids.length > 1 ? `${ids.length} conversations` : "Conversation"} ${verb}`,
      () => setMails((prev) => [...prev, ...removed].sort((a, b) => a.id - b.id)),
    );
  };

  const markUnread = (id: number) => {
    setMails((prev) => prev.map((m) => (m.id === id ? { ...m, unread: true } : m)));
    backToInbox();
    showToast("Conversation marked as unread");
  };

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  const activeMail = mails.find((m) => m.id === openId) ?? null;

  const inboxToolbar = (
    <div className="flex h-12 items-center gap-1 px-4 text-[#444746]">
      <CheckBox
        state={allVisibleSelected ? "on" : "off"}
        onToggle={toggleSelectAll}
        className={selected.size > 0 ? "opacity-100" : "opacity-60"}
      />
      <IconBtn label="Refresh" onClick={refresh}>
        <motion.span animate={{ rotate: refreshing ? 360 : 0 }} transition={{ duration: 0.7, ease: "easeInOut" }} className="grid">
          <Ic d={IC.refresh} />
        </motion.span>
      </IconBtn>
      <IconBtn label="More options">
        <IconMoreV />
      </IconBtn>
      {selected.size > 0 && (
        <>
          <span className="ml-2 text-xs font-medium text-[#5f6368]">{selected.size} selected</span>
          <IconBtn label="Archive" onClick={() => removeMails(Array.from(selected), "archived")}>
            <Ic d={IC.archive} />
          </IconBtn>
          <IconBtn label="Delete" onClick={() => removeMails(Array.from(selected), "moved to Trash")}>
            <Ic d={IC.delete} />
          </IconBtn>
        </>
      )}
      <span className="ml-auto pr-2 text-xs text-[#5f6368]">
        1&ndash;{visibleMails.length} of {visibleMails.length}
      </span>
    </div>
  );

  const mailToolbar = (
    <div className="flex h-12 items-center gap-1 overflow-x-auto px-4 text-[#444746]">
      <IconBtn label="Back to Inbox" onClick={backToInbox}>
        <Ic d={IC.back} />
      </IconBtn>
      <IconBtn label="Archive" onClick={() => openId !== null && removeMails([openId], "archived")}>
        <Ic d={IC.archive} />
      </IconBtn>
      <IconBtn label="Report spam">
        <Ic d={IC.report} />
      </IconBtn>
      <IconBtn label="Delete" onClick={() => openId !== null && removeMails([openId], "moved to Trash")}>
        <Ic d={IC.delete} />
      </IconBtn>
      <IconBtn label="Mark as unread" onClick={() => openId !== null && markUnread(openId)}>
        <Ic d={IC.mail} />
      </IconBtn>
      <IconBtn label="Snooze">
        <Ic d={IC.clock} />
      </IconBtn>
      <IconBtn label="More options">
        <IconMoreV />
      </IconBtn>
    </div>
  );

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden bg-[#f8fafd]"
      style={{ fontFamily: "'Google Sans','Roboto',Arial,'Helvetica Neue',sans-serif" }}
    >
      {/* top bar */}
      <header className="flex flex-shrink-0 items-center gap-2 px-4 py-2">
        <div className="flex w-60 flex-shrink-0 items-center gap-1">
          <IconBtn label="Main menu" onClick={() => setSidebarOpen((v) => !v)}>
            <Ic d={IC.menu} />
          </IconBtn>
          <button
            type="button"
            aria-label="Back to Inbox"
            onClick={backToInbox}
            className="ml-1 flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-[#e4e7eb]/60"
          >
            <GmailLogo className="h-10 w-auto" />
            <span className="text-[22px] leading-none tracking-tight text-[#5f6368]">Gmail</span>
          </button>
        </div>
        <div
          className={`mx-2 hidden h-12 max-w-3xl flex-1 items-center rounded-lg px-1 transition-colors sm:flex ${
            searchFocused ? "bg-white shadow-[0_1px_2px_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)]" : "bg-[#eaf1fb] hover:bg-[#e4ebf5]"
          }`}
        >
          <IconBtn label="Search mail" onClick={refresh}>
            <Ic d={IC.search} />
          </IconBtn>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (view === "mail") backToInbox();
            }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search mail"
            className="h-full min-w-0 flex-1 bg-transparent text-base text-[#202124] outline-none placeholder:text-[#5f6368]"
          />
          <IconBtn label="Show search options">
            <Ic d={IC.tune} />
          </IconBtn>
        </div>
        <div className="ml-auto flex flex-shrink-0 items-center gap-1 text-[#444746]">
          <IconBtn label="Support" className="hidden sm:grid">
            <Ic d={IC.help} />
          </IconBtn>
          <IconBtn label="Google apps">
            <IconApps />
          </IconBtn>
          <span className="ml-1 grid h-8 w-8 place-items-center rounded-full bg-[#9334e6] text-sm font-medium text-white">
            S
          </span>
        </div>
      </header>

      {/* body */}
      <div className="flex min-h-0 flex-1">
        {/* sidebar */}
        <aside
          className="hidden shrink-0 overflow-hidden transition-[width] duration-200 lg:block"
          style={{ width: sidebarOpen ? 240 : 0 }}
        >
          <div className="flex w-60 flex-col gap-1 px-3 pt-2">
            <button
              type="button"
              onClick={() => setComposeOpen(true)}
              className="mb-2 flex h-14 w-fit items-center gap-3 rounded-2xl bg-white px-6 text-sm font-medium text-[#1f1f1f] shadow-[0_1px_3px_rgba(60,64,67,0.3)] transition-shadow hover:shadow-[0_1px_4px_rgba(60,64,67,0.4)]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 -rotate-45" aria-hidden>
                <rect x="6" y="10" width="11" height="4.5" rx="1" fill="#4285f4" />
                <path d="M17 10l2.2 2.25L17 14.5z" fill="#fbbc04" />
                <rect x="3" y="10" width="3" height="4.5" rx="1" fill="#ea4335" />
              </svg>
              Compose
            </button>
            {([
              { label: "Inbox", icon: IC.inboxFill, filled: true, active: true, count: unreadCount },
              { label: "Starred", icon: IC.star, filled: false },
              { label: "Snoozed", icon: IC.clock, filled: false },
              { label: "Sent", icon: IC.sendFill, filled: true },
              { label: "Drafts", icon: IC.draft, filled: true },
              { label: "More", icon: IC.chevD, filled: false },
            ] as { label: string; icon: string | string[]; filled: boolean; active?: boolean; count?: number }[]).map((item) => (
              <button
                key={item.label}
                type="button"
                className={`flex h-8 items-center gap-4 rounded-r-full pl-4 pr-4 text-sm ${
                  item.active ? "bg-[#d3e3fd] font-bold text-[#001d35]" : "text-[#5f6368] hover:bg-[#e9eef6]"
                }`}
              >
                <Ic d={item.icon} filled={item.filled} className="h-[18px] w-[18px]" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count ? <span className="text-xs font-bold">{item.count}</span> : null}
              </button>
            ))}
            <p className="mb-1 mt-3 pl-4 text-xs font-medium text-[#5f6368]">Labels</p>
            {[
              { label: "Receipts", color: "#f9ab00" },
              { label: "Finance", color: "#34a853" },
            ].map((label) => (
              <button
                key={label.label}
                type="button"
                className="flex h-8 items-center gap-4 rounded-r-full pl-4 pr-4 text-sm text-[#5f6368] hover:bg-[#e9eef6]"
              >
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: label.color }} />
                {label.label}
              </button>
            ))}
          </div>
        </aside>

        {/* main */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-t-2xl border-x border-t border-[#e3e5e8] bg-white">
          <AnimatePresence mode="wait" initial={false}>
            {view === "inbox" ? (
              <motion.div
                key="inbox"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="flex min-h-0 flex-1 flex-col"
              >
                {inboxToolbar}
                {/* tabs */}
                <div className="flex flex-shrink-0 items-end gap-1 px-4">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTab(t.id)}
                      className={`relative flex h-10 items-center gap-2 rounded-t-lg px-4 text-sm ${
                        tab === t.id ? "font-medium text-[#1f1f1f]" : "text-[#5f6368] hover:bg-[#f0f4f9]"
                      }`}
                    >
                      {t.label}
                      {t.id !== "primary" && mails.some((m) => m.category === t.id) && (
                        <span className="text-xs text-[#5f6368]">{mails.filter((m) => m.category === t.id).length}</span>
                      )}
                      {tab === t.id && (
                        <motion.span
                          layoutId="tab-underline"
                          className="absolute inset-x-0 bottom-0 h-[3px] rounded-t bg-[#1a73e8]"
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* list */}
                <div className="min-h-0 flex-1 overflow-y-auto border-t border-[#e8eaed]">
                  <ul className="m-0 list-none p-0">
                    <AnimatePresence initial={false}>
                      {visibleMails.map((m) => (
                        <motion.li
                          key={m.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -40, height: 0, overflow: "hidden" }}
                          transition={{ duration: 0.22, ease: "easeOut" }}
                          onClick={() => openMail(m)}
                          className={`group grid cursor-pointer grid-cols-[auto_auto_10rem_minmax(0,1fr)_auto] items-center gap-3 px-4 text-sm ${
                            selected.has(m.id)
                              ? "bg-[#d3e3fd]"
                              : m.unread
                                ? "bg-white hover:shadow-[0_1px_2px_rgba(60,64,67,0.3)]"
                                : "bg-[#f2f6fc] hover:bg-[#ebf1fb]"
                          }`}
                        >
                          <CheckBox
                            state={selected.has(m.id) ? "on" : "off"}
                            onToggle={(e) => {
                              e.stopPropagation();
                              toggleSelect(m.id);
                            }}
                          />
                          <StarBtn starred={m.starred} onToggle={() => toggleStar(m.id)} />
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar mail={m} size={32} />
                            <span className={`truncate text-[#202124] ${m.unread ? "font-bold" : ""}`}>{m.fromName}</span>
                          </div>
                          <p className="m-0 min-w-0 truncate">
                            <span className={`text-[#202124] ${m.unread ? "font-bold" : ""}`}>{m.subject}</span>
                            <span className="text-[#5f6368]"> - {m.snippet}</span>
                          </p>
                          <div className="flex items-center gap-1">
                            <div className="hidden items-center md:flex">
                              <IconBtn
                                label="Archive"
                                className="h-8 w-8 hidden md:group-hover:grid"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeMails([m.id], "archived");
                                }}
                              >
                                <Ic d={IC.archive} className="h-4 w-4" />
                              </IconBtn>
                              <IconBtn
                                label="Delete"
                                className="h-8 w-8 hidden md:group-hover:grid"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeMails([m.id], "moved to Trash");
                                }}
                              >
                                <Ic d={IC.delete} className="h-4 w-4" />
                              </IconBtn>
                            </div>
                            <span className={`w-14 text-right text-xs ${m.unread ? "font-bold text-[#202124]" : "text-[#5f6368]"}`}>
                              {m.received}
                            </span>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                  {visibleMails.length === 0 && (
                    <div className="flex flex-col items-center gap-3 py-20 text-[#5f6368]">
                      <Ic d={IC.search} className="h-10 w-10 opacity-40" />
                      <p className="m-0 text-sm">No messages matched your search</p>
                    </div>
                  )}
                  <footer className="flex flex-col items-center gap-1 py-6 text-xs text-[#5f6368]">
                    <p className="m-0">0.35 GB of 15 GB used &middot; Terms &middot; Privacy &middot; Program Policies</p>
                    <p className="m-0">Last account activity: 4 minutes ago</p>
                  </footer>
                </div>
              </motion.div>
            ) : (
              activeMail && (
                <motion.div
                  key="mail"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="flex min-h-0 flex-1 flex-col"
                >
                  {mailToolbar}
                  <div className="min-h-0 flex-1 overflow-y-auto border-t border-[#e8eaed]">
                    <div className="px-6 pb-12 lg:px-10">
                      {/* subject */}
                      <div className="mb-1 flex items-start gap-3 pt-3">
                        <h1 className="m-0 flex-1 text-xl leading-snug text-[#1f1f1f] lg:text-[22px]">{activeMail.subject}</h1>
                        <span className="mt-1 hidden flex-shrink-0 items-center gap-1.5 rounded-lg bg-[#f1f3f4] px-2.5 py-1 text-xs text-[#444746] sm:flex">
                          <Ic d={IC.moveToInboxFill} className="h-4 w-4" filled />
                          Inbox
                        </span>
                      </div>

                      {/* sender */}
                      <div className="flex items-center gap-3 py-3">
                        <Avatar mail={activeMail} />
                        <div className="min-w-0 flex-1">
                          <p className="m-0 truncate text-sm font-semibold text-[#202124]">
                            {activeMail.fromName}{" "}
                            <span className="font-normal text-[#5f6368]">&lt;{activeMail.fromEmail}&gt;</span>
                          </p>
                          <button type="button" className="flex items-center gap-0.5 text-xs text-[#5f6368] hover:text-[#202124]">
                            to me
                            <Ic d={IC.chevD} className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="flex-shrink-0 text-xs text-[#5f6368]">{activeMail.received}</span>
                        <StarBtn
                          starred={activeMail.starred}
                          onToggle={() => toggleStar(activeMail.id)}
                          className="hidden sm:grid"
                        />
                        <IconBtn label="Print all" className="hidden sm:grid">
                          <Ic d={IC.print} />
                        </IconBtn>
                      </div>

                      {/* body */}
                      <div className="max-w-[680px] pt-2">{activeMail.body}</div>

                      {/* reply / forward */}
                      <div className="mt-8 flex max-w-[680px] gap-3">
                        <button
                          type="button"
                          onClick={() => setComposeOpen(true)}
                          className="flex h-9 items-center gap-2 rounded-full border border-[#c4c7c5] px-5 text-sm font-medium text-[#1f1f1f] transition-colors hover:bg-[#f0f4f9]"
                        >
                          <Ic d={IC.reply} className="h-[18px] w-[18px]" filled />
                          Reply
                        </button>
                        <button
                          type="button"
                          onClick={() => setComposeOpen(true)}
                          className="flex h-9 items-center gap-2 rounded-full border border-[#c4c7c5] px-5 text-sm font-medium text-[#1f1f1f] transition-colors hover:bg-[#f0f4f9]"
                        >
                          <Ic d={IC.forward} className="h-[18px] w-[18px]" filled />
                          Forward
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* compose */}
      <AnimatePresence>{composeOpen && <ComposeWindow onClose={() => setComposeOpen(false)} onSend={() => showToast("Message sent")} />}</AnimatePresence>

      {/* snackbar */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 left-5 z-[60] flex items-center gap-5 rounded-lg bg-[#333333] py-3.5 pl-4 pr-2 text-sm text-white shadow-[0_3px_10px_rgba(0,0,0,0.3)]"
          >
            <span>{toast.msg}</span>
            {toast.undo && (
              <button
                type="button"
                onClick={() => {
                  toast.undo?.();
                  clearTimeout(toastTimer.current);
                  setToast(null);
                }}
                className="pr-2 text-sm font-medium text-[#8ab4f8] hover:underline"
              >
                Undo
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

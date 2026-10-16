"use client";

import React from "react";

/**
 * Day 22 — hand-drawn SVG app/file icons in the macOS style.
 * Each icon renders inside a 64x64 viewBox; app tiles get the classic
 * squircle (rounded-rect) silhouette with a gradient fill.
 */

type IconProps = { className?: string };

const Svg = ({ children, className, tile = true }: { children: React.ReactNode; className?: string; tile?: boolean }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    {children}
    {tile && <rect x="0" y="0" width="64" height="64" rx="14.5" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.4" />}
  </svg>
);

/* --------------------------------- apps --------------------------------- */

export const FinderIcon = ({ className }: IconProps) => (
  <Svg className={className}>
    <defs>
      <linearGradient id="fd-a" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3fb3f7" />
        <stop offset="1" stopColor="#1273de" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14.5" fill="url(#fd-a)" />
    <path d="M32 0h17.5A14.5 14.5 0 0 1 64 14.5v35A14.5 14.5 0 0 1 49.5 64H32Z" fill="#0d6ad0" opacity="0.55" />
    <rect x="30.4" y="0" width="1.4" height="64" fill="#bfe4ff" opacity="0.65" />
    <circle cx="21.5" cy="24.5" r="3" fill="#fff" />
    <circle cx="43" cy="24.5" r="3" fill="#fff" />
    <path d="M13 38c6 7 12.5 10 19 10s13-3 19-10" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
    <path d="M32 48c6.5 0 13-3 19-10" fill="none" stroke="#0a5ab8" strokeWidth="4" strokeLinecap="round" />
  </Svg>
);

export const LaunchpadIcon = ({ className }: IconProps) => (
  <Svg className={className}>
    <rect width="64" height="64" rx="14.5" fill="#f4f5f7" />
    <circle cx="20" cy="20" r="5.2" fill="#ff5f57" />
    <circle cx="32" cy="20" r="5.2" fill="#ffbd2e" />
    <circle cx="44" cy="20" r="5.2" fill="#28c840" />
    <circle cx="20" cy="32" r="5.2" fill="#0a84ff" />
    <circle cx="32" cy="32" r="5.2" fill="#5e5ce6" />
    <circle cx="44" cy="32" r="5.2" fill="#ff375f" />
    <circle cx="20" cy="44" r="5.2" fill="#30d158" />
    <circle cx="32" cy="44" r="5.2" fill="#64d2ff" />
    <circle cx="44" cy="44" r="5.2" fill="#ff9f0a" />
  </Svg>
);

export const SafariIcon = ({ className }: IconProps) => (
  <Svg className={className}>
    <defs>
      <linearGradient id="sf-a" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3fa2ff" />
        <stop offset="1" stopColor="#0060df" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14.5" fill="url(#sf-a)" />
    <circle cx="32" cy="32" r="22" fill="#f5fbff" />
    <circle cx="32" cy="32" r="18.5" fill="url(#sf-a)" />
    {Array.from({ length: 12 }).map((_, i) => (
      <rect
        key={i}
        x="31.4"
        y="15"
        width="1.2"
        height={i % 3 === 0 ? 5 : 3}
        rx="0.6"
        fill="#dcecff"
        transform={`rotate(${i * 30} 32 32)`}
      />
    ))}
    <polygon points="45.5,18.5 34.4,34.4 29.6,29.6" fill="#ff4d3f" />
    <polygon points="18.5,45.5 29.6,29.6 34.4,34.4" fill="#f8fbff" />
  </Svg>
);

export const MailIcon = ({ className }: IconProps) => (
  <Svg className={className}>
    <defs>
      <linearGradient id="ml-a" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3ec6ff" />
        <stop offset="1" stopColor="#0a84ff" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14.5" fill="url(#ml-a)" />
    <rect x="12" y="20" width="40" height="25" rx="4.5" fill="#fff" />
    <path d="M14.5 22.5 32 36.5 49.5 22.5" fill="none" stroke="#9ecbef" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const NotesIcon = ({ className }: IconProps) => (
  <Svg className={className}>
    <rect width="64" height="64" rx="14.5" fill="#fff" />
    <rect width="64" height="15" rx="14.5" fill="#ffd60a" />
    <rect y="8" width="64" height="7" fill="#ffd60a" />
    <rect x="4.5" y="7" width="8" height="2.4" rx="1.2" fill="#b28a00" opacity="0.55" />
    <g fill="#d9d9de">
      <rect x="12" y="26" width="40" height="3.4" rx="1.7" />
      <rect x="12" y="35" width="40" height="3.4" rx="1.7" />
      <rect x="12" y="44" width="26" height="3.4" rx="1.7" />
    </g>
  </Svg>
);

export const MapsIcon = ({ className }: IconProps) => (
  <Svg className={className}>
    <defs>
      <linearGradient id="mp-a" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#9fe08e" />
        <stop offset="1" stopColor="#5ec98a" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14.5" fill="url(#mp-a)" />
    <path d="M0 40c14-4 22 4 32 2s20-8 32-4v26H0Z" fill="#7fd7a8" opacity="0.8" />
    <path d="M0 14c12 2 18-6 32-4s20 10 32 6v10c-12-4-20 4-32 2S12 20 0 24Z" fill="#8fd0f5" opacity="0.75" />
    <path d="M10 64C18 46 30 40 44 34l6-4" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    <path d="M2 22c14 8 24 16 34 30" fill="none" stroke="#ffd166" strokeWidth="3.4" strokeLinecap="round" />
    <circle cx="32" cy="30" r="6" fill="#ff3b30" />
    <path d="M32 46c-4.5-5.5-6-9-6-11.5a6 6 0 0 1 12 0C38 37 36.5 40.5 32 46Z" fill="#ff3b30" />
    <circle cx="32" cy="34.2" r="2.4" fill="#8f1d17" />
  </Svg>
);

export const PhotosIcon = ({ className }: IconProps) => (
  <Svg className={className}>
    <rect width="64" height="64" rx="14.5" fill="#fff" />
    {["#ff3b30", "#ff9f0a", "#ffd60a", "#30d158", "#00c7be", "#0a84ff", "#5e5ce6", "#ff375f"].map((c, i) => (
      <ellipse
        key={c}
        cx="32"
        cy="20.5"
        rx="6.2"
        ry="11.5"
        fill={c}
        opacity="0.82"
        transform={`rotate(${i * 45} 32 32)`}
      />
    ))}
  </Svg>
);

export const MusicIcon = ({ className }: IconProps) => (
  <Svg className={className}>
    <defs>
      <linearGradient id="mu-a" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fb5c74" />
        <stop offset="1" stopColor="#f8325f" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14.5" fill="url(#mu-a)" />
    <path
      d="M43 14.5c.2 5.8.4 8.7.4 11 0 4.6-1 8.4-1 12.4 0 2.5-2 4.1-4.9 4.1-3.4 0-6.2-2.2-6.2-5.2 0-2.8 2.4-5 6-5 1.5 0 2.6.3 3.6.8.3-4.6.2-9.3.1-15.6l-11.8 2.6c0 7.4.1 10.5.1 14.5 0 4.6-1 8.4-4.9 8.4s-6.2-2.2-6.2-5.2c0-2.8 2.4-5 6-5 1.5 0 2.6.3 3.6.8.2-6 .1-13 .1-19.8l15.1-3.4Z"
      fill="#fff"
    />
  </Svg>
);

export const CalculatorAppIcon = ({ className }: IconProps) => (
  <Svg className={className}>
    <rect width="64" height="64" rx="14.5" fill="#2c2c2e" />
    <rect x="10" y="8" width="44" height="12" rx="3" fill="#f2f2f7" />
    <text x="48" y="17.5" textAnchor="end" fontSize="8" fontWeight="600" fill="#1c1c1e" fontFamily="ui-monospace, monospace">
      1,024
    </text>
    {[
      [18, 28], [32, 28], [46, 28],
      [18, 40], [32, 40], [46, 40],
      [18, 52], [32, 52], [46, 52],
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="4.4" fill={x === 46 ? "#ff9f0a" : i < 3 ? "#8e8e93" : "#5b5b60"} />
    ))}
  </Svg>
);

export const CalendarIcon = ({ className }: IconProps) => (
  <Svg className={className}>
    <rect width="64" height="64" rx="14.5" fill="#fff" />
    <path d="M0 14.5A14.5 14.5 0 0 1 14.5 0h35A14.5 14.5 0 0 1 64 14.5V17H0Z" fill="#ff3b30" />
    <text x="10" y="12.5" fontSize="9" fontWeight="700" fill="#fff" fontFamily="-apple-system, sans-serif" letterSpacing="0.5">
      OCT
    </text>
    <text x="32" y="52" textAnchor="middle" fontSize="34" fontWeight="300" fill="#1c1c1e" fontFamily="-apple-system, sans-serif">
      11
    </text>
  </Svg>
);

export const TerminalIcon = ({ className }: IconProps) => (
  <Svg className={className}>
    <rect width="64" height="64" rx="14.5" fill="#1a1a1c" />
    <rect x="0" y="0" width="64" height="12" rx="14.5" fill="#3a3a3c" />
    <rect x="0" y="7" width="64" height="5" fill="#3a3a3c" />
    <text x="12" y="36" fontSize="16" fontWeight="700" fill="#30d158" fontFamily="ui-monospace, monospace">
      {">"}
    </text>
    <rect x="22" y="40" width="12" height="3.4" rx="1" fill="#e8e8ed" />
    <rect x="10" y="52" width="34" height="2.6" rx="1.3" fill="#5b5b60" opacity="0.7" />
  </Svg>
);

export const MessagesIcon = ({ className }: IconProps) => (
  <Svg className={className}>
    <defs>
      <linearGradient id="ms-a" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6ef26e" />
        <stop offset="1" stopColor="#1fce4f" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14.5" fill="url(#ms-a)" />
    <path
      d="M32 16c-10.5 0-19 6.7-19 15.2 0 5.2 3.2 9.8 8.1 12.6-.5 3.2-2.2 5.7-4.4 7.7 4.4-.6 8-2.4 10.7-4.8 1.5.3 3 .4 4.6.4 10.5 0 19-6.7 19-15.9S42.5 16 32 16Z"
      fill="#fff"
    />
  </Svg>
);

export const SettingsIcon = ({ className }: IconProps) => (
  <Svg className={className}>
    <defs>
      <linearGradient id="st-a" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#c9cdd6" />
        <stop offset="1" stopColor="#7d838f" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14.5" fill="url(#st-a)" />
    <g fill="#fafafa">
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x="29.6" y="8" width="4.8" height="13" rx="2.2" transform={`rotate(${i * 45} 32 32)`} />
      ))}
      <circle cx="32" cy="32" r="13.5" />
    </g>
    <circle cx="32" cy="32" r="6.5" fill="#8f95a1" />
  </Svg>
);

export const RemindersIcon = ({ className }: IconProps) => (
  <Svg className={className}>
    <rect width="64" height="64" rx="14.5" fill="#fff" />
    {[
      ["#ff3b30", 22],
      ["#ff9f0a", 32],
      ["#30d158", 42],
      ["#0a84ff", 52],
    ].map(([c, y]) => (
      <g key={y as number}>
        <circle cx="18" cy={y as number} r="3.4" fill={c as string} />
        <rect x="26" y={(y as number) - 1.7} width="22" height="3.4" rx="1.7" fill="#d9d9de" />
      </g>
    ))}
  </Svg>
);

export const AppStoreIcon = ({ className }: IconProps) => (
  <Svg className={className}>
    <defs>
      <linearGradient id="as-a" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2fc9ff" />
        <stop offset="1" stopColor="#0a6cff" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14.5" fill="url(#as-a)" />
    <g stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none">
      <path d="M32 15.5 21.5 34" />
      <path d="M32 15.5 42.5 34" />
      <path d="M17 40.5 19.5 36" />
      <path d="M47 40.5 36.5 22" />
      <path d="M21 40.5h22" />
    </g>
  </Svg>
);

export const TextEditIcon = ({ className }: IconProps) => (
  <Svg className={className}>
    <rect width="64" height="64" rx="14.5" fill="#fff" />
    <path d="M0 14.5A14.5 14.5 0 0 1 14.5 0h35A14.5 14.5 0 0 1 64 14.5V20H0Z" fill="#e9e9ee" />
    <g fill="#b9b9c4">
      <rect x="10" y="30" width="44" height="3.6" rx="1.8" />
      <rect x="10" y="39" width="44" height="3.6" rx="1.8" />
      <rect x="10" y="48" width="28" height="3.6" rx="1.8" />
    </g>
  </Svg>
);

/* ------------------------------ system items ----------------------------- */

export const FolderIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="fo-a" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8fc7ff" />
        <stop offset="1" stopColor="#4a97ea" />
      </linearGradient>
    </defs>
    <path d="M4 18a5 5 0 0 1 5-5h13l5 5h28a5 5 0 0 1 5 5v27a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z" fill="#3f8fe0" />
    <path d="M4 26h56v24a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z" fill="url(#fo-a)" />
    <path d="M4 26h56v3H4Z" fill="#fff" opacity="0.35" />
  </svg>
);

export const TrashIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <path d="M22 10h20" stroke="#cfd8e6" strokeWidth="3" strokeLinecap="round" />
    <path d="M28 10c0-2 1.6-3.5 4-3.5s4 1.5 4 3.5" fill="none" stroke="#cfd8e6" strokeWidth="3" strokeLinecap="round" />
    <rect x="14" y="14" width="36" height="5" rx="2.5" fill="#dfe7f2" />
    <path d="M17 21h30l-2.6 32a4 4 0 0 1-4 3.7H23.6a4 4 0 0 1-4-3.7Z" fill="#b9c6db" opacity="0.9" />
    <g stroke="#8fa3c0" strokeWidth="2.2" strokeLinecap="round">
      <path d="M26 26v26" />
      <path d="M32 26v26" />
      <path d="M38 26v26" />
    </g>
  </svg>
);

/* ------------------------------ file types ------------------------------- */

const docBadge = (text: string, color: string) => (
  <svg viewBox="0 0 64 64" className="" aria-hidden="true">
    <path d="M12 4h27l13 13v43a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z" fill="#fff" />
    <path d="M39 4l13 13H42a3 3 0 0 1-3-3Z" fill="#dfe3ea" />
    <rect x="14" y="24" width="34" height="16" rx="4" fill={color} />
    <text x="31" y="36.5" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#fff" fontFamily="-apple-system, sans-serif">
      {text}
    </text>
    <g fill="#c9cfda">
      <rect x="16" y="46" width="26" height="2.8" rx="1.4" />
      <rect x="16" y="52" width="16" height="2.8" rx="1.4" />
    </g>
  </svg>
);

export const PdfIcon = ({ className }: IconProps) => <div className={className}>{docBadge("PDF", "#ff3b30")}</div>;
export const PagesIcon = ({ className }: IconProps) => <div className={className}>{docBadge("DOC", "#0a84ff")}</div>;
export const NumbersIcon = ({ className }: IconProps) => <div className={className}>{docBadge("XLS", "#30d158")}</div>;
export const KeynoteIcon = ({ className }: IconProps) => <div className={className}>{docBadge("KEY", "#ff9f0a")}</div>;
export const ZipIcon = ({ className }: IconProps) => (
  <div className={className}>
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M12 4h27l13 13v43a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z" fill="#fff" />
      <path d="M39 4l13 13H42a3 3 0 0 1-3-3Z" fill="#dfe3ea" />
      <g fill="#c9cfda">
        <rect x="16" y="42" width="26" height="2.8" rx="1.4" />
        <rect x="16" y="49" width="18" height="2.8" rx="1.4" />
      </g>
      <rect x="26" y="10" width="12" height="12" rx="2" fill="#8e8e93" />
      <rect x="29" y="24" width="6" height="14" rx="3" fill="#8e8e93" />
      <rect x="30" y="28" width="4" height="4" rx="1" fill="#fff" />
    </svg>
  </div>
);
export const ImageDocIcon = ({ className }: IconProps) => (
  <div className={className}>
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M12 4h27l13 13v43a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z" fill="#fff" />
      <path d="M39 4l13 13H42a3 3 0 0 1-3-3Z" fill="#dfe3ea" />
      <rect x="16" y="26" width="32" height="24" rx="3" fill="#bfe0ff" />
      <circle cx="25" cy="34" r="4" fill="#ffd60a" />
      <path d="M18 48l9-9 7 7 6-5 8 7Z" fill="#4a97ea" />
    </svg>
  </div>
);
export const MarkdownIcon = ({ className }: IconProps) => (
  <div className={className}>
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <DocPageShape />
      <rect x="10" y="24" width="44" height="16" rx="3" fill="#3c3c43" />
      <text x="32" y="36.5" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff" fontFamily="ui-monospace, monospace">
        {"{ }"}
      </text>
      <g fill="#c9cfda">
        <rect x="16" y="46" width="26" height="2.8" rx="1.4" />
        <rect x="16" y="52" width="16" height="2.8" rx="1.4" />
      </g>
    </svg>
  </div>
);

const DocPageShape = () => (
  <>
    <path d="M12 4h27l13 13v43a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z" fill="#fff" />
    <path d="M39 4l13 13H42a3 3 0 0 1-3-3Z" fill="#dfe3ea" />
  </>
);

/* ------------------------------ misc glyphs ------------------------------ */

export const GlobeIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <defs>
      <radialGradient id="gl-a" cx="0.35" cy="0.3" r="0.9">
        <stop offset="0" stopColor="#7fd7ff" />
        <stop offset="1" stopColor="#0a6cff" />
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="26" fill="url(#gl-a)" />
    <g fill="none" stroke="#fff" strokeWidth="2.4" opacity="0.9">
      <ellipse cx="32" cy="32" rx="26" ry="26" />
      <ellipse cx="32" cy="32" rx="12" ry="26" />
      <path d="M6 32h52" />
      <path d="M10 20c14 5 30 5 44 0" />
      <path d="M10 44c14-5 30-5 44 0" />
    </g>
  </svg>
);

export const BookIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <rect x="8" y="8" width="48" height="48" rx="8" fill="#c26a2e" />
    <rect x="12" y="12" width="40" height="40" rx="5" fill="#fff" />
    <rect x="12" y="12" width="8" height="40" rx="3" fill="#e8dfd2" />
    <g fill="#c26a2e">
      <rect x="26" y="20" width="20" height="3" rx="1.5" />
      <rect x="26" y="28" width="20" height="3" rx="1.5" />
      <rect x="26" y="36" width="13" height="3" rx="1.5" />
    </g>
  </svg>
);

export const ContactIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <rect x="8" y="6" width="48" height="52" rx="9" fill="#fff" />
    <rect x="8" y="6" width="7" height="52" rx="3" fill="#c26a2e" />
    <circle cx="38" cy="27" r="8" fill="#b98a63" />
    <path d="M23 50c1.5-8.5 7-13 15-13s13.5 4.5 15 13Z" fill="#8f95a1" />
  </svg>
);

export const SiriIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <defs>
      <radialGradient id="si-a" cx="0.4" cy="0.35" r="0.85">
        <stop offset="0" stopColor="#7dfaff" />
        <stop offset="0.45" stopColor="#5e5ce6" />
        <stop offset="1" stopColor="#ff2d92" />
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="26" fill="url(#si-a)" />
    <path d="M14 40c10-14 26-14 36 0" fill="none" stroke="#fff" strokeWidth="3" opacity="0.4" />
  </svg>
);

export const MagnifierIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
);

export const DailyUiIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <rect width="64" height="64" rx="14.5" fill="#111827" />
    <rect x="10" y="14" width="44" height="30" rx="4" fill="#1f2937" stroke="#3b82f6" strokeWidth="2.5" />
    <circle cx="18" cy="22" r="2" fill="#3b82f6" />
    <rect x="16" y="28" width="18" height="3" rx="1.5" fill="#60a5fa" />
    <rect x="16" y="35" width="26" height="3" rx="1.5" fill="#3b5bdb" />
    <rect x="24" y="48" width="16" height="3.5" rx="1.75" fill="#3b82f6" />
  </svg>
);

/* -------------------------------- registry ------------------------------- */

export type IconId =
  | "finder" | "launchpad" | "safari" | "mail" | "notes" | "maps" | "photos"
  | "music" | "calculator" | "calendar" | "terminal" | "messages" | "settings"
  | "reminders" | "appstore" | "textedit" | "folder" | "trash" | "pdf" | "pages"
  | "numbers" | "keynote" | "zip" | "imagedoc" | "markdown" | "globe" | "book"
  | "contact" | "siri" | "dailyui";

export const ICONS: Record<IconId, React.ComponentType<IconProps>> = {
  finder: FinderIcon,
  launchpad: LaunchpadIcon,
  safari: SafariIcon,
  mail: MailIcon,
  notes: NotesIcon,
  maps: MapsIcon,
  photos: PhotosIcon,
  music: MusicIcon,
  calculator: CalculatorAppIcon,
  calendar: CalendarIcon,
  terminal: TerminalIcon,
  messages: MessagesIcon,
  settings: SettingsIcon,
  reminders: RemindersIcon,
  appstore: AppStoreIcon,
  textedit: TextEditIcon,
  folder: FolderIcon,
  trash: TrashIcon,
  pdf: PdfIcon,
  pages: PagesIcon,
  numbers: NumbersIcon,
  keynote: KeynoteIcon,
  zip: ZipIcon,
  imagedoc: ImageDocIcon,
  markdown: MarkdownIcon,
  globe: GlobeIcon,
  book: BookIcon,
  contact: ContactIcon,
  siri: SiriIcon,
  dailyui: DailyUiIcon,
};

export function ItemIcon({ id, className }: { id: IconId; className?: string }) {
  const Cmp = ICONS[id] ?? FolderIcon;
  return <Cmp className={className} />;
}

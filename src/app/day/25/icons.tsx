import React from "react";

type P = { className?: string; strokeWidth?: number };

const S = ({
  children,
  className,
  strokeWidth = 2,
  fill = "none",
  stroke = "currentColor",
  strokeLinecap = "round" as const,
  strokeLinejoin = "round" as const,
}: P & {
  children: React.ReactNode;
  fill?: string;
  stroke?: string;
  strokeLinecap?: "round" | "butt" | "square";
  strokeLinejoin?: "round" | "miter" | "bevel";
}) => (
  <svg
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinecap={strokeLinecap}
    strokeLinejoin={strokeLinejoin}
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const PowerIcon = (p: P) => (
  <S {...p}>
    <path d="M12 3v9" />
    <path d="M18.36 6.64a9 9 0 1 1-12.72 0" />
  </S>
);

export const HomeIcon = (p: P) => (
  <S {...p} strokeWidth={2.2}>
    <path d="M3.5 10.5 12 3.5l8.5 7" />
    <path d="M5.5 9.5V20h13V9.5" />
  </S>
);

export const BackIcon = (p: P) => (
  <S {...p}>
    <path d="M9.5 14.5 4.5 9.5l5-5" />
    <path d="M4.5 9.5h9a6.5 6.5 0 0 1 0 13H11" />
  </S>
);

export const StarIcon = (p: P) => (
  <S {...p} strokeWidth={2.4}>
    <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" />
  </S>
);

export const ReplayIcon = (p: P) => (
  <S {...p}>
    <path d="M4.5 5.5v5h5" />
    <path d="M5.2 10.5A8 8 0 1 1 12 20a8 8 0 0 1-6.9-4" />
  </S>
);

export const RewindIcon = (p: P) => (
  <S {...p} fill="currentColor" stroke="none">
    <path d="M11.5 5.5v13L2.5 12z" />
    <path d="M21.5 5.5v13L12.5 12z" />
  </S>
);

export const FfwdIcon = (p: P) => (
  <S {...p} fill="currentColor" stroke="none">
    <path d="M12.5 5.5v13L21.5 12z" />
    <path d="M2.5 5.5v13L11.5 12z" />
  </S>
);

export const PlayIcon = (p: P) => (
  <S {...p} fill="currentColor" stroke="none">
    <path d="M7 4.5v15l13-7.5z" />
  </S>
);

export const PauseIcon = (p: P) => (
  <S {...p} fill="currentColor" stroke="none">
    <rect x="5.5" y="4.5" width="4.6" height="15" rx="1.4" />
    <rect x="13.9" y="4.5" width="4.6" height="15" rx="1.4" />
  </S>
);

export const VolHighIcon = (p: P) => (
  <S {...p}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="none" />
    <path d="M15.5 9.2a4 4 0 0 1 0 5.6M18 6.8a7.4 7.4 0 0 1 0 10.4" />
  </S>
);

export const MuteIcon = (p: P) => (
  <S {...p}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="none" />
    <path d="M15.5 9.5l5 5M20.5 9.5l-5 5" />
  </S>
);

export const MicIcon = (p: P) => (
  <S {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M8.5 21h7" />
  </S>
);

export const WifiIcon = (p: P) => (
  <S {...p} strokeWidth={2.2}>
    <path d="M4 9.5a12 12 0 0 1 16 0M7 13a8 8 0 0 1 10 0M10 16.5a3.6 3.6 0 0 1 4 0" />
    <circle cx="12" cy="19.4" r="1.1" fill="currentColor" stroke="none" />
  </S>
);

export const GearIcon = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7" />
  </S>
);

export const PlusIcon = (p: P) => (
  <S {...p} strokeWidth={2.4}>
    <path d="M12 5v14M5 12h14" />
  </S>
);

export const InfoIcon = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v6M12 7.5v.5" />
  </S>
);

export const CcIcon = (p: P) => (
  <S {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
    <path d="M10.5 10.2a3 3 0 1 0 0 3.6M17.5 10.2a3 3 0 1 0 0 3.6" />
  </S>
);

export const ChevronLeftIcon = (p: P) => (
  <S {...p} strokeWidth={2.4}>
    <path d="M14.5 5.5 8 12l6.5 6.5" />
  </S>
);

export const SearchIcon = (p: P) => (
  <S {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </S>
);

export const ArrowLeftIcon = (p: P) => (
  <S {...p} strokeWidth={2.4}>
    <path d="M20 12H4.5M11 5.5 4.5 12l6.5 6.5" />
  </S>
);

export const SparkleIcon = (p: P) => (
  <S {...p} fill="currentColor" stroke="none">
    <path d="M12 3l1.8 5.7L19.5 10.5l-5.7 1.8L12 18l-1.8-5.7L4.5 10.5l5.7-1.8z" />
    <circle cx="19" cy="5" r="1.4" />
    <circle cx="5.5" cy="18.5" r="1.2" />
  </S>
);

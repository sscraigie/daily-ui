// Day 5 - App Icon

export const PhoneIcon = () => (
  <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
    <path
      transform="translate(16.4 16.4) scale(2.8)"
      d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
      fill="#fff"
    />
  </svg>
);

export const MessagesIcon = () => (
  <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
    <path
      d="M50 21.5c-18.9 0-34.2 11.2-34.2 25 0 7.6 4.5 14.2 11.7 18.7l-2.9 10.5c-.5 1.9 1.3 3.4 3 2.4l12.7-7.2c3.1.8 6.4 1.1 9.7 1.1 18.9 0 34.2-11.2 34.2-25S68.9 21.5 50 21.5z"
      fill="#fff"
    />
  </svg>
);

export const SafariIcon = () => (
  <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
    <defs>
      <linearGradient id="d5-safari-dial" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#3FB2F8" />
        <stop offset="1" stopColor="#1B6FF0" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="31" fill="url(#d5-safari-dial)" />
    <g stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.9">
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1="50" y1="21.5" x2="50" y2="25.5" transform={`rotate(${i * 30} 50 50)`} />
      ))}
    </g>
    <g transform="rotate(-45 50 50)">
      <path d="M50 27.5 55.5 50h-11z" fill="#FF4B4B" />
      <path d="M50 72.5 55.5 50h-11z" fill="#fff" />
    </g>
  </svg>
);

export const MusicIcon = () => (
  <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
    <g fill="#fff" transform="translate(-3.1 -3.2)">
      <ellipse cx="41.5" cy="69" rx="8" ry="6" transform="rotate(-18 41.5 69)" />
      <ellipse cx="64.5" cy="65" rx="8" ry="6" transform="rotate(-18 64.5 65)" />
      <rect x="46.2" y="36.5" width="3.2" height="31" />
      <rect x="69.2" y="32" width="3.2" height="31" />
      <path d="M46.2 36.5 72.4 31.6v7L46.2 43.5z" />
    </g>
  </svg>
);

export const CalendarIcon = () => (
  <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
    <text
      x="50"
      y="30"
      textAnchor="middle"
      fontSize="12"
      fontWeight="600"
      letterSpacing="1.5"
      fill="#FF3B30"
    >
      FRI
    </text>
    <text x="50" y="73" textAnchor="middle" fontSize="38" fontWeight="400" fill="#1C1C1E">
      23
    </text>
  </svg>
);

export const WeatherIcon = () => (
  <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
    <defs>
      <linearGradient id="d5-sun" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#FFE45C" />
        <stop offset="1" stopColor="#FFC400" />
      </linearGradient>
    </defs>
    <circle cx="40.5" cy="40.5" r="13.5" fill="url(#d5-sun)" />
    <g fill="#fff">
      <circle cx="56" cy="57" r="12" />
      <circle cx="69.5" cy="55.5" r="9.5" />
      <rect x="44" y="57" width="37" height="13.5" rx="6.75" />
    </g>
  </svg>
);

export const ClockIcon = () => (
  <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
    <circle cx="50" cy="50" r="31" fill="#fff" />
    <g stroke="#1C1C1E" strokeWidth="2.6" strokeLinecap="round">
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1="50" y1="22.5" x2="50" y2="26.5" transform={`rotate(${i * 30} 50 50)`} />
      ))}
    </g>
    <rect x="48.6" y="31" width="2.8" height="20" rx="1.4" fill="#1C1C1E" transform="rotate(-60 50 50)" />
    <rect x="48.8" y="24" width="2.4" height="27" rx="1.2" fill="#1C1C1E" transform="rotate(54 50 50)" />
    <rect x="49.3" y="21" width="1.4" height="31" rx="0.7" fill="#FF9500" transform="rotate(216 50 50)" />
    <circle cx="50" cy="50" r="3" fill="#FF9500" />
    <circle cx="50" cy="50" r="1.2" fill="#fff" />
  </svg>
);

export const MapsIcon = () => (
  <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
    <path d="M0 0h42v44L0 56Z" fill="#BFE3A8" />
    <path d="M60 0h40v30L78 20Z" fill="#A9D4F5" />
    <g stroke="#fff" strokeWidth="6" fill="none">
      <path d="M-4 64 104 46" />
      <path d="M40 -4 52 104" />
    </g>
    <path d="M-4 30 44 34" stroke="#F6C445" strokeWidth="5" fill="none" />
    <path d="M50 29 66 75 50 65.5 34 75Z" fill="#3478F6" />
  </svg>
);

export const NotesIcon = () => (
  <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
    <defs>
      <linearGradient id="d5-notes-band" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#FFCE3C" />
        <stop offset="1" stopColor="#FA9C1D" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="100" height="29" fill="url(#d5-notes-band)" />
    <g stroke="#D8D8DC" strokeWidth="4.5" strokeLinecap="round">
      <line x1="20" y1="47" x2="80" y2="47" />
      <line x1="20" y1="59.5" x2="80" y2="59.5" />
      <line x1="20" y1="72" x2="80" y2="72" />
      <line x1="20" y1="84.5" x2="60" y2="84.5" />
    </g>
  </svg>
);

export const RemindersIcon = () => (
  <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
    {(
      [
        ["#FF9500", 30],
        ["#007AFF", 44.5],
        ["#34C759", 59],
        ["#FF3B30", 73.5],
      ] as const
    ).map(([color, y]) => (
      <g key={color}>
        <circle cx="28" cy={y} r="5.5" fill={color} />
        <rect x="42" y={y - 2.5} width="38" height="5" rx="2.5" fill="#D9D9DE" />
      </g>
    ))}
  </svg>
);

export const CameraIcon = () => (
  <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
    <defs>
      <radialGradient id="d5-cam-glass" cx="0.38" cy="0.34" r="0.78">
        <stop offset="0" stopColor="#5C7CF5" />
        <stop offset="0.45" stopColor="#4B3FA8" />
        <stop offset="0.8" stopColor="#2E2A5E" />
        <stop offset="1" stopColor="#1E1C38" />
      </radialGradient>
    </defs>
    <circle cx="50" cy="55" r="21.5" fill="#0E0E11" />
    <circle cx="50" cy="55" r="18" fill="url(#d5-cam-glass)" />
    <circle cx="43.5" cy="48.5" r="3.2" fill="#fff" opacity="0.55" />
    <circle cx="26.5" cy="29.5" r="4" fill="#E8E8EA" />
  </svg>
);

export const PhotosIcon = () => (
  <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
    {(
      [
        "#FF3B30",
        "#FF9500",
        "#FFCC00",
        "#34C759",
        "#32ADE6",
        "#007AFF",
        "#AF52DE",
        "#FF2D55",
      ] as const
    ).map((color, i) => (
      <ellipse
        key={color}
        cx="50"
        cy="34"
        rx="8.5"
        ry="16.5"
        fill={color}
        opacity="0.8"
        transform={`rotate(${i * 45} 50 50)`}
      />
    ))}
  </svg>
);

export const HealthIcon = () => (
  <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
    <defs>
      <linearGradient id="d5-heart" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#FF6B7F" />
        <stop offset="1" stopColor="#FF2D55" />
      </linearGradient>
    </defs>
    <path
      d="M50 79C50 79 17.5 58.5 17.5 36.5c0-10.5 8.2-18.5 18.3-18.5 6.7 0 11.7 3.6 14.2 8.9 2.5-5.3 7.5-8.9 14.2-8.9 10.1 0 18.3 8 18.3 18.5C82.5 58.5 50 79 50 79z"
      fill="url(#d5-heart)"
    />
  </svg>
);

export const WalletIcon = () => (
  <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
    <rect x="19" y="42" width="62" height="13" rx="5" fill="#34C759" />
    <rect x="19" y="55" width="62" height="13" rx="5" fill="#FFD60A" />
    <rect x="19" y="68" width="62" height="14" rx="5" fill="#5AC8FA" />
  </svg>
);

export const SettingsIcon = () => (
  <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
    <g fill="#59595F">
      {Array.from({ length: 8 }, (_, i) => (
        <rect
          key={i}
          x="36.5"
          y="34"
          width="7"
          height="9"
          rx="1.5"
          transform={`rotate(${i * 45} 40 56)`}
        />
      ))}
      <circle cx="40" cy="56" r="15" />
    </g>
    <circle cx="40" cy="56" r="6.5" fill="#B9B9BF" />
    <g fill="#59595F">
      {Array.from({ length: 8 }, (_, i) => (
        <rect
          key={i}
          x="64.8"
          y="21"
          width="4.4"
          height="6"
          rx="1"
          transform={`rotate(${i * 45} 67 33)`}
        />
      ))}
      <circle cx="67" cy="33" r="8.5" />
    </g>
    <circle cx="67" cy="33" r="3.5" fill="#B9B9BF" />
  </svg>
);

export const AppStoreIcon = () => (
  <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
    <g stroke="#fff" strokeWidth="6.5" strokeLinecap="round" fill="none">
      <path d="M33 67 50 33" />
      <path d="M67 67 50 33" />
      <path d="M38.5 55h23" />
    </g>
  </svg>
);

export const CalculatorIcon = () => (
  <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
    <rect x="18" y="16" width="64" height="13" rx="3.5" fill="#3A3A3E" />
    {[0, 1, 2, 3].flatMap((row) =>
      [0, 1, 2, 3].map((col) => (
        <rect
          key={`${row}-${col}`}
          x={18 + col * 16.7}
          y={35 + row * 15}
          width="13.5"
          height="11"
          rx="3"
          fill={col === 3 ? "#FF9F0A" : "#98989D"}
        />
      )),
    )}
  </svg>
);

export const PodcastsIcon = () => (
  <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
    <circle cx="50" cy="40" r="7.2" fill="#fff" />
    <path
      d="M35.5 66.8V63.5C35.5 55.6 42 49.5 50 49.5s14.5 6.1 14.5 14v3.3c0 1-.8 1.8-1.8 1.8H37.3c-1 0-1.8-.8-1.8-1.8z"
      fill="#fff"
    />
    <path
      d="M26.5 32.5a27 27 0 0 0 0 35"
      stroke="#fff"
      strokeWidth="4.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M73.5 32.5a27 27 0 0 1 0 35"
      stroke="#fff"
      strokeWidth="4.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export const StocksIcon = () => (
  <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
    <path
      d="M18 67 33 52l13 7 16-19 20-10"
      stroke="#30D158"
      strokeWidth="5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="82" cy="30" r="4" fill="#fff" />
  </svg>
);

export const FilesIcon = () => (
  <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
    <defs>
      <linearGradient id="d5-folder" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#47A9F7" />
        <stop offset="1" stopColor="#2B7DE9" />
      </linearGradient>
    </defs>
    <rect x="18" y="27" width="26" height="12" rx="4" fill="url(#d5-folder)" />
    <rect x="18" y="32" width="64" height="40" rx="6" fill="url(#d5-folder)" />
    <rect x="18" y="50" width="64" height="22" rx="6" fill="#fff" opacity="0.16" />
  </svg>
);


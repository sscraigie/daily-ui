export type Palette = {
  from: string;
  via: string;
  to: string;
  accent: string;
};

export type Channel = {
  id: string;
  name: string;
  mark: string;
  markStyle: React.CSSProperties;
  tile: string;
  palette: Palette;
  show: string;
  genre: string;
  rating: string;
  episodes: string[];
  duration: number;
};

const netflixMark: React.CSSProperties = {
  color: "#e50914",
  fontWeight: 900,
  letterSpacing: "0.14em",
};

export const CHANNELS: Channel[] = [
  {
    id: "netflix",
    name: "Netflix",
    mark: "NETFLIX",
    markStyle: netflixMark,
    tile: "linear-gradient(150deg, #17171a 0%, #0b0b0d 100%)",
    palette: { from: "#3b0a10", via: "#7a0f18", to: "#1a0507", accent: "#e50914" },
    show: "Crimson Harbor",
    genre: "Crime drama",
    rating: "TV-MA",
    episodes: ["The Bait Barge", "Dead Low Tide", "Harbor Lights", "The Confession"],
    duration: 468,
  },
  {
    id: "disney",
    name: "Disney+",
    mark: "Disney+",
    markStyle: {
      color: "#3ba6ff",
      fontWeight: 700,
      fontFamily: "Georgia, serif",
      fontStyle: "italic",
    },
    tile: "linear-gradient(150deg, #101a2e 0%, #070b14 100%)",
    palette: { from: "#0a1e3f", via: "#144287", to: "#050b18", accent: "#3ba6ff" },
    show: "Starlight Canyon",
    genre: "Family adventure",
    rating: "TV-G",
    episodes: ["The Map in the Mesas", "Coyote Moon", "Rattlesnake Ridge", "Home on the Range"],
    duration: 412,
  },
  {
    id: "hulu",
    name: "Hulu",
    mark: "hulu",
    markStyle: { color: "#1ce783", fontWeight: 800, letterSpacing: "0.04em" },
    tile: "linear-gradient(150deg, #0d2118 0%, #060d09 100%)",
    palette: { from: "#06281a", via: "#0e5c38", to: "#03120b", accent: "#1ce783" },
    show: "Neon Kitchen",
    genre: "Competition",
    rating: "TV-PG",
    episodes: ["Sixteen Candles of Heat", "Umami Bombs", "The Pressure Test", "Fork in the Road"],
    duration: 386,
  },
  {
    id: "prime",
    name: "Prime Video",
    mark: "prime video",
    markStyle: { color: "#00a8e1", fontWeight: 700, letterSpacing: "0.02em" },
    tile: "linear-gradient(150deg, #0a1a22 0%, #050c10 100%)",
    palette: { from: "#06202b", via: "#0d5b76", to: "#02111a", accent: "#00a8e1" },
    show: "Deep Blue Division",
    genre: "Docuseries",
    rating: "TV-14",
    episodes: ["Beneath the Gyre", "The Coral Architects", "Twilight Zone", "Song of the Deep"],
    duration: 441,
  },
  {
    id: "appletv",
    name: "Apple TV+",
    mark: "",
    markStyle: { color: "#f5f5f7", fontWeight: 500, letterSpacing: "0.02em" },
    tile: "linear-gradient(150deg, #1c1c1e 0%, #0a0a0b 100%)",
    palette: { from: "#23252d", via: "#4a4f63", to: "#0c0d11", accent: "#b7bcda" },
    show: "Tidewalkers",
    genre: "Sci-fi drama",
    rating: "TV-14",
    episodes: ["Salt in the Wound", "The Long Shore", "Signal to Noise", "What the Water Gave"],
    duration: 502,
  },
  {
    id: "max",
    name: "Max",
    mark: "MAX",
    markStyle: {
      color: "#cfe0ff",
      fontWeight: 900,
      letterSpacing: "0.32em",
      textShadow: "0 0 14px rgba(122,108,255,.8)",
    },
    tile: "linear-gradient(150deg, #141428 0%, #08080f 100%)",
    palette: { from: "#131334", via: "#3b2f8f", to: "#070714", accent: "#7a6cff" },
    show: "Hollow Crown",
    genre: "Epic fantasy",
    rating: "TV-MA",
    episodes: ["The Winter Court", "Ash and Oath", "The Regent's Gambit", "Coronation"],
    duration: 528,
  },
  {
    id: "paramount",
    name: "Paramount+",
    mark: "Paramount+",
    markStyle: { color: "#eef3ff", fontWeight: 700, letterSpacing: "0.02em" },
    tile: "linear-gradient(150deg, #0e1c3f 0%, #060b18 100%)",
    palette: { from: "#0b1b46", via: "#1d4ed8", to: "#050a1c", accent: "#5b8cff" },
    show: "Ridgeline",
    genre: "Western",
    rating: "TV-14",
    episodes: ["Dry Season", "The Land Grant", "Cattle and Credit", "High Country"],
    duration: 427,
  },
  {
    id: "peacock",
    name: "Peacock",
    mark: "peacock",
    markStyle: {
      color: "#ffffff",
      fontWeight: 800,
      letterSpacing: "0.03em",
      textShadow: "0 0 12px rgba(255,199,0,.55), 0 0 22px rgba(0,201,219,.4)",
    },
    tile: "linear-gradient(150deg, #131c26 0%, #080b10 100%)",
    palette: { from: "#241d05", via: "#c7a112", to: "#0d0a02", accent: "#ffc700" },
    show: "Glass Harbour",
    genre: "Mystery",
    rating: "TV-14",
    episodes: ["The Lighthouse Keepers", "A Study in Salt", "The Ferryman's Ledger", "Glasshouse"],
    duration: 455,
  },
];

export const FEATURED: Channel = {
  id: "roku",
  name: "The Roku Channel",
  mark: "roku",
  markStyle: {
    color: "#ffffff",
    fontWeight: 900,
    letterSpacing: "0.06em",
  },
  tile: "linear-gradient(150deg, #2a1052 0%, #662d91 55%, #17102b 100%)",
  palette: { from: "#2a1052", via: "#7c34b8", to: "#170d2e", accent: "#a06bff" },
  show: "Interstellar Drift",
  genre: "Sci-fi thriller",
  rating: "TV-14",
  episodes: ["Signal from Kepler-442", "The Long Silence", "Oxygen Debt", "Terminal Velocity"],
  duration: 447,
};

export const SHORTCUTS: { key: `ch:${string}`; label: string; bg: string; fg: string; text: string }[] = [
  { key: "ch:netflix", label: "Netflix", bg: "linear-gradient(160deg,#f7f6f4,#eae8e3)", fg: "#d81f26", text: "NETFLIX" },
  { key: "ch:disney", label: "Disney+", bg: "linear-gradient(160deg,#f7f6f4,#eae8e3)", fg: "#1446c8", text: "Disney+" },
  { key: "ch:appletv", label: "Apple TV+", bg: "linear-gradient(160deg,#3a3a40,#2a2a2f)", fg: "#f5f5f7", text: "tv+" },
  { key: "ch:rokuch", label: "Roku Channel", bg: "linear-gradient(160deg,#f7f6f4,#eae8e3)", fg: "#662d91", text: "Roku Channel" },
];

export const ADD_TILE_INDEX = 1 + CHANNELS.length;

export function fmtTime(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

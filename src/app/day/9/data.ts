// Day 9 - Spotify clone data model
// All tracks/playlists are fictional. Covers are CSS gradients keyed by
// playlist (cards) and artist (track rows), so no image assets are needed.

export type Track = {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: number; // seconds
  plays: number;
};

export type Playlist = {
  id: number;
  name: string;
  description: string;
  cover: [string, string];
  bg: string; // header gradient color for the playlist page
  kind?: "playlist" | "artist";
  tracks: Track[];
};

export type View =
  | { type: "home" }
  | { type: "search" }
  | { type: "playlist"; id: number }
  | { type: "artist"; name: string }
  | { type: "liked" };

export const LIKED_CONTEXT_ID = -1;

const t = (
  id: number,
  title: string,
  artist: string,
  album: string,
  duration: number,
  plays: number
): Track => ({ id, title, artist, album, duration, plays });

export const playlists: Playlist[] = [
  {
    id: 1,
    name: "Daily Mix 1",
    description: "Aurora Skies, Cassette Motel, Marseille Grey and more",
    cover: ["#5A4FCF", "#8E7BFF"],
    bg: "#4038A8",
    tracks: [
      t(101, "Hologram Sky", "Aurora Skies", "Pastel Machines", 223, 48213944),
      t(102, "Neon Sandwich", "Cassette Motel", "Vacancy", 197, 12904112),
      t(103, "Grey Weather", "Marseille Grey", "Overcast Tapes", 245, 8821507),
      t(104, "Polaroid Summer", "Aurora Skies", "Pastel Machines", 208, 36112903),
      t(105, "Static Lullaby", "Static Bloom", "Cold Wave", 189, 21339872),
      t(106, "Late Bus Home", "Cassette Motel", "Vacancy", 231, 9871201),
      t(107, "Violet Hour", "Marseille Grey", "Overcast Tapes", 264, 7431002),
    ],
  },
  {
    id: 2,
    name: "Midnight Chill",
    description: "Slow tempo sounds for late nights and long thoughts.",
    cover: ["#1E3264", "#537AA1"],
    bg: "#1E3264",
    tracks: [
      t(201, "Slow Tide", "Fern & Fog", "Seafoam", 254, 15220987),
      t(202, "Blue Hour Drive", "Marseille Grey", "Overcast Tapes", 268, 6720112),
      t(203, "Weightless", "Aurora Skies", "Pastel Machines", 275, 59130442),
      t(204, "Half Moon Motel", "Cassette Motel", "Vacancy", 212, 8433210),
      t(205, "Quiet Machines", "Static Bloom", "Cold Wave", 240, 12993871),
      t(206, "Sea Glass", "Fern & Fog", "Seafoam", 233, 9811223),
    ],
  },
  {
    id: 3,
    name: "Focus Flow",
    description: "Beats with no vocals to keep you in the zone.",
    cover: ["#503750", "#8D67AB"],
    bg: "#503750",
    tracks: [
      t(301, "Deep Work", "Volt Atlas", "Concentration Engine", 302, 22910453),
      t(302, "Flow State", "Volt Atlas", "Concentration Engine", 288, 19884012),
      t(303, "Monotask", "Static Bloom", "Cold Wave", 276, 11023982),
      t(304, "Slow Motion City", "Marseille Grey", "Overcast Tapes", 294, 7744210),
      t(305, "Signal Path", "Volt Atlas", "Concentration Engine", 263, 15339821),
      t(306, "Rain on Windows", "Fern & Fog", "Seafoam", 258, 8812012),
    ],
  },
  {
    id: 4,
    name: "Neon Nights",
    description: "Synthwave anthems for midnight drives.",
    cover: ["#E8115B", "#7A0C3E"],
    bg: "#A31250",
    tracks: [
      t(401, "Chrome Heart", "Static Bloom", "Cold Wave", 214, 31223871),
      t(402, "Midnight Arcade", "Volt Atlas", "Night Circuit", 198, 27118903),
      t(403, "Pink Linear", "Static Bloom", "Cold Wave", 226, 18442901),
      t(404, "Turbo Sunset", "Volt Atlas", "Night Circuit", 241, 22990812),
      t(405, "Laser Date", "Cassette Motel", "Vacancy", 205, 11223871),
      t(406, "Afterglow Boulevard", "Aurora Skies", "Pastel Machines", 232, 33112874),
    ],
  },
  {
    id: 5,
    name: "Acoustic Mornings",
    description: "Gentle folk to ease into the day.",
    cover: ["#B06239", "#E8A15C"],
    bg: "#8D4E2F",
    tracks: [
      t(501, "Paper Planes Home", "Kaya Rivers", "Timber & Twine", 221, 18990342),
      t(502, "Coffee & Charcoal", "Kaya Rivers", "Timber & Twine", 196, 12440871),
      t(503, "Front Porch Light", "Fern & Fog", "Seafoam", 238, 9912211),
      t(504, "Wildflower County", "Kaya Rivers", "Timber & Twine", 247, 15872903),
      t(505, "Sawdust Waltz", "Fern & Fog", "Seafoam", 214, 7433991),
      t(506, "Golden Retrievers", "Kaya Rivers", "Timber & Twine", 189, 8992013),
    ],
  },
  {
    id: 6,
    name: "Beast Mode",
    description: "Heavy hitters for max-effort sessions.",
    cover: ["#D84000", "#7A2E0C"],
    bg: "#B23A0A",
    tracks: [
      t(601, "Iron Pulse", "Volt Atlas", "Night Circuit", 182, 40112871),
      t(602, "Adrenaline Bank", "Static Bloom", "Cold Wave", 176, 28901273),
      t(603, "Full Send", "Volt Atlas", "Night Circuit", 194, 33448901),
      t(604, "Redline", "The Midnight Court", "Neon Graffiti", 201, 21440112),
      t(605, "Heavy Set", "The Midnight Court", "Neon Graffiti", 188, 17872930),
      t(606, "Sprint Finish", "Volt Atlas", "Night Circuit", 172, 12990213),
    ],
  },
  {
    id: 7,
    name: "Indie Discoveries",
    description: "Fresh finds from the edge of the alternative scene.",
    cover: ["#0E7A5E", "#3ED598"],
    bg: "#0E6B54",
    tracks: [
      t(701, "Paper Cut Maps", "The Midnight Court", "Neon Graffiti", 217, 12449023),
      t(702, "Velvet Static", "Static Bloom", "Cold Wave", 229, 15339182),
      t(703, "Sleeper Hit", "Cassette Motel", "Vacancy", 203, 9982172),
      t(704, "Local Anesthetic", "The Midnight Court", "Neon Graffiti", 236, 8892013),
      t(705, "Basement Tapes Vol. 9", "Marseille Grey", "Overcast Tapes", 251, 6699102),
      t(706, "Parallel Parking", "Cassette Motel", "Vacancy", 194, 7123981),
    ],
  },
];

export const ARTIST_COLORS: Record<string, [string, string]> = {
  "Aurora Skies": ["#7FB2F0", "#B39DDB"],
  "The Midnight Court": ["#30475E", "#7A9E7E"],
  "Kaya Rivers": ["#C98A5E", "#E8C39E"],
  "Static Bloom": ["#E8115B", "#4A1259"],
  "Fern & Fog": ["#3E6B4F", "#9CC5A1"],
  "Volt Atlas": ["#D84000", "#2B124C"],
  "Cassette Motel": ["#F2AA4C", "#D65A31"],
  "Marseille Grey": ["#5D6D7E", "#AEB6BF"],
};

export const LIKED_COVER: [string, string] = ["#4C1D95", "#A78BFA"];

export const allTracks: Track[] = playlists.flatMap((p) => p.tracks);

export const artistPages: Playlist[] = Object.entries(ARTIST_COLORS).map(
  ([name, colors], i) => ({
    id: 1001 + i,
    name,
    description: "",
    cover: colors,
    bg: colors[0],
    kind: "artist" as const,
    tracks: allTracks.filter((tr) => tr.artist === name),
  })
);

export const artistIdFor = (name: string): number => {
  const idx = Object.keys(ARTIST_COLORS).indexOf(name);
  return 1001 + (idx === -1 ? 0 : idx);
};

export function findTrack(id: number): Track | undefined {
  return allTracks.find((t) => t.id === id);
}

export function playlistById(id: number): Playlist | undefined {
  return playlists.find((p) => p.id === id);
}

export function pageByIdAll(id: number): Playlist | undefined {
  if (id === LIKED_CONTEXT_ID) return undefined;
  return [...playlists, ...artistPages].find((p) => p.id === id);
}

export function playlistOfTrack(id: number): Playlist | undefined {
  return playlists.find((p) => p.tracks.some((t) => t.id === id));
}

export function colorsForArtist(artist: string): [string, string] {
  return ARTIST_COLORS[artist] ?? ["#5A4FCF", "#8E7BFF"];
}

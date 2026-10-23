"use client";
// Day 20 - Map
// "Atlas" - a maps app clone on top of real, explorable map data. Leaflet +
// OpenStreetMap/CARTO/Esri tiles power the basemap, Nominatim handles global
// search and reverse geocoding, and OSRM computes real driving, walking and
// cycling routes.
// Includes: typeahead search, place cards with photos, nearby filters,
// multi-mode directions with step lists, map/satellite/terrain layers,
// dropped pins, saved places and browser geolocation.

import "leaflet/dist/leaflet.css";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import type {
  LayerGroup,
  Map as LeafletMap,
  Marker,
  TileLayer as LeafletTileLayer,
} from "leaflet";
import { useDarkMode } from "@/components/ThemeProvider";
import {
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconArrowsSplit2,
  IconAlertCircle,
  IconBeach,
  IconBookmark,
  IconBookmarkFilled,
  IconBuildingArch,
  IconBuildingMonument,
  IconBus,
  IconBike,
  IconCamera,
  IconCar,
  IconCheck,
  IconChevronUp,
  IconClock,
  IconCoffee,
  IconCookie,
  IconCopy,
  IconCurrentLocation,
  IconFlag,
  IconGlobe,
  IconMap2,
  IconMapPin,
  IconMinus,
  IconMoonStars,
  IconMountain,
  IconNavigation,
  IconPhone,
  IconPlus,
  IconRefresh,
  IconRoute,
  IconSearch,
  IconShoppingBag,
  IconShare,
  IconStar,
  IconStarFilled,
  IconTrees,
  IconWalk,
  IconX,
  IconDotsVertical,
} from "@tabler/icons-react";

/* --------------------------------- data ----------------------------------- */

type Category =
  | "Attraction"
  | "Park"
  | "Cafe"
  | "Bakery"
  | "Museum"
  | "Market"
  | "Beach"
  | "Landmark"
  | "Viewpoint"
  | "Shopping"
  | "Place";

type Place = {
  id: string;
  name: string;
  category: Category;
  rating: number;
  reviews: number;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  hours: string;
  open: boolean;
  price?: string;
  blurb: string;
  tags: string[];
  wiki?: string;
  remote?: boolean;
};

type DirMode = "drive" | "transit" | "walk" | "bike";

type RouteStep = { text: string; dist: number; icon: string; loc?: [number, number] };

type RouteData = {
  coords: [number, number][];
  distance: number;
  duration: number;
  steps: RouteStep[];
  via: string;
  fallback: boolean;
  profile: DirMode | "offline";
};

type Dest = { name: string; lat: number; lng: number; id?: string };

const DEFAULT_ORIGIN: [number, number] = [37.7879, -122.4074]; // Union Square

const PLACES: Place[] = [
  {
    id: "ggb",
    name: "Golden Gate Bridge",
    category: "Attraction",
    rating: 4.8,
    reviews: 51840,
    lat: 37.8199,
    lng: -122.4783,
    address: "Golden Gate Brg, San Francisco, CA",
    phone: "(415) 921-5858",
    hours: "Open 24 hours",
    open: true,
    blurb:
      "The 1.7-mile Art Deco icon spanning the Golden Gate strait since 1937. Walk or bike across for postcard views of the city, Alcatraz and the Marin Headlands.",
    tags: ["bridge", "landmark", "views", "cycling", "iconic"],
    wiki: "Golden Gate Bridge",
  },
  {
    id: "ferry",
    name: "Ferry Building Marketplace",
    category: "Market",
    rating: 4.6,
    reviews: 18422,
    lat: 37.7955,
    lng: -122.3937,
    address: "1 Ferry Building, San Francisco, CA 94111",
    phone: "(415) 981-0888",
    hours: "Open until 8 PM",
    open: true,
    blurb:
      "Historic 1898 ferry terminal turned artisan food hall. Slurp oysters, grab Blue Bottle coffee and browse the famous farmers market.",
    tags: ["market", "food", "farmers market", "ferry", "food hall"],
    wiki: "Ferry Building",
  },
  {
    id: "pier39",
    name: "Pier 39",
    category: "Attraction",
    rating: 4.5,
    reviews: 32110,
    lat: 37.8087,
    lng: -122.4098,
    address: "Beach St & The Embarcadero, San Francisco, CA",
    phone: "(415) 705-5500",
    hours: "Open until 10 PM",
    open: true,
    blurb:
      "Festive waterfront complex famous for its raucous sea lion colony, street performers, an antique carousel and bay views.",
    tags: ["sea lions", "waterfront", "shopping", "family", "carousel"],
    wiki: "Pier 39",
  },
  {
    id: "ggpark",
    name: "Golden Gate Park",
    category: "Park",
    rating: 4.8,
    reviews: 27301,
    lat: 37.7694,
    lng: -122.4862,
    address: "501 Stanyan St, San Francisco, CA 94117",
    phone: "(415) 831-2700",
    hours: "Open 24 hours",
    open: true,
    blurb:
      "A 1,000-acre urban oasis bigger than Central Park, with gardens, lakes, windmills, a bison paddock and the de Young museum.",
    tags: ["park", "garden", "bison", "trails", "museum"],
    wiki: "Golden Gate Park",
  },
  {
    id: "painted",
    name: "Painted Ladies",
    category: "Landmark",
    rating: 4.7,
    reviews: 12120,
    lat: 37.7762,
    lng: -122.4326,
    address: "Steiner St, San Francisco, CA 94117",
    phone: "",
    hours: "Open 24 hours",
    open: true,
    blurb:
      "The postcard row of colorful Victorian houses lining Alamo Square, with the downtown skyline rising behind them.",
    tags: ["victorian", "houses", "viewpoint", "photos", "postcard row"],
    wiki: "Painted Ladies",
  },
  {
    id: "coit",
    name: "Coit Tower",
    category: "Landmark",
    rating: 4.6,
    reviews: 15480,
    lat: 37.8024,
    lng: -122.4058,
    address: "1 Telegraph Hill Blvd, San Francisco, CA 94133",
    phone: "(415) 249-0995",
    hours: "Open until 5 PM",
    open: true,
    blurb:
      "Flapper-era concrete tower on Telegraph Hill with Depression-era murals inside and a 360-degree observation deck at the top.",
    tags: ["tower", "murals", "views", "history", "observation"],
    wiki: "Coit Tower",
  },
  {
    id: "twinpeaks",
    name: "Twin Peaks",
    category: "Viewpoint",
    rating: 4.8,
    reviews: 21066,
    lat: 37.7544,
    lng: -122.4477,
    address: "501 Twin Peaks Blvd, San Francisco, CA 94114",
    phone: "",
    hours: "Open 24 hours",
    open: true,
    blurb:
      "Two 900-foot hills with a winding road to the summit - the best panoramic viewpoint in the city, especially at sunset.",
    tags: ["viewpoint", "sunset", "hiking", "panorama", "views"],
    wiki: "Twin Peaks (San Francisco)",
  },
  {
    id: "palace",
    name: "Palace of Fine Arts",
    category: "Landmark",
    rating: 4.7,
    reviews: 23408,
    lat: 37.8029,
    lng: -122.4485,
    address: "3601 Lyon St, San Francisco, CA 94123",
    phone: "",
    hours: "Open 24 hours",
    open: true,
    blurb:
      "A Beaux-Arts rotunda and swan lagoon left over from the 1915 Panama-Pacific Exposition. Golden hour here is unreal.",
    tags: ["rotunda", "lagoon", "architecture", "photos", "weddings"],
    wiki: "Palace of Fine Arts",
  },
  {
    id: "dragon",
    name: "Chinatown Dragon Gate",
    category: "Landmark",
    rating: 4.5,
    reviews: 8240,
    lat: 37.7908,
    lng: -122.4056,
    address: "Grant Ave & Bush St, San Francisco, CA 94108",
    phone: "",
    hours: "Open 24 hours",
    open: true,
    blurb:
      "The green-tiled southern entrance to the oldest Chinatown in North America. Step through into 24 blocks of lanterns, bakeries and alleys.",
    tags: ["chinatown", "gate", "arch", "photos", "grant ave"],
    wiki: "Chinatown, San Francisco",
  },
  {
    id: "oceanbeach",
    name: "Ocean Beach",
    category: "Beach",
    rating: 4.6,
    reviews: 9420,
    lat: 37.7594,
    lng: -122.5107,
    address: "Great Hwy, San Francisco, CA 94121",
    phone: "",
    hours: "Open 24 hours",
    open: true,
    blurb:
      "Three miles of windswept Pacific shoreline along the Great Highway. Surfers in wetsuits, bonfire pits and the best sunsets in town.",
    tags: ["beach", "surf", "sunset", "bonfire", "coast"],
    wiki: "Ocean Beach, San Francisco",
  },
  {
    id: "bluebottle",
    name: "Blue Bottle Coffee - Mint Plaza",
    category: "Cafe",
    rating: 4.5,
    reviews: 2140,
    lat: 37.7824,
    lng: -122.4094,
    address: "66 Mint St, San Francisco, CA 94103",
    phone: "(415) 992-6440",
    hours: "Open until 6 PM",
    open: true,
    price: "$$",
    blurb:
      "The Bay Area cult roaster's flagship cafe in a brick-lined plaza. New Orleans iced coffee and siphon brews.",
    tags: ["coffee", "espresso", "wifi", "pastry", "latte"],
    wiki: "Blue Bottle Coffee",
  },
  {
    id: "tartine",
    name: "Tartine Bakery",
    category: "Bakery",
    rating: 4.5,
    reviews: 4815,
    lat: 37.7614,
    lng: -122.4241,
    address: "600 Guerrero St, San Francisco, CA 94110",
    phone: "(415) 937-1599",
    hours: "Open until 5 PM",
    open: true,
    price: "$$",
    blurb:
      "Legendary Mission bakery - the morning bun and country loaf have their own fan clubs. Expect a line, it moves fast.",
    tags: ["bakery", "bread", "morning bun", "croissant", "pastry"],
    wiki: "Tartine Bakery",
  },
  {
    id: "ghirardelli",
    name: "Ghirardelli Square",
    category: "Shopping",
    rating: 4.5,
    reviews: 13220,
    lat: 37.8058,
    lng: -122.4229,
    address: "900 North Point St, San Francisco, CA 94109",
    phone: "(415) 775-5500",
    hours: "Open until 9 PM",
    open: true,
    blurb:
      "Converted 19th-century chocolate factory on the waterfront. Original Ghirardelli sundae flagships and bay views from the courtyard.",
    tags: ["chocolate", "shopping", "sundae", "waterfront", "ice cream"],
    wiki: "Ghirardelli Square",
  },
  {
    id: "exploratorium",
    name: "Exploratorium",
    category: "Museum",
    rating: 4.7,
    reviews: 11430,
    lat: 37.8017,
    lng: -122.3973,
    address: "Pier 15, The Embarcadero, San Francisco, CA 94111",
    phone: "(415) 528-4444",
    hours: "Open until 5 PM",
    open: true,
    price: "$$$",
    blurb:
      "650+ hands-on science, art and perception exhibits inside Pier 15. Adults-only After Dark nights on Thursdays.",
    tags: ["science", "museum", "hands-on", "kids", "pier"],
    wiki: "Exploratorium",
  },
  {
    id: "dolores",
    name: "Mission Dolores Park",
    category: "Park",
    rating: 4.7,
    reviews: 14002,
    lat: 37.7596,
    lng: -122.4269,
    address: "Dolores St, San Francisco, CA 94114",
    phone: "",
    hours: "Open until 10 PM",
    open: true,
    blurb:
      "The Mission's sunbathing lawn with a skyline backdrop, off-leash dog area and the best picnic people-watching in the city.",
    tags: ["park", "picnic", "views", "dogs", "mission"],
    wiki: "Mission Dolores Park",
  },
  {
    id: "salesforce",
    name: "Salesforce Park",
    category: "Park",
    rating: 4.6,
    reviews: 6180,
    lat: 37.7898,
    lng: -122.3967,
    address: "425 Mission St, San Francisco, CA 94105",
    phone: "",
    hours: "Open until 8 PM",
    open: true,
    blurb:
      "A 5.4-acre rooftop botanical garden floating 70 feet above the bus terminal, with 13 gardens and free morning yoga.",
    tags: ["rooftop", "garden", "downtown", "free", "transit center"],
    wiki: "Salesforce Transit Center",
  },
];

const CAT_META: Record<Category, { color: string; label: string }> = {
  Attraction: { color: "#ea4335", label: "Attraction" },
  Park: { color: "#34a853", label: "Park" },
  Cafe: { color: "#c79a6b", label: "Coffee shop" },
  Bakery: { color: "#fbc02d", label: "Bakery" },
  Museum: { color: "#a78bfa", label: "Museum" },
  Market: { color: "#26a69a", label: "Market" },
  Beach: { color: "#00b8d9", label: "Beach" },
  Landmark: { color: "#e8710a", label: "Landmark" },
  Viewpoint: { color: "#7986cb", label: "Viewpoint" },
  Shopping: { color: "#f06292", label: "Shopping" },
  Place: { color: "#8ab4f8", label: "Place" },
};

function catIcon(c: Category, size = 16) {
  const cls = `flex-shrink-0`;
  switch (c) {
    case "Park":
      return <IconTrees size={size} className={cls} />;
    case "Cafe":
      return <IconCoffee size={size} className={cls} />;
    case "Bakery":
      return <IconCookie size={size} className={cls} />;
    case "Museum":
      return <IconBuildingMonument size={size} className={cls} />;
    case "Market":
    case "Shopping":
      return <IconShoppingBag size={size} className={cls} />;
    case "Beach":
      return <IconBeach size={size} className={cls} />;
    case "Viewpoint":
      return <IconCamera size={size} className={cls} />;
    case "Landmark":
      return <IconBuildingArch size={size} className={cls} />;
    default:
      return <IconMapPin size={size} className={cls} />;
  }
}

const GROUPS: { id: string; label: string; cats: Category[] }[] = [
  { id: "food", label: "Food & drink", cats: ["Cafe", "Bakery", "Market"] },
  { id: "parks", label: "Parks", cats: ["Park"] },
  { id: "attractions", label: "Attractions", cats: ["Attraction", "Landmark", "Viewpoint"] },
  { id: "museums", label: "Museums", cats: ["Museum"] },
  { id: "shopping", label: "Shopping", cats: ["Shopping"] },
];

const REVIEWS: Record<string, { author: string; text: string; rating: number }[]> = {
  Attraction: [
    { author: "Maya R.", rating: 5, text: "Bike across at sunrise before the crowds - the view back at the city is unbeatable." },
    { author: "Jordan T.", rating: 4, text: "Bring a windbreaker, it gets seriously cold and windy even in summer." },
  ],
  Park: [
    { author: "Priya S.", rating: 5, text: "My weekend ritual. Grab a blanket, a burrito and watch the fog roll in." },
    { author: "Sam K.", rating: 5, text: "Huge and never feels crowded if you walk ten minutes off the main lawn." },
  ],
  Cafe: [
    { author: "Elena V.", rating: 5, text: "The New Orleans iced coffee is dangerous. Staff actually care about pour quality." },
    { author: "Chris L.", rating: 4, text: "Limited seating at peak hours but the espresso is consistently excellent." },
  ],
  Bakery: [
    { author: "Maya R.", rating: 5, text: "Morning bun lives up to the hype. Line looks long but moves in five minutes." },
    { author: "Jordan T.", rating: 4, text: "Everything is good, but get there before noon or the bread sells out." },
  ],
  Museum: [
    { author: "Priya S.", rating: 5, text: "Easily lost track of time - three hours vanished. The tactile dome is worth booking." },
    { author: "Sam K.", rating: 5, text: "Thursday After Dark with cocktails is the best museum night anywhere." },
  ],
  Market: [
    { author: "Elena V.", rating: 5, text: "Tuesday farmers market is the move. Oysters outside with the bay behind you." },
    { author: "Chris L.", rating: 4, text: "Touristy in spots but the food halls inside are genuinely excellent." },
  ],
  Beach: [
    { author: "Sam K.", rating: 5, text: "Bring layers. Wild, windswept and beautiful - sunset bonfires are a core memory." },
    { author: "Maya R.", rating: 4, text: "Strong currents, swim with care, but for a walk it's perfect." },
  ],
  Landmark: [
    { author: "Jordan T.", rating: 5, text: "Golden hour, every time. You will fill a camera roll, no shame." },
    { author: "Priya S.", rating: 5, text: "Free to wander and endlessly photogenic from every angle." },
  ],
  Viewpoint: [
    { author: "Chris L.", rating: 5, text: "Fog rolling under your feet at sunset is a top-five SF experience." },
    { author: "Elena V.", rating: 5, text: "Windy! But the 360 panorama is the best in the city, hands down." },
  ],
  Shopping: [
    { author: "Maya R.", rating: 4, text: "The sundae is pure nostalgia and the courtyard view over the bay is lovely." },
    { author: "Sam K.", rating: 4, text: "Touristy but charming - great for gifts and a cable car photo." },
  ],
  Place: [
    { author: "A traveler", rating: 5, text: "Found via search - a great little detour off the usual route." },
  ],
};

/* --------------------------------- helpers -------------------------------- */

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const fmtReviews = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `${n}`;

const fmtDistance = (m: number) =>
  m < 914 ? `${Math.round(m * 3.28084)} ft` : `${(m / 1609.34).toFixed(1)} mi`;

const fmtDuration = (s: number) => {
  const min = Math.round(s / 60);
  if (min < 60) return `${Math.max(1, min)} min`;
  return `${Math.floor(min / 60)} hr ${min % 60} min`;
};

const haversine = (a: [number, number], b: [number, number]) => {
  const R = 6371000;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const la1 = (a[0] * Math.PI) / 180;
  const la2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/* ------------------------------ custom pin CSS ----------------------------- */

const PIN_CSS = `
.atlas-pin { filter: drop-shadow(0 3px 4px rgba(0,0,0,.45)); transition: transform .18s ease; }
.atlas-pin svg { display: block; }
.atlas-pin:hover { transform: scale(1.12); transform-origin: 50% 100%; }
.atlas-pin-selected svg { animation: atlas-pin-drop .38s cubic-bezier(.2,.9,.3,1.4); }
.atlas-pin-selected { transform: scale(1.22); transform-origin: 50% 100%; z-index: 900 !important; }
@keyframes atlas-pin-drop {
  0% { transform: translateY(-26px) scale(1.22); opacity: 0; }
  100% { transform: translateY(0) scale(1.22); opacity: 1; }
}
.atlas-user-dot { position: relative; width: 18px; height: 18px; }
.atlas-user-dot i {
  position: absolute; inset: 0; border-radius: 9999px; background: #4285f4;
  border: 3px solid #dfeaff; box-shadow: 0 0 6px rgba(66,133,244,.8);
}
.atlas-user-dot span {
  position: absolute; inset: -7px; border-radius: 9999px;
  background: rgba(66,133,244,.35); animation: atlas-pulse 2.2s ease-out infinite;
}
@keyframes atlas-pulse {
  0% { transform: scale(.4); opacity: .9; }
  80% { transform: scale(1.5); opacity: 0; }
  100% { transform: scale(1.5); opacity: 0; }
}
.leaflet-container { background: #e9e6df; font-family: inherit; }
.leaflet-control-attribution {
  background: rgba(18,20,24,.85) !important; color: #9aa0a6 !important;
  font-size: 10px !important; border-radius: 6px 0 0 0; padding: 2px 6px;
  backdrop-filter: blur(4px);
}
.leaflet-control-attribution a { color: #8ab4f8 !important; }
.leaflet-tooltip.atlas-tip {
  background: #26282d; color: #e8eaed; border: 1px solid rgba(255,255,255,.12);
  box-shadow: 0 4px 14px rgba(0,0,0,.5); font-size: 12px; padding: 4px 8px;
  border-radius: 6px;
}
.leaflet-tooltip.atlas-tip::before { border-top-color: rgba(255,255,255,.12); }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { scrollbar-width: none; }
.thin-scroll::-webkit-scrollbar { width: 6px; }
.thin-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.14); border-radius: 9999px; }
.thin-scroll::-webkit-scrollbar-track { background: transparent; }
.atlas-step-flash { animation: atlas-flash 1.15s ease-out 2; }
@keyframes atlas-flash {
  0% { opacity: .85; }
  100% { opacity: .08; }
}
.leaflet-control-scale-line {
  background: rgba(18,20,24,.72); color: #e8eaed;
  border-color: rgba(255,255,255,.4) !important; border-radius: 3px;
  font-size: 10px; font-family: inherit; backdrop-filter: blur(4px);
}
@media (min-width: 640px) { .leaflet-bottom.leaflet-left { left: 404px; } }
@media (max-width: 639px) { .leaflet-control-scale { display: none; } }
/* ---- light ui (basemaps other than night) ---- */
.gm-light .bg-\\[\\#0e1013\\]{ background:#e9e6df }
.gm-light .bg-\\[\\#1b1d21\\]\\/95{ background:rgba(255,255,255,.97) }
.gm-light .bg-\\[\\#1b1d21\\]\\/98{ background:rgba(255,255,255,.98) }
.gm-light .bg-\\[\\#202124\\]\\/95{ background:rgba(255,255,255,.97) }
.gm-light .bg-\\[\\#202124\\]\\/97{ background:rgba(255,255,255,.98) }
.gm-light .bg-\\[\\#24272c\\]\\/95{ background:rgba(255,255,255,.96) }
.gm-light .bg-\\[\\#303134\\]{ background:#e8eaed }
.gm-light .bg-\\[\\#5f6368\\]{ background:#dadce0 }
.gm-light .bg-\\[\\#8ab4f8\\]\\/15{ background:rgba(26,115,232,.08) }
.gm-light .bg-\\[\\#9aa0a6\\]{ background:#dadce0 }
.gm-light .bg-\\[\\#9aa0a6\\]\\/15{ background:rgba(0,0,0,.06) }
.gm-light .bg-\\[\\#a8c7fa\\]{ background:#d2e3fc }
.gm-light .bg-\\[\\#a8c7fa\\]\\/40{ background:rgba(210,227,252,.6) }
.gm-light .border-\\[\\#4285f4\\]{ border-color:#1a73e8 }
.gm-light .border-\\[\\#5f6368\\]{ border-color:#dadce0 }
.gm-light .border-\\[\\#a8c7fa\\]{ border-color:#1a73e8 }
.gm-light .hover\\:bg-\\[\\#2a2d31\\]:hover{ background:#f1f3f4 }
.gm-light .hover\\:bg-\\[\\#2e3238\\]:hover{ background:#f1f3f4 }
.gm-light .hover\\:bg-\\[\\#a8c7fa\\]\\/10:hover{ background:rgba(26,115,232,.08) }
.gm-light .hover\\:border-\\[\\#8ab4f8\\]:hover{ border-color:#1a73e8 }
.gm-light .hover\\:text-\\[\\#8ab4f8\\]:hover{ color:#1a73e8 }
.gm-light .hover\\:text-\\[\\#e8eaed\\]:hover{ color:#202124 }
.gm-light .placeholder\\:text-\\[\\#9aa0a6\\]::placeholder{ color:#5f6368 }
.gm-light .text-\\[\\#062e6f\\]{ color:#174ea6 }
.gm-light .text-\\[\\#5f6368\\]{ color:#5f6368 }
.gm-light .text-\\[\\#81c995\\]{ color:#188038 }
.gm-light .text-\\[\\#8ab4f8\\]{ color:#1a73e8 }
.gm-light .text-\\[\\#9aa0a6\\]{ color:#5f6368 }
.gm-light .text-\\[\\#a8c7fa\\]{ color:#1a73e8 }
.gm-light .text-\\[\\#e8eaed\\]{ color:#202124 }
.gm-light .text-\\[\\#f28b82\\]{ color:#c5221e }
.gm-light .text-\\[\\#fdd663\\]{ color:#b26a00 }
.gm-light .leaflet-control-attribution { background: rgba(255,255,255,.85) !important; color: #5f6368 !important; }
.gm-light .leaflet-control-attribution a { color: #1a73e8 !important; }
.gm-light .leaflet-tooltip.atlas-tip { background: #fff; color: #202124; border-color: rgba(0,0,0,.12); box-shadow: 0 4px 14px rgba(60,64,67,.25); }
.gm-light .leaflet-tooltip.atlas-tip::before { border-top-color: rgba(0,0,0,.12); }
.gm-light .thin-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,.2); }
.gm-light .leaflet-control-scale-line { background: rgba(255,255,255,.8); color: #202124; border-color: rgba(0,0,0,.45) !important; }
.gm-light .shadow-\\[0_2px_10px_rgba\\(0\\,0\\,0\\,\\.18\\)\\]{ box-shadow:0 1px 2px rgba(60,64,67,.2),0 2px 6px rgba(60,64,67,.12) }
.gm-light .shadow-\\[0_4px_16px_rgba\\(0\\,0\\,0\\,\\.55\\)\\]{ box-shadow:0 1px 2px rgba(60,64,67,.3),0 2px 6px 2px rgba(60,64,67,.15) }
.gm-light .shadow-\\[0_12px_40px_rgba\\(0\\,0\\,0\\,\\.6\\)\\]{ box-shadow:0 1px 3px rgba(60,64,67,.3),0 4px 8px 3px rgba(60,64,67,.15) }
.gm-light .shadow-\\[0_12px_40px_rgba\\(0\\,0\\,0\\,\\.65\\)\\]{ box-shadow:0 1px 3px rgba(60,64,67,.3),0 4px 8px 3px rgba(60,64,67,.15) }
.gm-light .shadow-\\[0_-12px_40px_rgba\\(0\\,0\\,0\\,\\.6\\)\\]{ box-shadow:0 -4px 16px rgba(60,64,67,.15) }
.gm-light .bg-white\\/5{ background:rgba(0,0,0,.05) }
.gm-light .bg-white\\/10{ background:rgba(0,0,0,.07) }
.gm-light .bg-white\\/\\[\\.03\\]{ background:rgba(0,0,0,.03) }
.gm-light .bg-white\\/\\[\\.04\\]{ background:rgba(0,0,0,.04) }
.gm-light .bg-white\\/\\[\\.05\\]{ background:rgba(0,0,0,.05) }
.gm-light .bg-white\\/\\[\\.06\\]{ background:rgba(0,0,0,.06) }
.gm-light .bg-white\\/\\[\\.07\\]{ background:rgba(0,0,0,.07) }
.gm-light .bg-white\\/\\[\\.08\\]{ background:rgba(0,0,0,.08) }
.gm-light .border-white\\/10{ border-color:rgba(0,0,0,.1) }
.gm-light .border-white\\/15{ border-color:rgba(0,0,0,.12) }
.gm-light .border-white\\/20{ border-color:rgba(0,0,0,.15) }
.gm-light .border-white\\/\\[\\.05\\]{ border-color:rgba(0,0,0,.06) }
.gm-light .border-white\\/\\[\\.07\\]{ border-color:rgba(0,0,0,.08) }
.gm-light .border-white\\/\\[\\.08\\]{ border-color:rgba(0,0,0,.09) }
.gm-light .hover\\:bg-white\\/5:hover{ background:rgba(0,0,0,.05) }
.gm-light .hover\\:bg-white\\/\\[\\.05\\]:hover{ background:rgba(0,0,0,.05) }
.gm-light .hover\\:bg-white\\/\\[\\.08\\]:hover{ background:rgba(0,0,0,.08) }
.gm-light .hover\\:border-white\\/20:hover{ border-color:rgba(0,0,0,.15) }
`;

/* --------------------------------- pin html -------------------------------- */

function pinSvg(color: string, size = 30) {
  return `<svg width="${size}" height="${(size * 42) / 30}" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
  <path d="M15 1C7.3 1 1 7.3 1 15c0 9.6 12.5 23.7 13.4 24.7.3.4.9.4 1.2 0C16.5 38.7 29 24.6 29 15 29 7.3 22.7 1 15 1z" fill="${color}" stroke="rgba(255,255,255,.92)" stroke-width="1.6"/>
  <circle cx="15" cy="15" r="5.6" fill="rgba(255,255,255,.95)"/>
</svg>`;
}

/* --------------------------------- styles ---------------------------------- */

const BTN =
  "flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#24272c]/95 text-[#e8eaed] shadow-[0_4px_16px_rgba(0,0,0,.55)] backdrop-blur transition hover:bg-[#2e3238] active:scale-95";
const CARD = "rounded-2xl border border-white/10 bg-[#1b1d21]/95 shadow-[0_12px_40px_rgba(0,0,0,.6)] backdrop-blur";
const SEARCH_CARD =
  "rounded-2xl border border-white/10 bg-[#1b1d21]/95 shadow-[0_2px_10px_rgba(0,0,0,.18)] backdrop-blur";
const CHIP = (active: boolean) =>
  `flex h-9 flex-shrink-0 items-center gap-1.5 rounded-full border px-4 text-[13px] transition ${
    active
      ? "border-transparent bg-[#a8c7fa] font-medium text-[#062e6f] shadow"
      : "border-white/10 bg-[#202124]/95 text-[#e8eaed] hover:bg-[#2a2d31]"
  }`;
const ACTION =
  "flex h-9 items-center justify-center gap-2 rounded-full border border-[#5f6368] px-4 text-[13px] font-medium text-[#a8c7fa] transition hover:border-[#8ab4f8] hover:bg-[#a8c7fa]/10";

function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  const pct = clamp((rating / 5) * 100, 0, 100);
  const row = (filled: boolean) => (
    <div className="flex gap-px">
      {[0, 1, 2, 3, 4].map((i) =>
        filled ? (
          <IconStarFilled key={i} size={size} className="flex-shrink-0 text-[#fbbc04]" />
        ) : (
          <IconStar key={i} size={size} className="flex-shrink-0 text-[#5f6368]" />
        )
      )}
    </div>
  );
  return (
    <div className="relative inline-block">
      {row(false)}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        {row(true)}
      </div>
    </div>
  );
}

function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      aria-label="toggle labels"
      className={`relative h-5 w-9 flex-shrink-0 rounded-full border transition ${
        on ? "border-[#a8c7fa] bg-[#a8c7fa]/40" : "border-[#5f6368] bg-[#303134]"
      }`}
    >
      <span
        className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full transition-all ${
          on ? "left-[18px] bg-[#a8c7fa]" : "left-[2px] bg-[#9aa0a6]"
        }`}
      />
    </button>
  );
}

/* ------------------------------- place photos ------------------------------ */

const wikiPhotoCache = new Map<string, Promise<string | null>>();

function fetchWikiPhoto(title: string, query: string): Promise<string | null> {
  const key = title || query;
  const hit = wikiPhotoCache.get(key);
  if (hit) return hit;
  const p = (async () => {
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
      );
      if (res.ok) {
        const d = (await res.json()) as {
          thumbnail?: { source?: string };
          originalimage?: { source?: string; width?: number };
        };
        if (d.thumbnail?.source) {
          const t = d.thumbnail.source;
          // Wikimedia only serves whitelisted thumb widths (330/500/960/1280...)
          // - arbitrary sizes return a 400 HTML page
          if (d.originalimage?.width && d.originalimage.width > 960) {
            return t.replace(/\/\d+px-/, "/960px-");
          }
          return t;
        }
      }
    } catch {
      /* fall through to commons search */
    }
    try {
      const res = await fetch(
        `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=960`
      );
      if (res.ok) {
        const d = (await res.json()) as {
          query?: { pages?: Record<string, { imageinfo?: { thumburl?: string }[] }> };
        };
        for (const pg of Object.values(d.query?.pages ?? {})) {
          const u = pg.imageinfo?.[0]?.thumburl;
          if (u) return u;
        }
      }
    } catch {
      /* offline - gradient fallback */
    }
    return null;
  })();
  wikiPhotoCache.set(key, p);
  return p;
}

function PlacePhoto({ place }: { place: Place }) {
  const [src, setSrc] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);
  useEffect(() => {
    let dead = false;
    setSrc(null);
    setBroken(false);
    if (place.wiki) {
      fetchWikiPhoto(place.wiki, `${place.name} San Francisco`).then((u) => {
        if (!dead && u) setSrc(u);
      });
    }
    return () => {
      dead = true;
    };
  }, [place.wiki, place.name]);
  return (
    <div
      className="relative flex h-36 w-full flex-shrink-0 items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${CAT_META[place.category].color}55, #26282d)`,
      }}
    >
      {src && !broken ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={place.name}
            className="h-full w-full object-cover"
            onError={() => setBroken(true)}
          />
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/50 px-1.5 py-0.5 text-[9px] text-white/85">
            Photo © Wikimedia
          </span>
        </>
      ) : (
        <span style={{ color: `${CAT_META[place.category].color}aa` }}>
          {catIcon(place.category, 44)}
        </span>
      )}
    </div>
  );
}

/* ----------------------------------- page ---------------------------------- */

export default function Day20Map() {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const LRef = useRef<typeof import("leaflet") | null>(null);
  const tileRef = useRef<LeafletTileLayer | null>(null);
  const labelRef = useRef<LeafletTileLayer | null>(null);
  const routeGroupRef = useRef<LayerGroup | null>(null);
  const placeMarkersRef = useRef<Map<string, Marker>>(new Map());
  const userMarkerRef = useRef<Marker | null>(null);
  const pinMarkerRef = useRef<Marker | null>(null);
  const stepMarkerRef = useRef<{ remove: () => void } | null>(null);
  const remoteMarkerRef = useRef<Marker | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const handlersRef = useRef<{
    selectPlace: (p: Place) => void;
    dropPin: (lat: number, lng: number) => void;
  }>({
    selectPlace: () => {},
    dropPin: () => {},
  });

  const [selected, setSelected] = useState<Place | null>(null);
  const [pin, setPin] = useState<{ lat: number; lng: number; label: string; loading: boolean } | null>(null);
  const [mode, setMode] = useState<"explore" | "directions">("explore");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hiIdx, setHiIdx] = useState(0);
  const [remoteResults, setRemoteResults] = useState<
    { id: string; name: string; detail: string; lat: number; lng: number }[]
  >([]);
  const [nearby, setNearby] = useState<string | null>(null);
  const [layer, setLayer] = useState<
    "default" | "night" | "satellite" | "terrain"
  >("default");
  const [labels, setLabels] = useState(true);
  const [layersOpen, setLayersOpen] = useState(false);
  const [saved, setSaved] = useState<string[]>(["ggb", "tartine"]);
  const [recents, setRecents] = useState<string[]>([]);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [dirMode, setDirMode] = useState<DirMode>("drive");
  const [dirDest, setDirDest] = useState<Dest | null>(null);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; msg: string; icon: "ok" | "warn" | "save" }[]>([]);
  const [sheetExpanded, setSheetExpanded] = useState(true);
  const [panelClosed, setPanelClosed] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const sheetControls = useDragControls();
  const justDraggedRef = useRef(false);

  /* keep the global site nav in sync with the basemap theme (light unless night) */
  const { setDark } = useDarkMode();
  useEffect(() => {
    setDark(layer === "night");
    return () => setDark(false);
  }, [layer, setDark]);

  const placeById = useCallback(
    (id: string) => PLACES.find((p) => p.id === id) ?? null,
    []
  );

  /* ------------------------------ local search ----------------------------- */

  const localResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const score = (p: Place) => {
      const n = p.name.toLowerCase();
      const c = p.category.toLowerCase();
      if (n.startsWith(q)) return 0;
      if (n.includes(q)) return 1;
      if (c.includes(q) || p.tags.some((t) => t.includes(q))) return 2;
      return -1;
    };
    return PLACES.map((p) => ({ p, s: score(p) }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => a.s - b.s || b.p.rating - a.p.rating)
      .slice(0, 4)
      .map((r) => r.p);
  }, [query]);

  const dropdownItems = useMemo(
    () => [
      ...localResults,
      ...remoteResults.slice(0, 3).map((r) => ({
        id: r.id,
        name: r.name,
        category: "Place" as Category,
        rating: 0,
        reviews: 0,
        lat: r.lat,
        lng: r.lng,
        address: r.detail,
        phone: "",
        hours: "",
        open: true,
        blurb: r.detail,
        tags: [],
        remote: true,
      })),
    ],
    [localResults, remoteResults]
  );

  /* --------------------------------- toasts -------------------------------- */

  const toast = useCallback((msg: string, icon: "ok" | "warn" | "save" = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, msg, icon }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  /* --------------------------- persisted preferences ------------------------ */

  useEffect(() => {
    try {
      const l = window.localStorage.getItem("atlas-layer");
      if (l === "night" || l === "satellite" || l === "terrain") setLayer(l);
      const sv = JSON.parse(window.localStorage.getItem("atlas-saved") ?? "null");
      if (Array.isArray(sv)) {
        setSaved(sv.filter((x): x is string => typeof x === "string" && !!placeById(x)));
      }
    } catch {
      /* private mode etc. */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem("atlas-layer", layer); } catch { /* ignore */ }
  }, [layer]);

  useEffect(() => {
    try { window.localStorage.setItem("atlas-saved", JSON.stringify(saved)); } catch { /* ignore */ }
  }, [saved]);

  /* ------------------------------- map effects ----------------------------- */

  useEffect(() => {
    let disposed = false;
    let map: LeafletMap | null = null;
    (async () => {
      const L = await import("leaflet");
      if (disposed || !mapElRef.current) return;
      LRef.current = L;
      map = L.map(mapElRef.current, {
        zoomControl: false,
        minZoom: 3,
        maxZoom: 18,
        zoomSnap: 0.5,
        wheelPxPerZoomLevel: 90,
      }).setView([37.787, -122.44], 12.5);

      tileRef.current = L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          maxNativeZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }
      ).addTo(map);

      routeGroupRef.current = L.layerGroup().addTo(map);

      L.control.scale({
        position: "bottomleft",
        imperial: true,
        metric: false,
        maxWidth: 120,
      }).addTo(map);

      PLACES.forEach((p) => {
        const icon = L.divIcon({
          className: `atlas-pin ${selected?.id === p.id ? "atlas-pin-selected" : ""}`,
          html: pinSvg(CAT_META[p.category].color),
          iconSize: [30, 42],
          iconAnchor: [15, 40],
        });
        const m = L.marker([p.lat, p.lng], { icon, riseOnHover: true });
        m.bindTooltip(p.name, {
          direction: "top",
          offset: [0, -34],
          className: "atlas-tip",
        });
        m.on("click", () => handlersRef.current.selectPlace(p));
        m.addTo(map!);
        placeMarkersRef.current.set(p.id, m);
      });

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        handlersRef.current.dropPin(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
      window.setTimeout(() => map?.invalidateSize(), 250);
    })();
    return () => {
      disposed = true;
      map?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* tile layer switching */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    (async () => {
      const L = await import("leaflet");
      if (tileRef.current) {
        map.removeLayer(tileRef.current);
        tileRef.current = null;
      }
      if (labelRef.current) {
        map.removeLayer(labelRef.current);
        labelRef.current = null;
      }
      const conf = {
        default: {
          url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          sub: undefined as string | undefined,
          native: 19,
        },
        night: {
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
          attr: "Tiles &copy; Esri - Esri, DeLorme, NAVTEQ",
          sub: undefined as string | undefined,
          native: 16,
        },
        satellite: {
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          attr: "Tiles &copy; Esri - Source: Esri, Maxar, Earthstar Geographics",
          sub: undefined as string | undefined,
          native: 19,
        },
        terrain: {
          url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
          attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, SRTM | &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
          sub: "abc" as unknown as string,
          native: 17,
        },
      }[layer];
      tileRef.current = L.tileLayer(conf.url, {
        maxZoom: 19,
        maxNativeZoom: conf.native,
        attribution: conf.attr,
        subdomains: conf.sub ?? "abc",
      }).addTo(map);
      if (layer === "night") {
        labelRef.current = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
          { maxZoom: 19, maxNativeZoom: 16, attribution: "" }
        ).addTo(map);
      } else if (layer === "satellite" && labels) {
        labelRef.current = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
          { maxZoom: 19, maxNativeZoom: 19, attribution: "" }
        ).addTo(map);
      }
    })();
  }, [layer, labels]);

  /* marker visibility + selection icon */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    placeMarkersRef.current.forEach((m, id) => {
      const visible =
        !nearby ||
        !!GROUPS.find((g) => g.id === nearby)?.cats.includes(
          placeById(id)?.category ?? "Place"
        );
      if (visible && !map.hasLayer(m)) m.addTo(map);
      if (!visible && map.hasLayer(m)) map.removeLayer(m);
      if (visible) {
        const p = placeById(id)!;
        const isSel = selected?.id === id;
        m.setIcon(
          LRef.current!.divIcon({
            className: `atlas-pin ${isSel ? "atlas-pin-selected" : ""}`,
            html: pinSvg(CAT_META[p.category].color),
            iconSize: [30, 42],
            iconAnchor: [15, 40],
          })
        );
      }
    });
  }, [nearby, selected, placeById]);

  /* user location marker */
  useEffect(() => {
    if (!mapRef.current || !userLoc) return;
    (async () => {
      const L = await import("leaflet");
      const icon = L.divIcon({
        className: "",
        html: `<div class="atlas-user-dot"><span></span><i></i></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLoc.lat, userLoc.lng]).setIcon(icon);
      } else {
        userMarkerRef.current = L.marker([userLoc.lat, userLoc.lng], {
          icon,
          interactive: false,
          zIndexOffset: 500,
        }).addTo(mapRef.current!);
      }
    })();
  }, [userLoc]);

  /* dropped pin marker */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    (async () => {
      const L = await import("leaflet");
      if (!pin) {
        if (pinMarkerRef.current && map.hasLayer(pinMarkerRef.current)) {
          map.removeLayer(pinMarkerRef.current);
        }
        pinMarkerRef.current = null;
        return;
      }
      const icon = L.divIcon({
        className: "atlas-pin atlas-pin-selected",
        html: pinSvg("#9aa0a6"),
        iconSize: [30, 42],
        iconAnchor: [15, 40],
      });
      if (pinMarkerRef.current) {
        pinMarkerRef.current.setLatLng([pin.lat, pin.lng]).setIcon(icon);
      } else {
        pinMarkerRef.current = L.marker([pin.lat, pin.lng], { icon }).addTo(map);
      }
    })();
  }, [pin]);

  /* route drawing */
  useEffect(() => {
    const map = mapRef.current;
    const group = routeGroupRef.current;
    if (!map || !group) return;
    (async () => {
      const L = await import("leaflet");
      group.clearLayers();
      if (stepMarkerRef.current) {
        stepMarkerRef.current.remove();
        stepMarkerRef.current = null;
      }
      if (!route || route.coords.length < 2) return;
      const style =
        dirMode === "walk"
          ? { color: "#4285f4", weight: 5, dashArray: "2 9", lineCap: "round" as const }
          : dirMode === "bike"
          ? { color: "#34a853", weight: 5, dashArray: "10 7" }
          : dirMode === "transit"
          ? { color: "#8ab4f8", weight: 5, dashArray: "1 10", lineCap: "round" as const }
          : { color: "#4285f4", weight: 6, opacity: 0.95 };
      const line = L.polyline(route.coords, style);
      L.polyline(route.coords, {
        color: "#ffffff",
        weight: style.weight + 3,
        opacity: 0.7,
        lineCap: "round" as const,
      }).addTo(group);
      line.addTo(group);
      L.circleMarker(route.coords[0], {
        radius: 7, color: "#4285f4", weight: 3, fillColor: "#dfeaff", fillOpacity: 1,
      }).addTo(group);
      const last = route.coords[route.coords.length - 1];
      L.marker(last, {
        icon: L.divIcon({
          className: "atlas-pin atlas-pin-selected",
          html: pinSvg(dirMode === "bike" ? "#34a853" : "#ea4335"),
          iconSize: [30, 42],
          iconAnchor: [15, 40],
        }),
        interactive: false,
      }).addTo(group);
      const isMobile = window.innerWidth < 768;
      map.fitBounds(line.getBounds(), isMobile
        ? { paddingTopLeft: [30, 90], paddingBottomRight: [30, 300] }
        : { paddingTopLeft: [450, 100], paddingBottomRight: [80, 90] });
    })();
  }, [route, dirMode]);

  /* ------------------------------ search logic ----------------------------- */

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3 || submitted) {
      setRemoteResults([]);
      return;
    }
    const ctrl = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=3&q=${encodeURIComponent(q)}`,
          { signal: ctrl.signal, headers: { Accept: "application/json" } }
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          osm_id: number; display_name: string; lat: string; lon: string;
        }[];
        const items = data.map((d) => {
          const parts = d.display_name.split(", ");
          return {
            id: `osm-${d.osm_id}`,
            name: parts[0],
            detail: parts.slice(1).join(", "),
            lat: +d.lat,
            lng: +d.lon,
          };
        });
        setRemoteResults(items);
      } catch {
        /* ignore */
      }
    }, 380);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [query, submitted]);

  const doGlobalSearch = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    setSubmitted(true);
    setSearchOpen(false);
    setNearby(null);
    setHiIdx(0);
    setPanelClosed(false);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(q)}`
      );
      const data = (await res.json()) as {
        osm_id: number; display_name: string; lat: string; lon: string;
      }[];
      setRemoteResults(
        data.map((d) => {
          const parts = d.display_name.split(", ");
          return {
            id: `osm-${d.osm_id}`,
            name: parts[0],
            detail: parts.slice(1).join(", "),
            lat: +d.lat,
            lng: +d.lon,
          };
        })
      );
      if (!data.length && !localResults.length) toast(`No results for "${q}"`, "warn");
    } catch {
      if (!localResults.length) toast("Search is offline - try a nearby place", "warn");
    }
  }, [query, localResults.length, toast]);

  /* ------------------------------ place actions ---------------------------- */

  const flyTo = useCallback((lat: number, lng: number, zoom = 16) => {
    const map = mapRef.current;
    if (!map) return;
    const isMobile = window.innerWidth < 768;
    map.flyTo([lat + (isMobile ? 0.0018 : 0), lng], zoom, { duration: 0.9 });
  }, []);

  const selectPlace = useCallback(
    (p: Place) => {
      setPanelClosed(false);
      setSelected(p);
      setPin(null);
      setSearchOpen(false);
      setQuery("");
      setRemoteResults([]);
      setNearby(null);
      setSheetExpanded(true);
      setMode("explore");
      setRecents((r) => [p.id, ...r.filter((x) => x !== p.id)].slice(0, 6));
      flyTo(p.lat, p.lng, 16);
    },
    [flyTo]
  );

  const selectRemote = useCallback(
    (r: { id: string; name: string; detail: string; lat: number; lng: number }) => {
      setPanelClosed(false);
      const pseudo: Place = {
        id: r.id,
        name: r.name,
        category: "Place",
        rating: 0,
        reviews: 0,
        lat: r.lat,
        lng: r.lng,
        address: r.detail || r.name,
        phone: "",
        hours: "",
        open: true,
        blurb: r.detail || "An OpenStreetMap place found via search.",
        tags: [],
        remote: true,
      };
      (async () => {
        const L = await import("leaflet");
        const map = mapRef.current;
        if (!map) return;
        if (remoteMarkerRef.current) map.removeLayer(remoteMarkerRef.current);
        remoteMarkerRef.current = L.marker([r.lat, r.lng], {
          icon: L.divIcon({
            className: "atlas-pin atlas-pin-selected",
            html: pinSvg("#8ab4f8"),
            iconSize: [30, 42],
            iconAnchor: [15, 40],
          }),
        }).addTo(map);
      })();
      setSelected(pseudo);
      setPin(null);
      setSearchOpen(false);
      setQuery("");
      setSubmitted(false);
      setSheetExpanded(true);
      flyTo(r.lat, r.lng, 15);
    },
    [flyTo]
  );

  const dropPin = useCallback(
    (lat: number, lng: number) => {
      setSelected(null);
      setSubmitted(false);
      setQuery("");
      setSearchOpen(false);
      setRemoteResults([]);
      setNearby(null);
      setMode("explore");
      setSheetExpanded(true);
      setPanelClosed(false);
      setPin({ lat, lng, label: "Dropped pin", loading: true });
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      )
        .then((r) => r.json())
        .then((d: { display_name?: string }) => {
          setPin((p) =>
            p && p.lat === lat && p.lng === lng
              ? { ...p, label: d.display_name ?? "Dropped pin", loading: false }
              : p
          );
        })
        .catch(() => {
          setPin((p) => (p ? { ...p, loading: false } : p));
        });
    },
    []
  );

  handlersRef.current = { selectPlace, dropPin };

  const startDirections = useCallback(
    (dest: Dest) => {
      setPanelClosed(false);
      setMode("directions");
      setDirDest(dest);
      setSelected(null);
      setPin(null);
      setLayersOpen(false);
      setSearchOpen(false);
    },
    []
  );

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      toast("Geolocation not available in this browser", "warn");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLoc(loc);
        flyTo(loc.lat, loc.lng, 14);
        toast("Showing your location", "ok");
      },
      () => toast("Location permission denied - using San Francisco", "warn"),
      { timeout: 8000 }
    );
  }, [flyTo, toast]);

  const toggleSave = useCallback(
    (p: Place) => {
      setSaved((s) => {
        const has = s.includes(p.id);
        toast(
          has ? `Removed ${p.name} from Favorites` : `Saved ${p.name} to Favorites`,
          "save"
        );
        return has ? s.filter((x) => x !== p.id) : [p.id, ...s];
      });
    },
    [toast]
  );

  const copyText = useCallback(
    (text: string, label: string) => {
      navigator.clipboard?.writeText(text).then(
        () => toast(`${label} copied to clipboard`, "ok"),
        () => toast("Could not copy", "warn")
      );
    },
    [toast]
  );

  const escapePanel = useCallback(() => {
    if (searchOpen) {
      setSearchOpen(false);
      return;
    }
    const wasPlainExplore =
      mode === "explore" && !selected && !pin && !nearby && !submitted;
    setMode("explore");
    setSelected(null);
    setPin(null);
    setDirDest(null);
    setNearby(null);
    setSubmitted(false);
    setRemoteResults([]);
    if (wasPlainExplore) setPanelClosed(true);
  }, [searchOpen, mode, selected, pin, nearby, submitted]);

  /* mobile sheet drag: pull down to collapse, pull again to close, flick up to open */
  const onSheetDragEnd = useCallback(
    (_e: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
      const y = info.offset.y;
      const vy = info.velocity.y;
      if (Math.abs(y) > 18) {
        justDraggedRef.current = true;
        window.setTimeout(() => {
          justDraggedRef.current = false;
        }, 300);
      }
      if (sheetExpanded) {
        if (y > 120 || vy > 700) setSheetExpanded(false);
      } else if (y > 80 || vy > 700) {
        escapePanel();
      } else if (y < -50 || vy < -600) {
        setSheetExpanded(true);
      }
    },
    [sheetExpanded, escapePanel]
  );

  const sheetTapToggle = () => {
    if (justDraggedRef.current) {
      justDraggedRef.current = false;
      return;
    }
    setSheetExpanded((v) => !v);
  };

  const sheetTapExpand = () => {
    if (justDraggedRef.current) {
      justDraggedRef.current = false;
      return;
    }
    setSheetExpanded(true);
  };

  /* keyboard shortcuts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape" && tag !== "INPUT") escapePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [escapePanel]);

  /* ------------------------------- directions ------------------------------ */

  useEffect(() => {
    if (mode !== "directions" || !dirDest) {
      setRoute(null);
      return;
    }
    const origin = userLoc
      ? ([userLoc.lat, userLoc.lng] as [number, number])
      : DEFAULT_ORIGIN;
    let dead = false;
    const ctrl = new AbortController();
    const timeout = window.setTimeout(() => ctrl.abort(), 9000);
    setRouteLoading(true);
    const profileUrl =
      dirMode === "walk"
        ? "https://routing.openstreetmap.de/routed-foot/route/v1/foot"
        : dirMode === "bike"
        ? "https://routing.openstreetmap.de/routed-bike/route/v1/bike"
        : "https://router.project-osrm.org/route/v1/driving";
    const line = `${origin[1]},${origin[0]};${dirDest.lng},${dirDest.lat}?overview=full&geometries=geojson&steps=true`;
    const attempt = (base: string) =>
      fetch(`${base}/${line}`, { signal: ctrl.signal }).then((r) => r.json());
    attempt(profileUrl)
      .catch(() =>
        dirMode === "walk" || dirMode === "bike"
          ? attempt("https://router.project-osrm.org/route/v1/driving")
          : Promise.reject(new Error("no route"))
      )
      .then((data: {
        code?: string;
        routes?: {
          distance: number;
          duration: number;
          geometry: { coordinates: [number, number][] };
          legs?: {
            steps?: {
              maneuver?: { type?: string; modifier?: string; location?: number[] };
              name?: string;
              distance: number;
            }[];
          }[];
        }[];
      }) => {
        if (dead) return;
        const r0 = data.routes?.[0];
        if (data.code !== "Ok" || !r0) throw new Error("no route");
        const raw = r0.legs?.[0]?.steps ?? [];
        const locOf = (st: { maneuver?: { location?: number[] } }) => {
          const l = st.maneuver?.location;
          return l ? ([l[1], l[0]] as [number, number]) : undefined;
        };
        const steps: RouteStep[] = [];
        let longest = "";
        let longestLen = 0;
        raw.forEach((s) => {
          const t = s.maneuver?.type ?? "";
          const mod = s.maneuver?.modifier ?? "";
          const name = s.name || "";
          if (t === "arrive") {
            steps.push({ text: "Arrive at your destination", dist: s.distance, icon: "arrive", loc: locOf(s) });
            return;
          }
          if (t === "depart") {
            steps.push({ text: name ? `Head out on ${name}` : "Start your route", dist: s.distance, icon: "depart", loc: locOf(s) });
            return;
          }
          const dir = mod.includes("left") ? "left" : mod.includes("right") ? "right" : "straight";
          let text = "";
          let icon = "straight";
          if (t === "turn") {
            text = `Turn ${dir}${name ? ` onto ${name}` : ""}`;
            icon = dir === "left" ? "left" : dir === "right" ? "right" : "straight";
          } else if (t === "new name" || t === "continue") {
            text = `Continue onto ${name || "the road"}`;
          } else if (t === "roundabout" || t === "rotary") {
            text = `Take the roundabout${name ? ` to ${name}` : ""}`;
            icon = "round";
          } else if (t === "fork") {
            text = `Keep ${dir} at the fork${name ? ` onto ${name}` : ""}`;
            icon = "fork";
          } else if (t === "merge") {
            text = `Merge ${dir}${name ? ` onto ${name}` : ""}`;
          } else {
            text = `Continue ${dir === "straight" ? "" : dir + " "}${name || ""}`.trim() || "Continue";
          }
          if (name.length > longestLen) {
            longestLen = name.length;
            longest = name;
          }
          steps.push({ text, dist: s.distance, icon, loc: locOf(s) });
        });
        setActiveStep(null);
        setRoute({
          coords: r0.geometry.coordinates.map((c) => [c[1], c[0]] as [number, number]),
          distance: r0.distance,
          duration: r0.duration,
          steps: steps.length ? steps : [
            { text: "Head toward your destination", dist: r0.distance, icon: "depart" },
            { text: "Arrive at your destination", dist: 0, icon: "arrive" },
          ],
          via: longest,
          fallback: false,
          profile: dirMode,
        });
      })
      .catch(() => {
        if (dead) return;
        const d = haversine(origin, [dirDest.lat, dirDest.lng]);
        setActiveStep(null);
        setRoute({
          coords: [origin, [dirDest.lat, dirDest.lng]],
          distance: d,
          duration: (d / 1000 / 60) * 3600,
          steps: [
            { text: "Live routing unavailable - head toward the pin", dist: d / 2, icon: "depart" },
            { text: `Follow the route to ${dirDest.name}`, dist: d / 2, icon: "straight" },
            { text: "Arrive at your destination", dist: 0, icon: "arrive" },
          ],
          via: "straight line",
          fallback: true,
          profile: "offline",
        });
      })
      .finally(() => {
        if (!dead) setRouteLoading(false);
      });
    return () => {
      dead = true;
      ctrl.abort();
      window.clearTimeout(timeout);
    };
  }, [mode, dirDest, userLoc, dirMode]);

  const modeDuration = useCallback(
    (m: DirMode, r: RouteData) => {
      if (r.profile === "offline") {
        switch (m) {
          case "walk":
            return r.distance / 1.4;
          case "bike":
            return r.distance / 4.2;
          case "transit":
            return (r.distance / 1000 / 30) * 3600 + 420;
          default:
            return r.duration;
        }
      }
      if (r.profile === "drive") {
        if (m === "transit") return r.duration * 1.8 + 420;
        if (m === "walk") return r.distance / 1.4;
        if (m === "bike") return r.distance / 4.2;
      }
      return r.duration;
    },
    []
  );

  /* click a turn step to flash its spot on the map */
  const focusStep = useCallback((s: RouteStep) => {
    if (!s.loc) return;
    const map = mapRef.current;
    if (!map) return;
    setActiveStep(null);
    map.flyTo(s.loc, Math.max(map.getZoom(), 16), { duration: 0.7 });
    (async () => {
      const L = await import("leaflet");
      if (stepMarkerRef.current) {
        stepMarkerRef.current.remove();
        stepMarkerRef.current = null;
      }
      const flash = L.circleMarker(s.loc!, {
        radius: 13,
        color: "#4285f4",
        weight: 3,
        fillColor: "#4285f4",
        fillOpacity: 0.25,
        className: "atlas-step-flash",
      }).addTo(map!);
      stepMarkerRef.current = flash;
      window.setTimeout(() => {
        flash.remove();
        if (stepMarkerRef.current === flash) stepMarkerRef.current = null;
      }, 2500);
    })();
  }, []);

  /* ------------------------------- search bar ------------------------------ */

  const onSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchOpen(false);
      (e.target as HTMLInputElement).blur();
      return;
    }
    if (!searchOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHiIdx((i) => Math.min(i + 1, dropdownItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHiIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = dropdownItems[hiIdx];
      if (item) {
        if (item.remote) {
          const r = remoteResults.find((x) => x.id === item.id);
          if (r) selectRemote(r);
        } else {
          selectPlace(item as Place);
        }
      } else {
        void doGlobalSearch();
      }
    }
  };

  const searchBar = (
    <div className="relative z-30 w-full">
      <motion.div
        initial={{ y: -14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className={`${SEARCH_CARD} flex h-[52px] items-center gap-1 px-1.5`}
      >
        <button
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[#9aa0a6] transition hover:bg-white/5 hover:text-[#e8eaed]"
          title="Menu"
        >
          <IconDotsVertical size={20} />
        </button>
        <input
          ref={searchInputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchOpen(e.target.value.trim().length > 0);
            setSubmitted(false);
            setHiIdx(0);
          }}
          onFocus={() => setSearchOpen(query.trim().length > 0)}
          onKeyDown={onSearchKeyDown}
          placeholder="Search Atlas"
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-[#e8eaed] outline-none placeholder:text-[#9aa0a6]"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setSearchOpen(false);
              setSubmitted(false);
              setRemoteResults([]);
            }}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[#9aa0a6] hover:bg-white/5 hover:text-[#e8eaed]"
            title="Clear"
          >
            <IconX size={18} />
          </button>
        )}
        <div className="h-6 w-px flex-shrink-0 bg-white/10" />
        <button
          onClick={() => void doGlobalSearch()}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[#9aa0a6] transition hover:bg-white/5 hover:text-[#e8eaed]"
          title="Search"
        >
          <IconSearch size={19} />
        </button>
        <button
          onClick={() => {
            const dest = selected ?? (pin ? { name: pin.label.split(",")[0], lat: pin.lat, lng: pin.lng } : null);
            if (dest) startDirections({ name: dest.name, lat: dest.lat, lng: dest.lng });
            else toast("Pick a place or drop a pin first", "warn");
          }}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[#a8c7fa] transition hover:bg-[#a8c7fa]/10"
          title="Directions"
        >
          <IconRoute size={19} />
        </button>
      </motion.div>

      {/* dropdown */}
      <AnimatePresence>
        {searchOpen && !submitted && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            className={`${SEARCH_CARD} absolute inset-x-0 top-[60px] z-30 overflow-hidden py-1.5`}
          >
            {dropdownItems.length === 0 && (
              <div className="px-4 py-3 text-[13px] text-[#9aa0a6]">
                Type to search places - press Enter for worldwide search
              </div>
            )}
            {dropdownItems.map((r, i) => (
              <button
                key={r.id}
                onClick={() => {
                  if (r.remote) {
                    const rem = remoteResults.find((x) => x.id === r.id);
                    if (rem) selectRemote(rem);
                  } else selectPlace(r as Place);
                }}
                onMouseEnter={() => setHiIdx(i)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${
                  i === hiIdx ? "bg-white/[.07]" : ""
                }`}
              >
                <span
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: `${CAT_META[r.category].color}22`,
                    color: CAT_META[r.category].color,
                  }}
                >
                  {r.remote ? <IconGlobe size={16} /> : catIcon(r.category)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] text-[#e8eaed]">{r.name}</span>
                  <span className="block truncate text-[12px] text-[#9aa0a6]">
                    {r.remote
                      ? (r as { address: string }).address
                      : `${CAT_META[r.category].label} · ${r.address}`}
                  </span>
                </span>
              </button>
            ))}
            <div className="flex items-center justify-between px-4 pb-1 pt-1.5 text-[10px] text-[#5f6368]">
              <span>Enter for worldwide search</span>
              <span className="flex items-center gap-1">/ to focus · Esc to close</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  /* ------------------------------ panel content ---------------------------- */

  const nearbyPlaces = useMemo(() => {
    if (!nearby) return [];
    const g = GROUPS.find((x) => x.id === nearby);
    if (!g) return [];
    return PLACES.filter((p) => g.cats.includes(p.category)).sort(
      (a, b) => b.rating - a.rating
    );
  }, [nearby]);

  const originLabel = userLoc ? "Your location" : "Union Square (default)";
  const originCoords: [number, number] = userLoc
    ? [userLoc.lat, userLoc.lng]
    : DEFAULT_ORIGIN;

  const PlaceRow = ({ p, active }: { p: Place; active?: boolean }) => (
    <button
      onClick={() => selectPlace(p)}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
        active ? "bg-white/[.06]" : "hover:bg-white/[.05]"
      }`}
    >
      <span
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${CAT_META[p.category].color}1f`, color: CAT_META[p.category].color }}
      >
        {catIcon(p.category, 17)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-medium text-[#e8eaed]">{p.name}</span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-[#9aa0a6]">
          {p.rating > 0 && (
            <>
              <span className="text-[#e8eaed]">{p.rating.toFixed(1)}</span>
              <Stars rating={p.rating} size={11} />
              <span>({fmtReviews(p.reviews)})</span>
            </>
          )}
          <span className="truncate">{p.remote ? p.address : CAT_META[p.category].label}</span>
        </span>
      </span>
      <span className="flex-shrink-0 text-[11px] text-[#5f6368]">
        {fmtDistance(haversine(originCoords, [p.lat, p.lng]))}
      </span>
    </button>
  );

  const exploreContent = (
    <div className="thin-scroll flex-1 overflow-y-auto">
      <div className="border-b border-white/[.07] px-4 pb-4 pt-4">
        <p className="m-0 text-[11px] font-medium uppercase tracking-[.14em] text-[#9aa0a6]">
          Explore San Francisco
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                setNearby(g.id);
                setSheetExpanded(true);
              }}
              className="flex items-center gap-2.5 rounded-xl border border-white/[.08] bg-white/[.04] px-3 py-2.5 text-left text-[13px] text-[#e8eaed] transition hover:border-white/20 hover:bg-white/[.08]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#8ab4f8]/15 text-[#8ab4f8]">
                {catIcon(g.cats[0], 15)}
              </span>
              {g.label}
            </button>
          ))}
        </div>
      </div>
      {recents.length > 0 && (
        <div className="border-b border-white/[.07] py-2">
          <p className="m-0 px-4 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[.14em] text-[#9aa0a6]">
            Recently viewed
          </p>
          {recents.map((id) => {
            const p = placeById(id);
            return p ? <PlaceRow key={id} p={p} /> : null;
          })}
        </div>
      )}
      <div className="py-2">
        <p className="m-0 px-4 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[.14em] text-[#9aa0a6]">
          Favorites
        </p>
        {saved.length === 0 ? (
          <p className="px-4 py-2 text-[13px] text-[#5f6368]">
            Tap the save button on any place to add it here.
          </p>
        ) : (
          saved.map((id) => {
            const p = placeById(id);
            return p ? <PlaceRow key={id} p={p} /> : (
              <button
                key={id}
                onClick={() => setSaved((s) => s.filter((x) => x !== id))}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-[13px] text-[#9aa0a6] hover:bg-white/[.05]"
              >
                <IconMapPin size={16} className="text-[#5f6368]" />
                Saved place (cleared)
                <IconX size={14} className="ml-auto" />
              </button>
            );
          })
        )}
      </div>
      <div className="border-t border-white/[.07] px-4 py-3 text-[10px] leading-relaxed text-[#5f6368]">
        Atlas · basemaps &copy; OpenStreetMap contributors &amp; Esri · routes by OSRM ·
        geocoding by Nominatim. Click anywhere on the map to drop a pin.
      </div>
    </div>
  );

  const resultsContent = (
    <div className="thin-scroll flex-1 overflow-y-auto">
      <div className="border-b border-white/[.07] px-4 py-3">
        <p className="m-0 truncate text-[13px] text-[#9aa0a6]">
          Results for <span className="text-[#e8eaed]">“{query}”</span>
        </p>
      </div>
      {localResults.length === 0 && remoteResults.length === 0 && (
        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
          <IconSearch size={26} className="text-[#5f6368]" />
          <p className="m-0 text-[13px] text-[#9aa0a6]">
            Nothing matched locally.
            <br />
            Press Enter to search the whole planet.
          </p>
        </div>
      )}
      {localResults.map((p) => (
        <PlaceRow key={p.id} p={p} />
      ))}
      {remoteResults.map((r) => (
        <button
          key={r.id}
          onClick={() => selectRemote(r)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/[.05]"
        >
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#8ab4f8]/15 text-[#8ab4f8]">
            <IconGlobe size={17} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-medium text-[#e8eaed]">{r.name}</span>
            <span className="block truncate text-[12px] text-[#9aa0a6]">{r.detail}</span>
          </span>
          <span className="flex-shrink-0 text-[11px] text-[#5f6368]">
            {fmtDistance(haversine(originCoords, [r.lat, r.lng]))}
          </span>
        </button>
      ))}
    </div>
  );

  const placeContent = (p: Place) => {
    const reviews = REVIEWS[p.category] ?? REVIEWS.Place;
    const primary = reviews[hashStr(p.id) % reviews.length];
    const isSaved = saved.includes(p.id);
    return (
      <div className="thin-scroll flex-1 overflow-y-auto">
        {/* photo */}
        <PlacePhoto place={p} />
        <div className="px-4 pb-5 pt-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="m-0 truncate text-[20px] font-medium leading-snug text-[#e8eaed]">
                {p.name}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-[#9aa0a6]">
                {p.rating > 0 && (
                  <>
                    <span className="text-[#e8eaed]">{p.rating.toFixed(1)}</span>
                    <Stars rating={p.rating} />
                    <span>({fmtReviews(p.reviews)})</span>
                    <span>·</span>
                  </>
                )}
                <span className="text-[#9aa0a6]">
                  {p.price ? `${p.price} · ` : ""}
                  {CAT_META[p.category].label}
                </span>
              </div>
            </div>
            <span
              className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${CAT_META[p.category].color}22`, color: CAT_META[p.category].color }}
            >
              {catIcon(p.category, 20)}
            </span>
          </div>

          {/* actions */}
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => startDirections({ name: p.name, lat: p.lat, lng: p.lng, id: p.id })}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[#a8c7fa] text-[13px] font-semibold text-[#062e6f] transition hover:brightness-110 active:scale-[.98]"
            >
              <IconNavigation size={17} />
              Directions
            </button>
            <button
              onClick={() => toggleSave(p)}
              className={ACTION}
              title={isSaved ? "Remove from Favorites" : "Save to Favorites"}
            >
              {isSaved ? <IconBookmarkFilled size={17} /> : <IconBookmark size={17} />}
              {isSaved ? "Saved" : "Save"}
            </button>
            <button
              onClick={() =>
                copyText(
                  `https://www.openstreetmap.org/#map=17/${p.lat.toFixed(5)}/${p.lng.toFixed(5)}`,
                  "Map link"
                )
              }
              className={ACTION}
              title="Share"
            >
              <IconShare size={17} />
            </button>
          </div>

          {/* info rows */}
          <div className="mt-4 space-y-3">
            <button
              onClick={() => copyText(p.address, "Address")}
              className="group flex w-full items-start gap-3.5 text-left"
            >
              <IconMapPin size={19} className="mt-0.5 flex-shrink-0 text-[#9aa0a6]" />
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] leading-snug text-[#e8eaed] group-hover:text-[#8ab4f8]">
                  {p.address}
                </span>
                <span className="text-[12px] text-[#5f6368]">
                  {fmtDistance(haversine(originCoords, [p.lat, p.lng]))} away · tap to copy
                </span>
              </span>
              <IconCopy size={16} className="mt-1 flex-shrink-0 text-[#5f6368] opacity-0 transition group-hover:opacity-100" />
            </button>
            <div className="flex items-start gap-3.5">
              <IconClock size={19} className="mt-0.5 flex-shrink-0 text-[#9aa0a6]" />
              <div className="min-w-0 flex-1 text-[13.5px]">
                <span className={`block ${p.open ? "text-[#81c995]" : "text-[#f28b82]"}`}>
                  {p.open ? "Open now" : "Closed"}
                </span>
                <span className="block text-[#9aa0a6]">{p.hours}</span>
              </div>
            </div>
            {p.phone && (
              <a
                href={`tel:${p.phone.replace(/[^0-9+]/g, "")}`}
                className="flex items-start gap-3.5 no-underline"
              >
                <IconPhone size={19} className="mt-0.5 flex-shrink-0 text-[#9aa0a6]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] text-[#e8eaed]">{p.phone}</span>
                  <span className="block text-[12px] text-[#5f6368]">Tap to call</span>
                </span>
              </a>
            )}
          </div>

          {/* about */}
          <div className="mt-5">
            <p className="m-0 text-[13px] font-medium text-[#e8eaed]">About</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#9aa0a6]">{p.blurb}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-white/[.08] bg-white/[.05] px-2 py-1 text-[11px] text-[#9aa0a6]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* review */}
          <div className="mt-5 rounded-xl border border-white/[.07] bg-white/[.03] p-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#5f6368] text-[13px] font-semibold text-white">
                {primary.author[0]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate text-[13px] font-medium text-[#e8eaed]">{primary.author}</p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <Stars rating={primary.rating} size={11} />
                  <span className="text-[11px] text-[#5f6368]">a month ago</span>
                </div>
              </div>
            </div>
            <p className="mb-0 mt-2.5 text-[13px] leading-relaxed text-[#9aa0a6]">
              “{primary.text}”
            </p>
          </div>
        </div>
      </div>
    );
  };

  const pinContent = () => {
    if (!pin) return null;
    const shortLabel = pin.label === "Dropped pin" ? "Dropped pin" : pin.label.split(", ").slice(0, 2).join(", ");
    return (
      <div className="thin-scroll flex-1 overflow-y-auto px-4 pb-5 pt-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#9aa0a6]/15 text-[#9aa0a6]">
            <IconMapPin size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="m-0 truncate text-[18px] font-medium text-[#e8eaed]">{shortLabel}</h3>
            <p className="m-0 mt-0.5 font-mono text-[12px] text-[#9aa0a6]">
              {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
            </p>
          </div>
          <button
            onClick={() => setPin(null)}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[#9aa0a6] hover:bg-white/5 hover:text-[#e8eaed]"
          >
            <IconX size={17} />
          </button>
        </div>
        {pin.loading ? (
          <div className="mt-4 flex items-center gap-2 text-[13px] text-[#9aa0a6]">
            <IconRefresh size={15} className="animate-spin" />
            Looking up this address…
          </div>
        ) : (
          <p className="mt-3 text-[13px] leading-relaxed text-[#9aa0a6]">{pin.label}</p>
        )}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => startDirections({ name: shortLabel, lat: pin.lat, lng: pin.lng })}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[#a8c7fa] text-[13px] font-semibold text-[#062e6f] transition hover:brightness-110"
          >
            <IconNavigation size={17} />
            Directions
          </button>
          <button
            onClick={() => copyText(`${pin.lat.toFixed(6)}, ${pin.lng.toFixed(6)}`, "Coordinates")}
            className={ACTION}
          >
            <IconCopy size={16} />
            Copy
          </button>
        </div>
      </div>
    );
  };

  const directionsContent = () => {
    if (!dirDest) {
      return (
        <div className="thin-scroll flex-1 overflow-y-auto px-4 pb-5 pt-4">
          <p className="m-0 text-[13px] text-[#9aa0a6]">
            Choose a destination: search above, tap any pin, or drop a pin on the map.
          </p>
          <div className="mt-3 space-y-1">
            {(recents.length ? recents : ["ggb", "ferry", "pier39", "tartine"]).map((id) => {
              const p = placeById(id);
              if (!p) return null;
              return (
                <button
                  key={id}
                  onClick={() => startDirections({ name: p.name, lat: p.lat, lng: p.lng, id: p.id })}
                  className="flex w-full items-center gap-3 px-1 py-2.5 text-left transition hover:bg-white/[.05]"
                >
                  <span
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `${CAT_META[p.category].color}1f`,
                      color: CAT_META[p.category].color,
                    }}
                  >
                    {catIcon(p.category, 17)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium text-[#e8eaed]">{p.name}</span>
                    <span className="block truncate text-[12px] text-[#9aa0a6]">
                      {CAT_META[p.category].label} · {fmtDistance(haversine(originCoords, [p.lat, p.lng]))}
                    </span>
                  </span>
                  <IconArrowRight size={16} className="flex-shrink-0 text-[#5f6368]" />
                </button>
              );
            })}
          </div>
        </div>
      );
    }
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        {/* origin/destination */}
        <div className="border-b border-white/[.07] px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center self-stretch pt-2 pb-1">
              <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full border-[2.5px] border-[#4285f4]" />
              <span className="min-h-[22px] w-px flex-1 border-l-2 border-dashed border-[#5f6368]" />
              <span className="flex h-2.5 w-2.5 flex-shrink-0 rotate-45 border-[2.5px] border-[#ea4335]" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex h-10 items-center rounded-lg border border-white/[.08] bg-white/[.05] px-3 text-[13.5px] text-[#e8eaed]">
                <span className="truncate">{originLabel}</span>
              </div>
              <div className="flex h-10 items-center rounded-lg border border-white/[.08] bg-white/[.05] px-3 text-[13.5px] text-[#e8eaed]">
                <span className="truncate">{dirDest.name}</span>
              </div>
            </div>
          </div>
          {/* mode tabs */}
          <div className="mt-3 flex items-center justify-between">
            {(
              [
                ["drive", <IconCar key="c" size={19} />],
                ["transit", <IconBus key="t" size={19} />],
                ["walk", <IconWalk key="w" size={19} />],
                ["bike", <IconBike key="b" size={19} />],
              ] as [DirMode, React.ReactNode][]
            ).map(([m, icon]) => (
              <button
                key={m}
                onClick={() => setDirMode(m)}
                className={`flex h-10 flex-1 items-center justify-center rounded-full text-[12px] transition ${
                  dirMode === m
                    ? "bg-[#8ab4f8]/15 font-semibold text-[#8ab4f8]"
                    : "text-[#9aa0a6] hover:bg-white/5"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* summary */}
        {routeLoading && (
          <div className="flex items-center gap-2.5 px-4 py-5 text-[13px] text-[#9aa0a6]">
            <IconRefresh size={16} className="animate-spin" />
            Finding the best route…
          </div>
        )}
        {!routeLoading && route && (
          <>
            <div className="border-b border-white/[.07] px-4 py-3.5">
              <div className="flex items-baseline gap-2">
                <span className="text-[18px] font-semibold text-[#e8eaed]">
                  {fmtDuration(modeDuration(dirMode, route))}
                </span>
                <span className="text-[13px] text-[#9aa0a6]">{fmtDistance(route.distance)}</span>
              </div>
              <p className="m-0 mt-0.5 text-[12.5px] text-[#9aa0a6]">
                {dirMode === "transit"
                  ? "Best transit option · departures every 10 min"
                  : `via ${route.via || "local streets"}`}
                {route.fallback && " · offline estimate"}
              </p>
              <button
                onClick={() => toast("Turn-by-turn navigation is just a demo - enjoy the ride", "ok")}
                className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#a8c7fa] text-[13px] font-semibold text-[#062e6f] transition hover:brightness-110"
              >
                <IconNavigation size={17} />
                Start
              </button>
            </div>
            {/* steps */}
            <div className="thin-scroll flex-1 overflow-y-auto py-2">
              {route.steps.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setActiveStep(i);
                    focusStep(s);
                  }}
                  className={`flex w-full items-start gap-3.5 border-b border-white/[.05] px-4 py-3 text-left transition last:border-b-0 ${
                    activeStep === i ? "bg-[#8ab4f8]/15" : "hover:bg-white/[.05]"
                  }`}
                >
                  <span className="mt-0.5 flex-shrink-0 text-[#8ab4f8]">
                    {s.icon === "depart" ? (
                      <IconCurrentLocation size={18} />
                    ) : s.icon === "arrive" ? (
                      <IconFlag size={18} />
                    ) : s.icon === "left" ? (
                      <IconArrowLeft size={18} />
                    ) : s.icon === "right" ? (
                      <IconArrowRight size={18} />
                    ) : s.icon === "round" ? (
                      <IconRefresh size={18} />
                    ) : s.icon === "fork" ? (
                      <IconArrowsSplit2 size={18} />
                    ) : (
                      <IconArrowUp size={18} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-[13.5px] leading-snug text-[#e8eaed]">{s.text}</p>
                    {s.dist > 0 && (
                      <p className="m-0 mt-0.5 text-[12px] text-[#5f6368]">
                        {fmtDistance(s.dist)}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
        {!routeLoading && !route && (
          <div className="px-4 py-5 text-[13px] text-[#9aa0a6]">
            Routing is taking a breather. Try again in a moment.
          </div>
        )}
      </div>
    );
  };

  /* which panel content to show */
  const panel =
    mode === "directions"
      ? { key: "directions", body: directionsContent(), title: "Directions" }
      : selected
      ? { key: `place-${selected.id}`, body: placeContent(selected), title: selected.name }
      : pin
      ? { key: "pin", body: pinContent(), title: "Dropped pin" }
      : submitted || nearby
      ? {
          key: nearby ? `nearby-${nearby}` : "results",
          body: nearby ? (
            <div className="thin-scroll flex-1 overflow-y-auto">
              <div className="border-b border-white/[.07] px-4 py-3">
                <p className="m-0 text-[13px] text-[#9aa0a6]">
                  <span className="text-[#e8eaed]">
                    {GROUPS.find((g) => g.id === nearby)?.label}
                  </span>{" "}
                  near Union Square · {nearbyPlaces.length} places
                </p>
              </div>
              {nearbyPlaces.map((p) => (
                <PlaceRow key={p.id} p={p} />
              ))}
            </div>
          ) : (
            resultsContent
          ),
          title: nearby ? "Nearby" : "Search results",
        }
      : { key: "explore", body: exploreContent, title: "Explore" };

  const panelHeader = (
    <div className="flex items-center justify-between gap-2 border-b border-white/[.07] px-3 py-2.5">
      {mode === "directions" ? (
        <button
          onClick={() => {
            setMode("explore");
            setDirDest(null);
          }}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[#9aa0a6] hover:bg-white/5 hover:text-[#e8eaed]"
          title="Back"
        >
          <IconArrowLeft size={19} />
        </button>
      ) : (
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center">
          <IconMap2 size={18} className="text-[#8ab4f8]" />
        </span>
      )}
      <p className="m-0 min-w-0 flex-1 truncate text-[13px] font-medium text-[#9aa0a6]">
        {panel.title}
      </p>
      {mode !== "directions" && (
        <button
          onClick={escapePanel}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[#9aa0a6] hover:bg-white/5 hover:text-[#e8eaed]"
          title="Close"
        >
          <IconX size={18} />
        </button>
      )}
    </div>
  );

  const hasMobileSheet = !!(
    mode === "directions" ||
    selected ||
    pin ||
    submitted ||
    nearby
  );

  /* --------------------------------- render -------------------------------- */

  return (
    <div className={`relative h-full w-full overflow-hidden bg-[#0e1013] text-[#e8eaed] ${layer === "night" ? "" : "gm-light"}`}>

      <style>{PIN_CSS}</style>

      {/* map canvas */}
      <div ref={mapElRef} className="absolute inset-0 z-0 isolate" />

      {/* top-left: search + chips */}
      <div className="absolute inset-x-3 top-3 z-20 sm:inset-x-auto sm:left-4 sm:w-[380px]">
        {searchBar}
        <div className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => { setNearby(null); setSubmitted(false); setPanelClosed(false); }} className={CHIP(!nearby && !submitted)}>
            All
          </button>
          {GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                setNearby(nearby === g.id ? null : g.id);
                setSubmitted(false);
                setSelected(null);
                setPin(null);
                setMode("explore");
                setPanelClosed(false);
              }}
              className={CHIP(nearby === g.id)}
            >
              {catIcon(g.cats[0], 15)}
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* desktop side panel */}
      <AnimatePresence>
        {!panelClosed && (
          <motion.div
            key="side-panel"
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute bottom-4 left-4 top-[152px] z-10 hidden w-[380px] sm:block"
          >
            <div className={`${CARD} pointer-events-auto flex h-full min-h-0 flex-col overflow-hidden`}>
              {panelHeader}
              {panel.body}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {panelClosed && (
        <button
          onClick={() => setPanelClosed(false)}
          className="absolute bottom-4 left-4 z-10 hidden h-10 items-center gap-2 rounded-full border border-white/10 bg-[#1b1d21]/95 px-4 text-[13px] font-medium text-[#e8eaed] shadow-[0_4px_16px_rgba(0,0,0,.55)] backdrop-blur transition hover:bg-[#2e3238] sm:flex"
          title="Show panel"
        >
          <IconMap2 size={16} className="text-[#8ab4f8]" />
          Explore
        </button>
      )}

      {/* mobile bottom sheet */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 sm:hidden">
        <AnimatePresence>
          {hasMobileSheet && (
            <motion.div
              key={panel.key}
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 90, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              drag="y"
              dragListener={false}
              dragControls={sheetControls}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.35}
              dragMomentum={false}
              onDragEnd={onSheetDragEnd}
              className="pointer-events-auto flex max-h-[64vh] flex-col overflow-hidden rounded-t-2xl border-t border-white/10 bg-[#1b1d21]/98 shadow-[0_-12px_40px_rgba(0,0,0,.6)] backdrop-blur"
              style={{ height: sheetExpanded ? "64vh" : "auto" }}
            >
              <button
                onClick={sheetTapToggle}
                onPointerDown={(e) => sheetControls.start(e)}
                className="flex w-full touch-none flex-col items-center pt-2 pb-1"
                title="Drag to collapse, tap to toggle"
              >
                <span className="h-1 w-10 rounded-full bg-[#5f6368]" />
              </button>
              {sheetExpanded ? (
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  {panelHeader}
                  {panel.body}
                </div>
              ) : (
                <div className="flex w-full items-center justify-between pb-3 pl-4 pr-2 pt-1.5">
                  <button
                    onClick={sheetTapExpand}
                    onPointerDown={(e) => sheetControls.start(e)}
                    className="flex min-w-0 flex-1 touch-none items-center justify-between"
                    title="Expand"
                  >
                    <span className="m-0 min-w-0 flex-1 truncate text-left text-[14px] font-medium text-[#e8eaed]">
                      {panel.title}
                    </span>
                    <IconChevronUp size={18} className="text-[#9aa0a6]" />
                  </button>
                  <button
                    onClick={escapePanel}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[#9aa0a6] transition hover:bg-white/5 hover:text-[#e8eaed]"
                    title="Close"
                  >
                    <IconX size={18} />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* right controls */}
      <div
        className={`absolute right-3 z-20 flex flex-col items-end gap-2 transition-all sm:top-4 sm:bottom-auto ${
          hasMobileSheet && sheetExpanded
            ? "hidden sm:flex"
            : hasMobileSheet && !sheetExpanded
            ? "bottom-[104px] sm:bottom-auto"
            : "bottom-3 sm:bottom-auto"
        }`}
      >
        <AnimatePresence>
          {layersOpen && (
            <motion.div
              initial={{ opacity: 0, x: 12, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 12, scale: 0.97 }}
              transition={{ duration: 0.16 }}
              className="absolute bottom-0 right-[54px] top-auto w-60 rounded-2xl sm:bottom-auto sm:top-0 border border-white/10 bg-[#202124]/97 p-2 shadow-[0_12px_40px_rgba(0,0,0,.6)] backdrop-blur"
            >
              {(
                [
                  ["default", "Default", "linear-gradient(135deg,#f4f1ea,#e8e5da 55%,#dce5e6)", "repeating-linear-gradient(90deg,rgba(90,90,90,.1) 0 1px,transparent 1px 11px),repeating-linear-gradient(0deg,rgba(90,90,90,.1) 0 1px,transparent 1px 11px)"],
                  ["night", "Night", "linear-gradient(135deg,#1f2126,#2a2d33 55%,#3a3f46)", "repeating-linear-gradient(90deg,rgba(255,255,255,.06) 0 1px,transparent 1px 12px),repeating-linear-gradient(0deg,rgba(255,255,255,.06) 0 1px,transparent 1px 12px)"],
                  ["satellite", "Satellite", "linear-gradient(135deg,#0b2d24,#12402e 45%,#2b5a2f 75%,#123a4a)", ""],
                  ["terrain", "Terrain", "linear-gradient(135deg,#315c3d,#7a8f56 55%,#c2a97a)", ""],
                ] as [
                  "default" | "night" | "satellite" | "terrain",
                  string,
                  string,
                  string,
                ][]
              ).map(([id, label, grad, overlay]) => (
                <button
                  key={id}
                  onClick={() => setLayer(id)}
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-white/5"
                >
                  <span
                    className="h-12 w-12 flex-shrink-0 rounded-lg border border-white/15"
                    style={{ background: overlay ? `${overlay}, ${grad}` : grad, backgroundBlendMode: "overlay" }}
                  />
                  <span className="flex-1 text-[13.5px] text-[#e8eaed]">{label}</span>
                  {layer === id && <IconCheck size={17} className="text-[#8ab4f8]" />}
                </button>
              ))}
              {layer === "satellite" && (
                <div className="mt-1 flex items-center justify-between rounded-xl border border-white/[.08] bg-white/[.04] px-3 py-2">
                  <span className="text-[13px] text-[#e8eaed]">Place labels</span>
                  <Switch on={labels} onChange={setLabels} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={() => setLayersOpen((v) => !v)} className={BTN} title="Layers">
          {layer === "default" ? (
            <IconMap2 size={20} />
          ) : layer === "night" ? (
            <IconMoonStars size={20} />
          ) : layer === "satellite" ? (
            <IconGlobe size={20} />
          ) : (
            <IconMountain size={20} />
          )}
        </button>
        <div className="flex flex-col overflow-hidden rounded-full border border-white/10 bg-[#24272c]/95 shadow-[0_4px_16px_rgba(0,0,0,.55)] backdrop-blur">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="flex h-11 w-11 items-center justify-center border-b border-white/10 text-[#e8eaed] transition hover:bg-[#2e3238]"
            title="Zoom in"
          >
            <IconPlus size={19} />
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="flex h-11 w-11 items-center justify-center text-[#e8eaed] transition hover:bg-[#2e3238]"
            title="Zoom out"
          >
            <IconMinus size={19} />
          </button>
        </div>
        <button onClick={locate} className={BTN} title="Your location">
          <IconCurrentLocation size={20} className={userLoc ? "text-[#8ab4f8]" : ""} />
        </button>
      </div>

      {/* toast stack */}
      <div className="pointer-events-none absolute inset-x-0 bottom-14 z-40 flex flex-col items-center gap-2 px-4 sm:bottom-6">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ y: 16, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 10, opacity: 0, scale: 0.96 }}
              className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#202124]/97 px-4 py-3 text-[13px] text-[#e8eaed] shadow-[0_12px_40px_rgba(0,0,0,.65)] backdrop-blur"
            >
              {t.icon === "warn" ? (
                <IconAlertCircle size={17} className="flex-shrink-0 text-[#fdd663]" />
              ) : t.icon === "save" ? (
                <IconBookmarkFilled size={17} className="flex-shrink-0 text-[#8ab4f8]" />
              ) : (
                <IconCheck size={17} className="flex-shrink-0 text-[#81c995]" />
              )}
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
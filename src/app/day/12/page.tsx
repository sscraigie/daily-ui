"use client";
// Day 12 - E-Commerce Shop (Single Product)
// Nike.com style product page for the Air Zoom Alphafly 4 (IU4686-002), built
// with real product imagery, specs and copy: swoosh nav, full gallery with
// thumbnail rail and hover zoom, size grid, add-to-bag flow with cart toast,
// expandable details, reviews and a "You Might Also Like" rail.

import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";

/* --------------------------------- assets -------------------------------- */

const GALLERY = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({
  src: `/alphafly/gallery/gal-${String(n).padStart(2, "0")}.webp`,
  alt: "Nike Alphafly 4 Men's Road Racing Shoes",
}));

const COLORWAY = "Sea Glass/Laser Crimson/Phantom/Burgundy Ash";
const PRICE = 280;

const SPECS = [
  { k: "Engineered For", v: "Road Racing" },
  { k: "Race Distance", v: "Half Marathons & Marathons" },
  { k: "Shoe Weight", v: "Approx. 188g/6.6oz (Men's US 8.5)" },
  { k: "Heel-to-Toe Drop", v: "8mm" },
  { k: "Technology", v: "Carbon Fiber Flyplate, ZoomX LT Foam & Air Zoom Units" },
];

const RELATED = [
  {
    name: "Nike Vaporfly 4",
    sub: "Men's Road Racing Shoes",
    price: 234.97,
    was: 270,
    img: "/alphafly/rail/vaporfly4.webp",
  },
  {
    name: "Nike Zoom Fly 6",
    sub: "Men's Road Running Shoes",
    price: 143.97,
    was: 190,
    img: "/alphafly/rail/zoomfly6.webp",
  },
  {
    name: "Nike Alphafly 3",
    sub: "Men's Road Racing Shoes",
    price: 221.97,
    was: 295,
    img: "/alphafly/rail/alphafly3.webp",
  },
  {
    name: "Nike Pegasus Premium",
    sub: "Men's Road Running Shoes",
    price: 201.97,
    was: 220,
    img: "/alphafly/rail/pegasus-premium.webp",
  },
  {
    name: "Nike Alphafly 3 Glam",
    sub: "Women's Road Racing Shoes",
    price: 184.97,
    was: 305,
    img: "/alphafly/rail/alphafly3-glam.webp",
  },
  {
    name: "Nike Vomero Plus",
    sub: "Women's Road Running Shoes",
    price: 190,
    was: null,
    img: "/alphafly/rail/vomero-plus.webp",
  },
];

/* --------------------------------- icons ---------------------------------- */

const SWOOSH_PATH =
  "M245.8075 717.62406c-29.79588-1.1837-54.1734-9.3368-73.23459-24.4796-3.63775-2.8928-12.30611-11.5663-15.21427-15.2245-7.72958-9.7193-12.98467-19.1785-16.48977-29.6734-10.7857-32.3061-5.23469-74.6989 15.87753-121.2243 18.0765-39.8316 45.96932-79.3366 94.63252-134.0508 7.16836-8.0511 28.51526-31.5969 28.65302-31.5969.051 0-1.11225 2.0153-2.57652 4.4694-12.65304 21.1938-23.47957 46.158-29.37751 67.7703-9.47448 34.6785-8.33163 64.4387 3.34693 87.5151 8.05611 15.898 21.86731 29.6684 37.3979 37.2806 27.18874 13.3214 66.9948 14.4235 115.60699 3.2245 3.34694-.7755 169.19363-44.801 368.55048-97.8366 199.35686-53.0408 362.49439-96.4029 362.51989-96.3672.056.046-463.16259 198.2599-703.62654 301.0914-38.08158 16.2806-48.26521 20.3928-66.16827 26.6785-45.76525 16.0714-86.76008 23.7398-119.89779 22.4235z";

function Swoosh({ className }: { className?: string }) {
  return (
    <svg viewBox="135.5 361.38 1000 356.39" className={className} aria-label="Nike">
      <path d={SWOOSH_PATH} fill="currentColor" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L21 21" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "#e11d48" : "none"}
      stroke={filled ? "#e11d48" : "currentColor"}
      strokeWidth="1.7"
    >
      <path d="M12 20.8l-1.2-1.1C6 15.4 3 12.6 3 9.1 3 6.3 5.2 4.1 8 4.1c1.6 0 3.1.8 4 2 0.9-1.2 2.4-2 4-2 2.8 0 5 2.2 5 5 0 3.5-3 6.3-7.8 10.6L12 20.8z" />
    </svg>
  );
}

function BagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
      <rect x="4.5" y="7.5" width="15" height="13.5" rx="1.5" />
      <path d="M8.5 7.5V6.8a3.5 3.5 0 0 1 7 0v0.7" strokeLinecap="round" />
    </svg>
  );
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Stars({ value }: { value: number }) {
  const star = "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";
  return (
    <svg viewBox="0 0 110 20" className="h-4 w-[110px]">
      <defs>
        <linearGradient id="halfstar">
          <stop offset="50%" stopColor="#111" />
          <stop offset="50%" stopColor="#e5e5e5" />
        </linearGradient>
      </defs>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.floor(value);
        const half = !filled && value - i > 0;
        return (
          <path
            key={i}
            d={star}
            transform={`translate(${i * 22} 0) scale(0.83)`}
            fill={filled ? "#111" : half ? "url(#halfstar)" : "#e5e5e5"}
          />
        );
      })}
    </svg>
  );
}

/* --------------------------------- data ---------------------------------- */

const SIZES = [
  "6", "6.5", "7", "7.5", "8", "8.5",
  "9", "9.5", "10", "10.5", "11", "12",
];
const SOLD_OUT = new Set(["7.5", "11"]);

const RATING = { score: 4.8, count: 87 };
const RATING_BARS = [
  { stars: 5, pct: 82 },
  { stars: 4, pct: 12 },
  { stars: 3, pct: 4 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 1 },
];

const REVIEWS = [
  {
    title: "PR machine",
    body: "Ran a 2:41 marathon in these off 6 weeks of build. The Air Zoom units feel softer than the 3s and the ride is so quiet now. Sizing tip: go up a half size — the toe box is snug.",
    author: "Marcus T.",
    date: "September 2, 2026",
  },
  {
    title: "Worth every penny",
    body: "My third pair of Alphaflys. The 4 is noticeably lighter and the knit upper needs zero break-in. I saved them for race day only and they still feel brand new.",
    author: "Alicia R.",
    date: "August 18, 2026",
  },
];

/* ------------------------------ ui sections ------------------------------ */

function Expandable({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="border-t border-[#e5e5e5]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-base font-medium text-[#111]">{title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-[#111]">
          <Chevron className="h-4 w-4" />
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.28, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="pb-5">{children}</div>
      </motion.div>
    </div>
  );
}

/* --------------------------------- page ---------------------------------- */

export default function Day12() {
  const [active, setActive] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [fav, setFav] = useState(false);
  const [bagCount, setBagCount] = useState(0);
  const [toast, setToast] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(false), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const addToBag = () => {
    setBagCount((c) => c + 1);
    setToast(true);
  };

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-white text-[#111]">
      {/* promo bar */}
      <div className="bg-[#f5f5f5] px-4 py-2.5 text-center">
        <p className="m-0 text-xs font-medium">New Styles On Sale: Up To 40% Off</p>
        <a href="#" className="mt-0.5 inline-block text-xs underline underline-offset-2">
          Shop All Our New Markdowns
        </a>
      </div>

      {/* nav */}
      <header className="sticky top-0 z-40 border-b border-[#e5e5e5] bg-white">
        <div className="mx-auto flex h-16 max-w-[1800px] items-center gap-8 px-6 lg:px-12">
          <a href="#" className="shrink-0 text-[#111]">
            <Swoosh className="h-6 w-[60px]" />
          </a>

          <nav className="hidden items-center gap-5 lg:flex">
            {["New & Featured", "Men", "Women", "Kids", "Jordan", "Sale"].map(
              (l) => (
                <a
                  key={l}
                  href="#"
                  className="text-base font-medium hover:underline hover:decoration-2 hover:underline-offset-[6px]"
                >
                  {l}
                </a>
              )
            )}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-[#f5f5f5] px-4 py-2 md:flex">
              <SearchIcon className="h-4 w-4 text-[#111]" />
              <input
                placeholder="Search"
                className="w-24 bg-transparent text-sm outline-none placeholder:text-[#111]"
              />
            </div>
            <button className="p-2" aria-label="Favourites">
              <HeartIcon className="h-6 w-6" />
            </button>
            <button className="relative p-2" aria-label="Bag">
              <BagIcon className="h-6 w-6" />
              <AnimatePresence>
                {bagCount > 0 && (
                  <motion.span
                    key={bagCount}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#111] px-1 text-[10px] font-semibold leading-none text-white"
                  >
                    {bagCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              className="p-2 lg:hidden"
              aria-label="Menu"
              onClick={() => setMobileMenu((m) => !m)}
            >
              {mobileMenu ? (
                <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                  <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenu && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-[#e5e5e5] lg:hidden"
            >
              <div className="flex flex-col gap-1 px-6 py-4">
                {["New & Featured", "Men", "Women", "Kids", "Jordan", "Sale"].map(
                  (l) => (
                    <a key={l} href="#" className="py-1.5 text-base font-medium">
                      {l}
                    </a>
                  )
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* breadcrumb */}
      <div className="mx-auto max-w-[1800px] px-6 py-4 lg:px-12">
        <div className="flex items-center gap-1.5 text-xs text-[#707072]">
          <a href="#" className="hover:underline">Home</a>
          <span>/</span>
          <a href="#" className="hover:underline">Men</a>
          <span>/</span>
          <a href="#" className="hover:underline">Shoes</a>
          <span>/</span>
          <span className="text-[#111]">Road Racing</span>
        </div>
      </div>

      {/* product */}
      <main className="mx-auto max-w-[1800px] px-6 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[13fr_10fr] lg:gap-16">
          {/* gallery */}
          <div className="flex items-start gap-4">
            <div className="hidden w-[88px] shrink-0 flex-col gap-3 self-stretch overflow-y-auto [scrollbar-width:none] md:flex [&::-webkit-scrollbar]:hidden">
              {GALLERY.map((g, i) => (
                <button
                  key={g.src}
                  onClick={() => setActive(i)}
                  className={`aspect-square bg-[#f5f5f5] transition-shadow ${
                    active === i
                      ? "border border-solid border-[#111]"
                      : "border border-solid border-transparent hover:border-[#cacacb]"
                  }`}
                  aria-label={`View ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.src} alt="" className="h-full w-full object-contain p-1" />
                </button>
              ))}
            </div>

            <div className="group relative aspect-square min-w-0 flex-1 overflow-hidden bg-[#f5f5f5]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={GALLERY[active].src}
                    alt={GALLERY[active].alt}
                    className="h-full w-full object-contain p-6 transition-transform duration-500 ease-out group-hover:scale-[1.07]"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* mobile thumbs */}
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
            {GALLERY.map((g, i) => (
              <button
                key={g.src}
                onClick={() => setActive(i)}
                className={`aspect-square w-20 shrink-0 bg-[#f5f5f5] ${
                  active === i
                    ? "border border-solid border-[#111]"
                    : "border border-solid border-transparent"
                }`}
                aria-label={`View ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.src} alt="" className="h-full w-full object-contain p-1" />
              </button>
            ))}
          </div>

          {/* details */}
          <div>
            <p className="m-0 text-sm font-medium">{COLORWAY}</p>
            <div className="mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/alphafly/gallery/gal-01.webp"
                alt={COLORWAY}
                className="h-12 w-12 rounded-full border border-solid border-[#cacacb] bg-white object-cover"
              />
            </div>

            <h1 className="mb-1 mt-5 text-2xl font-medium">Nike Alphafly 4</h1>
            <p className="m-0 text-base text-[#707072]">Men&apos;s Road Racing Shoes</p>
            <p className="m-0 mt-3 text-base font-medium">${PRICE}</p>

            <button className="mt-2 flex items-center gap-1.5 p-0">
              <Stars value={RATING.score} />
              <span className="text-sm text-[#707072] underline underline-offset-2">
                ({RATING.count})
              </span>
            </button>

            {/* sizes */}
            <div className="mt-8 flex items-center justify-between">
              <span className="text-base font-medium">Select Size</span>
              <button
                onClick={() => setSizeGuideOpen((o) => !o)}
                className="p-0 text-sm text-[#707072] underline underline-offset-2 hover:text-[#111]"
              >
                Size Guide
              </button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {SIZES.map((s) => {
                const out = SOLD_OUT.has(s);
                return (
                  <button
                    key={s}
                    disabled={out}
                    onClick={() => setSize(s)}
                    className={`h-11 rounded-full border border-solid text-sm font-medium transition-colors ${
                      out
                        ? "cursor-not-allowed border-transparent bg-[#e5e5e5] text-[#9b9b9b] line-through"
                        : size === s
                        ? "border-[#111] bg-[#111] text-white"
                        : "border-[#e5e5e5] bg-white text-[#111] hover:border-[#111]"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <AnimatePresence>
              {sizeGuideOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <table className="mt-4 w-full text-sm">
                    <thead>
                      <tr className="text-left text-[#707072]">
                        <th className="font-medium">US</th>
                        <th className="font-medium">EU</th>
                        <th className="font-medium">UK</th>
                        <th className="font-medium">CM</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["8", "41", "7", "26"],
                        ["9", "42.5", "8", "27"],
                        ["10", "44", "9", "28"],
                        ["11", "45", "10", "29"],
                      ].map((r) => (
                        <tr key={r[0]} className="border-t border-[#e5e5e5]">
                          {r.map((c) => (
                            <td key={c} className="py-2">{c}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>

            {/* actions */}
            <div className="mt-6 flex gap-2">
              <motion.button
                onClick={addToBag}
                whileTap={{ scale: 0.98 }}
                className="h-12 flex-1 rounded-full bg-[#111] text-base font-medium text-white transition-colors hover:bg-[#3a3a3a]"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={toast ? "added" : "add"}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="inline-flex items-center gap-2"
                  >
                    {toast ? "Added to Bag" : "Add to Bag"}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setFav((f) => !f)}
                className="flex h-12 items-center justify-center gap-2 rounded-full border border-solid border-[#e5e5e5] px-6 text-base font-medium hover:border-[#111]"
              >
                <motion.span
                  animate={fav ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex"
                >
                  <HeartIcon className="h-5 w-5" filled={fav} />
                </motion.span>
                Favourite
              </motion.button>
            </div>
            {size === null && !toast && (
              <p className="m-0 mt-2 text-center text-sm text-[#707072]">
                Select a size to add to your bag
              </p>
            )}

            {/* description */}
            <p className="mt-8 text-base leading-relaxed text-[#111]">
              Our legendary racer delivers more energy with less weight. The
              iconic racing shoe is back and lighter than ever. We updated the
              Air Zoom unit for the first time in Alphafly history, making it
              softer and quieter. Advancements to our ZoomX foam deliver more
              bounce with less weight, opening up your marathon potential.
            </p>
            <ul className="m-0 mt-4 list-none p-0 text-base leading-relaxed">
              {[
                "Updated Air Zoom unit for a softer, quieter ride",
                "ZoomX LT foam for more bounce with less weight",
                "Full-length carbon fiber flyplate for propulsion",
                "Engineered knit upper, light and breathable",
              ].map((li) => (
                <li key={li} className="mt-1.5">• {li}</li>
              ))}
            </ul>

            {/* expandables */}
            <div className="mt-8">
              <Expandable title="Product Specifications">
                <dl className="m-0">
                  {SPECS.map((s) => (
                    <div key={s.k} className="flex gap-4 border-t border-[#e5e5e5] py-2.5 first:border-t-0">
                      <dt className="w-32 shrink-0 text-sm text-[#707072]">{s.k}</dt>
                      <dd className="m-0 text-sm font-medium">{s.v}</dd>
                    </div>
                  ))}
                </dl>
                <ul className="m-0 mt-3 list-none p-0 text-sm leading-relaxed text-[#707072]">
                  <li className="mt-1.5">Shown: {COLORWAY}</li>
                  <li className="mt-1.5">Style: IU4686-002</li>
                </ul>
              </Expandable>
              <Expandable title="Delivery & Returns" defaultOpen>
                <div className="text-sm leading-relaxed text-[#111]">
                  <p className="m-0">Free standard delivery on orders $50+ and free 60-day returns for Members.</p>
                  <ul className="m-0 mt-2 list-none p-0">
                    <li className="mt-1.5">• Standard delivery 3–7 business days</li>
                    <li className="mt-1.5">• Express delivery 2–3 business days</li>
                    <li className="mt-1.5">• Pick up in store, ready in 2 hours</li>
                  </ul>
                </div>
              </Expandable>
              <Expandable title={`Reviews (${RATING.count})`}>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-medium">{RATING.score}</span>
                  <div>
                    <Stars value={RATING.score} />
                    <p className="m-0 mt-1 text-xs text-[#707072]">
                      {RATING.count} Reviews
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-1.5">
                  {RATING_BARS.map((b) => (
                    <div key={b.stars} className="flex items-center gap-2 text-xs text-[#707072]">
                      <span className="w-8">★ {b.stars}</span>
                      <div className="h-2 flex-1 bg-[#e5e5e5]">
                        <div className="h-full bg-[#111]" style={{ width: `${b.pct}%` }} />
                      </div>
                      <span className="w-8 text-right">{b.pct}%</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex flex-col gap-4">
                  {REVIEWS.map((r) => (
                    <div key={r.author}>
                      <div className="flex items-center gap-2">
                        <Stars value={5} />
                        <p className="m-0 text-sm font-medium">{r.title}</p>
                      </div>
                      <p className="m-0 mt-1 text-sm leading-relaxed text-[#707072]">{r.body}</p>
                      <p className="m-0 mt-1 text-xs text-[#707072]">
                        {r.author} · {r.date}
                      </p>
                    </div>
                  ))}
                </div>
              </Expandable>
            </div>
          </div>
        </div>

        {/* you might also like */}
        <section className="py-16">
          <h2 className="m-0 mb-5 text-xl font-medium">You Might Also Like</h2>
          <div className="flex snap-x gap-3 overflow-x-auto pb-2">
            {RELATED.map((p, i) => (
              <motion.a
                key={p.name + i}
                href="#"
                whileHover={{ y: -4 }}
                className="w-[260px] shrink-0 snap-start"
              >
                <div className="aspect-square bg-[#f5f5f5]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.img} alt={p.name} className="h-full w-full object-contain p-4" />
                </div>
                <p className="m-0 mt-3 text-sm font-medium">{p.name}</p>
                <p className="m-0 text-sm text-[#707072]">{p.sub}</p>
                <p className="m-0 mt-1 text-sm">
                  {p.was !== null ? (
                    <>
                      <span className="font-medium text-[#9e3500]">${p.price}</span>{" "}
                      <span className="text-[#707072] line-through">${p.was}</span>
                    </>
                  ) : (
                    <span className="text-[#707072]">${p.price}</span>
                  )}
                </p>
              </motion.a>
            ))}
          </div>
        </section>
      </main>

      {/* footer */}
      <footer className="mt-4 bg-[#111] px-6 py-10 text-white lg:px-12">
        <div className="mx-auto max-w-[1800px]">
          <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
            <div>
              <Swoosh className="h-6 w-[60px] text-white" />
            </div>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { h: "Icons", l: ["Air Force 1", "Air Jordan 1", "Air Max", "Dunk"] },
                { h: "Shoes", l: ["All Shoes", "Running", "Basketball", "Lifestyle"] },
                { h: "Clothing", l: ["All Clothing", "Tops & T-Shirts", "Hoodies", "Pants"] },
                { h: "Support", l: ["Help", "Returns", "Order Status", "Contact Us"] },
              ].map((col) => (
                <div key={col.h}>
                  <p className="m-0 text-sm font-medium">{col.h}</p>
                  <ul className="m-0 mt-3 list-none p-0">
                    {col.l.map((li) => (
                      <li key={li} className="mt-2">
                        <a href="#" className="text-sm text-[#9b9b9b] hover:text-white">
                          {li}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#333] pt-6 text-xs text-[#9b9b9b]">
            <span>© 2026 Nike Clone — a Daily UI design exercise. Not affiliated with Nike, Inc.</span>
            <a href="#" className="hover:text-white">Guides</a>
            <a href="#" className="hover:text-white">Terms of Sale</a>
            <a href="#" className="hover:text-white">Terms of Use</a>
            <a href="#" className="hover:text-white">Privacy Policy</a>
          </div>
        </div>
      </footer>

      {/* added-to-bag toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed right-4 top-24 z-50 w-72 border border-solid border-[#e5e5e5] bg-white shadow-2xl"
          >
            <div className="border-b border-solid border-[#e5e5e5] px-4 py-3">
              <p className="m-0 text-xs font-semibold tracking-wide">ADDED TO BAG</p>
            </div>
            <div className="flex gap-3 p-4">
              <div className="h-16 w-16 shrink-0 bg-[#f5f5f5]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={GALLERY[active].src} alt="" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0">
                <p className="m-0 truncate text-sm font-medium">Nike Alphafly 4</p>
                <p className="m-0 text-xs text-[#707072]">{COLORWAY}</p>
                <p className="m-0 mt-0.5 text-xs text-[#707072]">
                  {size ? `Size ${size}` : "No size selected"} · ${PRICE}
                </p>
              </div>
            </div>
            <div className="flex gap-2 px-4 pb-4">
              <button
                onClick={() => setToast(false)}
                className="h-9 flex-1 rounded-full bg-[#111] text-xs font-medium text-white hover:bg-[#3a3a3a]"
              >
                View Bag
              </button>
              <button
                onClick={() => setToast(false)}
                className="h-9 rounded-full border border-solid border-[#e5e5e5] px-4 text-xs font-medium hover:border-[#111]"
              >
                Keep Shopping
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
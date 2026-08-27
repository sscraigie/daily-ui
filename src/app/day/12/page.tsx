"use client";
// Day 12 - Single Product
// Inspiration: https://dribbble.com/shots/20684888-E-commerce-Product-Page
// Premium product page with image zoom, variant selection, and add-to-cart animations

import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";

const colorVariants = [
  { id: "obsidian", label: "Obsidian", hex: "#1a1a2e" },
  { id: "glacier", label: "Glacier", hex: "#4facfe" },
  { id: "rose", label: "Rose Gold", hex: "#e8a79b" },
  { id: "forest", label: "Forest", hex: "#2d6a4f" },
];

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

const reviews = [
  { name: "Jordan K.", rating: 5, text: "Absolutely stunning quality. The weight and feel are premium — wearing this feels like a statement.", avatar: "JK" },
  { name: "Priya M.", rating: 5, text: "Fast shipping, true to size, and the color is even richer in person. Will definitely buy again.", avatar: "PM" },
  { name: "Chris F.", rating: 4, text: "Great hoodie. Stitching is tight and fabric is incredibly soft. Only wish it shipped with extra care guide.", avatar: "CF" },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="w-4 h-4"
          fill={i < count ? "#f59e0b" : "none"}
          stroke="#f59e0b"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ))}
    </div>
  );
}

export default function Day12() {
  const [selectedColor, setSelectedColor] = useState(colorVariants[0]);
  const [selectedSize, setSelectedSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const thumbnails = [0, 1, 2, 3];

  return (
    <div
      className="min-h-full w-full flex items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #fafafa 0%, #f0f4ff 100%)" }}
    >
      <div className="w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-[2rem] shadow-2xl overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row">
            {/* Gallery */}
            <div className="lg:w-1/2 p-8 flex flex-col gap-4">
              {/* Main image */}
              <div
                className="relative overflow-hidden rounded-2xl aspect-square flex items-center justify-center"
                style={{ background: selectedColor.hex + "18" }}
              >
                {/* Product illustration */}
                <motion.div
                  key={selectedColor.id + activeImage}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center justify-center gap-3"
                >
                  <div
                    className="w-40 h-48 rounded-3xl shadow-2xl flex items-center justify-center text-6xl"
                    style={{
                      background: `linear-gradient(145deg, ${selectedColor.hex}cc, ${selectedColor.hex})`,
                      boxShadow: `0 20px 60px ${selectedColor.hex}55`,
                    }}
                  >
                    👕
                  </div>
                  <div className="flex gap-2 items-center mt-2">
                    <div
                      className="w-4 h-4 rounded-full border border-white shadow"
                      style={{ background: selectedColor.hex }}
                    />
                    <span className="text-sm font-medium text-gray-600">
                      {selectedColor.label}
                    </span>
                  </div>
                </motion.div>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="px-3  py-1 bg-black text-white text-xs font-bold rounded-full">
                    NEW
                  </span>
                  <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                    -20%
                  </span>
                </div>

                {/* Wishlist */}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setWishlisted((w) => !w)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center border-none cursor-pointer"
                >
                  <motion.svg
                    animate={wishlisted ? { scale: [1, 1.35, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className="w-5 h-5"
                    fill={wishlisted ? "#ef4444" : "none"}
                    stroke={wishlisted ? "#ef4444" : "#9ca3af"}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </motion.svg>
                </motion.button>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3">
                {thumbnails.map((i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveImage(i)}
                    className="flex-1 aspect-square rounded-xl overflow-hidden border-2 cursor-pointer"
                    style={{
                      borderColor: activeImage === i ? selectedColor.hex : "transparent",
                      background: selectedColor.hex + "22",
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      👕
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="lg:w-1/2 p-8 flex flex-col gap-5">
              {/* Brand & title */}
              <div>
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest m-0 mb-1">
                  Arcadia Studio
                </p>
                <h1 className="text-gray-900 text-3xl font-extrabold m-0 leading-tight">
                  Meridian Heavyweight Hoodie
                </h1>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <Stars count={5} />
                <span className="text-sm text-gray-500">4.9 · 312 reviews</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-gray-900">$89</span>
                <span className="text-lg text-gray-400 line-through">$112</span>
                <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  Save $23
                </span>
              </div>

              {/* Color */}
              <div>
                <p className="text-sm font-semibold text-gray-700 m-0 mb-2">
                  Color: <span className="font-normal text-gray-500">{selectedColor.label}</span>
                </p>
                <div className="flex gap-3">
                  {colorVariants.map((c) => (
                    <motion.button
                      key={c.id}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedColor(c)}
                      className="p-0 border-2 rounded-full cursor-pointer flex-shrink-0"
                      style={{
                        borderColor: selectedColor.id === c.id ? c.hex : "transparent",
                        outline: selectedColor.id === c.id ? `2px solid ${c.hex}66` : "none",
                        outlineOffset: 2,
                        width: 32,
                        height: 32,
                        background: c.hex,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700 m-0">
                    Size: <span className="font-normal text-gray-500">{selectedSize}</span>
                  </p>
                  <button className="text-xs text-indigo-500 font-medium border-none bg-transparent cursor-pointer p-0">
                    Size Guide
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {sizes.map((s) => (
                    <motion.button
                      key={s}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setSelectedSize(s)}
                      className="w-11 h-10 rounded-xl text-sm font-semibold border-2 border-solid cursor-pointer outline-none focus:outline-none focus-visible:outline-none"
                      style={{
                        borderColor:
                          selectedSize === s ? selectedColor.hex : "#e5e7eb",
                        color: selectedSize === s ? selectedColor.hex : "#374151",
                        background:
                          selectedSize === s ? selectedColor.hex + "12" : "#fff",
                      }}
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Qty + Add to Cart */}
              <div className="flex gap-3 items-center">
                <div
                  className="flex items-center rounded-xl overflow-hidden border gap-0"
                  style={{ borderColor: "#e5e7eb" }}
                >
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-11 flex items-center justify-center border-none bg-transparent cursor-pointer text-gray-600 text-lg hover:bg-gray-50"
                  >
                    −
                  </button>
                  <motion.span
                    key={qty}
                    initial={{ scale: 0.7 }}
                    animate={{ scale: 1 }}
                    className="w-10 text-center text-sm font-bold text-gray-800"
                  >
                    {qty}
                  </motion.span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-10 h-11 flex items-center justify-center border-none bg-transparent cursor-pointer text-gray-600 text-lg hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>

                <motion.button
                  onClick={handleAdd}
                  whileHover={!added ? { scale: 1.02, y: -1 } : {}}
                  whileTap={!added ? { scale: 0.97 } : {}}
                  className="flex-1 h-11 rounded-xl font-bold text-sm border-none cursor-pointer text-white"
                  style={{
                    background: added
                      ? "linear-gradient(90deg, #10b981, #059669)"
                      : `linear-gradient(90deg, ${selectedColor.hex}, ${selectedColor.hex}cc)`,
                    transition: "background 0.4s",
                  }}
                >
                  <AnimatePresence mode="wait">
                    {added ? (
                      <motion.span
                        key="done"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center justify-center gap-2"
                      >
                        ✓ Added to Cart
                      </motion.span>
                    ) : (
                      <motion.span
                        key="add"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                      >
                        Add to Cart · ${89 * qty}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

              {/* Features */}
              <div className="flex gap-4 pt-1">
                {[
                  { icon: "🚚", label: "Free shipping over $50" },
                  { icon: "↩️", label: "30-day returns" },
                  { icon: "🛡️", label: "1 year warranty" },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span>{f.icon}</span>
                    <span>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="px-8 pb-8 border-t mt-4" style={{ borderColor: "#f3f4f6" }}>
            <h3 className="text-gray-800 text-lg font-bold mt-6 mb-4 m-0">
              Customer Reviews
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reviews.map((r, i) => (
                <motion.div
                  key={r.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="p-4 rounded-2xl"
                  style={{ background: "#f9fafb" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}
                    >
                      {r.avatar}
                    </div>
                    <div>
                      <p className="m-0 text-sm font-semibold text-gray-800">{r.name}</p>
                      <Stars count={r.rating} />
                    </div>
                  </div>
                  <p className="m-0 text-sm text-gray-600 leading-relaxed">{r.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

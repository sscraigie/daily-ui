"use client";

import React from "react";

export const TopBar = () => (
  <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-end gap-3 px-6 py-4">
    <div className="hidden cursor-default rounded-full bg-white px-4 py-1.5 text-xs font-bold text-black transition-transform hover:scale-105 sm:block">
      Explore Premium
    </div>
    <div
      title="Your profile"
      className="hidden h-8 w-8 cursor-default place-items-center rounded-full bg-[#503750] text-xs font-bold text-white ring-2 ring-black/40 sm:grid"
    >
      S
    </div>
  </div>
);

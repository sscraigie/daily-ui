"use client";

import React from "react";

type Variant = "digit" | "function" | "operator";

const variantClasses: Record<Variant, string> = {
  digit: "bg-[#333333] text-white active:bg-[#737373]",
  function: "bg-[#a5a5a5] text-black active:bg-[#e3e3e3]",
  operator: "bg-[#ff9f0a] text-white active:bg-[#ffc46b]",
};

type CalcButtonProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  highlighted?: boolean;
  wide?: boolean;
  ariaLabel?: string;
};

export const CalcButton = ({
  label,
  onPress,
  variant = "digit",
  highlighted = false,
  wide = false,
  ariaLabel,
}: CalcButtonProps) => {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={ariaLabel ?? label}
      className={[
        "flex select-none items-center rounded-full text-3xl leading-none transition-colors duration-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 active:duration-0 md:text-[32px]",
        wide
          ? "col-span-2 aspect-[2.15/1] justify-start pl-[17%]"
          : "aspect-square justify-center",
        highlighted
          ? "bg-white text-[#ff9f0a] active:bg-white/70"
          : variantClasses[variant],
      ].join(" ")}
    >
      {label}
    </button>
  );
};

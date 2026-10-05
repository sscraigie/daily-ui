"use client";

import Image from "next/image";
import React from "react";
import { Add, Remove } from "@mui/icons-material";

import { formatPrice } from "../data";
import type { CartLine, Product } from "../data";

type CartItemProps = {
  line: CartLine;
  onChangeQuantity: (product: Product, quantity: number) => void;
};

const iconButton =
  "grid h-8 w-8 shrink-0 place-items-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-700";

export default function CartItem({ line, onChangeQuantity }: CartItemProps) {
  const { name, price, image, quantity } = line;
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-stone-200 sm:gap-4">
      <Image
        src={image}
        alt={name}
        width={56}
        height={56}
        className="h-14 w-14 shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-stone-900">{name}</p>
        <p className="text-sm text-stone-500">{formatPrice(price)} each</p>
      </div>
      <div
        role="group"
        aria-label={`Quantity of ${name}`}
        className="flex shrink-0 items-center rounded-full ring-1 ring-stone-200"
      >
        <button
          type="button"
          aria-label={`Decrease quantity of ${name}`}
          onClick={() => onChangeQuantity(line, quantity - 1)}
          className={`${iconButton} text-stone-500 hover:bg-stone-100 hover:text-stone-900`}
        >
          <Remove fontSize="small" />
        </button>
        <span
          aria-live="polite"
          className="w-7 text-center text-sm font-semibold text-stone-900"
        >
          {quantity}
        </span>
        <button
          type="button"
          aria-label={`Increase quantity of ${name}`}
          onClick={() => onChangeQuantity(line, quantity + 1)}
          className={`${iconButton} text-stone-500 hover:bg-stone-100 hover:text-stone-900`}
        >
          <Add fontSize="small" />
        </button>
      </div>
      <p className="w-16 shrink-0 text-right font-semibold text-stone-900">
        {formatPrice(price * quantity)}
      </p>
    </div>
  );
}

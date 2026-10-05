"use client";

import React from "react";

import {
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  formatPrice,
} from "../data";

type CheckoutTotalProps = {
  subtotal: number;
  delivery: number;
  total: number;
  onCheckout: () => void;
  disabled?: boolean;
};

export default function CheckoutTotal({
  subtotal,
  delivery,
  total,
  onCheckout,
  disabled = false,
}: CheckoutTotalProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
      <div className="flex justify-between text-sm text-stone-500">
        <span>Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm text-stone-500">
        <span>Delivery</span>
        {delivery === 0 ? (
          <span className="font-medium text-emerald-600">Free</span>
        ) : (
          <span>{formatPrice(delivery)}</span>
        )}
      </div>
      <div className="my-1 h-px bg-stone-200" />
      <div className="flex items-baseline justify-between">
        <span className="font-medium text-stone-900">Total</span>
        <span className="text-xl font-bold text-stone-900">
          {formatPrice(total)}
        </span>
      </div>
      {delivery === DELIVERY_FEE && (
        <p className="text-xs text-stone-400">
          Add {formatPrice(FREE_DELIVERY_THRESHOLD - subtotal)} more for free
          delivery.
        </p>
      )}
      <button
        type="button"
        onClick={onCheckout}
        disabled={disabled}
        className="mt-2 h-11 w-full rounded-xl bg-stone-900 text-sm font-semibold text-white transition hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-300"
      >
        Checkout
      </button>
    </div>
  );
}

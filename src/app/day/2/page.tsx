"use client";
// Day 2 - Checkout
// Inspiration: https://dribbble.com/shots/19669977-Furniture-shop-checkout-page
// Furniture store checkout: product gallery with switchable views and colors,
// a live cart whose quantities drive the totals, and a confetti celebration
// on a successful order.

import Image from "next/image";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AddShoppingCart, Check, DeleteOutline, TaskAlt } from "@mui/icons-material";

import CartItem from "./components/CartItem";
import CheckoutTotal from "./components/CheckoutTotal";
import Confetti from "./components/Confetti";
import {
  CATALOG,
  COLORS,
  DELIVERY_FEE,
  FEATURED_ID,
  FEATURED_PRODUCT,
  FREE_DELIVERY_THRESHOLD,
  MAX_QUANTITY,
  formatPrice,
} from "./data";
import type { CartLine, Product, ProductView } from "./data";

const RECEIPT_DURATION = 4000;
const ADDED_DURATION = 1200;

const sectionHeading =
  "text-sm font-semibold uppercase tracking-wide text-stone-900";

export default function Checkout() {
  const [view, setView] = useState<ProductView>(FEATURED_PRODUCT.views[0]);
  const [direction, setDirection] = useState(1);
  const [color, setColor] = useState(COLORS[0].id);
  const [justAdded, setJustAdded] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(CATALOG.map((product) => [product.id, 1])),
  );
  const [celebrationCount, setCelebrationCount] = useState(0);
  const [receipt, setReceipt] = useState<{
    itemCount: number;
    total: number;
  } | null>(null);
  const receiptTimer = useRef<ReturnType<typeof setTimeout>>();
  const addedTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(
    () => () => {
      clearTimeout(receiptTimer.current);
      clearTimeout(addedTimer.current);
    },
    [],
  );

  const lines = useMemo<CartLine[]>(
    () =>
      CATALOG.map((product) => ({
        ...product,
        quantity: quantities[product.id] ?? 0,
      })).filter((line) => line.quantity > 0),
    [quantities],
  );

  const itemCount = lines.reduce((count, line) => count + line.quantity, 0);
  const subtotal = lines.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0,
  );
  const delivery =
    lines.length === 0 || subtotal >= FREE_DELIVERY_THRESHOLD
      ? 0
      : DELIVERY_FEE;
  const total = subtotal + delivery;

  const setQuantity = (product: Product, quantity: number) => {
    setQuantities((prev) => ({
      ...prev,
      [product.id]: Math.min(MAX_QUANTITY, Math.max(0, quantity)),
    }));
  };

  const clearCart = () => {
    setQuantities(Object.fromEntries(CATALOG.map((product) => [product.id, 0])));
  };

  const checkout = () => {
    if (lines.length === 0) return;
    setReceipt({ itemCount, total });
    setCelebrationCount((count) => count + 1);
    clearCart();
    clearTimeout(receiptTimer.current);
    receiptTimer.current = setTimeout(
      () => setReceipt(null),
      RECEIPT_DURATION,
    );
  };

  const selectView = (next: ProductView) => {
    if (next.id === view.id) return;
    const currentIndex = FEATURED_PRODUCT.views.findIndex(
      (candidate) => candidate.id === view.id,
    );
    const nextIndex = FEATURED_PRODUCT.views.findIndex(
      (candidate) => candidate.id === next.id,
    );
    setDirection(nextIndex > currentIndex ? 1 : -1);
    setView(next);
  };

  const addToCart = () => {
    setQuantities((prev) => ({
      ...prev,
      [FEATURED_ID]: Math.min(MAX_QUANTITY, (prev[FEATURED_ID] ?? 0) + 1),
    }));
    setJustAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setJustAdded(false), ADDED_DURATION);
  };

  return (
    <main className="flex h-full flex-col overflow-y-auto bg-stone-100 md:flex-row md:overflow-hidden">
      {/* ---------- Product ---------- */}
      <section className="flex flex-col gap-6 border-stone-200 p-6 md:w-1/2 md:overflow-y-auto md:border-r lg:p-10">
        <header className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-800/80">
              Furniture Store
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 lg:text-3xl">
              {FEATURED_PRODUCT.name}
            </h1>
          </div>
          <p className="text-2xl font-bold text-stone-900">
            {formatPrice(FEATURED_PRODUCT.price)}
          </p>
        </header>

        <div className="flex flex-col-reverse gap-4 md:flex-row">
          <div className="flex gap-3 md:flex-col">
            {FEATURED_PRODUCT.views.map((productView) => (
              <button
                key={productView.id}
                type="button"
                aria-label={`Show ${productView.label.toLowerCase()} view`}
                aria-pressed={view.id === productView.id}
                onClick={() => selectView(productView)}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-700 hover:ring-stone-400 ${
                  view.id === productView.id
                    ? "ring-stone-700"
                    : "ring-transparent"
                }`}
              >
                <Image
                  src={`/d2/${productView.id}.jpg`}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
          <div className="relative flex flex-1 items-center justify-center overflow-hidden p-6 md:p-10">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={view.id}
                initial={{ x: direction * 100 + "%" }}
                animate={{ x: "0%" }}
                exit={{ x: direction * -100 + "%" }}
                transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
                className="w-full max-w-sm"
              >
                <Image
                  src={`/d2/${view.id}.jpg`}
                  alt={`${FEATURED_PRODUCT.name}, ${view.label.toLowerCase()} view`}
                  width={480}
                  height={480}
                  priority
                  className="h-auto w-full rounded-2xl object-contain shadow-md"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="grid gap-6 border-t border-stone-200 pt-6 sm:grid-cols-[auto,1fr] sm:gap-12">
          <div>
            <h2 className={sectionHeading}>Colors</h2>
            <div className="mt-3 flex items-center gap-3">
              {COLORS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  title={option.label}
                  aria-label={option.label}
                  aria-pressed={color === option.id}
                  onClick={() => setColor(option.id)}
                  className={`h-8 w-8 rounded-full shadow-md transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-700 focus-visible:ring-offset-2 ${option.swatch} ${
                    color === option.id ? "ring-2 ring-stone-700 ring-offset-2" : ""
                  }`}
                />
              ))}
            </div>
          </div>
          <div>
            <h2 className={sectionHeading}>Description</h2>
            <p className="mt-3 text-sm leading-6 text-stone-500">
              {FEATURED_PRODUCT.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <motion.button
            type="button"
            onClick={addToCart}
            whileTap={{ scale: 0.97 }}
            className={`flex h-11 items-center gap-2 rounded-xl px-6 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-700 focus-visible:ring-offset-2 ${
              justAdded
                ? "bg-emerald-600 hover:bg-emerald-600"
                : "bg-stone-900 hover:bg-stone-700"
            }`}
          >
            {justAdded ? (
              <Check fontSize="small" />
            ) : (
              <AddShoppingCart fontSize="small" />
            )}
            {justAdded ? "Added!" : "Add to cart"}
          </motion.button>
          {(quantities[FEATURED_ID] ?? 0) > 0 && (
            <p className="text-sm text-stone-500" aria-live="polite">
              {quantities[FEATURED_ID]} in cart
            </p>
          )}
        </div>
      </section>

      {/* ---------- Cart ---------- */}
      <section className="flex w-full flex-col gap-5 p-6 md:w-1/2 md:overflow-y-auto lg:p-10">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-stone-900">
              Cart
            </h2>
            <p className="text-sm text-stone-500">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
          {lines.length > 0 && (
            <button
              type="button"
              aria-label="Clear cart"
              onClick={clearCart}
              className="grid h-9 w-9 place-items-center rounded-full text-stone-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-700"
            >
              <DeleteOutline />
            </button>
          )}
        </header>

        {lines.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {lines.map((line) => (
              <li key={line.id}>
                <CartItem line={line} onChangeQuantity={setQuantity} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 p-8 text-center text-sm text-stone-400">
            Your cart is empty - add something you love.
          </div>
        )}

        <CheckoutTotal
          subtotal={subtotal}
          delivery={delivery}
          total={total}
          onCheckout={checkout}
          disabled={lines.length === 0}
        />

        <AnimatePresence>
          {receipt && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200"
            >
              <TaskAlt fontSize="small" />
              Order placed - {receipt.itemCount}{" "}
              {receipt.itemCount === 1 ? "item" : "items"} for{" "}
              {formatPrice(receipt.total)}!
            </motion.div>
          )}
        </AnimatePresence>

        {celebrationCount > 0 && <Confetti key={celebrationCount} />}
      </section>
    </main>
  );
}

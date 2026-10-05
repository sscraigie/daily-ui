export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};

export type CartLine = Product & { quantity: number };

export type ProductView = {
  id: string;
  label: string;
};

export const CATALOG: Product[] = [
  { id: "table", name: "Wooden Top Table", price: 560, image: "/d2/table.jpg" },
  { id: "chair", name: "Wooden Plywood Chair", price: 600, image: "/d2/main.jpg" },
  { id: "sofa", name: "Single Lamb-Like Sofa", price: 680, image: "/d2/sofa.jpg" },
];

export const FEATURED_ID = "chair";

export const FEATURED_PRODUCT = {
  name: "Molded Plywood Chair",
  price: 600,
  description:
    "A molded plywood chair with three splayed legs - light, durable and made to suit every modern home. Upholstered seat cushion with a smooth matte finish. Suitable for living rooms and lounges, available in three colors.",
  views: [
    { id: "main", label: "Angle" },
    { id: "side", label: "Side" },
    { id: "front", label: "Front" },
    { id: "back", label: "Back" },
  ] satisfies ProductView[],
};

export const COLORS = [
  { id: "walnut", label: "Walnut", swatch: "bg-stone-700" },
  { id: "cedar", label: "Cedar", swatch: "bg-orange-800" },
  { id: "ash", label: "Ash", swatch: "bg-stone-400" },
];

export const DELIVERY_FEE = 49;
export const FREE_DELIVERY_THRESHOLD = 2000;
export const MAX_QUANTITY = 99;

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const formatPrice = (amount: number) => usd.format(amount);

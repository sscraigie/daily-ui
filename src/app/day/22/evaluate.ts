/**
 * Day 22 — Spotlight math + conversion engines.
 *
 * A tiny recursive-descent parser evaluates calculator expressions the way
 * macOS Spotlight does: type "2+2*10" and a result row appears. Also handles
 * unit + currency conversions ("5 km to mi", "100 usd to eur").
 */

/* ------------------------------ tokenizer ------------------------------ */

type Token =
  | { type: "num"; value: number }
  | { type: "ident"; value: string }
  | { type: "op"; value: string }
  | { type: "lparen" }
  | { type: "rparen" };

function tokenize(input: string): Token[] | null {
  const tokens: Token[] = [];
  let i = 0;
  const src = input.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/,/g, "");

  while (i < src.length) {
    const ch = src[i];
    if (ch === " ") {
      i += 1;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j += 1;
      const value = Number(src.slice(i, j));
      if (!isFinite(value)) return null;
      tokens.push({ type: "num", value });
      i = j;
      continue;
    }
    if (/[a-zA-Z]/.test(ch)) {
      let j = i;
      while (j < src.length && /[a-zA-Z]/.test(src[j])) j += 1;
      tokens.push({ type: "ident", value: src.slice(i, j).toLowerCase() });
      i = j;
      continue;
    }
    if ("+-*/^%".includes(ch)) {
      tokens.push({ type: "op", value: ch });
      i += 1;
      continue;
    }
    if (ch === "(") {
      tokens.push({ type: "lparen" });
      i += 1;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "rparen" });
      i += 1;
      continue;
    }
    return null; // unknown character -> not an expression
  }
  return tokens;
}

/* -------------------------------- parser ------------------------------- */

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
  tau: Math.PI * 2,
  phi: (1 + Math.sqrt(5)) / 2,
};

const FUNCTIONS: Record<string, (x: number) => number> = {
  sqrt: Math.sqrt,
  abs: Math.abs,
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  log: Math.log10,
  ln: Math.log,
};

class Parser {
  private pos = 0;

  constructor(private tokens: Token[]) {}

  parse(): number {
    const value = this.parseExpr();
    if (this.pos < this.tokens.length) throw new Error("unexpected token");
    return value;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private parseExpr(): number {
    let value = this.parseTerm();
    for (;;) {
      const t = this.peek();
      if (t?.type === "op" && (t.value === "+" || t.value === "-")) {
        this.pos += 1;
        const rhs = this.parseTerm();
        value = t.value === "+" ? value + rhs : value - rhs;
      } else {
        return value;
      }
    }
  }

  private parseTerm(): number {
    let value = this.parseFactor();
    for (;;) {
      const t = this.peek();
      if (t?.type === "op" && (t.value === "*" || t.value === "/" || t.value === "%")) {
        this.pos += 1;
        const rhs = this.parseFactor();
        if (t.value === "*") value *= rhs;
        else if (t.value === "/") value /= rhs;
        else value %= rhs;
      } else if (
        (t?.type === "num" || t?.type === "ident" || t?.type === "lparen") &&
        // implicit multiplication: 2pi, 3(4+1), 2 sqrt(9)
        (this.tokens[this.pos - 1]?.type === "num" ||
          this.tokens[this.pos - 1]?.type === "rparen" ||
          this.tokens[this.pos - 1]?.type === "ident")
      ) {
        value *= this.parseFactor();
      } else {
        return value;
      }
    }
  }

  private parseFactor(): number {
    const t = this.peek();
    if (t?.type === "op" && (t.value === "-" || t.value === "+")) {
      this.pos += 1;
      const value = this.parseFactor();
      return t.value === "-" ? -value : value;
    }
    return this.parsePower();
  }

  private parsePower(): number {
    const base = this.parsePrimary();
    const t = this.peek();
    if (t?.type === "op" && t.value === "^") {
      this.pos += 1;
      return Math.pow(base, this.parseFactor());
    }
    return base;
  }

  private parsePrimary(): number {
    const t = this.peek();
    if (!t) throw new Error("unexpected end");
    this.pos += 1;
    if (t.type === "num") return t.value;
    if (t.type === "lparen") {
      const value = this.parseExpr();
      if (this.peek()?.type !== "rparen") throw new Error("missing )");
      this.pos += 1;
      return value;
    }
    if (t.type === "ident") {
      const name = t.value;
      // sqrt(9), sin(pi/2), log 100 — function call with or without parens
      const fn = FUNCTIONS[name];
      if (fn) {
        if (this.peek()?.type === "lparen") {
          this.pos += 1;
          const arg = this.parseExpr();
          if (this.peek()?.type !== "rparen") throw new Error("missing )");
          this.pos += 1;
          return fn(arg);
        }
        return fn(this.parseFactor());
      }
      if (name in CONSTANTS) return CONSTANTS[name];
      throw new Error(`unknown name ${name}`);
    }
    throw new Error("unexpected token");
  }
}

export function evalExpression(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 60) return null;
  // must contain a digit or constant to be considered math
  if (!/[0-9]|pi|e\b/.test(trimmed.toLowerCase())) return null;
  try {
    const tokens = tokenize(trimmed);
    if (!tokens) return null;
    const value = new Parser(tokens).parse();
    return isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

export function formatNumber(value: number): string {
  if (Number.isInteger(value) && Math.abs(value) < 1e15) return value.toLocaleString("en-US");
  const abs = Math.abs(value);
  if (abs !== 0 && (abs < 1e-6 || abs >= 1e12)) return value.toExponential(6).replace(/\.?0+e/, "e");
  const rounded = Number(value.toPrecision(10));
  const [int, dec] = rounded.toString().split(".");
  return Number(int).toLocaleString("en-US") + (dec ? `.${dec}` : "");
}

/* ------------------------------ conversions ---------------------------- */

type UnitDef = { base: string; factor: number; label: string };

const UNITS: Record<string, UnitDef> = {
  // length (base: meters)
  km: { base: "len", factor: 1000, label: "kilometers" },
  kilometer: { base: "len", factor: 1000, label: "kilometers" },
  kilometers: { base: "len", factor: 1000, label: "kilometers" },
  m: { base: "len", factor: 1, label: "meters" },
  meter: { base: "len", factor: 1, label: "meters" },
  meters: { base: "len", factor: 1, label: "meters" },
  cm: { base: "len", factor: 0.01, label: "centimeters" },
  mm: { base: "len", factor: 0.001, label: "millimeters" },
  mi: { base: "len", factor: 1609.344, label: "miles" },
  mile: { base: "len", factor: 1609.344, label: "miles" },
  miles: { base: "len", factor: 1609.344, label: "miles" },
  yd: { base: "len", factor: 0.9144, label: "yards" },
  yard: { base: "len", factor: 0.9144, label: "yards" },
  yards: { base: "len", factor: 0.9144, label: "yards" },
  ft: { base: "len", factor: 0.3048, label: "feet" },
  foot: { base: "len", factor: 0.3048, label: "feet" },
  feet: { base: "len", factor: 0.3048, label: "feet" },
  in: { base: "len", factor: 0.0254, label: "inches" },
  inch: { base: "len", factor: 0.0254, label: "inches" },
  inches: { base: "len", factor: 0.0254, label: "inches" },
  nmi: { base: "len", factor: 1852, label: "nautical miles" },

  // mass (base: kilograms)
  kg: { base: "mass", factor: 1, label: "kilograms" },
  kilogram: { base: "mass", factor: 1, label: "kilograms" },
  kilograms: { base: "mass", factor: 1, label: "kilograms" },
  g: { base: "mass", factor: 0.001, label: "grams" },
  gram: { base: "mass", factor: 0.001, label: "grams" },
  grams: { base: "mass", factor: 0.001, label: "grams" },
  mg: { base: "mass", factor: 1e-6, label: "milligrams" },
  lb: { base: "mass", factor: 0.45359237, label: "pounds" },
  lbs: { base: "mass", factor: 0.45359237, label: "pounds" },
  pound: { base: "mass", factor: 0.45359237, label: "pounds" },
  pounds: { base: "mass", factor: 0.45359237, label: "pounds" },
  oz: { base: "mass", factor: 0.028349523125, label: "ounces" },
  ounce: { base: "mass", factor: 0.028349523125, label: "ounces" },
  ounces: { base: "mass", factor: 0.028349523125, label: "ounces" },
  st: { base: "mass", factor: 6.35029318, label: "stones" },

  // volume (base: liters)
  l: { base: "vol", factor: 1, label: "liters" },
  liter: { base: "vol", factor: 1, label: "liters" },
  liters: { base: "vol", factor: 1, label: "liters" },
  ml: { base: "vol", factor: 0.001, label: "milliliters" },
  gal: { base: "vol", factor: 3.785411784, label: "gallons" },
  gallon: { base: "vol", factor: 3.785411784, label: "gallons" },
  gallons: { base: "vol", factor: 3.785411784, label: "gallons" },
  qt: { base: "vol", factor: 0.946352946, label: "quarts" },
  cup: { base: "vol", factor: 0.2365882365, label: "cups" },
  cups: { base: "vol", factor: 0.2365882365, label: "cups" },

  // data (base: bytes)
  b: { base: "data", factor: 1, label: "bytes" },
  kb: { base: "data", factor: 1000, label: "kilobytes" },
  mb: { base: "data", factor: 1e6, label: "megabytes" },
  gb: { base: "data", factor: 1e9, label: "gigabytes" },
  tb: { base: "data", factor: 1e12, label: "terabytes" },

  // speed (base: km/h)
  kmh: { base: "speed", factor: 1, label: "kilometers per hour" },
  kph: { base: "speed", factor: 1, label: "kilometers per hour" },
  mph: { base: "speed", factor: 1.609344, label: "miles per hour" },
  kn: { base: "speed", factor: 1.852, label: "knots" },

  // temperature handled separately, but alias tokens to the same family
  c: { base: "temp", factor: 1, label: "celsius" },
  "°c": { base: "temp", factor: 1, label: "celsius" },
  celsius: { base: "temp", factor: 1, label: "celsius" },
  f: { base: "temp", factor: 1, label: "fahrenheit" },
  "°f": { base: "temp", factor: 1, label: "fahrenheit" },
  fahrenheit: { base: "temp", factor: 1, label: "fahrenheit" },
  k: { base: "temp", factor: 1, label: "kelvin" },
  kelvin: { base: "temp", factor: 1, label: "kelvin" },
};

// static mid-2026 style rates, relative to USD
const CURRENCIES: Record<string, { perUsd: number; label: string }> = {
  usd: { perUsd: 1, label: "US dollars" },
  eur: { perUsd: 0.92, label: "euros" },
  gbp: { perUsd: 0.79, label: "British pounds" },
  jpy: { perUsd: 149.5, label: "Japanese yen" },
  cad: { perUsd: 1.36, label: "Canadian dollars" },
  aud: { perUsd: 1.51, label: "Australian dollars" },
  nok: { perUsd: 10.72, label: "Norwegian krone" },
  sek: { perUsd: 10.41, label: "Swedish krona" },
};

const TEMP_ALIASES: Record<string, string> = {
  c: "c", "°c": "c", celsius: "c",
  f: "f", "°f": "f", fahrenheit: "f",
  k: "k", kelvin: "k",
};

function convertTemp(value: number, from: string, to: string): number | null {
  const f = TEMP_ALIASES[from];
  const t = TEMP_ALIASES[to];
  if (!f || !t) return null;
  const celsius = f === "c" ? value : f === "f" ? ((value - 32) * 5) / 9 : value - 273.15;
  return t === "c" ? celsius : t === "f" ? (celsius * 9) / 5 + 32 : celsius + 273.15;
}

export type Conversion = {
  input: string;
  output: string;
  detail: string;
  rawValue: number;
  from: string;
  to: string;
};

const CONVERSION_RE =
  /^(-?[\d,.]+)\s*([a-zA-Z°]+)\s*(?:to|in|into|as|=|->)\s*([a-zA-Z°]+)\.?\s*$/i;

export function tryConvert(raw: string): Conversion | null {
  const m = CONVERSION_RE.exec(raw.trim());
  if (!m) return null;
  const value = Number(m[1].replace(/,/g, ""));
  if (!isFinite(value)) return null;
  const from = m[2].toLowerCase();
  const to = m[3].toLowerCase();
  if (from === to) return null;

  // currency?
  if (CURRENCIES[from] && CURRENCIES[to]) {
    const rate = CURRENCIES[to].perUsd / CURRENCIES[from].perUsd;
    const result = value * rate;
    const symbol: Record<string, string> = { usd: "$", eur: "€", gbp: "£", jpy: "¥", cad: "C$", aud: "A$", nok: "kr", sek: "kr" };
    const fmt = (n: number, cur: string) => {
      const decimals = CURRENCIES[cur].perUsd < 0.1 ? 0 : 2;
      return `${symbol[cur]}${formatNumber(Number(n.toFixed(decimals)))}`;
    };
    return {
      input: `${formatNumber(value)} ${CURRENCIES[from].label}`,
      output: fmt(result, to),
      detail: `1 ${from.toUpperCase()} ≈ ${formatNumber(Number(rate.toPrecision(6)))} ${to.toUpperCase()} · approximate rate`,
      rawValue: result,
      from: from.toUpperCase(),
      to: to.toUpperCase(),
    };
  }

  // temperature?
  const temp = convertTemp(value, from, to);
  if (temp !== null) {
    const names: Record<string, string> = { c: "°C", f: "°F", k: "K" };
    const labels: Record<string, string> = { c: "Celsius", f: "Fahrenheit", k: "Kelvin" };
    return {
      input: `${formatNumber(value)}° on the ${labels[TEMP_ALIASES[from]]} scale`.replace("° on", ` ${names[TEMP_ALIASES[from]]} on`),
      output: `${formatNumber(Number(temp.toFixed(2)))} ${names[TEMP_ALIASES[to]]}`,
      detail: `${labels[TEMP_ALIASES[from]]} to ${labels[TEMP_ALIASES[to]]}`,
      rawValue: temp,
      from,
      to,
    };
  }

  // general units?
  const fu = UNITS[from];
  const tu = UNITS[to];
  if (fu && tu && fu.base === tu.base && fu.base !== "temp") {
    const result = (value * fu.factor) / tu.factor;
    return {
      input: `${formatNumber(value)} ${fu.label}`,
      output: `${formatNumber(Number(result.toPrecision(10)))} ${tu.label}`,
      detail: `${fu.base === "len" ? "Length" : fu.base === "mass" ? "Weight" : fu.base === "vol" ? "Volume" : fu.base === "data" ? "Data" : "Speed"} conversion`,
      rawValue: result,
      from,
      to,
    };
  }
  return null;
}

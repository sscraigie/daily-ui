"use client";

import { useEffect, useReducer } from "react";
import { CalcButton } from "./CalcButton";

type Operator = "+" | "-" | "×" | "÷";

type State = {
  display: string;
  acc: number | null;
  op: Operator | null;
  waiting: boolean;
  lastOp: Operator | null;
  lastOperand: number | null;
  error: boolean;
};

type Action =
  | { type: "digit"; value: string }
  | { type: "operator"; value: Operator }
  | { type: "equals" }
  | { type: "clear" }
  | { type: "sign" }
  | { type: "percent" }
  | { type: "backspace" };

const MAX_DIGITS = 9;

export const initialState: State = {
  display: "0",
  acc: null,
  op: null,
  waiting: true,
  lastOp: null,
  lastOperand: null,
  error: false,
};

const errorState: State = { ...initialState, display: "Error", error: true };

const compute = (a: number, b: number, op: Operator): number => {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      return a / b;
  }
};

const format = (n: number): string => {
  if (Object.is(n, -0)) n = 0;
  if (!isFinite(n)) return "Error";
  const abs = Math.abs(n);
  if (n !== 0 && (abs >= 1e9 || abs < 1e-6)) {
    return n.toExponential(5).replace(/\.?0+e/, "e");
  }
  return String(parseFloat(n.toPrecision(9)));
};

const digitCount = (s: string): number => s.replace(/[^0-9]/g, "").length;

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "digit": {
      const fresh = action.value === "." ? "0." : action.value;
      if (state.error) {
        return { ...initialState, display: fresh, waiting: false };
      }
      if (state.waiting || state.display.includes("e")) {
        return { ...state, display: fresh, waiting: false };
      }
      if (action.value === ".") {
        if (state.display.includes(".")) return state;
        return { ...state, display: state.display + "." };
      }
      if (digitCount(state.display) >= MAX_DIGITS) return state;
      const base =
        state.display === "0" || state.display === "-0"
          ? state.display.slice(0, -1)
          : state.display;
      return { ...state, display: base + action.value };
    }
    case "operator": {
      if (state.error) return state;
      const current = parseFloat(state.display) || 0;
      if (state.op !== null && !state.waiting) {
        const result = compute(state.acc ?? 0, current, state.op);
        if (!isFinite(result)) return errorState;
        return {
          ...state,
          acc: result,
          op: action.value,
          display: format(result),
          waiting: true,
          lastOp: null,
          lastOperand: null,
        };
      }
      if (state.op === null) {
        return {
          ...state,
          acc: current,
          op: action.value,
          display: format(current),
          waiting: true,
          lastOp: null,
          lastOperand: null,
        };
      }
      return { ...state, op: action.value };
    }
    case "equals": {
      if (state.error) return state;
      const current = parseFloat(state.display) || 0;
      if (state.op !== null) {
        const result = compute(state.acc ?? 0, current, state.op);
        if (!isFinite(result)) return errorState;
        return {
          ...state,
          display: format(result),
          acc: null,
          op: null,
          waiting: true,
          lastOp: state.op,
          lastOperand: current,
        };
      }
      if (state.lastOp !== null) {
        const result = compute(current, state.lastOperand ?? 0, state.lastOp);
        if (!isFinite(result)) return errorState;
        return { ...state, display: format(result), waiting: true };
      }
      return { ...state, waiting: true };
    }
    case "clear": {
      if (state.error) return initialState;
      if (state.display !== "0") {
        return { ...state, display: "0", waiting: true };
      }
      return initialState;
    }
    case "sign": {
      if (state.error) return state;
      if (state.display.includes("e")) {
        return { ...state, display: format(-parseFloat(state.display)) };
      }
      if (state.display.startsWith("-")) {
        return { ...state, display: state.display.slice(1) };
      }
      return { ...state, display: "-" + state.display };
    }
    case "percent": {
      if (state.error) return state;
      return {
        ...state,
        display: format((parseFloat(state.display) || 0) / 100),
        waiting: false,
      };
    }
    case "backspace": {
      if (state.error || state.waiting || state.display.includes("e")) {
        return state;
      }
      const next = state.display.slice(0, -1);
      if (next === "" || next === "-" || next === "-0") {
        return { ...state, display: "0" };
      }
      return { ...state, display: next };
    }
  }
}

export const Calculator = ({ keyboard = false }: { keyboard?: boolean }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!keyboard) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key;
      if (/^[0-9]$/.test(key)) {
        dispatch({ type: "digit", value: key });
      } else if (key === "." || key === ",") {
        dispatch({ type: "digit", value: "." });
      } else if (key === "+") {
        dispatch({ type: "operator", value: "+" });
      } else if (key === "-") {
        dispatch({ type: "operator", value: "-" });
      } else if (key === "*") {
        dispatch({ type: "operator", value: "×" });
      } else if (key === "/") {
        event.preventDefault();
        dispatch({ type: "operator", value: "÷" });
      } else if (key === "Enter" || key === "=") {
        dispatch({ type: "equals" });
      } else if (key === "Escape") {
        dispatch({ type: "clear" });
      } else if (key === "%") {
        dispatch({ type: "percent" });
      } else if (key === "Backspace") {
        event.preventDefault();
        dispatch({ type: "backspace" });
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [keyboard]);

  const hint =
    state.acc !== null && state.op !== null
      ? `${format(state.acc)} ${state.op}`
      : "";

  const clearLabel = state.error || state.display === "0" ? "AC" : "C";

  const displaySize = state.error
    ? "text-5xl md:text-[48px]"
    : state.display.length <= 9
    ? "text-6xl md:text-[56px]"
    : state.display.length <= 12
    ? "text-5xl md:text-[42px]"
    : "text-4xl md:text-[32px]";

  return (
    <div className="flex min-h-0 flex-1 select-none flex-col bg-black text-white">
      <div
        aria-live="polite"
        className="flex min-h-[60px] flex-1 flex-col items-end justify-end px-5 pb-1 md:min-h-[76px] md:px-6 md:pb-2"
      >
        <span className="text-white/35 h-7 text-xl tabular-nums">{hint}</span>
        <span
          className={`${displaySize} truncate tabular-nums leading-none tracking-tight`}
        >
          {state.display}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3 px-3 pb-4 md:px-4 md:pb-10">
        <CalcButton
          label={clearLabel}
          variant="function"
          ariaLabel={clearLabel === "AC" ? "All clear" : "Clear entry"}
          onPress={() => dispatch({ type: "clear" })}
        />
        <CalcButton
          label="+/−"
          variant="function"
          ariaLabel="Toggle sign"
          onPress={() => dispatch({ type: "sign" })}
        />
        <CalcButton
          label="%"
          variant="function"
          ariaLabel="Percent"
          onPress={() => dispatch({ type: "percent" })}
        />
        <CalcButton
          label="÷"
          variant="operator"
          ariaLabel="Divide"
          highlighted={state.op === "÷"}
          onPress={() => dispatch({ type: "operator", value: "÷" })}
        />

        <CalcButton
          label="7"
          onPress={() => dispatch({ type: "digit", value: "7" })}
        />
        <CalcButton
          label="8"
          onPress={() => dispatch({ type: "digit", value: "8" })}
        />
        <CalcButton
          label="9"
          onPress={() => dispatch({ type: "digit", value: "9" })}
        />
        <CalcButton
          label="×"
          variant="operator"
          ariaLabel="Multiply"
          highlighted={state.op === "×"}
          onPress={() => dispatch({ type: "operator", value: "×" })}
        />

        <CalcButton
          label="4"
          onPress={() => dispatch({ type: "digit", value: "4" })}
        />
        <CalcButton
          label="5"
          onPress={() => dispatch({ type: "digit", value: "5" })}
        />
        <CalcButton
          label="6"
          onPress={() => dispatch({ type: "digit", value: "6" })}
        />
        <CalcButton
          label="-"
          variant="operator"
          ariaLabel="Subtract"
          highlighted={state.op === "-"}
          onPress={() => dispatch({ type: "operator", value: "-" })}
        />

        <CalcButton
          label="1"
          onPress={() => dispatch({ type: "digit", value: "1" })}
        />
        <CalcButton
          label="2"
          onPress={() => dispatch({ type: "digit", value: "2" })}
        />
        <CalcButton
          label="3"
          onPress={() => dispatch({ type: "digit", value: "3" })}
        />
        <CalcButton
          label="+"
          variant="operator"
          ariaLabel="Add"
          highlighted={state.op === "+"}
          onPress={() => dispatch({ type: "operator", value: "+" })}
        />

        <CalcButton
          label="0"
          wide
          ariaLabel="Zero"
          onPress={() => dispatch({ type: "digit", value: "0" })}
        />
        <CalcButton
          label="."
          ariaLabel="Decimal point"
          onPress={() => dispatch({ type: "digit", value: "." })}
        />
        <CalcButton
          label="="
          variant="operator"
          ariaLabel="Equals"
          onPress={() => dispatch({ type: "equals" })}
        />
      </div>
    </div>
  );
};

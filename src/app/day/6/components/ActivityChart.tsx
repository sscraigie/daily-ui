import React from "react";

const EMPTY = "#161b22";
const colors = [EMPTY, "#0e4429", "#006d32", "#26a641", "#39d353"];

const WEEKS = 53;
const DAYS = 7;
const CELL = 12;
const GAP = 3;

const MONTHS = [
  { name: "Jan", col: 0 },
  { name: "Feb", col: 4 },
  { name: "Mar", col: 8 },
  { name: "Apr", col: 13 },
  { name: "May", col: 17 },
  { name: "Jun", col: 21 },
  { name: "Jul", col: 26 },
  { name: "Aug", col: 30 },
  { name: "Sep", col: 34 },
  { name: "Oct", col: 39 },
  { name: "Nov", col: 43 },
  { name: "Dec", col: 47 },
];

// Deterministic pseudo-random so SSR and client renders match.
const levelFor = (week: number, day: number) => {
  const n = Math.sin(week * 12.9898 + day * 78.233) * 43758.5453;
  const f = n - Math.floor(n);
  const bias = (week / WEEKS) * 0.15;
  if (f < 0.6 - bias) return 0;
  if (f < 0.78 - bias) return 1;
  if (f < 0.9 - bias) return 2;
  if (f < 0.97 - bias) return 3;
  return 4;
};

const levels = Array.from({ length: WEEKS }, (_, week) =>
  Array.from({ length: DAYS }, (_, day) => levelFor(week, day)),
);

const total = levels.flat().reduce((sum: number, level) => sum + level, 0);

export const ActivityChart = () => {
  return (
    <section className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base text-white">
          {total} contributions in the last year
        </h2>
        <a className="flex cursor-pointer items-center gap-1 text-sm text-[#7e8590] hover:text-[#4c81f9]">
          Contribution settings
          <svg
            aria-hidden="true"
            height="16"
            viewBox="0 0 16 16"
            version="1.1"
            width="16"
            className="fill-current"
          >
            <path d="m4.427 7.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z"></path>
          </svg>
        </a>
      </div>
      <div className="rounded-lg border border-solid border-[#31363d] p-4">
        <div className="overflow-x-auto pb-1">
          <div style={{ minWidth: 27 + WEEKS * (CELL + GAP) }}>
            <div
              className="relative h-4 text-[10px] text-[#7e8590]"
              style={{ marginLeft: 27 }}
            >
              {MONTHS.map((month) => (
                <span
                  key={month.name}
                  className="absolute"
                  style={{ left: month.col * (CELL + GAP) }}
                >
                  {month.name}
                </span>
              ))}
            </div>
            <div className="flex gap-[3px]">
              <div
                className="flex w-6 shrink-0 flex-col text-[9px] text-[#7e8590]"
                style={{ gap: GAP }}
              >
                {["", "Mon", "", "Wed", "", "Fri", ""].map((label, i) => (
                  <span
                    key={i}
                    className="flex h-3 items-center leading-none"
                    style={{ height: CELL }}
                  >
                    {label}
                  </span>
                ))}
              </div>
              <div
                className="grid"
                style={{
                  gridTemplateRows: `repeat(7, ${CELL}px)`,
                  gridAutoFlow: "column",
                  gridAutoColumns: `${CELL}px`,
                  gap: GAP,
                }}
              >
                {levels.map((week, w) =>
                  week.map((level, d) => (
                    <span
                      key={`${w}-${d}`}
                      className="h-3 w-3 rounded-[2px]"
                      style={{ backgroundColor: colors[level] }}
                    />
                  )),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

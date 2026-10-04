import React from "react";
import Wifi from "@mui/icons-material/Wifi";

const sideButton =
  "absolute hidden w-[3px] rounded-l-[2px] bg-gradient-to-r from-zinc-600 to-zinc-400 md:block";

export const IPhoneFrame = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative h-full w-full origin-center md:h-auto md:w-auto max-md:[@media(max-height:520px)]:scale-[0.65] max-md:[@media(max-height:620px)]:scale-[0.8] max-md:[@media(max-height:700px)]:scale-90 md:[@media(max-height:722px)]:scale-[0.58] md:[@media(max-height:806px)]:scale-[0.72] md:[@media(max-height:872px)]:scale-[0.82] md:[@media(max-height:956px)]:scale-90">
      {/* Hardware buttons */}
      <div className={`${sideButton} -left-[3px] top-[150px] h-[28px]`} />
      <div className={`${sideButton} -left-[3px] top-[198px] h-[58px]`} />
      <div className={`${sideButton} -left-[3px] top-[266px] h-[58px]`} />
      <div className="absolute -right-[3px] top-[220px] hidden h-[88px] w-[3px] rounded-r-[2px] bg-gradient-to-l from-zinc-600 to-zinc-400 md:block" />

      {/* Titanium rim + black bezel */}
      <div className="h-full w-full md:h-auto md:w-auto md:rounded-[64px] md:bg-gradient-to-b md:from-[#55555c] md:via-[#232327] md:to-[#494951] md:p-[3px] md:shadow-[0_60px_120px_-30px_rgba(0,0,0,0.9),0_0_60px_rgba(0,0,0,0.5)]">
        <div className="h-full w-full md:h-auto md:w-auto md:rounded-[61px] md:bg-[#050507] md:p-[12px]">
          {/* Screen */}
          <div className="relative flex h-full w-full flex-col overflow-hidden bg-black md:h-[812px] md:w-[375px] md:rounded-[50px]">
            {/* Dynamic island */}
            <div className="absolute left-1/2 top-[11px] z-20 hidden h-[35px] w-[122px] -translate-x-1/2 items-center justify-end rounded-full bg-black pr-[13px] ring-1 ring-white/[0.07] md:flex">
              <div className="h-[11px] w-[11px] rounded-full bg-[#0e0e16] ring-1 ring-white/10" />
            </div>

            {/* Status bar */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 hidden h-[54px] items-center justify-between px-[32px] text-white md:flex">
              <span className="w-[54px] text-center text-[16px] font-semibold tracking-tight">
                9:41
              </span>
              <div className="flex items-center gap-[6px]">
                <svg
                  width="18"
                  height="12"
                  viewBox="0 0 18 12"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <rect x="0" y="7" width="3" height="5" rx="1" />
                  <rect x="5" y="5" width="3" height="7" rx="1" />
                  <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
                  <rect x="15" y="0" width="3" height="12" rx="1" />
                </svg>
                <Wifi sx={{ fontSize: 17 }} />
                <div className="flex items-center">
                  <div className="h-[12px] w-[25px] rounded-[4px] border border-white/40 p-[2px]">
                    <div className="h-full w-4/5 rounded-[2.5px] bg-white" />
                  </div>
                  <div className="ml-[1px] h-[4px] w-[2px] rounded-r-full bg-white/40" />
                </div>
              </div>
            </div>

            {children}

            {/* Home indicator */}
            <div className="absolute bottom-[8px] left-1/2 z-20 hidden h-[5px] w-[135px] -translate-x-1/2 rounded-full bg-white/80 md:block" />

            {/* Screen sheen */}
            <div className="pointer-events-none absolute inset-0 z-30 hidden rounded-[50px] bg-gradient-to-tr from-transparent via-transparent to-white/[0.05] md:block" />
          </div>
        </div>
      </div>
    </div>
  );
};

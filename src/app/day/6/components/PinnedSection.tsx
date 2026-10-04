import React from "react";

type PinProps = {
  title: string;
  description: string;
  lang: string;
  langColor: string;
};

export const Pins = ({
  title,
  description,
  lang,
  langColor,
}: PinProps) => {
  return (
    <div className="flex flex-col rounded-lg border border-solid border-[#31363d] p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <svg
            aria-hidden="true"
            height="16"
            viewBox="0 0 16 16"
            version="1.1"
            width="16"
            className="shrink-0 fill-[#7e8590]"
          >
            <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
          </svg>
          <a className="cursor-pointer text-sm font-semibold text-[#4c81f9] hover:underline">
            {title}
          </a>
          <span className="rounded-full border border-solid border-[#747b85] px-2 py-px text-xs text-[#747b85]">
            Public
          </span>
        </div>
        <button
          aria-label="Pin options"
          className="mt-1 border-none bg-transparent p-1 fill-[#7e8590] hover:fill-white"
        >
          <svg
            aria-hidden="true"
            height="16"
            viewBox="0 0 16 16"
            version="1.1"
            width="16"
          >
            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"></path>
          </svg>
        </button>
      </div>
      <p className="mt-3 text-sm text-[#747b85]">{description}</p>
      <div className="mt-3 flex items-center gap-1.5 text-xs text-[#747b85]">
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: langColor }}
        />
        {lang}
      </div>
    </div>
  );
};

export const PinnedSection = () => {
  return (
    <section className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base text-white">Pinned</h2>
        <a className="cursor-pointer text-sm text-[#4c81f9] hover:underline">
          Customize your pins
        </a>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Pins
          title="daily-ui"
          description="100 Days of Frontend Code"
          lang="TypeScript"
          langColor="#3178c6"
        />
        <Pins
          title="LeetCode"
          description="LeetCode problems solved in TypeScript."
          lang="TypeScript"
          langColor="#3178c6"
        />
        <Pins
          title="adventOfCode"
          description="Advent of Code Solutions"
          lang="JavaScript"
          langColor="#f1e05a"
        />
      </div>
    </section>
  );
};

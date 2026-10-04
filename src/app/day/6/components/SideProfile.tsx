import React from "react";

import Image from "next/image";

export const SideProfile = () => {
  return (
    <aside className="flex w-full shrink-0 flex-col md:w-[296px]">
      <div className="relative w-fit">
        <Image
          className="rounded-full border border-[#31363d]"
          src="/profile-picture.jpg"
          alt="Spencer Craigie"
          width={296}
          height={296}
          priority
        />
        <button
          aria-label="Set status"
          className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-solid border-[#31363d] bg-[#0e1117] fill-[#7e8590] hover:bg-[#181b20]"
        >
          <svg
            aria-hidden="true"
            height="16"
            viewBox="0 0 16 16"
            version="1.1"
            width="16"
          >
            <path
              fillRule="evenodd"
              d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16Zm0-1.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13ZM5.5 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM4.5 9.9c.94 1.2 2.11 1.9 3.5 1.9s2.56-.7 3.5-1.9l1.17.93C11.4 12.34 9.85 13.3 8 13.3s-3.4-.96-4.67-2.47l1.17-.93Z"
            ></path>
          </svg>
        </button>
      </div>
      <h1 className="mt-4 text-2xl font-semibold text-white">
        Spencer Craigie
      </h1>
      <p className="text-xl font-light text-[#7e8590]">sscraigie</p>
      <button className="mt-4 w-full rounded-md border border-solid border-[#31363d] bg-transparent py-1.5 text-sm text-[#c9d1d9] hover:bg-[#181b20]">
        Edit profile
      </button>
      <div className="mt-4 flex items-center gap-1 text-sm text-[#7e8590]">
        <svg
          aria-hidden="true"
          height="16"
          viewBox="0 0 16 16"
          version="1.1"
          width="16"
          className="fill-[#7e8590]"
        >
          <path d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.234 4.001 4.001 0 0 0-7.9 0 .75.75 0 0 1-1.482-.234 5.507 5.507 0 0 1 3.034-4.084A3.501 3.501 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.885 3.827 3.5 3.5 0 0 1-1.698 5.86.75.75 0 0 1-.31-1.469 2 2 0 0 0 .972-3.36 2.002 2.002 0 0 0-.974-.553A3.004 3.004 0 0 1 11 4Z"></path>
        </svg>
        <span>
          <span className="font-semibold text-white">1</span> follower
        </span>
        <span>·</span>
        <span>
          <span className="font-semibold text-white">0</span> following
        </span>
      </div>
    </aside>
  );
};

export default SideProfile;

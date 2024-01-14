import Link from "next/link";
import React from "react";

export const InfoCard = (props: { day: number; title: string }) => {
  return (
    <Link
      href={`/day/${props.day}`}
      className=" flex h-60 w-80 appearance-none flex-col justify-between rounded-md bg-white no-underline shadow-md transition hover:scale-105"
    >
      <img
        alt={props.day}
        className=" h-40 w-full rounded-t-md object-cover"
        height="200"
        src={`/${props.day}.png`}
        style={{
          aspectRatio: "200/200",
          objectFit: "cover",
        }}
        width="200"
      />
      <div className=" flex flex-col gap-2 p-3">
        <h2 className=" m-0 text-lg font-semibold text-black no-underline">
          Day {props.day}
        </h2>
        <p className="m-0 text-gray-600 no-underline">{props.title}</p>
      </div>
    </Link>
  );
};

// {/* <a href={`/day/${props.day}`} className="h-60 w-60 rounded-md bg-slate-100">
// {/* <Image src={`/1.png`} alt={"Preview"} width={80} height={80} /> */}
// <div className="p-2">
//   <h3 className="">Day {props.day}</h3>
//   <p className="">{props.title}</p>
// </div>
// </a> */}

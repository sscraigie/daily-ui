import React from "react";
import { InfoCard } from "../day/45/page";

const days = [
  { day: 1, title: "Sign Up" },
  { day: 2, title: "Checkout" },
  { day: 3, title: "Landing Page" },
  { day: 4, title: "Calculator" },
  { day: 5, title: "App Icon" },
  { day: 6, title: "User Profile" },
  { day: 45, title: "InfoCard" },
];

export const Portfolio = () => {
  return (
    <div className="flex h-full w-full justify-center bg-slate-100">
      <div className="m-0 w-full max-w-5xl ">
        <h1 className="m-0 p-10">Portfolio</h1>
        <div className="flex max-w-5xl flex-wrap justify-center gap-5">
          {days.map((day) => (
            <InfoCard day={day.day} title={day.title} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;

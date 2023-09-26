"use client";
import React from "react";
import Motion from "@/components/Motion";
import Image from "next/image";
import { HeroImage } from "./HeroImage";

export const Hero = () => {
  return (
    <div className="px-16 py-7">
      <Motion>
        <h1 className="w-full font-bold text-blue-600">Daily Dev</h1>
      </Motion>
      <Motion yChange={25} delay={0.5} className="flex w-full">
        <div className="hidden items-center justify-center pt-16 md:flex  md:w-1/2 ">
          <Image
            className="duration-200 hover:-rotate-12"
            src="/d3/hero.jpg"
            alt="hero"
            width={500}
            height={300}
            layout="intrinsic"
          />
        </div>
        <div className="w-full gap-10 p-5 text-center text-2xl md:w-1/2">
          <h1 className=" m-1 text-6xl font-extrabold text-red-300">
            Become a
          </h1>
          <h1 className="m-1 text-6xl font-extrabold text-blue-600">
            Better Developer
          </h1>
          <h1 className="m-1 text-6xl font-extrabold text-red-300">
            {" "}
            in 100 Days
          </h1>
          <p className="font-light text-blue-400">
            Daily Dev is a series of
            <b className="text-blue-600">Design Challenges</b> and
            <b className="text-blue-600"> Surprise Rewards</b> sent out
            everyday.
          </p>
          <a href="https://www.dailyui.co/#signup">
            <button className=" text-bold rounded-md border-none bg-blue-600 p-5 px-10 text-center text-lg font-extrabold text-white">
              Get Started for Free
            </button>
          </a>
          <p className="text-sm text-blue-200">
            100% FREE. No Spam. No Affiliate Links. No data sharing.
          </p>
        </div>
      </Motion>
    </div>
  );
};

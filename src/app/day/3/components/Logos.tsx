import React from "react";
import Image from "next/image";

export const Logos = () => {
  return (
    <div className="flex items-center justify-center p-10">
      <div className="grid w-full grid-cols-3 gap-10">
        {/* <DisneyLogo />
      <NetflixLogo /> */}
        {["disney", "netflix", "microsoft", "airbnb", "xd", "verizon"].map(
          (image) => (
            <div key={image} className="flex items-center justify-center">
              <Image
                src={`/d3/logos/${image}.svg`}
                alt="hero"
                width={image === "xd" ? 50 : 300}
                height={50}
                layout="intrinsic"
              />
            </div>
          ),
        )}
      </div>
    </div>
  );
};

export default Logos;

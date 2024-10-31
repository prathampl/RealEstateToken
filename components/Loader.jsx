import React from "react";
import Image from "next/image";
import images from "../assets";
export default function Loader() {
  return (
    <div className="flexCenter w-full my-4">
      <Image src={images.loader} alt="loader" width={100} objectFit="contain" />
    </div>
  );
}

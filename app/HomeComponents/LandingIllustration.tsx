"use client";

import Image from "next/image";

export default function LandingIllustration() {
  return (
    <Image
      src="/illustration-1.svg"
      alt="landing-illustration"
      width={560}
      height={80}
      className="sm:w-[80%] md:w-[430px] xl:w-[560px]"
    />
  );
}

"use client";

import { useEffect, useState } from "react";
import LandingHero from "./HomeComponents/LandingHero";
import LandingIllustration from "./HomeComponents/LandingIllustration";
import LoginModal from "./HomeComponents/LoginModal";
export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    console.log("Modal is:", isModalOpen);
  }, [isModalOpen]);

  return (
    <div className="h-[100dvh] px-8 py-6 flex flex-col lg:flex-row lg:justify-center justify-between items-center lg:items-stretch relative overflow-y-hidden">
      <div className="flex-3 hidden lg:flex"></div>

      <LandingHero setIsModalOpen={setIsModalOpen} />

      <LandingIllustration />

      <div className="flex md:hidden"></div>

      {/* Button mobile (TIDAK DIUBAH) */}
      <LandingHero.MobileButton setIsModalOpen={setIsModalOpen} />

      <div className="flex-2 hidden lg:flex"></div>

      <LoginModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </div>
  );
}

"use client";

import Image from "next/image";
import Button from "@/components/ui/Button";

interface Props {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function LandingHero({ setIsModalOpen }: Props) {
  return (
    <div className="flex flex-col mr-[2vw] xl:mr-34">
      <Image
        src="/logo.svg"
        alt="if-collab-logo"
        width={200}
        height={80}
        className="w-[130px] sm:w-[160px] xl:w-[200px]"
      />

      <div className="max-w-140 mt-10 lg:mt-46 lg:min-w-100 xl:min-w-120">
        <h1 className="text-dp font-semibold text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight text-center lg:text-left">
          Buat Kerja Nyata, Tanpa Drama
        </h1>

        <p className="text-dp text-sm sm:text-lg xl:text-xl lg:my-5 text-center lg:text-left">
          Proyek terorganisir, tugas kebagi jelas, nggak ada lagi yang cuma
          numpang nama.
        </p>

        <Button
          fullWidth={false}
          className="text-xl px-10 py-3 hidden lg:flex"
          onClick={() => setIsModalOpen(true)}
        >
          Masuk
        </Button>
      </div>

      <div className="h-[80px] hidden lg:flex"></div>
    </div>
  );
}

/* 
  Pecah mobile button sebagai static property 
  agar tetap satu domain komponen
*/
LandingHero.MobileButton = function MobileButton({ setIsModalOpen }: Props) {
  return (
    <Button
      className="text-[1.125rem] sm:text-xl px-10 py-3 lg:hidden max-w-140 mt-20"
      onClick={() => setIsModalOpen(true)}
    >
      Masuk
    </Button>
  );
};

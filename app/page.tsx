"use client";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { useEffect, useState } from "react";
import LoginComp from "./LoginComp";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    console.log("Modal is:", isModalOpen);
  }, [isModalOpen]);
  return (
    <div className="h-[100dvh] px-8 py-6 flex flex-col lg:flex-row lg:justify-center justify-between items-center lg:items-stretch relative overflow-y-hidden">
      <div className="flex-3 hidden lg:flex"></div>
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
          <p className="text-dp text-sm sm:text-lg xl:text-xl lg:my-5  text-center lg:text-left ">
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
      <Image
        src="/illustration-1.svg"
        alt="landing-illustration"
        width={560}
        height={80}
        className="sm:w-[80%] md:w-[430px] xl:w-[560px]"
      />
      <div className="flex md:hidden"></div>
      <Button
        className="text-[1.125rem] sm:text-xl px-10 py-3 lg:hidden max-w-140 mt-20"
        onClick={() => setIsModalOpen(true)}
      >
        Masuk
      </Button>
      <div className="flex-2 hidden lg:flex"></div>
      {/* ini bagian modal */}
      <div
        className={`fixed inset-0 flex items-center justify-center absolute bg-black/40 ${isModalOpen ? "flex" : "hidden"}`}
        onClick={() => setIsModalOpen(false)}
      ></div>
      <div
        className={`h-150 w-[100%] sm:w-160 rounded-xl border border-gry bg-white
        transition-transform duration-300 ease-in-out absolute 
        ${isModalOpen ? "translate-y-44 md:translate-y-26" : "translate-y-[110vh]"}
      `}
        onClick={(e) => e.stopPropagation()}
      >
        <LoginComp setIsModalOpen={setIsModalOpen} />
      </div>
    </div>
  );
}

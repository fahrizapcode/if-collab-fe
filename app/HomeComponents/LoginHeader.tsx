"use client";

import Image from "next/image";

export default function LoginHeader({
  setIsModalOpen,
}: {
  setIsModalOpen: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-col items-center w-[100%]">
      <div className="flex justify-end w-[100%]">
        <Image
          src="/icons/add.svg"
          alt="add"
          width={50}
          height={50}
          className="rotate-45 w-10 sm:w-12 cursor-pointer"
          onClick={() => setIsModalOpen(false)}
        />
      </div>

      <Image
        src="/logo.svg"
        alt="if-collab-logo"
        width={160}
        height={80}
        className="w-[120px] sm:w-[140px] xl:w-[180px]"
      />

      <h1 className="text-2xl sm:text-4xl">Selamat Datang</h1>
    </div>
  );
}

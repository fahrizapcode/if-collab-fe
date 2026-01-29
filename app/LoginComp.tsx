"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Image from "next/image";
import Link from "next/link";

export default function LoginComp({
  setIsModalOpen,
}: {
  setIsModalOpen: (value: boolean) => void;
}) {
  return (
    <div className="p-5 sm:p-6 flex flex-col items-center">
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
          className="w-[120px] sm:w-[140px] xl:w-[180px] "
        />
        <h1 className="text-2xl sm:text-4xl">Selamat Datang</h1>
      </div>
      <form action="" className="w-[92%]  flex flex-col justify-between mt-6">
        <div className="flex flex-col gap-y-3  py-12">
          <Input
            name="Nim/Nip"
            label="Nim/Nip"
            placeholder="Masukkan Nim/Nip Anda"
          />
          <Input
            name="Password"
            label="Password"
            placeholder="Masukkan Password Anda"
          />
        </div>
        <Link href={"/dashboard"}>
          <Button className="text-[1.05rem] sm:text-[1.3rem] py-3 h-13 sm:h-16">
            Masuk
          </Button>
        </Link>
      </form>
    </div>
  );
}

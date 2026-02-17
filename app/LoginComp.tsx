"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUser } from "@/store/userSlice";
import { initialUsers } from "@/data/dataUsers";
import { useState } from "react";

export default function LoginComp({
  setIsModalOpen,
}: {
  setIsModalOpen: (value: boolean) => void;
}) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [nim, setNim] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const foundUser = initialUsers.find(
      (user) => user.nim_nip === nim && user.password === password,
    );

    if (!foundUser) {
      setError("NIM/NIP atau password salah");
      return;
    }

    // ✅ SET USER KE REDUX
    dispatch(setUser(foundUser));

    setError(null);
    setIsModalOpen(false);
    if (foundUser.general_role !== "admin") {
      router.push("/dashboard");
    } else {
      router.push("/admin");
    }
  };

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
          className="w-[120px] sm:w-[140px] xl:w-[180px]"
        />

        <h1 className="text-2xl sm:text-4xl">Selamat Datang</h1>
      </div>

      <form
        onSubmit={handleLogin}
        className="w-[92%] flex flex-col justify-between mt-6"
      >
        <div className="flex flex-col gap-y-3 py-12">
          <Input
            name="Nim/Nip"
            label="Nim/Nip"
            placeholder="Masukkan Nim/Nip Anda"
            value={nim}
            onChange={(e) => setNim(e.target.value)}
          />

          <Input
            name="Password"
            label="Password"
            type="password"
            placeholder="Masukkan Password Anda"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <Button
          type="submit"
          className="text-[1.05rem] sm:text-[1.3rem] py-3 h-13 sm:h-16"
        >
          Masuk
        </Button>
      </form>
    </div>
  );
}

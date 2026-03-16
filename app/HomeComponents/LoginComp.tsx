"use client";

import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUser } from "@/store/userSlice";
import { initialUsers } from "@/data/dataUsers";
import { useState } from "react";

import LoginHeader from "./LoginHeader";
import LoginForm from "./LoginForm";

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
      <LoginHeader setIsModalOpen={setIsModalOpen} />

      <LoginForm
        nim={nim}
        password={password}
        error={error}
        setNim={setNim}
        setPassword={setPassword}
        handleLogin={handleLogin}
      />
    </div>
  );
}

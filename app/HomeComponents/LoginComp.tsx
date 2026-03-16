"use client";

import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUser } from "@/store/userSlice";
import { useState } from "react";
import { authService } from "@/lib/services/auth.service";

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
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await authService.login({ nim_nip: nim, password });

      // Store user in Redux (without password — API never returns it)
      dispatch(
        setUser({
          id: user.id,
          name: user.name,
          nim_nip: user.nim_nip,
          general_role: user.general_role,
          has_avatar: user.has_avatar,
          last_active: user.last_active,
          notifications: user.notifications ?? [],
        }),
      );

      setIsModalOpen(false);

      if (user.general_role !== "admin") {
        router.push("/dashboard");
      } else {
        router.push("/admin");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Login gagal. Periksa NIM/NIP dan password Anda.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 flex flex-col items-center">
      <LoginHeader setIsModalOpen={setIsModalOpen} />

      <LoginForm
        nim={nim}
        password={password}
        error={error}
        loading={loading}
        setNim={setNim}
        setPassword={setPassword}
        handleLogin={handleLogin}
      />
    </div>
  );
}

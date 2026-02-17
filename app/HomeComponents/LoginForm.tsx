"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Props {
  nim: string;
  password: string;
  error: string | null;
  setNim: (value: string) => void;
  setPassword: (value: string) => void;
  handleLogin: (e: React.FormEvent) => void;
}

export default function LoginForm({
  nim,
  password,
  error,
  setNim,
  setPassword,
  handleLogin,
}: Props) {
  return (
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
  );
}

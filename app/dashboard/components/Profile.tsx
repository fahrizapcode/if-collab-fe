"use client";

import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { ActiveComponent } from "@/types/types";
import { X, LogOut, Pencil, Check } from "lucide-react";
import { useState } from "react";
import { updateProfile } from "@/store/userSlice";
import { useRouter } from "next/navigation";
export default function Profile({
  isOpen,
  setIsActiveComponent,
}: {
  isOpen: boolean;
  setIsActiveComponent: React.Dispatch<React.SetStateAction<ActiveComponent>>;
}) {
  const dispatch = useDispatch();
  const router = useRouter();

  const user = useSelector((state: RootState) => state.user.currentUser);

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (!user) return null;

  const handleUpdateName = () => {
    dispatch(updateProfile({ name: newName }));
    setIsEditingName(false);
  };

  const handleUpdatePassword = () => {
    if (!newPassword) return;
    dispatch(updateProfile({ password: newPassword }));
    setNewPassword("");
  };

  return (
    <div
      className={`${
        isOpen ? "block" : "hidden"
      } absolute top-[8vh] right-6 w-[90%] max-w-[400px] bg-white border border-gray-300 z-30 rounded-md shadow-md`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">Profil</h2>
        <X
          className="cursor-pointer"
          onClick={() => setIsActiveComponent(null)}
        />
      </div>

      <div className="p-4 space-y-5">
        {/* CARD UNGU */}
        <div className="flex items-center justify-between bg-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <Image
              src={user.avatar || "/images/default.png"}
              alt="avatar"
              width={46}
              height={46}
              className="rounded-full object-cover"
            />

            <div>
              <div className="text-lg font-semibold text-purple-800">
                {user.name}
              </div>
              <div className="text-sm text-purple-700">{user.nim_nip}</div>
            </div>
          </div>

          <LogOut
            className="text-purple-800 cursor-pointer"
            onClick={() => {
              setIsActiveComponent(null);
              router.push("/");
            }}
          />
        </div>

        {/* NAMA */}
        <div>
          <label className="block text-sm font-medium mb-2">Nama</label>
          <div className="flex items-center border rounded-lg px-3 py-2">
            <input
              type="text"
              value={isEditingName ? newName : user.name}
              onChange={(e) => setNewName(e.target.value)}
              readOnly={!isEditingName}
              className="flex-1 outline-none bg-transparent"
            />

            {isEditingName ? (
              <Check
                className="w-4 h-4 text-green-600 cursor-pointer"
                onClick={handleUpdateName}
              />
            ) : (
              <Pencil
                className="w-4 h-4 text-gray-500 cursor-pointer"
                onClick={() => setIsEditingName(true)}
              />
            )}
          </div>
        </div>

        {/* PASSWORD */}
        {/* PASSWORD */}
        <div>
          <label className="block text-sm font-medium mb-2">Password</label>

          {!isChangingPassword ? (
            // ===============================
            // DEFAULT MODE
            // ===============================
            <div className="flex items-center justify-between border rounded-lg px-3 py-2">
              <span className="tracking-widest text-gray-600">********</span>

              <button
                onClick={() => setIsChangingPassword(true)}
                className="text-purple-700 text-sm font-medium hover:underline"
              >
                Ganti Password
              </button>
            </div>
          ) : (
            // ===============================
            // EXPANDED MODE
            // ===============================
            <div className="space-y-3 border rounded-lg p-3">
              <input
                type="password"
                placeholder="Password Lama"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />

              <input
                type="password"
                placeholder="Password Baru"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />

              <input
                type="password"
                placeholder="Konfirmasi Password Baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsChangingPassword(false);
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="text-sm text-gray-500 hover:underline"
                >
                  Batal
                </button>

                <button
                  onClick={() => {
                    if (oldPassword !== user.password) {
                      alert("Password lama salah!");
                      return;
                    }

                    if (newPassword !== confirmPassword) {
                      alert("Konfirmasi password tidak cocok!");
                      return;
                    }

                    if (!newPassword) return;

                    dispatch(updateProfile({ password: newPassword }));

                    setIsChangingPassword(false);
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="bg-purple-700 text-white px-4 py-1 rounded-lg text-sm hover:bg-purple-800 transition"
                >
                  Simpan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

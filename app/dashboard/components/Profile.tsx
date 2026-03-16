"use client";

import Image from "next/image";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { X, LogOut, Pencil, Check } from "lucide-react";

import { RootState } from "@/store/store";
import { updateProfile } from "@/store/userSlice";
import { ActiveComponent } from "@/types/types";

interface ProfileProps {
  isOpen: boolean;
  setIsActiveComponent: React.Dispatch<React.SetStateAction<ActiveComponent>>;
}

export default function Profile({
  isOpen,
  setIsActiveComponent,
}: ProfileProps) {
  const dispatch = useDispatch();
  const router = useRouter();

  const user = useSelector((state: RootState) => state.user.currentUser);

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (!user) return null;

  const resetPasswordFields = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleClose = () => {
    setIsActiveComponent(null);
  };

  const handleLogout = () => {
    setIsActiveComponent(null);
    router.push("/");
  };

  const handleUpdateName = () => {
    dispatch(updateProfile({ name: newName }));
    setIsEditingName(false);
  };

  const handleSavePassword = () => {
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
    resetPasswordFields();
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    resetPasswordFields();
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
        <X className="cursor-pointer" onClick={handleClose} />
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
            onClick={handleLogout}
          />
        </div>

        {/* NAMA */}
        <div>
          <label className="block text-sm font-medium mb-2">Nama</label>

          <div className="flex items-center border rounded-lg px-3 py-2 border-gray-500">
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
        <div>
          <label className="block text-sm font-medium mb-2 transition-all duration-300">
            {isChangingPassword ? "Ganti Password" : "Password"}
          </label>

          <div
            className={`border border-gray-500 rounded-xl overflow-hidden bg-white transition-all duration-300 ${!isChangingPassword && "pt-3"}`}
          >
            {/* VIEW MODE */}
            <div
              className={`flex items-center justify-between px-4 pb-3 
                transition-all duration-300 ease-in-out origin-top
                ${
                  isChangingPassword
                    ? "opacity-0 scale-95 max-h-0 py-0 pointer-events-none"
                    : "opacity-100 scale-100 max-h-20"
                }`}
            >
              <span className="tracking-[0.4em] text-gray-500 text-sm">
                • • • • • • • •
              </span>

              <button
                onClick={() => setIsChangingPassword(true)}
                className="text-dp text-sm font-medium cursor-pointer
                 hover:text-np 
                 transition-colors duration-200"
              >
                Ganti Password
              </button>
            </div>

            {/* EDIT MODE */}
            <div
              className={`transition-all duration-300 ease-in-out origin-top
                ${
                  isChangingPassword
                    ? "opacity-100 scale-100 max-h-[500px] py-4 px-4"
                    : "opacity-0 scale-95 max-h-0 py-0 px-4 pointer-events-none"
                }`}
            >
              <div className="space-y-3">
                {/* INPUT FIELD */}
                {[
                  {
                    placeholder: "Password Lama",
                    value: oldPassword,
                    setter: setOldPassword,
                  },
                  {
                    placeholder: "Password Baru",
                    value: newPassword,
                    setter: setNewPassword,
                  },
                  {
                    placeholder: "Konfirmasi Password Baru",
                    value: confirmPassword,
                    setter: setConfirmPassword,
                  },
                ].map((field, i) => (
                  <input
                    key={i}
                    type="password"
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    className="w-full border border-gray-500 
                     rounded-lg px-3 py-2.5 text-sm
                     focus:outline-none 
                     focus:ring-2 focus:ring-lp
                     focus:border-dp
                     transition-all duration-200"
                  />
                ))}

                {/* ACTION BUTTONS */}
                <div className="flex justify-end gap-6 pt-2">
                  <button
                    onClick={handleCancelPasswordChange}
                    className="text-sm text-gray-500 
                     hover:text-gray-700
                     transition-colors duration-200 cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    onClick={handleSavePassword}
                    className="bg-np text-white px-6 py-2.5 
                     rounded-lg text-sm font-medium
                     hover:bg-dp 
                     active:scale-95
                     transition-all duration-200 cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

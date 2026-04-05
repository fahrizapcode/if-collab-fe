"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { X, LogOut, Pencil, Check, Camera } from "lucide-react";

import { RootState } from "@/store/store";
import { updateProfile, logout } from "@/store/userSlice";
import { ActiveComponent } from "@/types/types";
import { usersService } from "@/lib/services/users.service";
import { authService } from "@/lib/services/auth.service";
import { useUI } from "@/components/providers/UIProvider";

interface ProfileProps {
  isOpen: boolean;
  setIsActiveComponent: React.Dispatch<React.SetStateAction<ActiveComponent>>;
}

export default function Profile({
  isOpen,
  setIsActiveComponent,
}: ProfileProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showToast } = useUI();

  const user = useSelector((state: RootState) => state.user.currentUser);

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [nameLoading, setNameLoading] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize and sync newName from Redux ONLY when not in editing mode
  useEffect(() => {
    if (user && !isEditingName) {
      setNewName(user.name);
    }
  }, [user, isEditingName]);

  /* AVATAR LOGIC */
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());

  const baseAvatarUrl = user?.has_avatar
    ? usersService.getAvatarUrl(user.id) + `?t=${avatarTimestamp}`
    : "/images/default.png";

  const [mainAvatarSrc, setMainAvatarSrc] = useState(baseAvatarUrl);

  useEffect(() => {
    setMainAvatarSrc(previewUrl || baseAvatarUrl);
  }, [previewUrl, baseAvatarUrl]);

  const handleAvatarError = () => {
    if (mainAvatarSrc !== "/images/default.png") {
      setMainAvatarSrc("/images/default.png");
    }
  };

  const resetPasswordFields = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPwError(null);
  };

  const handleClose = () => setIsActiveComponent(null);

  const handleLogout = () => {
    authService.logout();
    dispatch(logout());
    setIsActiveComponent(null);
    router.push("/");
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      showToast("Nama tidak boleh kosong", "error");
      return;
    }
    if (newName.trim() === user?.name) {
      setIsEditingName(false);
      return;
    }
    setNameLoading(true);
    try {
      await usersService.updateProfile({ name: newName.trim() });
      dispatch(updateProfile({ name: newName.trim() }));
      setIsEditingName(false);
    } catch {
      showToast("Gagal memperbarui nama", "error");
    } finally {
      setNameLoading(false);
    }
  };

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPwError("Konfirmasi password tidak cocok!");
      return;
    }
    if (!newPassword || !oldPassword) return;
    if (newPassword.length < 8) {
      setPwError("Password baru minimal 8 karakter!");
      return;
    }

    setPwLoading(true);
    setPwError(null);
    try {
      await usersService.updateProfile({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setIsChangingPassword(false);
      resetPasswordFields();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Gagal mengubah password";
      setPwError(msg);
    } finally {
      setPwLoading(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    resetPasswordFields();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant Preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    setAvatarLoading(true);
    try {
      await usersService.uploadAvatar(file);
      dispatch(updateProfile({ has_avatar: true }));
      setAvatarTimestamp(Date.now());
    } catch {
      showToast("Gagal mengupload avatar", "error");
      setPreviewUrl(null); // Reset if failed
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div
      className={`${isOpen ? "block" : "hidden"
        } fixed top-[10vh] right-6 w-[90%] max-w-[400px] bg-white border border-gray-300 z-[80] rounded-md shadow-2xl scale-up-center`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">Profil</h2>
        <X className="cursor-pointer" onClick={handleClose} />
      </div>

      <div className="p-4 space-y-5">
        {/* CARD UNGU */}
        {user ? (
          <div className="flex items-center justify-between bg-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-4">
              {/* Avatar with upload overlay */}
              <div className="relative group">
                <Image
                  src={mainAvatarSrc}
                  alt="avatar"
                  width={46}
                  height={46}
                  onError={handleAvatarError}
                  className="rounded-full object-cover aspect-square"
                  unoptimized
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Ganti foto"
                >
                  {avatarLoading ? (
                    <span className="text-white text-xs">...</span>
                  ) : (
                    <Camera className="w-4 h-4 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

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
        ) : (
          <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl animate-pulse">
            <div className="text-gray-400">Loading user data...</div>
          </div>
        )}

        {/* NAMA */}
        <div>
          <label className="block text-sm font-medium mb-2">Nama</label>

          <div className="flex items-center border rounded-lg px-3 py-2 border-gray-500">
            <input
              type="text"
              value={isEditingName ? newName : (user?.name || "")}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUpdateName();
                if (e.key === "Escape") setIsEditingName(false);
              }}
              readOnly={!isEditingName}
              className="flex-1 outline-none bg-transparent"
              autoFocus={isEditingName}
            />

            {isEditingName ? (
              <Check
                className={`w-4 h-4 text-green-600 cursor-pointer ${nameLoading ? "opacity-50" : ""}`}
                onClick={nameLoading ? undefined : handleUpdateName}
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
                ${isChangingPassword
                  ? "opacity-0 scale-95 max-h-0 py-0 pointer-events-none"
                  : "opacity-100 scale-100 max-h-20"
                }`}
            >
              <span className="tracking-[0.4em] text-gray-500 text-sm">
                • • • • • • • •
              </span>

              <button
                onClick={() => setIsChangingPassword(true)}
                className="text-dp text-sm font-medium cursor-pointer hover:text-np transition-colors duration-200"
              >
                Ganti Password
              </button>
            </div>

            {/* EDIT MODE */}
            <div
              className={`transition-all duration-300 ease-in-out origin-top
                ${isChangingPassword
                  ? "opacity-100 scale-100 max-h-[500px] py-4 px-4"
                  : "opacity-0 scale-95 max-h-0 py-0 px-4 pointer-events-none"
                }`}
            >
              <div className="space-y-3">
                {[
                  { placeholder: "Password Lama", value: oldPassword, setter: setOldPassword },
                  { placeholder: "Password Baru", value: newPassword, setter: setNewPassword },
                  { placeholder: "Konfirmasi Password Baru", value: confirmPassword, setter: setConfirmPassword },
                ].map((field, i) => (
                  <input
                    key={i}
                    type="password"
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    className="w-full border border-gray-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lp focus:border-dp transition-all duration-200"
                  />
                ))}

                {pwError && (
                  <p className="text-red-500 text-xs">{pwError}</p>
                )}

                <div className="flex justify-end gap-6 pt-2">
                  <button
                    onClick={handleCancelPasswordChange}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    onClick={handleSavePassword}
                    disabled={pwLoading}
                    className="bg-np text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-dp active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
                  >
                    {pwLoading ? "Menyimpan..." : "Simpan"}
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

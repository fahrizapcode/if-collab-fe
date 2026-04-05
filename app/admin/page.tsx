"use client";

import { useState, useEffect } from "react";
import { RootState } from "@/store/store";
import { usersService } from "@/lib/services/users.service";
import { adminService } from "@/lib/services/admin.service";
import { PublicUser } from "@/types/typesUser";
import { BoardData } from "@/types/types";
import { useSelector, useDispatch } from "react-redux";
import MonthlyActiveUsersChart from "./components/MonthlyActiveUsersChart";
import { deleteBoard } from "@/store/boardsSlice";
import { setUsers } from "@/store/usersSlice";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useUI } from "@/components/providers/UIProvider";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { showToast, confirm } = useUI();

  // ===============================
  // STATE FROM API
  // ===============================
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalBoards: 0,
    activeBoards: 0,
  });
  const [monthlyStats, setMonthlyStats] = useState<{ label: string; value: number }[]>([]);
  const [liveUsers, setLiveUsers] = useState<PublicUser[]>([]);
  const [liveBoards, setLiveBoards] = useState<BoardData[]>([]);
  const [loading, setLoading] = useState(true);

  // ===============================
  // STATE
  // ===============================
  const [searchBoard, setSearchBoard] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [boardLimit, setBoardLimit] = useState(5);
  const [userLimit, setUserLimit] = useState(5);

  const [newName, setNewName] = useState("");
  const [newNim, setNewNim] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editingNim, setEditingNim] = useState("");

  const [showUserForm, setShowUserForm] = useState(false); // untuk toggle form

  useEffect(() => {
    fetchData();
  }, [searchBoard, boardLimit, searchUser, userLimit]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [s, m, u, b] = await Promise.all([
        adminService.getStats(),
        adminService.getMonthlyStats(),
        adminService.getUsers(searchUser, userLimit),
        adminService.getBoards(searchBoard, boardLimit),
      ]);
      setStats(s);
      setMonthlyStats(m);
      setLiveUsers(u);
      setLiveBoards(b);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();

  // ===============================
  // HELPERS
  // ===============================
  const formatLastActive = (dateString: string | Date) => {
    if (!dateString) return "Belum aktif";
    const last = new Date(dateString);
    if (isNaN(last.getTime())) return "Tanggal tidak valid";
    
    const diffMs = now.getTime() - last.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return "Hari ini";
    if (diffDays < 30) return `${diffDays} hari`;

    return `${Math.floor(diffDays / 30)} bulan`;
  };

  // ===============================
  // HANDLERS
  // ===============================
  const handleDeleteProject = async (id: string) => {
    confirm({
      title: "Hapus Proyek",
      message: "Yakin ingin menghapus proyek ini?",
      confirmLabel: "Ya, Hapus",
      type: "danger",
      onConfirm: async () => {
        try {
          await adminService.deleteBoard(id);
          fetchData(); // refresh
          dispatch(deleteBoard(id)); // update redux if needed
          showToast("Proyek berhasil dihapus", "success");
        } catch {
          showToast("Gagal menghapus proyek", "error");
        }
      }
    });
  };

  const resetForm = () => {
    setNewName("");
    setNewNim("");
    setNewPassword("");
    setIsEditing(false);
    setEditingNim("");
    setShowUserForm(false);
  };

  const handleSubmitUser = async () => {
    if (!newName || !newNim) {
      showToast("Nama dan NIM/NIP harus diisi", "error");
      return;
    }
    if (!isEditing && !newPassword) {
      showToast("Password harus diisi untuk user baru", "error");
      return;
    }

    try {
      if (isEditing) {
        await adminService.updateUser(editingNim, {
          name: newName,
          nim_nip: newNim,
          ...(newPassword ? { password: newPassword } : {})
        });
        showToast("User berhasil diperbarui", "success");
      } else {
        await adminService.createUser({
          name: newName,
          nim_nip: newNim,
          password: newPassword
        });
        showToast("User berhasil ditambahkan", "success");
      }
      resetForm();
      fetchData(); // Refresh list
    } catch (error: any) {
      showToast(error.response?.data?.message || "Gagal menyimpan user", "error");
    }
  };

  const handleEditUser = (user: any) => {
    setIsEditing(true);
    setEditingNim(user.id);
    setNewName(user.name);
    setNewNim(user.nim_nip || user.nimNip || "");
    setNewPassword(""); // Reset password on edit
    setShowUserForm(true); // otomatis munculkan form saat edit
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div className="py-8 sm:space-y-6 overflow-x-scroll min-h-screen px-4 sm:px-0 no-scrollbar scrollbar-none bg-[#FAF5FF]">
      <div className="w-[100%] flex scrollbar-none">
        <div className="flex flex-1 sm:min-w-10"></div>
        <div className="flex w-[90vw] sm:w-290 justify-between shrink-0">
          <Image
            src={"/logo.svg"}
            alt={"Logo"}
            width={160}
            height={160}
            className="w-30 sm:w-42 sm:h-10
          "
          />
          <div
            className="flex items-center gap-x-3"
            onClick={() => router.push("/")}
          >
            <h1 className="text-sm hidden sm:block sm:text-xl font-medium ">
              Admin Dashboard
            </h1>
            <Button
              className="px-6 text-[0.9rem] py-[0.6rem] sm:py-3 sm:text-[1.05rem] sm:px-8 "
              fullWidth={false}
            >
              Logout
            </Button>
          </div>
        </div>
        <div className="flex flex-1"></div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 w-[100%]">
        <div className="flex flex-1"></div>
        {/* LEFT SIDE */}
        <div className="w-[100%] sm:w-190 space-y-6 shrink-0">
          {/* STATS */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              title="User aktif"
              value={stats.activeUsers}
              color="green"
              icon="/icons/user-white.svg"
            />
            <StatCard
              title="Total Proyek"
              value={stats.totalBoards}
              color="purple"
              icon="/icons/board-white.svg"
            />
            <StatCard
              title="Proyek Aktif"
              value={stats.activeBoards}
              color="orange"
              icon="/icons/task-view-white.svg"
            />
          </div>

          <div className="flex flex-col gap-y-3">
            {/* BOARD SEARCH + LIMIT */}
            <div className="flex gap-x-2">
              <Image
                src={"/icons/task-clip.svg"}
                alt={"Setting user"}
                width={24}
                height={24}
              />
              <h1 className="font-medium">Manajemen Akun</h1>
            </div>
            <div className="flex justify-between items-center w-[100%] gap-x-2 ">
              <input
                type="text"
                placeholder="Cari proyek..."
                value={searchBoard}
                onChange={(e) => setSearchBoard(e.target.value)}
                className="border px-3 flex py-2 rounded-lg text-sm w-[60%] sm:flex-1"
              />

              <select
                value={boardLimit}
                onChange={(e) => setBoardLimit(Number(e.target.value))}
                className="border px-3 py-2 flex rounded-lg text-sm w-36 h-[100%]"
              >
                <option value={5}>Tampilkan 5</option>
                <option value={10}>Tampilkan 10</option>
                <option value={20}>Tampilkan 20</option>
              </select>
            </div>

            {/* BOARD TABLE */}
            {/* ==================== BOARD TABLE WRAPPER ==================== */}
            <div className="bg-white rounded-sm overflow-x-auto  sm:w-auto">
              <table className="w-180 sm:w-full text-sm sm:text-base">
                <thead className="bg-lp text-dp text-left">
                  <tr>
                    <th className="py-3 sm:py-4 px-2 sm:px-3">Nama</th>
                    <th className="py-3 sm:py-4 px-2 sm:px-3">Aktif</th>
                    <th className="py-3 sm:py-4 px-2 sm:px-3">Leader</th>
                    <th className="py-3 sm:py-4 px-2 sm:px-3">Member</th>
                    <th className="py-3 sm:py-4 px-2 sm:px-3">Task</th>
                    <th className="py-3 sm:py-4 px-2 sm:px-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {liveBoards.map((board) => {
                    return (
                      <tr key={board.id} className="border-b hover:bg-gray-50">
                        <td className="px-1 py-3 sm:p-3">{board.title}</td>
                        <td className="px-1 py-3 sm:p-3">
                          {formatLastActive(board.lastActive)}
                        </td>
                        <td className="px-1 py-3 sm:p-3">
                          {/* We might need to fetch leader name separately or include it in API */}
                          Admin
                        </td>
                        <td className="px-1 py-3 sm:p-3">
                          {board.members?.length || 0}
                        </td>
                        <td className="px-1 py-3 sm:p-3">
                          {(board as any)._count?.tasks || 0}
                        </td>
                        <td className="px-1 py-3 sm:p-3">
                          <button
                            onClick={() => handleDeleteProject(board.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs sm:text-sm"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="sm:w-100 space-y-6 sm:shrink-0">
          <MonthlyActiveUsersChart
            data={monthlyStats.map(s => s.value)}
            labels={monthlyStats.map(s => s.label)}
          />

          {/* USER MANAGEMENT */}
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
            <div className="flex gap-x-2">
              <Image
                src={"/icons/user-setting.svg"}
                alt={"Setting user"}
                width={18}
                height={18}
              />
              <h1 className="font-medium">Manajemen Akun</h1>
            </div>
            {!showUserForm && (
              <>
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    placeholder="Cari user..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="border px-3 py-2 rounded-lg text-sm w-40"
                  />

                  <select
                    value={userLimit}
                    onChange={(e) => setUserLimit(Number(e.target.value))}
                    className="border px-3 py-2 rounded-lg text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>

                {/* USER LIST */}
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {liveUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex justify-between items-center border-b py-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={
                            user.has_avatar
                              ? usersService.getAvatarUrl(user.id)
                              : "/images/default.png"
                          }
                          alt="Avatar"
                          width={28}
                          height={28}
                          className="rounded-full object-cover aspect-square"
                          unoptimized
                        />
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-gray-500 text-xs">
                            {user.nim_nip}
                          </p>
                          <p className="text-gray-400 text-[11px]">
                          Terakhir aktif: {formatLastActive((user as any).lastActive || user.last_active)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="bg-np px-3 py-2 rounded-md text-xs text-white"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => {
                            confirm({
                              title: "Hapus User",
                              message: `Apakah Anda yakin ingin menghapus user "${user.name}"?`,
                              confirmLabel: "Ya, Hapus",
                              type: "danger",
                              onConfirm: async () => {
                                try {
                                  await adminService.deleteUser(user.id);
                                  fetchData();
                                  showToast(`User ${user.name} berhasil dihapus`, "success");
                                } catch (error: any) {
                                  showToast(error.response?.data?.message || "Gagal menghapus user", "error");
                                }
                              }
                            });
                          }}
                          className="bg-red-500 px-3 py-2 rounded-md text-white text-xs"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm"
                  onClick={() => setShowUserForm(true)}
                >
                  Tambah User
                </Button>
              </>
            )}

            {showUserForm && (
              <div className="space-y-2">
                <div>{isEditing ? <p>Edit User</p> : <p>Tambah User</p>}</div>
                <input
                  type="text"
                  placeholder="Nama"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border px-3 py-2 rounded-lg text-sm"
                />

                <input
                  type="text"
                  placeholder="NIM/NIP"
                  value={newNim}
                  onChange={(e) => setNewNim(e.target.value)}
                  disabled={isEditing}
                  className="w-full border px-3 py-2 rounded-lg text-sm disabled:bg-gray-100"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border px-3 py-2 rounded-lg text-sm"
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleSubmitUser}
                    className="flex-1 bg-np text-white py-2 rounded-lg text-sm"
                  >
                    {isEditing ? "Update User" : "Tambah User"}
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg text-sm"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-1"></div>
      </div>
    </div>
  );
}

/* ===============================
   STAT CARD COMPONENT
=============================== */
function StatCard({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: number;
  color: "green" | "purple" | "orange";
  icon:
  | "/icons/user-white.svg"
  | "/icons/board-white.svg"
  | "/icons/task-view-white.svg";
}) {
  const colors = {
    green: "bg-green-200 text-green-900",
    purple: "bg-purple-200 text-purple-900",
    orange: "bg-orange-200 text-orange-900",
  };
  const colorsBG = {
    green: "bg-green-900",
    purple: "bg-purple-900 ",
    orange: "bg-orange-900 ",
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-2 sm:gap-x-4 rounded-xl py-5 sm:py-7 px-2 sm:px-4 ${colors[color]} shadow-sm`}
    >
      {/* ICON + VALUE (mobile sejajar & center) */}
      <div className="flex items-center gap-x-3">
        <div
          className={`${colorsBG[color]} w-9 h-9 sm:w-14 sm:h-14 rounded-full flex justify-center items-center`}
        >
          <Image
            src={icon}
            alt={icon}
            width={34}
            height={34}
            className="w-6 h-6 sm:w-9 sm:h-9"
          />
        </div>

        {/* Value pindah ke samping icon saat mobile */}
        <h2 className="text-2xl sm:hidden font-bold">{value}</h2>
      </div>

      {/* TITLE + VALUE DESKTOP */}
      <div className="text-center sm:text-left">
        <p className="font-medium text-xs sm:text-lg">{title}</p>
        <h2 className="hidden sm:block text-3xl font-bold">{value}</h2>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { RootState } from "@/store/store";
import { User } from "@/types/typesUser";
import { BoardData } from "@/types/types";
import { useSelector, useDispatch } from "react-redux";
import MonthlyActiveUsersChart from "./components/MonthlyActiveUsersChart";
import { deleteBoard } from "@/store/boardsSlice";
import { addUser, removeUser, updateUser } from "@/store/usersSlice";
import Image from "next/image";

export default function AdminDashboard() {
  const users = useSelector((state: RootState) => state.users.users);
  const boards = useSelector((state: RootState) => state.boards.boards);
  const dispatch = useDispatch();

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
  const [editingNim, setEditingNim] = useState(""); // ❌ tidak pakai null lagi

  const now = new Date();

  // ===============================
  // HELPERS
  // ===============================
  const getUserByNim = (nim: string) => users.find((u) => u.nim_nip === nim);

  const isWithin7Days = (dateString: string) => {
    const lastActive = new Date(dateString);
    const diffTime = now.getTime() - lastActive.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };

  const formatLastActive = (dateString: string) => {
    const last = new Date(dateString);
    const diffDays = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays < 1) return "Hari ini";
    if (diffDays < 30) return `${Math.floor(diffDays)} hari`;

    return `${Math.floor(diffDays / 30)} bulan`;
  };

  // ===============================
  // STATS
  // ===============================
  const activeUsers = users.filter((user: User) =>
    isWithin7Days(user.last_active),
  ).length;

  const totalProjects = Object.keys(boards).length;

  const activeProjects = Object.values(
    boards as Record<string, BoardData>,
  ).filter((board) => isWithin7Days(board.last_active)).length;

  // ===============================
  // FILTER BOARD
  // ===============================
  const allBoards = Object.values(boards as Record<string, BoardData>);

  const filteredBoards = allBoards.filter((board) =>
    board.title.toLowerCase().includes(searchBoard.toLowerCase()),
  );

  const displayedBoards =
    searchBoard.length > 0
      ? filteredBoards
      : filteredBoards.slice(0, boardLimit);

  // ===============================
  // FILTER USERS
  // ===============================
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      user.nim_nip.toLowerCase().includes(searchUser.toLowerCase()),
  );

  const displayedUsers =
    searchUser.length > 0 ? filteredUsers : filteredUsers.slice(0, userLimit);

  // ===============================
  // HANDLERS
  // ===============================
  const handleDeleteProject = (id: string) => {
    if (!confirm("Yakin ingin menghapus proyek ini?")) return;
    dispatch(deleteBoard(id));
  };

  const resetForm = () => {
    setNewName("");
    setNewNim("");
    setNewPassword("");
    setIsEditing(false);
    setEditingNim("");
  };

  const handleSubmitUser = () => {
    if (!newName || !newNim || !newPassword) return;

    if (isEditing) {
      dispatch(
        updateUser({
          name: newName,
          nim_nip: editingNim, // aman karena string
          password: newPassword,
          general_role: "student",
          notifications: [],
          last_active: new Date().toISOString(),
          avatar:
            users.find((u) => u.nim_nip === editingNim)?.avatar ||
            "/images/default.png",
        }),
      );
    } else {
      dispatch(
        addUser({
          name: newName,
          nim_nip: newNim,
          password: newPassword,
          general_role: "student",
          notifications: [],
          last_active: new Date().toISOString(),
        }),
      );
    }

    resetForm();
  };

  const handleEditUser = (user: User) => {
    setIsEditing(true);
    setEditingNim(user.nim_nip);
    setNewName(user.name);
    setNewNim(user.nim_nip);
    setNewPassword(user.password);
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div className="px-14 py-8 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="flex gap-6">
        {/* LEFT SIDE */}
        <div className="flex-5 space-y-6">
          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="User aktif (7 hari)"
              value={activeUsers}
              color="green"
            />
            <StatCard
              title="Total Proyek"
              value={totalProjects}
              color="purple"
            />
            <StatCard
              title="Proyek Aktif"
              value={activeProjects}
              color="orange"
            />
          </div>

          {/* BOARD SEARCH + LIMIT */}
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Cari proyek..."
              value={searchBoard}
              onChange={(e) => setSearchBoard(e.target.value)}
              className="border px-3 py-2 rounded-lg text-sm w-64"
            />

            <select
              value={boardLimit}
              onChange={(e) => setBoardLimit(Number(e.target.value))}
              className="border px-3 py-2 rounded-lg text-sm"
            >
              <option value={5}>Tampilkan 5</option>
              <option value={10}>Tampilkan 10</option>
              <option value={20}>Tampilkan 20</option>
            </select>
          </div>

          {/* BOARD TABLE */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3">Nama</th>
                  <th className="p-3">Aktif</th>
                  <th className="p-3">Leader</th>
                  <th className="p-3">Member</th>
                  <th className="p-3">Task</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {displayedBoards.map((board) => {
                  const leader = getUserByNim(board.createdBy);

                  return (
                    <tr key={board.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{board.title}</td>
                      <td className="p-3">
                        {formatLastActive(board.last_active)}
                      </td>
                      <td className="p-3">{leader?.name ?? "-"}</td>
                      <td className="p-3">
                        {Object.keys(board.members).length}
                      </td>
                      <td className="p-3">{Object.keys(board.tasks).length}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteProject(board.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
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

        {/* RIGHT SIDE */}
        <div className="flex-2 space-y-6">
          <MonthlyActiveUsersChart data={[129, 301, 299, 43, 134, 135]} />

          {/* USER MANAGEMENT */}
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
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
              {displayedUsers.map((user) => (
                <div
                  key={user.nim_nip}
                  className="flex justify-between items-center border-b py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Image
                      src={user.avatar || "/images/default.png"}
                      alt="Avatar"
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-gray-500 text-xs">{user.nim_nip}</p>
                      <p className="text-gray-400 text-[11px]">
                        Terakhir aktif: {formatLastActive(user.last_active)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-blue-500 text-xs"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => dispatch(removeUser(user.nim_nip))}
                      className="text-red-500 text-xs"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ADD / UPDATE USER */}
            <div className="space-y-2">
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

              <button
                onClick={handleSubmitUser}
                className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm"
              >
                {isEditing ? "Update User" : "Tambah User"}
              </button>
            </div>
          </div>
        </div>
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
}: {
  title: string;
  value: number;
  color: "green" | "purple" | "orange";
}) {
  const colors = {
    green: "bg-green-200 text-green-900",
    purple: "bg-purple-200 text-purple-900",
    orange: "bg-orange-200 text-orange-900",
  };

  return (
    <div
      className={`flex items-center justify-between rounded-xl p-6 ${colors[color]}`}
    >
      <div>
        <p className="font-medium">{title}</p>
        <h2 className="text-3xl font-bold">{value}</h2>
      </div>
    </div>
  );
}

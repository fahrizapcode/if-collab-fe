"use client";

import { useState } from "react";
import { BoardData } from "@/types/types";
import { User } from "@/types/typesUser";
import { useAppSelector } from "@/store/hooks";
import { selectAllUsers } from "@/store/usersSlice";
import { calculateDynamicProgress } from "../helpers";
import Image from "next/image";
import { setActiveBoard } from "@/store/boardsSlice";
import { useDispatch } from "react-redux";

export default function Dashboard({
  boards,
  setIsBoardView,
}: {
  boards: Record<string, BoardData>;
  setIsBoardView: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const allUsers = useAppSelector(selectAllUsers);
  const dispatch = useDispatch();

  const userMap: Record<string, User> = Object.fromEntries(
    allUsers.map((u) => [u.nim_nip, u]),
  );

  const [showAllProjects, setShowAllProjects] = useState(false);

  // ================= SEARCH & SORT STATE =================
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "progress">("name");
  const [descending, setDescending] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  const MAX_VISIBLE = 5;

  const boardsArray = Object.values(boards);

  const visibleBoards = showAllProjects
    ? boardsArray
    : boardsArray.slice(0, MAX_VISIBLE);

  // ================= FILTER & SORT =================
  const processedBoards = boardsArray
    .map((board) => {
      const progress = calculateDynamicProgress(
        board.columns,
        board.columnOrder,
      );

      return {
        ...board,
        percent: Math.round(progress),
      };
    })
    .filter((board) => board.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let result = 0;

      if (sortBy === "name") {
        result = a.title.localeCompare(b.title);
      }

      if (sortBy === "progress") {
        result = a.percent - b.percent;
      }

      return descending ? -result : result;
    });

  return (
    <div className="flex flex-1 flex-col overflow-x-auto scrollbar-stable bg-lp h-[100dvh] p-6">
      <h1 className="text-2xl font-semibold mb-6">Selamat Datang</h1>

      {/* ================= CARD ATAS ================= */}
      <div className="flex gap-6 flex-wrap">
        {visibleBoards.map((board) => {
          const nimArray = Object.keys(board.members);

          const users: User[] = nimArray
            .map((nim) => userMap[nim])
            .filter((u): u is User => Boolean(u));

          const visibleUsers = users.slice(0, 3);
          const remainingCount = users.length - 3;
          const totalTasks = Object.keys(board.tasks).length;

          let diffDays: number | null = null;

          if (board.deadline) {
            const deadlineDate = new Date(board.deadline);
            const today = new Date();
            const diffTime = deadlineDate.getTime() - today.getTime();
            diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          }

          return (
            <div
              key={board.id}
              className="relative w-[260px] rounded-xl p-5 bg-dp text-white"
              onClick={() => {
                setIsBoardView(true);
                dispatch(setActiveBoard(board.id));
              }}
            >
              <div className="absolute top-4 right-4 flex -space-x-2">
                {visibleUsers.map((user) => (
                  <Image
                    key={user.nim_nip}
                    src={user.avatar || "/images/default.png"}
                    alt={user.name}
                    width={30}
                    height={30}
                    className="w-8 h-8 rounded-full border-2 border-dp object-cover"
                  />
                ))}

                {remainingCount > 0 && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-black text-xs flex items-center justify-center border-2 border-dp">
                    +{remainingCount}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8 mb-3">
                <div className="bg-white/20 px-3 py-1 rounded-md text-sm">
                  {totalTasks} Task
                </div>

                {diffDays !== null && (
                  <div className="bg-white/20 px-3 py-1 rounded-md text-sm">
                    {diffDays > 0 ? `${diffDays} Hari` : "Deadline lewat"}
                  </div>
                )}
              </div>

              <div className="text-lg font-semibold line-clamp-2">
                {board.title}
              </div>
            </div>
          );
        })}
      </div>

      {boardsArray.length > MAX_VISIBLE && (
        <div className="mt-6">
          <button
            onClick={() => setShowAllProjects(!showAllProjects)}
            className="px-6 py-2 bg-dp text-white rounded-lg hover:opacity-90 transition"
          >
            {showAllProjects ? "Tutup" : "Lihat Semua"}
          </button>
        </div>
      )}

      {/* ================= PROYEK DIAMATI ================= */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Proyek yang diamati
            <span className="ml-2 bg-dp text-white text-xs px-2 py-1 rounded-full">
              {processedBoards.length}
            </span>
          </h2>
        </div>

        {/* SEARCH + SORT */}
        <div className="flex items-center gap-4 mb-6 relative">
          <input
            type="text"
            placeholder="Cari Proyek"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-np px-4 py-3 rounded-lg outline-none"
          />

          <button
            onClick={() => setShowSortModal(true)}
            className="bg-dp text-white px-4 py-3 rounded-lg"
          >
            Sortir
          </button>

          {showSortModal && (
            <div className="absolute right-0 top-16 w-64 bg-white rounded-xl shadow-xl p-5 z-50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Sortir Berdasarkan</h3>
                <button onClick={() => setShowSortModal(false)}>✕</button>
              </div>

              <div className="flex flex-col gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={sortBy === "name"}
                    onChange={() => setSortBy("name")}
                  />
                  Nama Proyek
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={sortBy === "progress"}
                    onChange={() => setSortBy("progress")}
                  />
                  Progres
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={descending}
                    onChange={() => setDescending(!descending)}
                  />
                  Descending
                </label>
              </div>
            </div>
          )}
        </div>

        {/* LIST */}
        <div className="flex flex-col gap-6">
          {processedBoards.map((board) => (
            <div
              key={board.id}
              className="flex items-center justify-between bg-white rounded-xl p-5 shadow-sm"
            >
              <div className="flex-1 pr-6">
                <div className="font-semibold text-dp">
                  {board.title}
                  <span className="text-sm text-gray-500 ml-2">
                    Task: {Object.keys(board.tasks).length}
                  </span>
                </div>

                <div className="mt-3 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-dp transition-all duration-500"
                    style={{ width: `${board.percent}%` }}
                  />
                </div>
              </div>

              <div className="font-semibold text-dp">{board.percent}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";

import { BoardData } from "@/types/types";
import { User } from "@/types/typesUser";
import { useAppSelector } from "@/store/hooks";
import { selectAllUsers } from "@/store/usersSlice";
import { setActiveBoard } from "@/store/boardsSlice";

import { calculateDynamicProgress } from "../helpers";
import BoardCard from "./BoardCard";

type DashboardProps = {
  boards: Record<string, BoardData>;
  setIsBoardView: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Dashboard({ boards, setIsBoardView }: DashboardProps) {
  const [MAX_VISIBLE, setMaxVisible] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setMaxVisible(5);
      } else {
        setMaxVisible(3);
      }
    };

    handleResize(); // run pertama kali
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const dispatch = useDispatch();
  const allUsers = useAppSelector(selectAllUsers);

  // ================= STATE =================
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "progress">("name");
  const [descending, setDescending] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  // ================= MEMOIZED DATA =================

  const userMap: Record<string, User> = useMemo(() => {
    return Object.fromEntries(allUsers.map((user) => [user.nim_nip, user]));
  }, [allUsers]);

  const boardsArray = useMemo(() => {
    return Object.values(boards);
  }, [boards]);
  const visibleBoards = useMemo(() => {
    return showAllProjects ? boardsArray : boardsArray.slice(0, MAX_VISIBLE);
  }, [showAllProjects, boardsArray, MAX_VISIBLE]);

  const processedBoards = useMemo(() => {
    return boardsArray
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
      .filter((board) =>
        board.title.toLowerCase().includes(search.toLowerCase()),
      )
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
  }, [boardsArray, search, sortBy, descending]);

  // ================= HANDLERS =================

  const handleOpenBoard = (boardId: string) => {
    setIsBoardView(true);
    dispatch(setActiveBoard(boardId));
  };

  // ================= RENDER =================

  return (
    <div className="flex flex-1 flex-col border overflow-x-hidden scrollbar-stable bg-lp h-[100dvh] p-4">
      <h1 className="mt-12 sm:mt-0 text-2xl font-semibold mb-6">
        Selamat Datang
      </h1>

      {/* ================= CARD ATAS ================= */}
      <div className="flex gap-3 flex-wrap">
        {visibleBoards.map((board) => {
          const memberIds = Object.keys(board.members);

          const users: User[] = memberIds
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
            <BoardCard
              key={board.id}
              boardId={board.id}
              title={board.title}
              totalTasks={totalTasks}
              diffDays={diffDays}
              visibleUsers={visibleUsers}
              remainingCount={remainingCount}
              onOpen={handleOpenBoard}
            />
          );
        })}
        {boardsArray.length > MAX_VISIBLE && (
          <div
            onClick={() => setShowAllProjects(!showAllProjects)}
            className="
      relative rounded-lg
      border-2 border-dp
      bg-white text-dp
      cursor-pointer
      
      flex flex-col items-center justify-center
        w-34 h-34
  md:w-40 md:h-40
      
      transition-all duration-200
      hover:bg-dp hover:text-white hover:-translate-y-1 hover:shadow-xl
      active:translate-y-0.5 active:shadow-md active:scale-[0.98]
    "
          >
            {!showAllProjects ? (
              <>
                <div className="text-2xl md:text-3xl font-bold">
                  +{boardsArray.length - MAX_VISIBLE}
                </div>
                <div className="text-sm md:text-base font-medium mt-2">
                  Lihat Semua
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl md:text-3xl font-bold">−</div>
                <div className="text-sm md:text-base font-medium mt-2">
                  Tutup
                </div>
              </>
            )}
          </div>
        )}
      </div>

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
            className="flex-1 bg-white focus:border focus:border-np px-4 py-3 rounded-lg outline-none"
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
                    style={{
                      width: `${board.percent}%`,
                    }}
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

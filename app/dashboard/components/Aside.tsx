"use client";

import { useMemo } from "react";
import CircularProgres from "./CircularProgres";
import ActivityItem from "./ActivityItem";
import { useAppSelector } from "@/store/hooks";
import { selectActiveBoardLogs } from "@/store/boardsSelectors";
import { calculateDynamicProgress } from "../helpers";

const ACCENT_COLORS = [
  "bg-fuchsia-300",
  "bg-sky-200",
  "bg-amber-300",
  "bg-emerald-300",
  "bg-rose-300",
];

export default function Aside({ isOpen }: { isOpen: boolean }) {
  const activityLogs = useAppSelector(selectActiveBoardLogs);

  const activeBoard = useAppSelector(
    (state) => state.boards.boards[state.boards.activeBoardId],
  );

  // 🔥 HITUNG PROGRESS DINAMIS
  const progress = useMemo(() => {
    if (!activeBoard) return 0;

    return calculateDynamicProgress(
      activeBoard.columns,
      activeBoard.columnOrder,
    );
  }, [activeBoard]);

  return (
    <div
      className={`
        w-[100%] lg:w-80
        h-[65dvh] sm:h-[75dvh] lg:h-[100dvh]
        pt-6 sm:pt-8 lg:pt-14
        pb-5 sm:pb-6
        px-4 sm:px-6
        flex flex-col items-center
        text-[1rem] sm:text-xl
        font-medium text-dp
        absolute lg:static
        bg-white
        bottom-[-10]
        border border-lightgry
        rounded-3xl
        z-20
        lg:border-none
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-y-10 " : "translate-y-[110vh] lg:translate-y-10"}
      `}
    >
      <p className="w-full mb-4 sm:mb-6">Progres Tugas</p>

      {/* ✅ SEKARANG DINAMIS */}
      <CircularProgres progress={progress} />

      <p className="w-full mt-5 sm:mt-6 mb-2 sm:mb-3">Riwayat Aktivitas</p>

      <div
        className="
          flex flex-row lg:flex-col
          overflow-x-auto lg:overflow-y-auto
          h-28 sm:h-30 lg:h-[60%]
          w-[96%] sm:w-[98%] lg:w-full
          no-scrollbar
          gap-2
        "
      >
        {activityLogs.length === 0 ? (
          <p className="text-sm text-gray-400 px-2">
            Belum ada aktivitas {activeBoard?.title}
          </p>
        ) : (
          activityLogs.map((log, index) => (
            <ActivityItem
              key={log.id}
              log={log}
              accentColor={ACCENT_COLORS[index % ACCENT_COLORS.length]}
            />
          ))
        )}
      </div>
    </div>
  );
}

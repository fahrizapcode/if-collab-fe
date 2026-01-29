"use client";

import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveBoard } from "@/store/boardsSlice";
import ButtonIcon from "@/components/ui/ButtonIcon";

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  const dispatch = useAppDispatch();

  const { boards, activeBoardId } = useAppSelector((state) => state.boards);

  return (
    <aside
      className={`
      fixed lg:static
      inset-y-0 left-0
      h-[100dvh]
      w-[16rem] sm:w-80
      flex flex-col
      border-r border-black/10 dark:border-white/10
      px-2 sm:px-3
      py-6 sm:py-8
      bg-white
      z-20
      transition-transform duration-300 ease-in-out
      ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
    `}
    >
      {/* Header */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 mb-4 sm:mb-6">
        <Image
          src="/logo.svg"
          alt="if-collab-logo"
          width={140}
          height={70}
          className="w-[140px] sm:w-[180px]"
        />
      </div>

      {/* Project List */}
      <nav className="flex-1 px-1 sm:px-2 space-y-2">
        <ButtonIcon
          srcIcon="/icons/add-white.svg"
          iconHeight={22}
          iconWidth={22}
          className="
          mt-2
          text-[0.9rem] sm:text-[1.1rem]
          py-3.5 sm:py-5
          rounded-sm
          text-white
          mb-4
          relative overflow-hidden
          flex items-center justify-center gap-2
          bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700
          ring-1 ring-white/30
          after:absolute after:inset-0
          after:bg-gradient-to-b after:from-white/18 after:via-white/6 after:to-transparent
          transition-colors
        "
        >
          Proyek Baru
        </ButtonIcon>

        {Object.values(boards).map((board) => {
          const isActive = board.id === activeBoardId;

          return (
            <button
              key={board.id}
              onClick={() => dispatch(setActiveBoard(board.id))}
              className={`
              w-full text-left
              px-3 sm:px-4
              py-3.5 sm:py-5
              rounded-md
              text-[0.95rem] sm:text-lg
              font-medium
              transition-colors
              flex items-center gap-x-2
              ${isActive ? "bg-lp text-dp" : "bg-white text-gry hover:bg-lp"}
            `}
            >
              <Image
                src={`/icons/document${isActive ? "-purple" : "-gray"}.svg`}
                alt="project"
                width={22}
                height={22}
                className="sm:w-[26px]"
              />
              <span className="line-clamp-1">{board.title}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveBoard } from "@/store/boardsSlice";
import SidebarItem from "./SidebarItem";
import ButtonIcon from "@/components/ui/ButtonIcon";
import { ActiveComponent } from "@/types/types";

interface SidebarNavProps {
  setIsActiveComponent: React.Dispatch<React.SetStateAction<ActiveComponent>>;
  setIsActiveOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  setIsBoardView: React.Dispatch<React.SetStateAction<boolean>>;
  isBoardView: boolean;
  isActiveComponent: ActiveComponent;
}

export default function SidebarNav({
  setIsActiveComponent,
  setIsActiveOverlay,
  setIsBoardView,
  isBoardView,
  isActiveComponent,
}: SidebarNavProps) {
  const dispatch = useAppDispatch();
  const { boards, activeBoardId } = useAppSelector((state) => state.boards);

  const handleOpenAddProject = () => {
    setIsActiveOverlay(true);
    setIsActiveComponent("addProject");
  };

  const handleDashboardClick = () => {
    if (isActiveComponent === "taskDetail") {
      setIsActiveComponent(null);
    }
    setIsBoardView(false);
  };

  const handleBoardClick = (boardId: string) => {
    if (isActiveComponent === "taskDetail") {
      setIsActiveComponent(null);
    }
    dispatch(setActiveBoard(boardId));
    setIsBoardView(true);
  };

  return (
    <nav
      className="
        flex-1 px-1 sm:px-2 space-y-2
        overflow-y-auto
        scrollbar-none
      "
    >
      <ButtonIcon
        srcIcon="/icons/add-white.svg"
        iconHeight={30}
        iconWidth={30}
        onClick={handleOpenAddProject}
        className="
          mt-2
          text-[0.9rem] sm:text-[1.1rem]
          py-3.5 sm:py-4.5
          rounded-sm
          text-white
          mb-4
          flex items-center justify-center gap-2
          bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700
        "
      >
        <span className="w-[100%]">Proyek Baru</span>
      </ButtonIcon>

      <SidebarItem
        title="Dashboard"
        icon={`/icons/document${
          isBoardView === false ? "-purple" : "-gray"
        }.svg`}
        active={isBoardView === false}
        onClick={handleDashboardClick}
      />

      {Object.values(boards).map((board) => {
        const isActive = board.id === activeBoardId;
        const isHighlighted = isActive && isBoardView;

        return (
          <SidebarItem
            key={board.id}
            title={board.title}
            icon={`/icons/document${isHighlighted ? "-purple" : "-gray"}.svg`}
            active={isHighlighted}
            onClick={() => handleBoardClick(board.id)}
          />
        );
      })}
    </nav>
  );
}

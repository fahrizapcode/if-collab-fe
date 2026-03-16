import Image from "next/image";
import { useDroppable } from "@dnd-kit/core";

import ButtonIcon from "@/components/ui/ButtonIcon";
import ClickableIcon from "@/components/ui/ClickableIcon";

import { Column, ActiveComponent } from "@/types/types";

interface DroppableColumnProps {
  column: Column;
  children: React.ReactNode;
  isActive?: boolean;
  setIsActiveOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  setIsActiveComponent: React.Dispatch<React.SetStateAction<ActiveComponent>>;
  setTaskColumnId: React.Dispatch<React.SetStateAction<string>>;
}

export default function DroppableColumn({
  column,
  children,
  isActive,
  setIsActiveOverlay,
  setIsActiveComponent,
  setTaskColumnId,
  canAddTask = true,
}: DroppableColumnProps & { canAddTask?: boolean }) {
  const { setNodeRef } = useDroppable({ id: column.id });

  const handleAddTaskClick = () => {
    setIsActiveComponent("addTask");
    setTaskColumnId(column.id);
    setIsActiveOverlay(true);
  };

  return (
    <div
      ref={setNodeRef}
      data-column-id={column.id}
      className={`
      w-[14em] sm:w-56
      rounded-md
      p-2.5 sm:p-3
      min-h-[100px] sm:min-h-[84px]
      ${isActive ? "bg-[#D5B2FB]" : "bg-lp"}
    `}
    >
      <h2 className="flex items-center gap-1.5 font-semibold text-[0.95rem] mb-2 sm:mb-2 sm:text-[0.95rem]">
        {column.title}

        <span className="min-w-[1.35rem] sm:min-w-[1.2rem] h-[1.35rem] sm:h-[1.2rem] px-1 sm:px-1.5 flex items-center justify-center text-[0.7rem] sm:text-[0.75rem] font-medium rounded-full text-white bg-np">
          {column.taskIds.length}
        </span>
      </h2>

      {children}

      {canAddTask && (
        <ButtonIcon
          srcIcon="/icons/add-white.svg"
          iconHeight={18}
          iconWidth={18}
          className="mt-1.5 sm:mt-1.5 text-[0.85rem] sm:text-[0.85rem] py-2.5 rounded-sm"
          onClick={handleAddTaskClick}
        >
          Tambah Tugas
        </ButtonIcon>
      )}
    </div>
  );
}

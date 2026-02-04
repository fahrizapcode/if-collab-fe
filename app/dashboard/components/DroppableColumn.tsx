import ButtonIcon from "@/components/ui/ButtonIcon";
import { Column } from "@/types/types";
import { useDroppable } from "@dnd-kit/core";
import { ActiveComponent } from "@/types/types";

export default function DroppableColumn({
  column,
  children,
  isActive,
  setIsActiveOverlay,
  setIsActiveComponent,
  setTaskColumnId,
}: {
  column: Column;
  children: React.ReactNode;
  isActive?: boolean;
  setIsActiveOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  setIsActiveComponent: React.Dispatch<React.SetStateAction<ActiveComponent>>;
  setTaskColumnId: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      data-column-id={column.id} // ✅ FIX: simpan columnId agar handleDragEnd bisa akurat
      className={`
        w-[14em] sm:w-80
        rounded-md
        p-2.5 sm:p-4
        min-h-[100px] sm:min-h-[120px]
        ${isActive ? "bg-[#D5B2FB]" : "bg-lp"}
      `}
    >
      <h2 className="flex items-center gap-1.5 font-semibold mb-2 sm:mb-3 text-[0.95rem] sm:text-lg">
        {column.title}
        <span className="min-w-[1.35rem] sm:min-w-[1.75rem] h-[1.35rem] sm:h-[1.75rem] px-1 sm:px-2 flex items-center justify-center text-[0.7rem] sm:text-sm font-medium rounded-full text-white bg-np">
          {column.taskIds.length}
        </span>
      </h2>

      {children}

      <ButtonIcon
        srcIcon={"/icons/add-white.svg"}
        iconHeight={24}
        iconWidth={24}
        className="mt-1.5 sm:mt-2 text-[0.85rem] sm:text-[1.1rem] py-3.5 rounded-sm"
        onClick={() => {
          setIsActiveComponent("addTask");
          setTaskColumnId(column.id);
          setIsActiveOverlay(true);
        }}
      >
        Tambah Tugas
      </ButtonIcon>
    </div>
  );
}

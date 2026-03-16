import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import PriorityDot from "./PriorityDot";
import AvatarStack from "./AvatarStack";

import { ActiveComponent, Task } from "@/types/types";
import { makeSelectUsersByIds } from "@/store/boardsSelectors";

interface Props {
  task: Task;
  setIsActiveComponent: React.Dispatch<React.SetStateAction<ActiveComponent>>;
  setActiveTaskId: React.Dispatch<React.SetStateAction<string>>;
}

export default function SortableTaskCard({
  task,
  setIsActiveComponent,
  setActiveTaskId,
}: Props) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  // Gunakan string key agar useMemo tidak re-create selector saat array reference berubah
  const assigneeKey = (task.assignees ?? []).join(",");
  const usersSelector = useMemo(
    () => makeSelectUsersByIds(task.assignees ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [assigneeKey],
  );

  const users = useSelector(usersSelector);

  const handleClick = () => {
    if (isDragging) return;

    setIsActiveComponent("taskDetail");
    setActiveTaskId(task.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className="
      p-2 sm:p-2
      rounded
      shadow
      text-[0.7rem] sm:text-[0.7rem]
      cursor-grab active:cursor-grabbing
      bg-white
      transition-colors
      touch-action-none
    "
    >
      <div className="flex flex-col gap-1 sm:gap-1.5 relative">
        <div className="w-[80%]">
          <div className="w-full line-clamp-2 text-[0.9rem] sm:text-[0.95rem] font-medium">
            {task.title}
          </div>
          <PriorityDot priority={task.priority ?? "low"} />
        </div>

        <div className="flex justify-between items-end">
          {task.tags?.length ? (
            <div className="flex flex-wrap gap-0.5 mt-1 sm:mt-1.5">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="
                  px-1 sm:px-1.5
                  py-[1px] sm:py-[1px]
                  rounded-sm
                  text-[0.65rem] sm:text-[0.7rem]
                  font-medium
                  bg-lp text-dp
                "
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <div />
          )}

          <AvatarStack users={users} />
        </div>
      </div>
    </div>
  );
}

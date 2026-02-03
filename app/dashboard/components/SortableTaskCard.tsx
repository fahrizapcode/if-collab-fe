import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PriorityDot from "./PriorityDot";
import { Task } from "@/types/types";

export default function SortableTaskCard({ task }: { task: Task }) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="
    p-2 sm:p-3
    rounded
    shadow
    text-[0.7rem] sm:text-sm
    cursor-grab active:cursor-grabbing
    bg-white
    transition-colors
    touch-action-none
  "
    >
      <div className="flex gap-1 sm:gap-2 flex-col relative">
        <div className="w-[80%]">
          <div className="w-full line-clamp-2 text-[0.9rem] sm:text-lg font-medium">
            {task.title}
          </div>
          <PriorityDot priority={task.priority ?? "low"} />
        </div>

        {task.tags?.length ? (
          <div className="flex flex-wrap gap-0.5 mt-1 sm:mt-2">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="
              px-1 sm:px-2
              py-[1px] sm:py-0.5
              rounded-sm
              text-[0.65rem] sm:text-sm
              font-medium
              bg-lp text-dp
            "
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

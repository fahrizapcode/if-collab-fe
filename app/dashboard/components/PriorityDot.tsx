import { Task } from "@/types/types";

interface PriorityDotProps {
  priority?: Task["priority"];
}

export default function PriorityDot({ priority }: PriorityDotProps) {
  const priorityColorMap: Record<NonNullable<Task["priority"]>, string> = {
    high: "bg-red-500",
    medium: "bg-yellow-400",
    low: "bg-green-500",
  };

  const color =
    priority && priorityColorMap[priority]
      ? priorityColorMap[priority]
      : "bg-green-500";

  const resolvedPriority = priority ?? "low";

  return (
    <span
      className={`w-3 h-3 rounded-full ${color} absolute right-1 top-1`}
      title={`Priority: ${resolvedPriority}`}
    />
  );
}

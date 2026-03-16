"use client";

import { useAppSelector } from "@/store/hooks";
import {
  selectActiveBoardColumns,
  selectActiveBoardTasks,
} from "@/store/boardsSelectors";
import { selectUserByNim } from "@/store/usersSlice";
import { timeAgo } from "../helpers";

type ActivityLog = {
  id: string;
  actorId: string;
  taskId: string;
  fromColumnId: string;
  toColumnId: string;
  createdAt: string;
};

type Props = {
  log: ActivityLog;
  accentColor: string;
};

export default function ActivityItem({ log, accentColor }: Props) {
  const tasks = useAppSelector(selectActiveBoardTasks);
  const columns = useAppSelector(selectActiveBoardColumns);

  // ⚠️ Tetap dipanggil untuk menjaga kemungkinan side-effect selector memoization
  const user = useAppSelector(selectUserByNim(log.actorId));

  const task = tasks[log.taskId];
  const destinationColumn = columns[log.toColumnId];

  const taskTitle = task?.title ?? "Unknown Task";
  const columnTitle = destinationColumn?.title ?? "Unknown";
  const formattedTime = timeAgo(log.createdAt);

  return (
    <div
      className="
      relative
      flex gap-3 sm:gap-3
      rounded-lg
      bg-gray-100
      pt-0
      sm:p-3.5
      pl-6 sm:pl-6
      items-center
      shrink-0
       
    "
    >
      <div
        className={`absolute left-1.5 sm:left-1.5 h-[80%] w-2 sm:w-2 rounded-md ${accentColor}`}
      />

      <span
        className="
        absolute
        right-3 sm:right-3.5
        top-3 sm:top-3.5
        text-[0.7rem] sm:text-[0.75rem]
        text-gray-400
      "
      >
        {formattedTime}
      </span>

      <div className="flex flex-1 flex-col gap-0.5 sm:gap-0.5">
        <h4 className="text-[0.95rem] sm:text-[1rem] font-semibold text-purple-800">
          Anda
        </h4>

        <p className="text-[0.7rem] sm:text-[0.75rem] text-gray-600 leading-snug">
          Memindahkan tugas <span className="font-medium">“{taskTitle}”</span>{" "}
          ke status <span className="font-medium">{columnTitle}</span>
        </p>
      </div>
    </div>
  );
}

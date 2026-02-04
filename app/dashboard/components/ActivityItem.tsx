"use client";

import { useAppSelector } from "@/store/hooks";
import {
  selectActiveBoardColumns,
  selectActiveBoardTasks,
} from "@/store/boardsSelectors";
import { timeAgo } from "../helpers";
import { selectUserByNim } from "@/store/usersSlice";

type Props = {
  log: {
    id: string;
    actorId: string;
    taskId: string;
    fromColumnId: string;
    toColumnId: string;
    createdAt: string;
  };
  accentColor: string;
};

export default function ActivityItem({ log, accentColor }: Props) {
  const tasks = useAppSelector(selectActiveBoardTasks);
  const columns = useAppSelector(selectActiveBoardColumns);
  const user = useAppSelector(selectUserByNim(log.actorId));
  const task = tasks[log.taskId];
  const toColumn = columns[log.toColumnId];
  return (
    <div
      className="
      relative
      flex gap-3 sm:gap-4
      rounded-lg
      bg-gray-100
      pt-0
      sm:p-5
      pl-6 sm:pl-8
      items-center
      shrink-0
      max-w-[13rem] sm:max-w-70
    "
    >
      <div
        className={`absolute left-1.5 sm:left-2 h-[80%] w-2 sm:w-3 rounded-md ${accentColor}`}
      />

      <span
        className="
        absolute
        right-3 sm:right-5
        top-3 sm:top-5
        text-[0.7rem] sm:text-sm
        text-gray-400
      "
      >
        {timeAgo(log.createdAt)}
      </span>

      <div className="flex flex-1 flex-col gap-0.5 sm:gap-1">
        <h4 className="text-[0.95rem] sm:text-xl font-semibold text-purple-800">
          Anda
        </h4>

        <p className="text-[0.7rem] sm:text-sm text-gray-600 leading-snug">
          Memindahkan tugas{" "}
          <span className="font-medium">“{task?.title ?? "Unknown Task"}”</span>{" "}
          ke status{" "}
          <span className="font-medium">{toColumn?.title ?? "Unknown"}</span>
        </p>
      </div>
    </div>
  );
}

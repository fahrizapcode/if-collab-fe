"use client";

import Image from "next/image";
import { PublicUser } from "@/types/typesUser";
import { usersService } from "@/lib/services/users.service";

import UserAvatar from "./UserAvatar";

interface BoardCardProps {
  boardId: string;
  title: string;
  totalTasks: number;
  diffDays: number | null;
  visibleUsers: PublicUser[];
  remainingCount: number;
  onOpen: (id: string) => void;
}

export default function BoardCard({
  boardId,
  title,
  totalTasks,
  diffDays,
  visibleUsers,
  remainingCount,
  onOpen,
}: BoardCardProps) {
  return (
    <div
      onClick={() => onOpen(boardId)}
      className="
  relative rounded-lg
  bg-np text-white
  cursor-pointer
  flex flex-col justify-end
  
  w-34 h-34

  md:w-40 md:h-40
  
  px-1.5 py-3 md:px-3 md:py-4
  
  transition-all duration-200 ease-out
  hover:-translate-y-1 hover:shadow-xl
  active:translate-y-0.5 
  active:shadow-md 
  active:scale-[0.98]
"
    >
      {/* AVATAR STACK */}
      <div className="absolute top-2 right-2 md:top-3 md:right-3 flex -space-x-2">
        {visibleUsers.map((user) => (
          <UserAvatar
            key={user.id}
            userId={user.id}
            userName={user.name}
            hasAvatar={user.has_avatar}
            className="border-2 border-np md:size-7 size-6"
          />
        ))}

        {remainingCount > 0 && (
          <div
            className="w-5 h-5 md:w-6 md:h-6 rounded-full 
                   bg-white text-np text-[9px] md:text-[10px]
                   flex items-center justify-center 
                   border-2 border-np font-medium"
          >
            +{remainingCount}
          </div>
        )}
      </div>

      {/* META INFO */}
      <div className="flex gap-1.5 mb-1.5 flex-wrap">
        {/* TASK */}
        <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-md">
          <Image
            src="/icons/document-purple.svg"
            alt="Task Icon"
            width={12}
            height={12}
            className="w-3 h-3 md:w-4 md:h-4"
          />
          <span className="text-np text-[10px] md:text-xs font-medium">
            {totalTasks}
          </span>
        </div>

        {/* DEADLINE */}
        {diffDays !== null && (
          <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-md">
            <Image
              src="/icons/date-purple.svg"
              alt="Deadline Icon"
              width={12}
              height={12}
              className="w-3 h-3 md:w-4 md:h-4"
            />
            <span
              className={`text-[10px] md:text-xs font-medium ${diffDays > 0 ? "text-dp" : "text-red-500"
                }`}
            >
              {diffDays > 0 ? `${diffDays} Hari` : "Terlewat"}
            </span>
          </div>
        )}
      </div>

      {/* TITLE */}
      <div className="text-xs md:text-sm font-semibold leading-snug line-clamp-2">
        {title}
      </div>
    </div>
  );
}

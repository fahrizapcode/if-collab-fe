"use client";

import Image from "next/image";

interface SidebarItemProps {
  title: string;
  icon: string;
  active?: boolean;
  onClick: () => void;
}

export default function SidebarItem({
  title,
  icon,
  active,
  onClick,
}: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left
        px-3 sm:px-4
        py-3.5 sm:py-4
        rounded-md
        text-[0.95rem] sm:text-[1rem]
        font-medium
        flex items-center gap-x-2
        transition-all duration-200
        ${active ? "bg-lp text-dp" : "bg-white text-gry hover:bg-lp"}
      `}
    >
      <Image
        src={icon}
        alt={title}
        width={22}
        height={22}
        className="sm:w-[26px]"
      />
      <span className="line-clamp-1">{title}</span>
    </button>
  );
}

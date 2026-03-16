"use client";

import React from "react";
import Image from "next/image";
interface ButtonProps {
  srcIcon: string;
  children: React.ReactNode;
  iconWidth: number;
  iconHeight: number;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  fullWidth?: boolean; // default true (ikut parent)
  className?: string;
  disabled?: boolean;
}

export default function ButtonIcon({
  srcIcon,
  iconWidth,
  iconHeight,
  children,
  type = "button",
  onClick,
  fullWidth = true,
  className = "",
  disabled = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${fullWidth ? "w-full" : "w-auto"}
        px-4 py-2 rounded-lg text-sm font-medium
        bg-np text-white flex relative
        hover:opacity-70 transition
        disabled:opacity-50 disabled:cursor-not-allowed
        active:opacity-20
        cursor-pointer
        items-center gap-x-2
        justify-center
        ${className}
      `}
    >
      <Image
        src={srcIcon}
        alt="add icon"
        width={iconWidth}
        height={iconHeight}
        className="object-contain"
      />
      {children}
      <div className={`w-${iconWidth}`}></div>
    </button>
  );
}

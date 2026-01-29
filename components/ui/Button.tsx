"use client";

import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  fullWidth?: boolean; // default true (ikut parent)
  className?: string;
  disabled?: boolean;
}

export default function Button({
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
        bg-np text-white
        hover:opacity-70 transition
        disabled:opacity-50 disabled:cursor-not-allowed
        active:opacity-20
        cursor-pointer
        ${className}
      `}
    >
      {children}
    </button>
  );
}

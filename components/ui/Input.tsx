"use client";

import React from "react";

interface InputProps {
  label?: string;
  name: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;

  className?: string; // untuk <input />
  wrapperClassName?: string; // untuk container
}

export default function Input({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  className = "",
  wrapperClassName = "",
}: InputProps) {
  return (
    <div className={`flex flex-col gap-1 w-full ${wrapperClassName}`}>
      {label && (
        <label
          htmlFor={name}
          className="text-md sm:text-xl font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          rounded-lg border h-12 sm:h-14 px-3 py-2 text-sm sm:text-lg
          outline-none transition
          ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-dp"}
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "focus:ring-2"}
          ${className}
        `}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

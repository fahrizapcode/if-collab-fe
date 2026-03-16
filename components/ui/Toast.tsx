"use client";

import React, { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = React.useCallback(() => {
    setIsExiting(true);
    setTimeout(onClose, 300); // Wait for transition
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const colors = {
    success: "border-green-100 bg-green-50 text-green-800",
    error: "border-red-100 bg-red-50 text-red-800",
    info: "border-blue-100 bg-blue-50 text-blue-800",
  };

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-[100]
        flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg
        transition-all duration-300 ease-in-out
        ${isExiting ? "opacity-0 translate-y-2 scale-95" : "opacity-100 translate-y-0 scale-100 animate-in fade-in slide-in-from-bottom-2"}
        ${colors[type]}
      `}
    >
      {icons[type]}
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={handleClose}
        className="ml-2 hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

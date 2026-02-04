"use client";

import { forwardRef } from "react";
import clsx from "clsx";

export type TextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    error?: boolean;
  };

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={clsx(
          "w-full rounded-lg border px-3 py-2 text-sm outline-none transition",
          "placeholder:text-gray-400",
          error
            ? "border-red-500 focus:border-red-500"
            : "border-gray-300 focus:border-purple-600",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;

import { useEffect, useRef, useState } from "react";

type TagInputProps = {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
};

export default function TagInput({
  selectedTags,
  onChange,
  placeholder = "buat tag",
  disabled = false,
}: TagInputProps & { disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const addTag = (tag: string) => {
    if (disabled) return;
    onChange([...selectedTags, tag]);
    setQuery("");
    setOpen(false);
  };

  const removeTag = (tag: string) => {
    if (disabled) return;
    onChange(selectedTags.filter((t) => t !== tag));
  };

  // close dropdown when click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="block sm:text-[0.9rem] font-medium">Tag</label>

      {/* Selected tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 px-4 bg-yellow-100 py-1 sm:py-[2px] rounded-full bg-lp text-dp text-md sm:text-[0.9rem] text-yellow-700"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-xl sm:text-base leading-none"
              >
                ×
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Input */}
      <input
        value={query}
        disabled={disabled}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={disabled ? "Tag proyek" : placeholder}
        className="w-full border rounded text-[1rem] sm:text-[0.9rem] p-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
      />

      {/* Dropdown */}
      {open && query.trim() !== "" && (
        <div
          className="
          absolute z-20 mt-1 w-full 
          rounded-md border border-gray-200 bg-white 
          shadow-lg
          max-h-56 overflow-auto
        "
        >
          <button
            type="button"
            onClick={() => addTag(query.trim())}
            disabled={query.trim() === ""}
            className={`
            w-full flex items-center gap-2
            px-3 py-2.5 sm:py-2 text-md sm:text-[0.9rem]
            font-medium border-b border-gray-100
            transition-colors
            ${
              query.trim() === ""
                ? "text-gray-400 cursor-not-allowed"
                : "text-purple-600 hover:bg-purple-50"
            }
          `}
          >
            <span className="text-lg sm:text-base">➕</span>
            <span>
              Buat tag{" "}
              <strong className="font-semibold">“{query.trim()}”</strong>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

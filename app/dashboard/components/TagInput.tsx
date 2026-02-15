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
}: TagInputProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const addTag = (tag: string) => {
    onChange([...selectedTags, tag]);
    setQuery("");
    setOpen(false);
  };

  const removeTag = (tag: string) => {
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
      <label className="block  sm:text-[1.15rem] font-medium">Tag</label>

      {/* Selected tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 px-4 bg-yellow-100 py-1 rounded-full bg-lp text-dp text-md text-yellow-700"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className=" text-xl "
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full border rounded text-[1rem] sm:text-[1.15rem] p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      {/* Dropdown */}
      {open && (
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
            onClick={() => addTag(query)}
            className="
          w-full flex items-center gap-2
          px-3 py-2.5 text-md text-purple-600 font-medium
          hover:bg-purple-50 transition-colors
          border-b border-gray-100
        "
          >
            <span className="text-lg">➕</span>
            <span>
              Buat tag <strong className="font-semibold ">“{query}”</strong>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

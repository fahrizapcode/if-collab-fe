import { useEffect, useRef, useState } from "react";

type TagInputProps = {
  availableTags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
};

export default function TagInput({
  availableTags,
  selectedTags,
  onChange,
  placeholder = "Cari atau buat tag...",
}: TagInputProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filteredTags = availableTags.filter(
    (tag) =>
      tag.toLowerCase().includes(query.toLowerCase()) &&
      !selectedTags.includes(tag),
  );

  const canCreate =
    query.trim().length > 0 &&
    !availableTags.includes(query) &&
    !selectedTags.includes(query);

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
      <label className="block text-[1.15rem] font-medium">Tag</label>

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
        className="w-full border rounded text-[1.125rem] p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
          {/* Create new tag */}
          {canCreate && (
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
                Buat tag <strong className="font-semibold">“{query}”</strong>
              </span>
            </button>
          )}

          {/* Empty state */}
          {filteredTags.length === 0 && !canCreate && (
            <div className="px-3 py-3 text-sm text-gray-400 text-center">
              Tidak ada tag yang cocok
            </div>
          )}

          {/* Tag list */}
          {filteredTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className="
          w-full text-left
          px-3 py-2.5 text-md font-medium text-gray-700
          hover:bg-lp hover:text-dp
          transition-colors
        "
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>{tag}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

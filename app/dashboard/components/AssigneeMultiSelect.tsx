import { PublicUser } from "@/types/typesUser";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

type Props = {
  users: PublicUser[];
  value: PublicUser[];
  onChange: (users: PublicUser[]) => void;
  max?: number; // default 3
};

export default function AssigneeMultiSelect({
  users,
  value,
  onChange,
  max = 3,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedIds = value.map((u) => u.nim_nip);

  const availableUsers = users.filter((u) => !selectedIds.includes(u.nim_nip));

  const isMax = value.length >= max;

  const addUser = (user: PublicUser) => {
    if (isMax) return;
    onChange([...value, user]);
  };

  const removeUser = (nim_nip: string) => {
    onChange(value.filter((u) => u.nim_nip !== nim_nip));
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
      <label className="block text-[1.15rem] font-medium mb-1">
        Penanggung Jawab
      </label>

      {/* Selected users */}
      <div
        className={`min-h-[44px] w-full border rounded px-2 py-2 
    flex items-center justify-between gap-2 cursor-pointer
    ${isMax ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
  `}
        onClick={() => !isMax && setOpen(!open)}
      >
        {/* LEFT: selected users / placeholder */}
        <div className="flex flex-wrap gap-2">
          {value.length === 0 && (
            <span className="text-md text-gray-400 py-1.5 px-1">
              Pilih penanggung jawab (maks {max})
            </span>
          )}

          {value.map((user) => (
            <div
              key={user.nim_nip}
              className="flex items-center gap-2 bg-lp text-dp 
          rounded-md px-2 py-0.5 text-sm"
            >
              <Image
                src={user.avatar || "/images/default-avatar.png"}
                alt={user.name}
                width={20}
                height={20}
                className="w-7 h-7 rounded-full object-cover"
              />

              <span className="max-w-[120px] truncate text-[1.05rem]">
                {user.name}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeUser(user.nim_nip);
                }}
                className="text-np hover:text-dp text-xl leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* RIGHT: dropdown icon */}
        <ChevronDown
          size={20}
          className={`shrink-0 text-gray-500 transition-transform duration-200
      ${open ? "rotate-180" : ""}
      ${isMax ? "opacity-40" : ""}
    `}
        />
      </div>

      {/* Max info */}
      {isMax && (
        <p className="text-xs text-red-500 mt-1">
          Maksimal {max} penanggung jawab
        </p>
      )}

      {/* Dropdown */}
      {open && !isMax && (
        <div className="absolute z-20 mt-1 w-full bg-white  rounded-md shadow-xl max-h-66 overflow-auto border border-gray-300">
          {availableUsers.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">
              Semua user sudah dipilih
            </div>
          ) : (
            availableUsers.map((user) => (
              <button
                type="button"
                key={user.nim_nip}
                onClick={() => {
                  addUser(user);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-5 px-4 py-2 hover:bg-purple-100 text-left"
              >
                <Image
                  src={user.avatar || ""}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover"
                  width={100}
                  height={100}
                />
                <span className="text-md">{user.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

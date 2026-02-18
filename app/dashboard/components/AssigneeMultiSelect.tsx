import { PublicUser } from "@/types/typesUser";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

type Props = {
  users: PublicUser[];
  value: PublicUser[];
  onChange: (users: PublicUser[]) => void;
  max?: number;
};

export default function AssigneeMultiSelect({
  users,
  value,
  onChange,
  max = 3,
}: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ======================
     Derived State
  ====================== */

  const selectedIds = value.map((user) => user.nim_nip);

  const availableUsers = users.filter(
    (user) => !selectedIds.includes(user.nim_nip),
  );

  const isMax = value.length >= max;

  /* ======================
     Handlers
  ====================== */

  const toggleDropdown = () => {
    if (!isMax) {
      setOpen((prev) => !prev);
    }
  };

  const addUser = (user: PublicUser) => {
    if (isMax) return;
    onChange([...value, user]);
  };

  const removeUser = (nim_nip: string) => {
    onChange(value.filter((user) => user.nim_nip !== nim_nip));
  };

  /* ======================
     Close On Outside Click
  ====================== */

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* ======================
     Render
  ====================== */

  return (
    <div ref={containerRef} className="relative">
      <label className="block sm:text-[0.9rem] font-medium mb-1">
        Penanggung Jawab
      </label>

      {/* Selected Users Field */}
      <div
        className={`min-h-[44px] sm:min-h-[38px] w-full border rounded px-2 py-2 sm:py-1.5 
      flex items-center justify-between gap-2 cursor-pointer
      ${isMax ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
      `}
        onClick={toggleDropdown}
      >
        {/* LEFT: Selected Users / Placeholder */}
        <div className="flex flex-wrap gap-2">
          {value.length === 0 && (
            <span className="text-[0.95rem] sm:text-[0.9rem] text-gray-400 py-1.5 sm:py-1 px-1">
              Pilih penanggung jawab (maks {max})
            </span>
          )}

          {value.map((user) => {
            const avatarSrc = user.avatar || "/images/default-avatar.png";

            return (
              <div
                key={user.nim_nip}
                className="flex items-center gap-2 bg-lp text-dp 
              rounded-md px-2 py-0.5 sm:py-[2px] text-sm sm:text-[0.85rem]"
              >
                <Image
                  src={avatarSrc}
                  alt={user.name}
                  width={20}
                  height={20}
                  className="w-7 h-7 sm:w-6 sm:h-6 rounded-full object-cover"
                />

                <span className="max-w-[120px] truncate text-[1.05rem] sm:text-[0.9rem]">
                  {user.name}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeUser(user.nim_nip);
                  }}
                  className="text-np hover:text-dp text-xl sm:text-base leading-none"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>

        {/* RIGHT: Dropdown Icon */}
        <ChevronDown
          size={20}
          className={`shrink-0 text-gray-500 transition-transform duration-200
        ${open ? "rotate-180" : ""}
        ${isMax ? "opacity-40" : ""}
        `}
        />
      </div>

      {/* Max Info */}
      {isMax && (
        <p className="text-xs sm:text-[0.7rem] text-red-500 mt-1">
          Maksimal {max} penanggung jawab
        </p>
      )}

      {/* Dropdown */}
      {open && !isMax && (
        <div className="absolute z-20 mt-1 w-full bg-white rounded-md shadow-xl max-h-66 overflow-auto border border-gray-300">
          {availableUsers.length === 0 ? (
            <div className="px-3 py-2 sm:py-1.5 text-sm sm:text-[0.85rem] text-gray-400">
              Semua user sudah dipilih
            </div>
          ) : (
            availableUsers.map((user) => {
              const avatarSrc = user.avatar || "";

              return (
                <button
                  type="button"
                  key={user.nim_nip}
                  onClick={() => {
                    addUser(user);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-5 px-4 py-2 sm:py-1.5 hover:bg-purple-100 text-left"
                >
                  <Image
                    src={avatarSrc}
                    alt={user.name}
                    className="w-9 h-9 sm:w-7 sm:h-7 rounded-full object-cover"
                    width={100}
                    height={100}
                  />
                  <span className="text-md sm:text-[0.9rem]">{user.name}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

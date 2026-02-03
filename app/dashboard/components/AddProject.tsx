"use client";

import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { addProject } from "@/store/boardsSlice";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ButtonIcon from "@/components/ui/ButtonIcon";
import { ActiveComponent } from "@/types/types";
import Image from "next/image";

type AddProjectProps = {
  isOpen: boolean;
  setIsActiveOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  setIsActiveComponent: React.Dispatch<React.SetStateAction<ActiveComponent>>;
};

export default function AddProject({
  isOpen,
  setIsActiveComponent,
  setIsActiveOverlay,
}: AddProjectProps) {
  const dispatch = useAppDispatch();

  const [title, setTitle] = useState("");
  const [statuses, setStatuses] = useState<string[]>([
    "Belum dimulai",
    "Belum dimulai",
    "Belum dimulai",
  ]);
  const [deadline, setDeadline] = useState("");

  const handleAddStatus = () => {
    setStatuses((prev) => [...prev, "Status baru"]);
  };

  const handleRemoveStatus = (index: number) => {
    setStatuses((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleStatusChange = (index: number, value: string) => {
    setStatuses((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    dispatch(
      addProject({
        title,
        statuses,
        deadline: deadline || undefined,
      }),
    );

    // reset form
    setTitle("");
    setStatuses(["Belum dimulai", "Belum dimulai", "Belum dimulai"]);
    setDeadline("");
    setIsActiveOverlay(false);
    setIsActiveComponent(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`h-[90dvh] sm:h-[80dvh]  w-full sm:w-160 rounded-xl bg-white
      transition-transform duration-300 ease-in-out absolute z-31 p-6
      ${isOpen ? "translate-y-32 md:translate-y-18" : "translate-y-[110vh]"}`}
    >
      <h2 className="text-2xl sm:text-3xl font-semibold mb-4 flex justify-between">
        Proyek Baru{" "}
        <span>
          <Image
            src="/icons/add.svg"
            alt="add"
            width={50}
            height={50}
            className="rotate-45 w-10 sm:w-12 cursor-pointer sm:block hidden"
            onClick={() => setIsActiveComponent(null)}
          />
        </span>
      </h2>

      {/* Nama Proyek */}
      <div className="mb-4">
        <label className="text-md font-medium">Nama Proyek</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Masukkan nama proyek"
          name=""
        />
      </div>

      {/* Status */}
      <div className="mb-4 h-66 sm:h-76 overflow-y-scroll pt-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-md font-medium">Status</span>
          <span className="text-sm bg-purple-600 text-white rounded-full h-6 w-6 flex items-center justify-center">
            {statuses.length}
          </span>
        </div>

        <div className="space-y-2 sm:px-1">
          {statuses.map((status, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={status}
                onChange={(e) => handleStatusChange(i, e.target.value)}
                name=""
              />

              <button
                type="button"
                onClick={() => handleRemoveStatus(i)}
                disabled={statuses.length <= 1}
                className="h-12 w-12 flex items-center justify-center
                rounded-md text-gray-500 hover:text-red-500
                hover:bg-red-50 transition disabled:opacity-40"
                aria-label="Hapus status"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <ButtonIcon
          srcIcon={"/icons/add-white.svg"}
          iconHeight={24}
          iconWidth={24}
          className="mt-1.5 sm:mt-2 text-[0.85rem] sm:text-[1.1rem] py-3.5 rounded-lg sm:ml-1 w-50"
          fullWidth={false}
          onClick={handleAddStatus}
        >
          Tambah Status
        </ButtonIcon>
      </div>

      {/* Deadline */}
      <div className="mb-8">
        <Input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          label="Tenggat Waktu (Opsional)"
          name="deadline"
          className="sm:ml-1 w-[98%]"
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="text-[1rem] sm:text-[1.175rem] py-4"
        disabled={!title.trim()}
      >
        Buat Proyek
      </Button>
    </form>
  );
}

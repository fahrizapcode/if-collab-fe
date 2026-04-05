"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";

import { useAppDispatch } from "@/store/hooks";
import { addProject } from "@/store/boardsSlice";
import { RootState } from "@/store/store";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ButtonIcon from "@/components/ui/ButtonIcon";

import { ActiveComponent } from "@/types/types";
import { useUI } from "@/components/providers/UIProvider";

type AddProjectProps = {
  isOpen: boolean;
  setIsActiveOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  setIsActiveComponent: React.Dispatch<React.SetStateAction<ActiveComponent>>;
  setIsBoardView: React.Dispatch<React.SetStateAction<boolean>>;
};

const DEFAULT_STATUSES = ["Belum dimulai", "Belum dimulai", "Belum dimulai"];

export default function AddProject({
  isOpen,
  setIsActiveComponent,
  setIsActiveOverlay,
  setIsBoardView
}: AddProjectProps) {
  const dispatch = useAppDispatch();
  const { showToast } = useUI();
  const user = useSelector((state: RootState) => state.user.currentUser);

  const [isLoading, setIsLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [statuses, setStatuses] = useState<string[]>(DEFAULT_STATUSES);
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  if (!user) return null;

  // ===============================
  // Handlers
  // ===============================

  const handleAddStatus = () => {
    if (statuses.length >= 10) {
      showToast("Maksimal 10 status telah tercapai", "error");
      return;
    }
    setStatuses((prev) => [...prev, "Status baru"]);
  };

  const handleRemoveStatus = (index: number) => {
    setStatuses((prev) => {
      if (prev.length <= 1) {
          showToast("Minimal harus ada 1 status", "error");
          return prev;
      }
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

  const resetForm = () => {
    setTitle("");
    setStatuses(DEFAULT_STATUSES);
    setDeadline("");
    setDescription("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const result = await dispatch(
        addProject({
          title,
          statuses,
          deadline: deadline || undefined,
          description: description || undefined,
          createdBy: user.nim_nip,
        }),
      ).unwrap();

      showToast(`Proyek "${result.title}" berhasil dibuat`, "success");
      resetForm();
      setIsActiveOverlay(false);
      setIsActiveComponent(null);
      setIsBoardView(true);
    } catch (err: any) {
      console.error("Gagal membuat proyek:", err);
      showToast(err.message || "Gagal membuat proyek. Pastikan data benar.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================
  // Render
  // ===============================

  return (
    <form
      onSubmit={handleSubmit}
      className={`
    h-[75dvh] sm:h-[85vh]
    w-[95%] sm:w-160
    rounded-xl bg-white
    transition-transform duration-300 ease-in-out
    fixed left-1/2 -translate-x-1/2 z-[90] p-6
    flex flex-col
    ${isOpen ? "translate-y-20 md:translate-y-10" : "translate-y-[110vh]"}
  `}
    >
      <h2 className="text-2xl sm:text-2xl items-center font-semibold mb-4 flex justify-between">
        Proyek Baru
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

      {/* SCROLL AREA */}
      <div className="h-120 sm:h-100 overflow-y-scroll pr-1">
        {/* Nama Proyek */}
        <div className="mb-4">
          <label className="text-[1rem] font-medium">Nama Proyek</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Masukkan nama proyek"
            name=""
          />
        </div>

        {/* Status */}
        <div className="mb-4 pt-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[1rem]  font-medium">Status</span>
            <span className="text-sm bg-purple-600 text-white rounded-full h-6 w-6 flex items-center justify-center">
              {statuses.length}
            </span>
          </div>

          <div className="space-y-2 ">
            {statuses.map((status, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={status}
                  onChange={(e) => handleStatusChange(index, e.target.value)}
                  name=""
                />

                <button
                  type="button"
                  onClick={() => handleRemoveStatus(index)}
                  disabled={statuses.length <= 1}
                  className="h-12 w-12 flex items-center justify-center
              rounded-md text-gray-500 hover:text-red-500
              hover:bg-red-50 transition disabled:opacity-40"
                  aria-label="Hapus status"
                >
                  <Image
                    src={"/icons/add.svg"}
                    className="rotate-45"
                    alt={""}
                    width={30}
                    height={30}
                  />
                </button>
              </div>
            ))}
          </div>

          <ButtonIcon
            srcIcon={"/icons/add-white.svg"}
            iconHeight={24}
            iconWidth={24}
            className="mt-1.5 sm:mt-2 text-[0.85rem] sm:text-[0.95rem] py-3 rounded-lg  w-50"
            fullWidth={false}
            onClick={handleAddStatus}
          >
            Tambah Status
          </ButtonIcon>
        </div>

        {/* Deskripsi Proyek */}
        <div className="mb-4">
          <label className="text-[1rem] font-medium">Deskripsi Proyek (Opsional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Masukkan deskripsi proyek"
            className="w-full border border-gray-300 rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-purple-500 focus:outline-none min-h-[100px]"
          />
        </div>

        {/* Deadline */}
        <div className="mb-4">
          <Input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            label="Tenggat Waktu (Opsional)"
            name="deadline"
            className=" w-[98%]"
          />
        </div>
      </div>

      {/* FIXED BOTTOM BUTTON */}
      <div className="pt-4  mt-3">
        <Button
          type="submit"
          className="text-[1rem] sm:text-[1.1rem] py-4 w-full"
          disabled={!title.trim() || isLoading}
        >
          {isLoading ? "Memproses..." : "Buat Proyek"}
        </Button>
      </div>
    </form>
  );
}

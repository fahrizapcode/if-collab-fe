"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";

import { BoardData, ActiveComponent } from "@/types/types";
import { PublicUser } from "@/types/typesUser";

import AssigneeMultiSelect from "./AssigneeMultiSelect";
import TagInput from "./TagInput";

import {
  makeSelectTagsByBoardId,
  makeSelectUsersByNims,
} from "@/store/boardsSelectors";
import { addTask } from "@/store/boardsSlice";

type TaskFormProps = {
  users: PublicUser[];
  availableTags: string[];
  isOpen: boolean;
  taskColumnId: string;
  boardId: string;
  setIsActiveOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  setIsActiveComponent: React.Dispatch<React.SetStateAction<ActiveComponent>>;
};

const PRIORITY_LEVELS = ["low", "medium", "high"] as const;

const PRIORITY_LABEL: Record<(typeof PRIORITY_LEVELS)[number], string> = {
  low: "Rendah",
  medium: "Sedang",
  high: "Tinggi",
};

const PRIORITY_CLASSES = {
  low: "text-green-700 bg-green-100",
  medium: "text-yellow-700 bg-yellow-100",
  high: "text-red-700 bg-red-100",
};

export default function AddTask({
  board,
  isOpen,
  taskColumnId,
  setIsActiveOverlay,
  setIsActiveComponent,
}: {
  board: BoardData;
  isOpen: boolean;
  taskColumnId: string;
  setIsActiveOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  setIsActiveComponent: React.Dispatch<React.SetStateAction<ActiveComponent>>;
}) {
  const nimArray = Object.keys(board.members);

  const usersSelector = useMemo(
    () => makeSelectUsersByNims(nimArray),
    [nimArray],
  );

  const tagsSelector = useMemo(
    () => makeSelectTagsByBoardId(board.id),
    [board.id],
  );

  const users = useSelector(usersSelector);
  const tags = useSelector(tagsSelector);

  return (
    <TaskForm
      users={users}
      availableTags={tags}
      isOpen={isOpen}
      taskColumnId={taskColumnId}
      boardId={board.id}
      setIsActiveOverlay={setIsActiveOverlay}
      setIsActiveComponent={setIsActiveComponent}
    />
  );
}

function TaskForm({
  users,
  availableTags,
  isOpen,
  taskColumnId,
  boardId,
  setIsActiveOverlay,
  setIsActiveComponent,
}: TaskFormProps) {
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [priority, setPriority] =
    useState<(typeof PRIORITY_LEVELS)[number]>("low");
  const [assignees, setAssignees] = useState<PublicUser[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [nameError, setNameError] = useState("");

  // Reset form saat modal dibuka/ditutup
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName("");
    setPriority("low");
    setAssignees([]);
    setTags([]);
    setDescription("");
    setDeadline("");
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setNameError("Nama tugas wajib diisi");
      return;
    }

    setNameError("");

    dispatch(
      addTask({
        boardId,
        columnId: taskColumnId,
        title: name,
        priority,
        description,
        tags,
        assignTo: assignees.map((user) => user.nim_nip),
        createdBy: "123705001",
        deadline: deadline || undefined,
      }),
    );

    setIsActiveOverlay(false);
    setIsActiveComponent(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`h-[88dvh] sm:h-[80dvh] 
  px-5 pt-6 sm:pt-4 pb-10
  w-full sm:w-140 
  rounded-xl bg-white z-30 
  flex flex-col gap-y-2 sm:gap-y-2 
  overflow-y-auto justify-between
  transition-transform duration-300 ease-in-out absolute 
  ${isOpen ? "translate-y-28 md:translate-y-16 fixed" : "translate-y-[110vh]"}
`}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-[1.6rem] font-medium">Tambah Tugas</h1>

        <Image
          src="/icons/add.svg"
          alt="add"
          width={40}
          height={40}
          className="rotate-45 w-8 sm:w-12 cursor-pointer hidden sm:block"
          onClick={() => {
            setIsActiveComponent(null);
            setIsActiveOverlay(false);
          }}
        />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-y-2 sm:gap-y-2 overflow-y-auto h-[76%] px-1">
        {/* Nama Tugas */}
        <div>
          <label className="block font-medium text-base sm:text-[0.9rem] mb-1">
            Nama Tugas
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError("");
            }}
            className={`w-full border rounded px-3 py-2 sm:py-1 
        text-base sm:text-[0.9rem]
        focus:outline-none focus:ring-2
        ${
          nameError
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-purple-500"
        }`}
          />

          {nameError && (
            <p className="mt-1 text-xs sm:text-[0.7rem] text-red-500">
              {nameError}
            </p>
          )}
        </div>

        {/* Prioritas */}
        <div>
          <label className="block text-base sm:text-[0.9rem] font-medium mb-1">
            Prioritas
          </label>

          <div className="flex gap-2">
            {PRIORITY_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setPriority(level)}
                className={`px-2 sm:px-3 flex-1 py-3  
            text-sm sm:text-[0.9rem] 
            rounded font-medium border 
            ${
              priority === level
                ? `border-purple-600 ${PRIORITY_CLASSES[level]}`
                : "border-gray-300"
            }`}
              >
                {PRIORITY_LABEL[level]}
              </button>
            ))}
          </div>
        </div>

        {/* Penanggung Jawab */}
        <AssigneeMultiSelect
          users={users}
          value={assignees}
          onChange={setAssignees}
          max={3}
        />

        {/* Tag */}
        <TagInput selectedTags={tags} onChange={setTags} />

        {/* Deskripsi */}
        <div>
          <label className="block text-base sm:text-[0.9rem] font-medium mb-1">
            Deskripsi
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded 
        text-base sm:text-[0.9rem] 
        px-3 py-2 sm:py-1.5
        focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={3}
          />
        </div>

        {/* Tenggat Waktu */}
        <div>
          <label className="block text-base sm:text-[0.9rem] font-medium mb-1">
            Tenggat Waktu
          </label>

          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full border border-gray-300 rounded 
        px-2 py-3 sm:py-2
        text-[1rem] sm:text-[0.9rem]
        focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="w-[100%] px-1">
        <button
          type="submit"
          className="bg-purple-600 text-white font-semibold 
      py-4 sm:py-3 px-4 w-[100%]
      rounded hover:bg-purple-700 
      text-sm sm:text-[0.9rem]"
        >
          Buat Tugas
        </button>
      </div>
    </form>
  );
}

"use client";

import { RootState } from "@/store/store";
import { ActiveComponent, BoardData, Task } from "@/types/types";
import { PublicUser } from "@/types/typesUser";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
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
export default function AddTask({
  isOpen,
  taskColumnId,
  board,
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
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low");
  const [assignees, setAssignees] = useState<PublicUser[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [nameError, setNameError] = useState("");

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

  const priorityClasses = {
    low: "text-green-700 bg-green-100",
    medium: "text-yellow-700 bg-yellow-100",
    high: "text-red-700 bg-red-100",
  };

  return (
    <form
      className={`h-[86dvh] p-4 pt-6 w-[100%] sm:w-160 rounded-xl bg-white z-30 flex flex-col gap-y-3 overflow-y-scroll
        transition-transform duration-300 ease-in-out absolute 
        ${isOpen ? "translate-y-44 md:translate-y-16" : "translate-y-[110vh]"}
      `}
      onSubmit={handleSubmit}
    >
      <div className="flex justify-between">
        <h1 className="text-3xl font-medium">Tambah Tugas</h1>
        <Image
          src="/icons/add.svg"
          alt="add"
          width={50}
          height={50}
          className="rotate-45 w-10 sm:w-12 cursor-pointer sm:block hidden"
          onClick={() => {
            setIsActiveComponent(null);
            setIsActiveOverlay(false);
          }}
        />
      </div>

      <div className="flex flex-col gap-y-3 overflow-y-scroll h-[80%] px-1">
        {/* Nama Tugas */}
        <div>
          <label className="block font-medium text-[1.15rem] mb-1">
            Nama Tugas
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError("");
            }}
            className={`w-full border rounded px-3 py-1.5 text-[1.15rem]
    focus:outline-none focus:ring-2
    ${
      nameError
        ? "border-red-500 focus:ring-red-500"
        : "border-gray-300 focus:ring-purple-500"
    }`}
          />
          {nameError && (
            <p className="mt-1 text-sm text-red-500">{nameError}</p>
          )}
        </div>

        {/* Prioritas */}
        <div>
          <label className="block text-[1.15rem] font-medium  mb-1">
            Prioritas
          </label>
          <div className="flex gap-2">
            {(["low", "medium", "high"] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setPriority(level)}
                className={`px-3 flex-1 py-3 text-lg rounded font-medium border ${
                  priority === level
                    ? `border-purple-600 ${priorityClasses[level]}`
                    : "border-gray-300"
                } `}
              >
                {level === "low"
                  ? "Rendah"
                  : level === "medium"
                    ? "Sedang"
                    : "Tinggi"}
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

        <TagInput
          availableTags={availableTags}
          selectedTags={tags}
          onChange={setTags}
        />

        {/* Deskripsi */}
        <div>
          <label className="block text-[1.15rem] font-medium  mb-1">
            Deskripsi
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded text-[1.15rem] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={4}
          />
        </div>

        {/* Tenggat Waktu */}
        <div>
          <label className="block text-[1.15rem] font-medium mb-1">
            Tenggat Waktu
          </label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>
      {/* Submit */}
      <button
        type="submit"
        className="mt-4 bg-purple-600 text-white font-semibold py-4 px-4 rounded hover:bg-purple-700"
      >
        Buat Tugas
      </button>
    </form>
  );
}

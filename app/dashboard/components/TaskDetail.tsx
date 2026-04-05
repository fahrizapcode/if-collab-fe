"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store/hooks";

import { RootState } from "@/store/store";
import { ActiveComponent, Task } from "@/types/types";
import { PublicUser } from "@/types/typesUser";

import AssigneeMultiSelect from "./AssigneeMultiSelect";
import TagInput from "./TagInput";

import { deleteTask, moveTask, updateTask } from "@/store/boardsSlice";
import { makeSelectUsersByIds } from "@/store/boardsSelectors";

import Image from "next/image";

interface Props {
  isOpen: boolean;
  setIsActiveComponent: React.Dispatch<React.SetStateAction<ActiveComponent>>;
  activeTaskId: string;
}

export default function TaskDetail({
  isOpen,
  setIsActiveComponent,
  activeTaskId,
}: Props) {
  const dispatch = useAppDispatch();

  // ==============================
  // BOARD STATE
  // ==============================

  const activeBoardId = useSelector(
    (state: RootState) => state.boards.activeBoardId,
  );

  const board = useSelector((state: RootState) =>
    activeBoardId ? state.boards.boards[activeBoardId] : undefined,
  );

  const columns = board?.columns ?? {};
  const columnOrder = board?.columnOrder ?? [];
  const members = board?.members ?? [];
  const tasks = board?.tasks ?? {};

  const task: Task | undefined = tasks[activeTaskId];

  // ==============================
  // ROLE CHECK
  // ==============================
  const authUser = useSelector((state: RootState) => state.user.currentUser);
  const userRole = useMemo(() => {
    if (!authUser || !members.length) return null;
    return members.find(m => m.userId === authUser.id)?.role;
  }, [authUser, members]);

  const canEditTask = userRole === 'leader' || userRole === 'manager';
  const canDeleteTask = canEditTask || task?.createdBy === authUser?.id;
  const canMoveTask = userRole && userRole !== 'observer';

  // ==============================
  // DELETE
  // ==============================

  const handleDelete = () => {
    if (!activeBoardId || !task) return;

    dispatch(
      deleteTask({
        boardId: activeBoardId,
        taskId: activeTaskId,
      }),
    );

    setIsActiveComponent(null);
  };

  // ==============================
  // DATE FORMAT
  // ==============================

  const formatForInput = (date?: string | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  // ==============================
  // USERS SELECTOR
  // ==============================

  const memberNims = useMemo(() => members.map((m) => m.userId), [members]);

  const usersSelector = useMemo(
    () => makeSelectUsersByIds(memberNims),
    [memberNims],
  );

  const allUsers = useSelector(usersSelector);

  const [localTitle, setLocalTitle] = useState("");
  const [description, setDescription] = useState("");

  const selectedUsers: PublicUser[] = useMemo(() => {
    if (!task) return [];
    return allUsers.filter((u) => task?.assignees.includes(u.id));
  }, [allUsers, task]);

  // Sync local states
  useEffect(() => {
    if (task) {
      setLocalTitle(task.title);
      setDescription(task.description || "");
    }
  }, [task?.id, task?.title, task?.description]);

  // ==============================
  // CURRENT COLUMN
  // ==============================

  const currentColumnId = useMemo(() => {
    if (!task) return undefined;

    return Object.values(columns).find((col) =>
      col.taskIds.includes(activeTaskId),
    )?.id;
  }, [columns, activeTaskId, task]);

  // ==============================
  // STRICT UPDATE FIELD
  // ==============================

  const updateField = <K extends keyof Task>(key: K, value: Task[K]) => {
    if (!activeBoardId || !task) return;

    dispatch(
      updateTask({
        boardId: activeBoardId,
        taskId: activeTaskId,
        updates: { [key]: value },
      }),
    );
  };

  // ==============================
  // MOVE STATUS
  // ==============================

  const handleMove = (toColumnId: string) => {
    if (
      !activeBoardId ||
      !task ||
      !currentColumnId ||
      currentColumnId === toColumnId
    )
      return;

    dispatch(
      moveTask({
        boardId: activeBoardId,
        taskId: activeTaskId,
        fromColumnId: currentColumnId,
        toColumnId,
        actor: "123705001",
      }),
    );
  };

  // ==============================
  // SAFE RENDER
  // ==============================

  if (!task) return null;

  return (
    <div
      className={`
        absolute inset-y-0 right-0 h-[100dvh] w-[100vw] md:w-160
        bg-white border-l border-black/30 z-30
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0 fixed" : "translate-x-full"}
      `}
    >
      <div className="flex flex-col h-full px-6 py-8 overflow-y-auto gap-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Detail Tugas</h2>
          <Image
            src={"/icons/add.svg"}
            alt="Close"
            width={40}
            height={40}
            className="rotate-45 cursor-pointer"
            onClick={() => setIsActiveComponent(null)}
          />
        </div>

        {/* JUDUL */}
        <div>
          <label className="font-medium">Judul</label>
          <input
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={() => {
              if (localTitle.trim() && localTitle !== task.title) {
                updateField("title", localTitle.trim());
              } else {
                setLocalTitle(task.title);
              }
            }}
            className="w-full border rounded p-3 mt-1 bg-white disabled:bg-gray-50 disabled:text-gray-700"
            disabled={!canEditTask}
          />
        </div>
        
        {/* DESKRIPSI */}
        <div>
          <label className="font-medium">Deskripsi</label>
          <textarea
            value={task.description || ""}
            onChange={(e) => updateField("description", e.target.value)}
            className="w-full border rounded p-3 mt-1 bg-white disabled:bg-gray-50 disabled:text-gray-700 min-h-[100px]"
            placeholder="Tambahkan deskripsi tugas..."
            disabled={!canEditTask}
          />
        </div>

        {/* PRIORITAS */}
        <div>
          <label className="font-medium">Prioritas</label>
          <div className="flex gap-2 mt-2">
            {(["low", "medium", "high"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => updateField("priority", p)}
                disabled={!canEditTask}
                className={`flex-1 py-2 rounded border transition ${task.priority === p
                  ? "bg-purple-100 border-purple-600"
                  : "border-gray-300"
                  } ${!canEditTask ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* PENANGGUNG JAWAB */}
        <div>
          <AssigneeMultiSelect
            users={allUsers}
            value={selectedUsers}
            disabled={!canEditTask}
            onChange={(users) =>
              updateField(
                "assigneeIds" as any,
                users.map((u) => u.id),
              )
            }
          />
        </div>

        {/* TAG */}
        <TagInput
          selectedTags={task.tags ?? []}
          disabled={!canEditTask}
          onChange={(tags) => updateField("tags", tags)}
        />

        {/* DEADLINE */}
        <div>
          <label className="font-medium">Tenggat Waktu</label>
          <input
            type="datetime-local"
            value={formatForInput(task.deadline)}
            disabled={!canEditTask}
            onChange={(e) =>
              updateField(
                "deadline",
                e.target.value
                  ? new Date(e.target.value).toISOString()
                  : undefined,
              )
            }
            className="w-full border rounded p-3 mt-1 bg-white disabled:bg-gray-50 disabled:text-gray-700 disabled:cursor-not-allowed"
          />
        </div>

        {/* STATUS */}
        <div>
          <label className="font-medium">Status</label>
          <div className="flex flex-col gap-2 mt-2">
            {columnOrder.map((columnId) => (
              <button
                key={columnId}
                type="button"
                onClick={() => handleMove(columnId)}
                disabled={!canMoveTask}
                className={`p-2 rounded border text-left transition ${currentColumnId === columnId
                  ? "bg-purple-100 border-purple-600"
                  : "border-gray-300 hover:bg-gray-50"
                  } ${!canMoveTask ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {columns[columnId]?.title}
              </button>
            ))}
          </div>
        </div>

        {/* DELETE */}
        {canDeleteTask && (
          <div className="pt-6 border-t mt-auto">
            <button
              type="button"
              onClick={handleDelete}
              className="w-full py-3 rounded bg-red-600 text-white font-medium hover:bg-red-700 transition"
            >
              Hapus Tugas
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

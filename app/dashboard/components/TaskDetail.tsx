"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { ActiveComponent, Task } from "@/types/types";
import { PublicUser } from "@/types/typesUser";
import { useMemo } from "react";
import AssigneeMultiSelect from "./AssigneeMultiSelect";
import TagInput from "./TagInput";
import { deleteTask, moveTask, updateTask } from "@/store/boardsSlice";
import { makeSelectUsersByNims } from "@/store/boardsSelectors";

export default function TaskDetail({
  isOpen,
  setIsActiveComponent,
  activeTaskId,
}: {
  isOpen: boolean;
  setIsActiveComponent: React.Dispatch<React.SetStateAction<ActiveComponent>>;
  activeTaskId: string;
}) {
  const dispatch = useDispatch();

  const activeBoardId = useSelector(
    (state: RootState) => state.boards.activeBoardId,
  );

  const board = useSelector((state: RootState) =>
    activeBoardId ? state.boards.boards[activeBoardId] : undefined,
  );

  const columns = board?.columns ?? {};
  const columnOrder = board?.columnOrder ?? [];
  const members = board?.members ?? {};
  const tasks = board?.tasks ?? {};

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

  const formatForInput = (date?: string) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  const task: Task | undefined = tasks[activeTaskId];

  // ==============================
  // USERS SELECTOR
  // ==============================

  const memberNims = useMemo(() => Object.keys(members), [members]);

  const usersSelector = useMemo(
    () => makeSelectUsersByNims(memberNims),
    [memberNims],
  );

  const allUsers = useSelector(usersSelector);

  const selectedUsers: PublicUser[] = useMemo(() => {
    if (!task) return [];
    return allUsers.filter((u) => task.assignTo.includes(u.nim_nip));
  }, [allUsers, task]);

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
      className={`absolute inset-y-0 right-0 h-[100dvh] w-[100vw] md:w-190 
      bg-white border-l border-black/30 z-30 
      transition-transform duration-300 ease-in-out
      ${isOpen ? "translate-x-0 fixed" : "translate-x-full"}`}
    >
      <div className="flex flex-col h-full px-6 py-8 overflow-y-auto gap-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Detail Tugas</h2>
          <button onClick={() => setIsActiveComponent(null)}>✕</button>
        </div>

        {/* ================== JUDUL ================== */}
        <div>
          <label className="font-medium">Judul</label>
          <input
            value={task.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full border rounded p-3 mt-1"
          />
        </div>

        {/* ================== PRIORITAS ================== */}
        <div>
          <label className="font-medium">Prioritas</label>
          <div className="flex gap-2 mt-2">
            {(["low", "medium", "high"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => updateField("priority", p)}
                className={`flex-1 py-2 rounded border ${
                  task.priority === p
                    ? "bg-purple-100 border-purple-600"
                    : "border-gray-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* ================== PENANGGUNG JAWAB ================== */}
        <div>
          <AssigneeMultiSelect
            users={allUsers}
            value={selectedUsers}
            onChange={(users) =>
              updateField(
                "assignTo",
                users.map((u) => u.nim_nip),
              )
            }
          />
        </div>

        {/* ================== TAG ================== */}
        <TagInput
          selectedTags={task.tags ?? []}
          onChange={(tags) => updateField("tags", tags)}
        />

        {/* ================== DEADLINE ================== */}
        <div>
          <label className="font-medium">Tenggat Waktu</label>
          <input
            type="datetime-local"
            value={formatForInput(task.deadline)}
            onChange={(e) =>
              updateField(
                "deadline",
                e.target.value
                  ? new Date(e.target.value).toISOString()
                  : undefined,
              )
            }
            className="w-full border rounded p-3 mt-1"
          />
        </div>

        {/* ================== STATUS ================== */}
        <div>
          <label className="font-medium">Status</label>
          <div className="flex flex-col gap-2 mt-2">
            {columnOrder.map((columnId) => (
              <button
                key={columnId}
                type="button"
                onClick={() => handleMove(columnId)}
                className={`p-2 rounded border text-left ${
                  currentColumnId === columnId
                    ? "bg-purple-100 border-purple-600"
                    : "border-gray-300"
                }`}
              >
                {columns[columnId]?.title}
              </button>
            ))}
          </div>
        </div>
        {/* ================== DELETE ================== */}
        <div className="pt-6 border-t">
          <button
            type="button"
            onClick={handleDelete}
            className="w-full py-3 rounded bg-red-600 text-white font-medium hover:bg-red-700 transition"
          >
            Hapus Tugas
          </button>
        </div>
      </div>
    </div>
  );
}

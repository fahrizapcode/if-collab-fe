"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { BoardData, Role, TabType } from "@/types/types";
import { ActiveComponent } from "@/types/types";
import { selectUserByNim } from "@/store/usersSlice";
import { selectUsersByNims } from "@/store/usersSlice";
import {
  addColumn,
  addMember,
  deleteColumn,
  reorderColumn,
  updateColumn,
  updateMemberRole,
  updateBoardMeta,
} from "@/store/boardsSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  makeSelectUserByNim,
  makeSelectUsersByNims,
  selectAllUsers,
} from "@/store/boardsSelectors";
import jsPDF from "jspdf";

interface ProjectDetailProps {
  isOpen: boolean;
  activeBoard: BoardData | null;
  setIsActiveComponent: React.Dispatch<React.SetStateAction<ActiveComponent>>;
}

export default function ProjectDetail({
  isOpen,
  activeBoard,
  setIsActiveComponent,
}: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<
    "status" | "kolaborator" | "pengaturan" | "tambah-kolaborator"
  >("status");
  const createdBy = activeBoard?.createdBy;
  const [newStatusTitle, setNewStatusTitle] = useState("");
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const [search, setSearch] = useState("");

  const dispatch = useDispatch();

  const isMinStatus = (activeBoard?.columnOrder.length ?? 0) <= 3;

  const memberIds = activeBoard ? Object.keys(activeBoard.members) : [];

  // single user (createdBy)
  const userSelector = useMemo(() => {
    if (!createdBy) return null;
    return makeSelectUserByNim(createdBy);
  }, [createdBy]);

  const user = useSelector((state: RootState) =>
    userSelector ? userSelector(state) : undefined,
  );

  // multiple users (memberIds)
  const usersSelector = useMemo(
    () => makeSelectUsersByNims(memberIds),
    [memberIds],
  );

  const users = useSelector(usersSelector);

  // all users
  const allUsersSelector = useMemo(() => selectAllUsers, []);

  const allUsers = useSelector(allUsersSelector);

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState<
    "leader" | "manager" | "member" | "observer"
  >("member");

  if (!activeBoard) return null;

  // Format tanggal dibuat
  const formattedCreatedAt = new Date(activeBoard.createdAt).toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  );

  // Kalau board punya deadline di masa depan nanti bisa diambil dari metadata
  // Sekarang kita ambil contoh deadline dari salah satu task (opsional)
  const firstTaskDeadline =
    Object.values(activeBoard.tasks)[0]?.deadline ?? null;

  const formattedDeadline = firstTaskDeadline
    ? new Date(firstTaskDeadline).toISOString().split("T")[0]
    : "";

  const totalMembers = Object.keys(activeBoard.members).length;
  const totalTasks = Object.keys(activeBoard.tasks).length;
  const getActiveMainTab = (tab: TabType) => {
    if (tab === "tambah-kolaborator") return "kolaborator";
    return tab;
  };

  return (
    <div
      className={`
        absolute
        inset-y-0
        h-[100dvh]
        w-[100vw]
        md:w-190
        flex flex-col
        border-l border-black/30
        px-4 sm:px-6
        py-6 sm:py-8
        bg-white
        z-22
        right-0
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0 fixed" : "translate-x-full"}
      `}
    >
      {/* Header */}
      <div className="border-b border-gray-400 flex items-center gap-2 pb-2 mb-4">
        <Image
          src={"/icons/arrow.svg"}
          width={34}
          height={34}
          alt="arrow"
          className="cursor-pointer"
          onClick={() => setIsActiveComponent(null)}
        />
        <h2 className="text-xl font-semibold">{activeBoard.title}</h2>
      </div>

      {/* Info Section */}
      <div className="mb-6 space-y-4">
        {/* Created By */}
        <div className="flex items-center">
          <span className="text-gray-500 w-[50%] max-w-70">Dibuat oleh</span>
          <div className="flex bg-lp p-1 px-3 rounded-full gap-x-3 items-center">
            <Image
              src={user?.avatar || ""}
              width={26}
              height={26}
              alt="arrow"
              className="rounded-full"
            />
            <span className="font-medium">{user?.name}</span>
          </div>
        </div>

        {/* Created At */}
        <div className="flex  items-center">
          <span className="text-gray-500 w-[50%] max-w-70">Tanggal dibuat</span>
          <span>{formattedCreatedAt}</span>
        </div>

        {/* Deadline */}
        <div className="flex items-center">
          <span className="text-gray-500 w-[50%] max-w-70">Tenggat waktu</span>

          <input
            type="date"
            value={
              activeBoard.deadline
                ? new Date(activeBoard.deadline).toISOString().slice(0, 10)
                : ""
            }
            onChange={(e) =>
              dispatch(
                updateBoardMeta({
                  boardId: activeBoard.id,
                  deadline: e.target.value,
                }),
              )
            }
            className="border border-gray-300 rounded px-2 py-1"
          />
        </div>

        {/* Description */}
        <div>
          <span className="text-gray-500">Deskripsi</span>

          <textarea
            value={activeBoard.description || ""}
            onChange={(e) =>
              dispatch(
                updateBoardMeta({
                  boardId: activeBoard.id,
                  description: e.target.value,
                }),
              )
            }
            className="w-full border border-gray-300 rounded px-2 py-1 mt-1"
            rows={4}
          />
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <div className="text-gray-500 text-sm">Total Task</div>
            <div className="font-semibold text-lg">{totalTasks}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Total Member</div>
            <div className="font-semibold text-lg">{totalMembers}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-4">
        {["status", "kolaborator", "pengaturan"].map((tab) => {
          const isActive = getActiveMainTab(activeTab) === tab;

          return (
            <button
              key={tab}
              className={`px-4 py-2 ${
                isActive
                  ? "border-b-2 border-purple-600 font-semibold"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab(tab as TabType)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "status" && (
          <div className="space-y-4">
            {/* ADD STATUS */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newStatusTitle}
                onChange={(e) => setNewStatusTitle(e.target.value)}
                placeholder="Nama status baru"
                className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
              />
              <button
                onClick={() => {
                  if (!newStatusTitle.trim()) return;

                  dispatch(
                    addColumn({
                      boardId: activeBoard.id,
                      title: newStatusTitle,
                    }),
                  );

                  setNewStatusTitle("");
                }}
                className="bg-np text-white px-4 py-2 rounded-lg text-sm"
              >
                Tambah
              </button>
            </div>

            {/* LIST STATUS */}
            {activeBoard.columnOrder.map((columnId, index) => {
              const column = activeBoard.columns[columnId];
              const isEditing = editingColumnId === column.id;

              return (
                <div
                  key={column.id}
                  className="border border-gray-200 rounded p-3"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                        />
                      ) : (
                        <>
                          <div className="font-semibold">{column.title}</div>
                          <div className="text-sm text-gray-500">
                            {column.taskIds.length} task
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4 items-center">
                      {/* ORDER BUTTON */}
                      <button
                        disabled={index === 0}
                        onClick={() =>
                          dispatch(
                            reorderColumn({
                              boardId: activeBoard.id,
                              sourceIndex: index,
                              destinationIndex: index - 1,
                            }),
                          )
                        }
                        className="text-gray-600 text-sm disabled:opacity-30"
                      >
                        ↑
                      </button>

                      <button
                        disabled={index === activeBoard.columnOrder.length - 1}
                        onClick={() =>
                          dispatch(
                            reorderColumn({
                              boardId: activeBoard.id,
                              sourceIndex: index,
                              destinationIndex: index + 1,
                            }),
                          )
                        }
                        className="text-gray-600 text-sm disabled:opacity-30"
                      >
                        ↓
                      </button>

                      {/* EDIT / DELETE */}
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => {
                              if (!editingTitle.trim()) return;

                              dispatch(
                                updateColumn({
                                  boardId: activeBoard.id,
                                  columnId: column.id,
                                  title: editingTitle,
                                }),
                              );

                              setEditingColumnId(null);
                            }}
                            className="text-green-600 text-sm"
                          >
                            Simpan
                          </button>

                          <button
                            onClick={() => setEditingColumnId(null)}
                            className="text-gray-500 text-sm"
                          >
                            Batal
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingColumnId(column.id);
                              setEditingTitle(column.title);
                            }}
                            className="text-blue-600 text-sm"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              dispatch(
                                deleteColumn({
                                  boardId: activeBoard.id,
                                  columnId: column.id,
                                }),
                              )
                            }
                            className="text-red-600 text-sm"
                          >
                            Hapus
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "kolaborator" && (
          <div className="space-y-2">
            {users.map((user) => {
              const role = activeBoard.members[user.nim_nip].role;

              return (
                <div
                  key={user.nim_nip}
                  className="flex items-center justify-between py-3"
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-3">
                    <Image
                      src={user.avatar}
                      width={40}
                      height={40}
                      alt={user.name}
                      className="rounded-full"
                    />

                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.nim_nip}</p>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex items-center gap-4">
                    {/* Dropdown Role */}
                    <select
                      value={role}
                      onChange={(e) =>
                        dispatch(
                          updateMemberRole({
                            boardId: activeBoard.id,
                            memberId: user.nim_nip,
                            role: e.target.value as Role,
                          }),
                        )
                      }
                      className="
              bg-white
              border
              rounded-xl
              px-4
              py-2
              text-sm
              shadow-sm
              focus:outline-none
              focus:ring-2
              focus:ring-np
            "
                    >
                      <option value="leader">Ketua</option>
                      <option value="manager">Pengelola</option>
                      <option value="member">Anggota</option>
                      <option value="observer">Pengamat</option>
                    </select>

                    {/* Delete Icon */}
                    <button
                      disabled={isMinStatus}
                      className={`text-sm ${
                        isMinStatus
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-red-600"
                      }`}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Tambah Kolaborator Button */}
            <div className="pt-4">
              <button
                onClick={() => setActiveTab("tambah-kolaborator")}
                className="
        bg-np
        text-white
        px-5
        py-2.5
        rounded-xl
        font-medium
        hover:opacity-90
        transition
      "
              >
                + Tambah Kolaborator
              </button>
            </div>
          </div>
        )}

        {activeTab === "tambah-kolaborator" && (
          <div className="mt-6 border-t pt-4 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
              <button onClick={() => setActiveTab("kolaborator")}>←</button>
              <h3 className="font-semibold text-lg">Undang Kolaborator</h3>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari berdasarkan nim atau nama"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
          w-full
          border
          rounded-xl
          px-4
          py-2
          pr-10
          focus:outline-none
          focus:ring-2
          focus:ring-np
        "
              />
              <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
            </div>

            {/* User List */}
            {/* User List */}
            {search.trim() !== "" && (
              <div className="space-y-3">
                {allUsers
                  .filter(
                    (user) =>
                      user.name.toLowerCase().includes(search.toLowerCase()) ||
                      user.nim_nip.includes(search),
                  )
                  .map((user) => {
                    const alreadyMember = !!activeBoard?.members[user.nim_nip];

                    return (
                      <div
                        key={user.nim_nip}
                        className="flex items-center justify-between"
                      >
                        {/* LEFT */}
                        <div className="flex items-center gap-3">
                          <Image
                            src={user.avatar}
                            width={40}
                            height={40}
                            alt={user.name}
                            className="rounded-full"
                          />
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">
                              {user.nim_nip}
                            </p>
                          </div>
                        </div>

                        {/* RIGHT BUTTON */}
                        {alreadyMember ? (
                          <button
                            disabled
                            className="
                  bg-purple-200
                  text-purple-700
                  px-4
                  py-2
                  rounded-xl
                  text-sm
                  font-medium
                "
                          >
                            Sudah diundang
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              dispatch(
                                addMember({
                                  boardId: activeBoard.id,
                                  memberId: user.nim_nip,
                                  role: "member",
                                }),
                              )
                            }
                            className="
                  bg-np
                  text-white
                  px-4
                  py-2
                  rounded-xl
                  text-sm
                  font-medium
                  hover:opacity-90
                  transition
                "
                          >
                            Undang Kolaborasi
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {activeTab === "pengaturan" && (
          <div className="space-y-6 p-4">
            {/* Pengaturan Ekspor PDF */}
            <div className="flex flex-col gap-2">
              <div className="font-semibold text-gray-700">Ekspor Laporan</div>
              <button
                onClick={() => {
                  const doc = new jsPDF();
                  let y = 10; // posisi vertikal awal

                  // INFO BOARD
                  doc.setFontSize(16);
                  doc.text(`Laporan Proyek: ${activeBoard.title}`, 10, y);
                  y += 10;

                  doc.setFontSize(12);
                  doc.text(`ID Board: ${activeBoard.id}`, 10, y);
                  y += 6;
                  doc.text(
                    `Created At: ${new Date(activeBoard.createdAt).toLocaleDateString()}`,
                    10,
                    y,
                  );
                  y += 6;
                  doc.text(`Created By: ${activeBoard.createdBy}`, 10, y);
                  y += 6;
                  doc.text(
                    `Deadline: ${
                      activeBoard.deadline
                        ? new Date(activeBoard.deadline).toLocaleDateString()
                        : "-"
                    }`,
                    10,
                    y,
                  );
                  y += 6;
                  doc.text(`Description: ${activeBoard.description}`, 10, y);
                  y += 10;

                  // MEMBERS
                  doc.setFontSize(14);
                  doc.text("Members:", 10, y);
                  y += 6;
                  doc.setFontSize(12);
                  Object.entries(activeBoard.members).forEach(
                    ([memberId, member]) => {
                      doc.text(`- ${memberId}: ${member.role}`, 12, y);
                      y += 6;
                      if (y > 280) {
                        doc.addPage();
                        y = 10;
                      }
                    },
                  );
                  y += 4;

                  // TASKS PER COLUMN
                  doc.setFontSize(14);
                  doc.text("Tasks per Column:", 10, y);
                  y += 6;

                  doc.setFontSize(12);
                  activeBoard.columnOrder.forEach((columnId) => {
                    const column = activeBoard.columns[columnId];
                    doc.setFont("bold");
                    doc.text(`Column: ${column.title}`, 10, y);
                    y += 6;
                    doc.setFont("normal");

                    column.taskIds.forEach((taskId) => {
                      const task = activeBoard.tasks[taskId];
                      doc.text(`• Task ID: ${task.id}`, 12, y);
                      y += 5;
                      doc.text(`  Title: ${task.title}`, 14, y);
                      y += 5;
                      doc.text(`  Description: ${task.description}`, 14, y);
                      y += 5;
                      doc.text(`  Priority: ${task.priority}`, 14, y);
                      y += 5;
                      doc.text(
                        `  Assigned To: ${
                          task.assignTo.length > 0
                            ? task.assignTo.join(", ")
                            : "-"
                        }`,
                        14,
                        y,
                      );
                      y += 5;
                      doc.text(
                        `  Deadline: ${
                          task.deadline
                            ? new Date(task.deadline).toLocaleDateString()
                            : "-"
                        }`,
                        14,
                        y,
                      );
                      y += 7;
                      if (y > 280) {
                        doc.addPage();
                        y = 10;
                      }
                    });
                    y += 4;
                  });

                  doc.save(`laporan-${activeBoard.id}.pdf`);
                }}
                className="flex items-center gap-2 bg-np text-white px-4 py-2 rounded"
              >
                📄 Ekspor ke PDF
              </button>
            </div>

            {/* Pengaturan Keluar */}
            <div className="flex flex-col gap-2">
              <div className="font-semibold text-gray-700">Keluar Proyek</div>
              <button
                onClick={() => {
                  alert("Keluar dari proyek");
                  // tambahkan logic keluar proyek di sini
                }}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded"
              >
                🔓 Keluar
              </button>
            </div>

            {/* Pengaturan Hapus */}
            <div className="flex flex-col gap-2">
              <div className="font-semibold text-gray-700">Hapus Proyek</div>
              <button
                onClick={() => {
                  alert("Proyek dihapus");
                  // tambahkan logic hapus proyek di sini
                }}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded"
              >
                ❌ Hapus Proyek
              </button>
            </div>

            {/* Info ID Board */}
            <div className="text-gray-500 mt-2">ID Board: {activeBoard.id}</div>
          </div>
        )}
      </div>
    </div>
  );
}

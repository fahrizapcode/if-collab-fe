"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { BoardData, Role, TabType } from "@/types/types";
import { ActiveComponent } from "@/types/types";
import {
  addColumn,
  addMember,
  deleteColumn,
  reorderColumn,
  updateColumn,
  updateMemberRole,
  updateBoardMeta,
  removeMember,
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
    "status" | "kontributor" | "pengaturan" | "tambah-kontributor"
  >("status");

  const [newStatusTitle, setNewStatusTitle] = useState("");
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [search, setSearch] = useState("");

  const dispatch = useDispatch();

  /* =========================
   DERIVED DATA
========================= */

  const createdBy = activeBoard?.createdBy ?? null;
  const memberIds = activeBoard ? Object.keys(activeBoard.members) : [];

  const isMinStatus = (activeBoard?.columnOrder.length ?? 0) <= 3;

  /* =========================
   SELECTORS
========================= */

  // single user (createdBy)
  const userSelector = useMemo(() => {
    return createdBy ? makeSelectUserByNim(createdBy) : null;
  }, [createdBy]);

  const user = useSelector((state: RootState) =>
    userSelector ? userSelector(state) : undefined,
  );

  // multiple users (memberIds)
  const usersSelector = useMemo(() => {
    return makeSelectUsersByNims(memberIds);
  }, [memberIds]);

  const users = useSelector(usersSelector);

  // all users
  const allUsers = useSelector(selectAllUsers);

  /* =========================
   GUARD AFTER HOOKS
========================= */

  if (!activeBoard) return null;

  /* =========================
   FORMATTED DATA
========================= */

  const formattedCreatedAt = new Date(activeBoard.createdAt).toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  );

  const totalMembers = Object.keys(activeBoard.members).length;
  const totalTasks = Object.keys(activeBoard.tasks).length;

  /* =========================
   HELPERS
========================= */

  const getActiveMainTab = (tab: TabType) =>
    tab === "tambah-kontributor" ? "kontributor" : tab;

  return (
    <div
      className={`
        overflow-y-scroll
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
      <div className="border-b border-gray-300 flex items-center gap-2 pb-2 mb-4 sm:pb-3 sm:mb-5">
        <Image
          src={"/icons/arrow.svg"}
          width={28}
          height={28}
          alt="arrow"
          className="cursor-pointer sm:w-[34px] sm:h-[34px]"
          onClick={() => setIsActiveComponent(null)}
        />
        <h2 className="text-lg sm:text-xl font-semibold">
          {activeBoard.title}
        </h2>
      </div>

      {/* Info Section */}
      <div className="mb-5 sm:mb-6 space-y-5 text-sm sm:text-base">
        {/* Created By */}
        <div className="flex items-center">
          <span className="text-gray-500 w-[45%] sm:w-[50%] max-w-40 sm:max-w-70">
            Dibuat oleh
          </span>

          <div className="flex bg-lp py-1 px-2 sm:px-3 rounded-full gap-2 sm:gap-3 items-center">
            <Image
              src={user?.avatar || ""}
              width={22}
              height={22}
              alt="avatar"
              className="rounded-full sm:w-[26px] sm:h-[26px]"
            />
            <span className="font-medium text-sm sm:text-base">
              {user?.name}
            </span>
          </div>
        </div>

        {/* Created At */}
        <div className="flex items-center">
          <span className="text-gray-500 w-[45%] sm:w-[50%] max-w-40 sm:max-w-70">
            Tanggal dibuat
          </span>
          <span className="text-sm sm:text-base">{formattedCreatedAt}</span>
        </div>

        {/* Deadline */}
        <div className="flex items-center">
          <span className="text-gray-500 w-[45%] sm:w-[50%] max-w-40 sm:max-w-70">
            Tenggat waktu
          </span>

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
            className="
        border border-gray-300
        rounded
        px-2 py-1
        text-sm
        sm:text-base
        sm:px-3 sm:py-2
      "
          />
        </div>

        {/* Description */}
        <div>
          <span className="text-gray-500 text-sm sm:text-base">Deskripsi</span>

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
            className="
        w-full
        border border-gray-300
        rounded
        px-2 py-1
        mt-1
        text-sm
        sm:text-base
        sm:px-3 sm:py-2
      "
            rows={3}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-4">
        {["status", "kontributor", "pengaturan"].map((tab) => {
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
      <div className="flex-1">
        {activeTab === "status" && (
          <div className="space-y-3">
            {/* ================= ADD STATUS ================= */}
            <div className="flex gap-3">
              <input
                type="text"
                value={newStatusTitle}
                onChange={(e) => setNewStatusTitle(e.target.value)}
                placeholder="Nama status baru..."
                className="
        w-full
        border border-gray-300
        rounded-lg
        px-4 py-2.5
        text-sm
        focus:outline-none
        focus:ring-2 focus:ring-purple-500
        transition
      "
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
                className="
        bg-purple-600 text-white
        px-5 py-2.5
        rounded-lg
        text-sm font-medium
        hover:bg-purple-700
        transition
        shadow-sm
      "
              >
                Tambah
              </button>
            </div>

            {/* ================= LIST STATUS ================= */}
            {activeBoard.columnOrder.map((columnId, index) => {
              const column = activeBoard.columns[columnId];
              const isEditing = editingColumnId === column.id;

              return (
                <div
                  key={column.id}
                  className="
          bg-white
          border border-gray-200
          rounded-xl
          p-4
          shadow-sm
          hover:shadow-md
          transition
        "
                >
                  <div className="flex justify-between items-start gap-4">
                    {/* LEFT CONTENT */}
                    <div className="flex-1 space-y-1">
                      {isEditing ? (
                        <input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="
                  w-full
                  border border-gray-300
                  rounded-lg
                  px-3 py-2
                  text-sm
                  focus:outline-none
                  focus:ring-2 focus:ring-purple-500
                "
                        />
                      ) : (
                        <>
                          <div className="font-semibold text-gray-800 text-base">
                            {column.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {column.taskIds.length} tugas
                          </div>
                        </>
                      )}
                    </div>

                    {/* RIGHT ACTIONS */}
                    <div className="flex items-center gap-2">
                      {/* ORDER */}
                      <div className="flex flex-col border rounded-md overflow-hidden">
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
                          className="
                  px-2 py-1
                  text-xs
                  hover:bg-gray-100
                  disabled:opacity-30
                "
                        >
                          ↑
                        </button>

                        <button
                          disabled={
                            index === activeBoard.columnOrder.length - 1
                          }
                          onClick={() =>
                            dispatch(
                              reorderColumn({
                                boardId: activeBoard.id,
                                sourceIndex: index,
                                destinationIndex: index + 1,
                              }),
                            )
                          }
                          className="
                  px-2 py-1
                  text-xs
                  hover:bg-gray-100
                  disabled:opacity-30
                  border-t
                "
                        >
                          ↓
                        </button>
                      </div>

                      {/* EDIT MODE */}
                      {isEditing ? (
                        <div className="flex gap-2">
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
                            className="
                    px-3 py-1.5
                    text-xs
                    bg-green-100 text-green-700
                    rounded-md
                    hover:bg-green-200
                    transition
                  "
                          >
                            Simpan
                          </button>

                          <button
                            onClick={() => setEditingColumnId(null)}
                            className="
                    px-3 py-1.5
                    text-xs
                    bg-gray-100 text-gray-600
                    rounded-md
                    hover:bg-gray-200
                    transition
                  "
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingColumnId(column.id);
                              setEditingTitle(column.title);
                            }}
                            className="
                    px-3 py-1.5
                    text-xs
                    bg-blue-100 text-blue-700
                    rounded-md
                    hover:bg-blue-200
                    transition
                  "
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
                            disabled={isMinStatus}
                            className={`
                    px-3 py-1.5
                    text-xs
                    rounded-md
                    transition
                    ${
                      isMinStatus
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    }
                  `}
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {activeTab === "kontributor" && (
          <div className="space-y-4 flex flex-col-reverse sm:flex-col">
            {/* DESKTOP / TABLE */}
            <div className="hidden sm:block overflow-x-auto">
              <div className="min-w-[650px] space-y-3">
                {/* HEADER */}
                <div className="grid grid-cols-3 px-4 py-2 text-xs font-semibold text-purple-800 bg-purple-100 rounded-lg">
                  <span>Nama</span>
                  <span>NIM/NIP</span>
                  <span className="text-right">Role</span>
                </div>

                {users.map((user) => {
                  const role = activeBoard.members[user.nim_nip].role;

                  return (
                    <div
                      key={user.nim_nip}
                      className="
                grid grid-cols-3 items-center
                px-4 py-2.5
                bg-white
                border border-gray-200
                rounded-lg
                hover:shadow-sm
                transition
                text-sm
              "
                    >
                      {/* NAMA */}
                      <div className="flex items-center gap-2.5">
                        <Image
                          src={user.avatar || ""}
                          width={36}
                          height={36}
                          alt={user.name}
                          className="rounded-full border"
                        />
                        <span className="font-medium text-gray-800 whitespace-nowrap">
                          {user.name}
                        </span>
                      </div>

                      {/* NIM */}
                      <div className="text-gray-600 text-xs whitespace-nowrap">
                        {user.nim_nip}
                      </div>

                      {/* ROLE + DELETE */}
                      <div className="flex justify-end items-center gap-2">
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
                    w-36
                    bg-gray-50
                    border border-gray-200
                    rounded-lg
                    px-2.5 py-1.5
                    text-xs
                    focus:outline-none
                    focus:ring-2 focus:ring-np
                  "
                        >
                          <option value="leader">Ketua</option>
                          <option value="manager">Pengelola</option>
                          <option value="member">Anggota</option>
                          <option value="observer">Pengamat</option>
                        </select>

                        <button
                          onClick={() =>
                            dispatch(
                              removeMember({
                                boardId: activeBoard.id,
                                memberId: user.nim_nip,
                              }),
                            )
                          }
                          className="
                    text-red-500
                    hover:text-red-600
                    text-xs
                    font-medium
                  "
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MOBILE VERSION (< sm) */}
            <div className="sm:hidden space-y-3">
              {users.map((user) => {
                const role = activeBoard.members[user.nim_nip].role;

                return (
                  <div
                    key={user.nim_nip}
                    className="
              bg-white
              border border-gray-200
              rounded-lg
              p-3
              space-y-3
              text-sm
            "
                  >
                    {/* TOP */}
                    <div className="flex items-center gap-3">
                      <Image
                        src={user.avatar || ""}
                        width={40}
                        height={40}
                        alt={user.name}
                        className="rounded-full border"
                      />
                      <div>
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.nim_nip}</p>
                      </div>
                    </div>

                    {/* ROLE + DELETE */}
                    <div className="flex items-center justify-between gap-2">
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
                  flex-1
                  bg-gray-50
                  border border-gray-200
                  rounded-lg
                  px-3 py-2
                  text-xs
                  focus:outline-none
                  focus:ring-2 focus:ring-np
                "
                      >
                        <option value="leader">Ketua</option>
                        <option value="manager">Pengelola</option>
                        <option value="member">Anggota</option>
                        <option value="observer">Pengamat</option>
                      </select>

                      <button
                        onClick={() =>
                          dispatch(
                            removeMember({
                              boardId: activeBoard.id,
                              memberId: user.nim_nip,
                            }),
                          )
                        }
                        className="
                  text-red-500
                  text-xs
                  font-medium
                "
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ADD BUTTON */}
            <div className="pt-3">
              <button
                onClick={() => setActiveTab("tambah-kontributor")}
                className="
          w-full sm:w-auto
          bg-np
          text-white
          px-5 py-4 sm:py-2
          rounded-lg
          text-sm
          font-medium
          hover:shadow-md
          transition
          flex items-center
          gap-x-2 justify-center
          mb-4
        "
              >
                <Image
                  src={"/icons/add-white.svg"}
                  alt="add"
                  width={26}
                  height={26}
                />
                Tambah Kontributor
              </button>
            </div>
          </div>
        )}

        {activeTab === "tambah-kontributor" && (
          <div className="mt-5 sm:mt-6 space-y-3 sm:space-y-6">
            {/* HEADER */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                onClick={() => setActiveTab("kontributor")}
                className="
          w-8 h-8 sm:w-9 sm:h-9
          flex items-center justify-center
          rounded-full
          bg-gray-100
          hover:bg-gray-200
          transition
          text-sm
        "
              >
                <Image
                  src={"/icons/arrow.svg"}
                  alt={"Arrow"}
                  width={30}
                  height={30}
                  className="rotate-180"
                />
              </button>
              <h3 className="font-semibold text-base sm:text-lg">
                Undang Kontributor
              </h3>
            </div>

            {/* SEARCH */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari berdasarkan nim atau nama"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
          w-full
          border border-gray-200
          rounded-xl sm:rounded-2xl
          px-3 sm:px-4
          py-2.5 sm:py-3
          pr-9 sm:pr-10
          text-sm
          focus:outline-none
          focus:ring-2 focus:ring-np
          transition
        "
              />
              <span className="absolute right-3 sm:right-4 top-2.5 sm:top-3 text-gray-400 text-sm">
                <Image
                  src={"/icons/search.svg"}
                  alt="Search"
                  width={20}
                  height={20}
                />
              </span>
            </div>

            {/* RESULT LIST */}
            {search.trim() !== "" && (
              <div className="space-y-2.5 sm:space-y-3">
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
                        className="
                  bg-white
                  border border-gray-200
                  rounded-xl sm:rounded-2xl
                  p-3 sm:p-4
                  hover:bg-gray-50
                  transition
                "
                      >
                        {/* DESKTOP */}
                        <div className="hidden sm:flex items-center justify-between">
                          {/* LEFT */}
                          <div className="flex items-center gap-3">
                            <Image
                              src={user.avatar || ""}
                              width={40}
                              height={40}
                              alt={user.name}
                              className="rounded-full border"
                            />
                            <div>
                              <p className="font-medium text-gray-800 text-sm">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {user.nim_nip}
                              </p>
                            </div>
                          </div>

                          {/* BUTTON */}
                          {alreadyMember ? (
                            <span
                              className="
                        bg-purple-100
                        text-purple-700
                        px-3 py-1.5
                        rounded-lg
                        text-xs
                        font-medium
                      "
                            >
                              Sudah diundang
                            </span>
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
                        px-4 py-1.5
                        rounded-lg
                        text-xs
                        font-medium
                        hover:shadow-sm
                        transition
                      "
                            >
                              Undang
                            </button>
                          )}
                        </div>

                        {/* MOBILE (< sm) */}
                        <div className="sm:hidden space-y-2">
                          <div className="flex items-center gap-3">
                            <Image
                              src={user.avatar || ""}
                              width={36}
                              height={36}
                              alt={user.name}
                              className="rounded-full border"
                            />
                            <div>
                              <p className="font-medium text-sm text-gray-800">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {user.nim_nip}
                              </p>
                            </div>
                          </div>

                          {alreadyMember ? (
                            <div
                              className="
                        bg-purple-100
                        text-purple-700
                        py-1.5
                        text-center
                        rounded-lg
                        text-xs
                        font-medium
                      "
                            >
                              Sudah diundang
                            </div>
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
                        w-full
                        bg-np
                        text-white
                        py-2
                        rounded-lg
                        text-xs
                        font-medium
                      "
                            >
                              Undang
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {activeTab === "pengaturan" && (
          <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
            {/* EKSPOR LAPORAN */}
            <div
              className="
      flex flex-col sm:flex-row
      sm:items-center sm:justify-between
      gap-4
      bg-gray-50
      p-4
      rounded-xl
      border
    "
            >
              <div>
                <h3 className="font-semibold text-gray-800">Ekspor Laporan</h3>
                <p className="text-sm text-gray-500">
                  Unduh laporan lengkap proyek dalam format PDF
                </p>
              </div>

              <button
                onClick={() => {
                  const doc = new jsPDF();
                  let y = 10;
                  doc.setFontSize(16);
                  doc.text(`Laporan Proyek: ${activeBoard.title}`, 10, y);
                  y += 10;
                  doc.save(`laporan-${activeBoard.id}.pdf`);
                }}
                className="
          flex items-center justify-center gap-2
          w-full sm:w-auto
          bg-np text-white
          px-4 py-2.5
          rounded-lg
          hover:opacity-90
          transition
        "
              >
                <Image
                  src="/icons/export-white.svg"
                  alt="export"
                  width={18}
                  height={18}
                />
                <span className="text-sm font-medium">Ekspor PDF</span>
              </button>
            </div>

            {/* KELUAR PROYEK */}
            <div
              className="
      flex flex-col sm:flex-row
      sm:items-center sm:justify-between
      gap-4
      bg-gray-50
      p-4
      rounded-xl
      border
    "
            >
              <div>
                <h3 className="font-semibold text-gray-800">Keluar Proyek</h3>
                <p className="text-sm text-gray-500">
                  Keluar dari proyek ini sebagai anggota
                </p>
              </div>

              <button
                onClick={() => alert("Keluar dari proyek")}
                className="
          flex items-center justify-center gap-2
          w-full sm:w-auto
          bg-orange-500 text-white
          px-4 py-2.5
          rounded-lg
          hover:opacity-90
          transition
        "
              >
                <Image
                  src="/icons/user-minus-white.svg"
                  alt="logout"
                  width={18}
                  height={18}
                />
                <span className="text-sm font-medium">Keluar</span>
              </button>
            </div>

            {/* HAPUS PROYEK */}
            <div
              className="
      flex flex-col sm:flex-row
      sm:items-center sm:justify-between
      gap-4
      bg-gray-50
      p-4
      rounded-xl
      border border-red-200
    "
            >
              <div>
                <h3 className="font-semibold text-red-600">Hapus Proyek</h3>
                <p className="text-sm text-gray-500">
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>

              <button
                onClick={() => alert("Proyek dihapus")}
                className="
          flex items-center justify-center gap-2
          w-full sm:w-auto
          bg-red-500 text-white
          px-4 py-2.5
          rounded-lg
          hover:bg-red-600
          transition
        "
              >
                <Image
                  src="/icons/x-bg-white.svg"
                  alt="delete"
                  width={18}
                  height={18}
                />
                <span className="text-sm font-medium">Hapus</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

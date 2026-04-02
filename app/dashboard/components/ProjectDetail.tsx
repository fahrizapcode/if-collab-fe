"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
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
    deleteBoard,
    setBoards,
} from "@/store/boardsSlice";
import { useAppDispatch } from "@/store/hooks";
import { RootState } from "@/store/store";
import {
    makeSelectUserById,
    makeSelectUsersByIds,
    selectAllUsers,
} from "@/store/boardsSelectors";
import UserAvatar from "./UserAvatar";
import { usersService } from "@/lib/services/users.service";
import { invitationsService } from "@/lib/services/invitations.service";
import { boardsService } from "@/lib/services/boards.service";
import jsPDF from "jspdf";
import { calculateDynamicProgress } from "../helpers";
import { useUI } from "@/components/providers/UIProvider";

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
    const [activeTab, setActiveTab] = useState<TabType>("status");
    const [newStatusTitle, setNewStatusTitle] = useState("");
    const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState("");
    const [search, setSearch] = useState("");
    const [pendingInviteeIds, setPendingInviteeIds] = useState<string[]>([]);

    const dispatch = useAppDispatch();
    const { showToast, confirm } = useUI();

    /* =========================
     DERIVED DATA
  ========================= */

    const createdBy = activeBoard?.createdBy ?? null;
    const memberIds = activeBoard ? activeBoard.members.map((m) => m.userId) : [];

    const isMinStatus = (activeBoard?.columnOrder?.length ?? 0) <= 3;

    /* =========================
     SELECTORS
  ========================= */

    // single user (createdBy)
    const userSelector = useMemo(() => {
        return createdBy ? makeSelectUserById(createdBy) : null;
    }, [createdBy]);

    const user = useSelector((state: RootState) =>
        userSelector ? userSelector(state) : undefined,
    );

    // multiple users (memberIds)
    const usersSelector = useMemo(() => {
        return makeSelectUsersByIds(memberIds);
    }, [memberIds]);

    const users = useSelector(usersSelector);

    // all users
    const allUsers = useSelector(selectAllUsers);

    /* =========================
     ROLE CHECK
  ========================= */
    const authUser = useSelector((state: RootState) => state.user.currentUser);
    const userRole = useMemo(() => {
        if (!authUser || !activeBoard) return null;
        return activeBoard.members.find((m) => m.userId === authUser.id)?.role;
    }, [authUser, activeBoard]);

    const isLeader = userRole === "leader";
    const isManager = userRole === "manager";
    const isLeaderOrManager = isLeader || isManager;
    const canEditDetails = isLeaderOrManager;
    const canManageMembers = isLeaderOrManager;
    const canAddColumn = isLeaderOrManager;
    const canExportPdf = isLeaderOrManager;

    const handleDeleteProject = async () => {
        if (!activeBoard) return;

        confirm({
            title: "Hapus Proyek",
            message: `Apakah Anda yakin ingin menghapus proyek "${activeBoard.title}"? Tindakan ini tidak dapat dibatalkan.`,
            confirmLabel: "Ya, Hapus",
            type: "danger",
            onConfirm: async () => {
                try {
                    await boardsService.delete(activeBoard.id);
                    dispatch(deleteBoard(activeBoard.id));
                    setIsActiveComponent(null);
                    showToast("Proyek berhasil dihapus", "success");
                } catch (err) {
                    console.error("Gagal menghapus proyek:", err);
                    showToast("Gagal menghapus proyek. Pastikan Anda memiliki akses.", "error");
                }
            },
        });
    };
    const canDeleteProject = isLeader;


    /* =========================
     FETCH PENDING INVITES
  ========================= */
    useEffect(() => {
        if (isOpen && activeBoard && activeTab === "tambah-kontributor") {
            invitationsService.getBoardPendingInvitations(activeBoard.id)
                .then(ids => setPendingInviteeIds(ids))
                .catch(err => console.error("Failed to fetch pending invites", err));
        }
    }, [isOpen, activeBoard, activeTab]);
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

    const totalMembers = activeBoard.members?.length || 0;
    const totalTasks = activeBoard.tasks ? Object.keys(activeBoard.tasks).length : 0;

    /* =========================
     HELPERS
  ========================= */

    const getActiveMainTab = (tab: TabType) =>
        tab === "tambah-kontributor" ? "kontributor" : tab;

    const handleRoleChange = (memberId: string, newRole: Role) => {
        if (!activeBoard || !authUser) return;

        const currentRole = activeBoard.members.find(m => m.userId === memberId)?.role;

        // 1. If self-downgrading from leader
        if (memberId === authUser.id && currentRole === 'leader' && newRole !== 'leader') {
            const otherLeaders = activeBoard.members.filter(m => m.userId !== authUser.id && m.role === 'leader');
            if (otherLeaders.length === 0) {
                showToast("Pilih ketua baru terlebih dahulu sebelum melepaskan peran Anda.", "info");
                return;
            }
        }

        // 2. If assigning someone else as leader (auto-demote self if currently leader)
        if (newRole === 'leader' && memberId !== authUser.id && isLeader) {
            dispatch(updateMemberRole({
                boardId: activeBoard.id,
                memberId: authUser.id,
                role: 'observer'
            }));
            showToast(`Role dialihkan. Anda sekarang adalah Pengamat.`, "success");
        }

        dispatch(updateMemberRole({
            boardId: activeBoard.id,
            memberId,
            role: newRole
        }));
    };

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
        z-50
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
                {canEditDetails ? (
                    <input
                        value={activeBoard.title}
                        onChange={(e) =>
                            dispatch(
                                updateBoardMeta({
                                    boardId: activeBoard.id,
                                    title: e.target.value,
                                }),
                            )
                        }
                        className="text-lg sm:text-xl font-semibold bg-transparent border-none outline-none focus:ring-2 focus:ring-purple-200 rounded px-1 transition-all w-full"
                    />
                ) : (
                    <h2 className="text-lg sm:text-xl font-semibold">
                        {activeBoard.title}
                    </h2>
                )}
            </div>

            {/* Info Section */}
            <div className="mb-5 sm:mb-6 space-y-5 text-sm sm:text-base">
                {/* Created By */}
                <div className="flex items-center">
                    <span className="text-gray-500 w-[45%] sm:w-[50%] max-w-40 sm:max-w-70">
                        Dibuat oleh
                    </span>

                    <div className="flex bg-lp py-1 px-2 sm:px-3 rounded-full gap-2 sm:gap-3 items-center">
                        <UserAvatar
                            userId={user?.id || ""}
                            userName={user?.name || "Unknown"}
                            hasAvatar={user?.has_avatar}
                            size={22}
                            className="sm:size-[26px]"
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
                        disabled={!canEditDetails}
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
        disabled:bg-gray-50 disabled:text-gray-500
      "
                    />
                </div>

                {/* Description */}
                <div>
                    <span className="text-gray-500 text-sm sm:text-base">Deskripsi</span>

                    <textarea
                        value={activeBoard.description || ""}
                        disabled={!canEditDetails}
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
        disabled:bg-gray-50 disabled:text-gray-500
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
                            className={`px-4 py-2 ${isActive
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
                        {canAddColumn && (
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
                        )}

                        {/* ================= LIST STATUS ================= */}
                        {activeBoard?.columnOrder?.map((columnId, index) => {
                            const column = activeBoard.columns?.[columnId];
                            if (!column) return null;
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
                                                        {column.taskIds?.length || 0} tugas
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* RIGHT ACTIONS */}
                                        <div className="flex items-center gap-2">
                                            {/* ORDER */}
                                            {canAddColumn && (
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
                                            )}

                                            {/* EDIT MODE */}
                                            {canAddColumn && (
                                                isEditing ? (
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
                        ${isMinStatus
                                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                                                                }
                      `}
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                )
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
                                    const role = activeBoard.members.find(
                                        (m) => m.userId === user.id,
                                    )?.role;

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
                                                <UserAvatar
                                                    userId={user.id}
                                                    userName={user.name}
                                                    hasAvatar={user.has_avatar}
                                                    size={36}
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
                                                    disabled={!canManageMembers || (isManager && role === 'leader')}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                                                    className="
                    w-36
                    bg-gray-50
                    border border-gray-200
                    rounded-lg
                    px-2.5 py-1.5
                    text-xs
                    focus:outline-none
                    focus:ring-2 focus:ring-np
                    disabled:opacity-70 disabled:bg-gray-100
                  "
                                                >
                                                    <option value="leader" disabled={isManager}>Ketua</option>
                                                    <option value="manager">Pengelola</option>
                                                    <option value="member">Anggota</option>
                                                    <option value="observer">Pengamat</option>
                                                </select>

                                                {canManageMembers && (role as string) !== 'leader' && (
                                                    <button
                                                        onClick={() =>
                                                            dispatch(
                                                                removeMember({
                                                                    boardId: activeBoard.id,
                                                                    memberId: user.id,
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
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* MOBILE VERSION (< sm) */}
                        <div className="sm:hidden space-y-3">
                            {users.map((user) => {
                                const role = activeBoard.members.find(
                                    (m) => m.userId === user.id,
                                )?.role;

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
                                            <UserAvatar
                                                userId={user.id}
                                                userName={user.name}
                                                hasAvatar={user.has_avatar}
                                                size={40}
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
                                                disabled={!canManageMembers || (isManager && role === 'leader')}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                                                className="
                  flex-1
                  bg-gray-50
                  border border-gray-200
                  rounded-lg
                  px-3 py-2
                  text-xs
                  focus:outline-none
                  focus:ring-2 focus:ring-np
                  disabled:opacity-70 disabled:bg-gray-100
                "
                                            >
                                                <option value="leader" disabled={isManager}>Ketua</option>
                                                <option value="manager">Pengelola</option>
                                                <option value="member">Anggota</option>
                                                <option value="observer">Pengamat</option>
                                            </select>

                                            {canManageMembers && (role as string) !== 'leader' && (
                                                <button
                                                    onClick={() =>
                                                        dispatch(
                                                            removeMember({
                                                                boardId: activeBoard.id,
                                                                memberId: user.id,
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
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ADD BUTTON */}
                        {canManageMembers && (
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
                        )}
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
                                        const alreadyMember = !!activeBoard?.members?.find(
                                            (m) => m.userId === user.id,
                                        );
                                        const isPending = pendingInviteeIds.includes(user.id);

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
                                                        <UserAvatar
                                                            userId={user.id}
                                                            userName={user.name}
                                                            hasAvatar={user.has_avatar}
                                                            size={40}
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
                                                            Sdh Bergabung
                                                        </span>
                                                    ) : isPending ? (
                                                        <span
                                                            className="
                        bg-orange-100
                        text-orange-700
                        px-3 py-1.5
                        rounded-lg
                        text-xs
                        font-medium
                      "
                                                        >
                                                            Pending
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                dispatch(
                                                                    addMember({
                                                                        boardId: activeBoard.id,
                                                                        memberId: user.id,
                                                                        role: "member",
                                                                    }),
                                                                ).then((res) => {
                                                                    if (res.meta.requestStatus === 'fulfilled') {
                                                                        setPendingInviteeIds((p) => [...p, user.id]);
                                                                        showToast("Undangan berhasil dikirim!", "success");
                                                                        setSearch("");
                                                                    } else {
                                                                        showToast("Gagal mengirim undangan. Mungkin user sudah diundang.", "error");
                                                                    }
                                                                });
                                                            }}
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
                                                        <UserAvatar
                                                            userId={user.id}
                                                            userName={user.name}
                                                            hasAvatar={user.has_avatar}
                                                            size={36}
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
                                                            Sdh Bergabung
                                                        </div>
                                                    ) : isPending ? (
                                                        <div
                                                            className="
                        bg-orange-100
                        text-orange-700
                        py-1.5
                        text-center
                        rounded-lg
                        text-xs
                        font-medium
                      "
                                                        >
                                                            Pending
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                dispatch(
                                                                    addMember({
                                                                        boardId: activeBoard.id,
                                                                        memberId: user.id,
                                                                        role: "member",
                                                                    }),
                                                                ).then((res) => {
                                                                    if (res.meta.requestStatus === 'fulfilled') {
                                                                        setPendingInviteeIds((p) => [...p, user.id]);
                                                                        showToast("Undangan berhasil dikirim!", "success");
                                                                        setSearch("");
                                                                    } else {
                                                                        showToast("Gagal mengirim undangan. Mungkin user sudah diundang.", "error");
                                                                    }
                                                                });
                                                            }}
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
                        {canExportPdf && (
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
                                        let y = 15;
                                        const margin = 15;
                                        const pageWidth = doc.internal.pageSize.getWidth();

                                        // TITLE
                                        doc.setFontSize(22);
                                        doc.setTextColor(88, 28, 135); // Purple-800
                                        const titleText = `Laporan Proyek: ${activeBoard.title}`;
                                        const splitTitle = doc.splitTextToSize(titleText, pageWidth - (margin * 2));
                                        doc.text(splitTitle, margin, y);
                                        y += (splitTitle.length * 10);

                                        // PROJECT METADATA
                                        doc.setDrawColor(200, 200, 200);
                                        doc.line(margin, y, pageWidth - margin, y);
                                        y += 10;

                                        doc.setFontSize(12);
                                        doc.setTextColor(0, 0, 0);
                                        doc.setFont("helvetica", "bold");
                                        doc.text("Informasi Proyek", margin, y);
                                        y += 8;

                                        doc.setFont("helvetica", "normal");
                                        const progress = calculateDynamicProgress(activeBoard.columns, activeBoard.columnOrder);

                                        doc.text(`Tanggal Dibuat: ${formattedCreatedAt}`, margin, y);
                                        y += 6;
                                        doc.text(`Total Tugas: ${totalTasks}`, margin, y);
                                        y += 6;
                                        doc.text(`Progres Keseluruhan: ${progress}%`, margin, y);
                                        y += 15;

                                        // MEMBERS SECTION
                                        doc.setFont("helvetica", "bold");
                                        doc.text("Daftar Kontributor", margin, y);
                                        y += 7;

                                        doc.setFontSize(10);
                                        doc.setTextColor(100, 100, 100);
                                        doc.text("Nama", margin, y);
                                        doc.text("Pemeran (Role)", margin + 60, y);
                                        y += 2;
                                        doc.line(margin, y, pageWidth - margin, y);
                                        y += 6;

                                        doc.setTextColor(0, 0, 0);
                                        doc.setFont("helvetica", "normal");

                                        users.forEach((u) => {
                                            const role = activeBoard.members.find(m => m.userId === u.id)?.role || "member";
                                            const roleLabel = role === "leader" ? "Ketua" : role === "manager" ? "Pengelola" : role === "member" ? "Anggota" : "Pengamat";

                                            if (y > 270) { doc.addPage(); y = 20; }
                                            doc.text(u.name, margin, y);
                                            doc.text(roleLabel, margin + 60, y);
                                            y += 6;
                                        });
                                        y += 10;

                                        // TASK LIST SECTION
                                        doc.setFontSize(12);
                                        doc.setFont("helvetica", "bold");
                                        doc.text("Daftar Tugas", margin, y);
                                        y += 7;

                                        doc.setFontSize(10);
                                        doc.setTextColor(100, 100, 100);
                                        doc.text("Nama Tugas", margin, y);
                                        doc.text("PIC", margin + 65, y);
                                        doc.text("Prioritas", margin + 105, y);
                                        doc.text("Tenggat", margin + 135, y);
                                        doc.text("Status", margin + 165, y);
                                        y += 2;
                                        doc.line(margin, y, pageWidth - margin, y);
                                        y += 6;

                                        doc.setTextColor(0, 0, 0);
                                        doc.setFont("helvetica", "normal");

                                        Object.values(activeBoard.tasks).forEach((t) => {
                                            const col = activeBoard.columns[t.columnId];
                                            const priorityLabel = t.priority === "high" ? "Tinggi" : t.priority === "medium" ? "Sedang" : "Rendah";

                                            // Resolve assignees
                                            const assigneeNames = t.assignees
                                                .map(aid => allUsers.find(u => u.id === aid)?.name || "User")
                                                .join(", ");

                                            const formattedDeadline = t.deadline
                                                ? new Date(t.deadline).toLocaleDateString("id-ID", { day: '2-digit', month: '2-digit' })
                                                : "-";

                                            if (y > 270) { doc.addPage(); y = 20; }

                                            // Handle long text wrapping for task title and PIC
                                            const splitTitle = doc.splitTextToSize(t.title, 60);
                                            const splitPIC = doc.splitTextToSize(assigneeNames, 35);

                                            const maxLines = Math.max(splitTitle.length, splitPIC.length);

                                            doc.text(splitTitle, margin, y);
                                            doc.text(splitPIC, margin + 65, y);
                                            doc.text(priorityLabel, margin + 105, y);
                                            doc.text(formattedDeadline, margin + 135, y);
                                            doc.text(col?.title || "Unknown", margin + 165, y);

                                            y += (maxLines * 5) + 2;
                                        });

                                        doc.save(`${activeBoard.title}-Laporan.pdf`);
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
                        )}

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
                                    {isLeader
                                        ? "Pindahkan peran Ketua ke anggota lain sebelum keluar"
                                        : "Keluar dari proyek ini sebagai anggota"}
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    if (isLeader) {
                                        showToast("Silakan delegasikan peran Ketua terlebih dahulu", "info");
                                    } else {
                                        confirm({
                                            title: "Keluar Proyek",
                                            message: "Apakah Anda yakin ingin keluar dari proyek ini?",
                                            confirmLabel: "Ya, Keluar",
                                            type: "danger",
                                            onConfirm: () => {
                                                // Handle actual leave logic if available
                                                showToast("Berhasil keluar dari proyek", "success");
                                            }
                                        });
                                    }
                                }}
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
                        {canDeleteProject && (
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
                                    onClick={handleDeleteProject}
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
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

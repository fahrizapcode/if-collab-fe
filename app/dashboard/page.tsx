"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { ActiveComponent, BoardData } from "@/types/types";
import { setBoards, setActiveBoardId } from "@/store/boardsSlice";
import { boardsService } from "@/lib/services/boards.service";
import { authService } from "@/lib/services/auth.service";
import { usersService } from "@/lib/services/users.service";
import { setUser } from "@/store/userSlice";
import { setUsers } from "@/store/usersSlice";

import ClickableIcon from "@/components/ui/ClickableIcon";

import Aside from "./components/Aside";
import Overlay from "./components/Overlay";
import Sidebar from "./components/Sidebar";
import Nav from "./components/Nav";
import AddProject from "./components/AddProject";
import AddTask from "./components/AddTask";
import ProjectDetail from "./components/ProjectDetail";
import TaskDetail from "./components/TaskDetail";
import Notification from "./components/Notification";
import Profile from "./components/Profile";
import Dashboard from "./components/Dashboard";

const Board = dynamic(() => import("./components/Board"), {
  ssr: false,
});

// ==============================
// HELPER: normalize API board list into redux shape
// ==============================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function apiBoardsToReduxShape(apiBoards: any[]): Record<string, BoardData> {
  const map: Record<string, BoardData> = {};
  for (const b of apiBoards) {
    // If backend already sends standard shape, we can use it or transform slightly
    // Map tasks to Redux-friendly shape (assignees as IDs)
    const tasks: BoardData["tasks"] = {};
    const apiTasks = typeof b.tasks === 'object' && !Array.isArray(b.tasks) ? b.tasks : {};
    
    // If b.tasks is array (legacy), normalize. If object (new), map through values
    const taskList = Array.isArray(b.tasks) ? b.tasks : Object.values(b.tasks);
    
    for (const t of taskList as any[]) {
      tasks[t.id] = {
        id: t.id,
        title: t.title,
        description: t.description ?? "",
        priority: t.priority,
        tags: t.tags ?? [],
        deadline: t.deadline ?? null,
        columnId: t.columnId,
        createdBy: t.createdBy,
        createdAt: t.createdAt,
        assignees: t.assignees?.map((a: { id: string }) => typeof a === 'string' ? a : a.id) ?? [],
      };
    }

    // Map columns - Use b.columns (standardized object) or normalize array
    const columns: BoardData["columns"] = {};
    if (typeof b.columns === 'object' && !Array.isArray(b.columns)) {
      // It's already an object { [id]: { id, title, order, taskIds } }
      // We just need to ensure the shape matches Column type
      for (const id in b.columns) {
        columns[id] = {
          id: b.columns[id].id,
          title: b.columns[id].title,
          taskIds: b.columns[id].taskIds || [],
        };
      }
    } else if (Array.isArray(b.columns)) {
      for (const col of b.columns) {
        columns[col.id] = {
          id: col.id,
          title: col.title,
          taskIds: b.tasks
            .filter((t: { columnId: string }) => t.columnId === col.id)
            .map((t: { id: string }) => t.id),
        };
      }
    }

    // Determine columnOrder
    let columnOrder = b.columnOrder;
    if (!columnOrder && Array.isArray(b.columns)) {
      columnOrder = [...b.columns]
        .sort((a, c) => a.order - c.order)
        .map(c => c.id);
    } else if (!columnOrder) {
      columnOrder = Object.values(columns).map(c => c.id);
    }

    map[b.id] = {
      id: b.id,
      title: b.title,
      description: b.description ?? "",
      deadline: b.deadline ?? null,
      createdAt: b.createdAt,
      lastActive: b.lastActive,
      createdBy: b.createdBy,
      columnOrder,
      columns,
      tasks,
      members: b.members?.map((m: { userId: string; role: string }) => ({
        userId: m.userId,
        role: m.role,
      })) ?? [],
      activityLogs: b.activityLogs ?? [],
    };
  }
  return map;
}

export default function DashboardPage() {
  const dispatch = useAppDispatch();

  /* ================================
     REDUX STATE
  ================================= */
  const activeBoardId = useAppSelector((state) => state.boards.activeBoardId);
  const activeBoard = useAppSelector(
    (state) => state.boards.boards[activeBoardId],
  );

  const boards = useAppSelector((state) => state.boards.boards);

  /* ================================
     LOCAL STATE
  ================================= */
  const [board, setBoard] = useState<BoardData | undefined>(activeBoard);

  // Gunakan useCallback agar referensi setBoard stabil (tidak berganti setiap render)
  const stableSetBoard = useCallback<React.Dispatch<React.SetStateAction<BoardData | undefined>>>(
    (value) => setBoard(value),
    []
  );

  const [isActiveOverlay, setIsActiveOverlay] = useState(false);
  const [isActiveComponent, setIsActiveComponent] =
    useState<ActiveComponent>(null);

  const [isBoardView, setIsBoardView] = useState(false);
  const [taskColumnId, setTaskColumnId] = useState<string>("");
  const [activeTaskId, setActiveTaskId] = useState<string>("");

  /* ================================
     HYDRATE BOARDS FROM API
  ================================= */
  useEffect(() => {
    // 1. Fetch Boards
    boardsService.getAll().then((apiBoards) => {
      const shaped = apiBoardsToReduxShape(apiBoards);
      dispatch(setBoards(shaped));
      // Set first board as active if none selected
      const firstId = Object.keys(shaped)[0];
      if (firstId) dispatch(setActiveBoardId(firstId));
    });

    // 2. Hydrate User if missing
    authService.me().then((userData) => {
      dispatch(setUser(userData));
    }).catch(() => {
      // If error (unauthorized), Login middleware should handle redirect
    });
    // 3. Fetch all users for name lookups
    usersService.search().then((allUsers) => {
      dispatch(setUsers(allUsers));
    });
  }, [dispatch]);



  return (
    <div className="flex relative overflow-hidden justify-center">
      {/* SIDEBAR */}
      <Sidebar
        isOpen={isActiveComponent === "sidebar"}
        setIsActiveComponent={setIsActiveComponent}
        setIsActiveOverlay={setIsActiveOverlay}
        isActiveComponent={isActiveComponent}
        setIsBoardView={setIsBoardView}
        isBoardView={isBoardView}
      />

      {/* PROJECT DETAIL */}
      <ProjectDetail
        isOpen={isActiveComponent === "projectDetail"}
        activeBoard={activeBoard}
        setIsActiveComponent={setIsActiveComponent}
      />

      {/* TASK DETAIL */}
      <TaskDetail
        isOpen={isActiveComponent === "taskDetail"}
        setIsActiveComponent={setIsActiveComponent}
        activeTaskId={activeTaskId}
      />

      {/* MAIN CONTENT */}
      {isBoardView ? (
        <Board
          board={board}
          activeBoard={activeBoard}
          setBoard={stableSetBoard}
          setIsActiveComponent={setIsActiveComponent}
          setIsActiveOverlay={setIsActiveOverlay}
          setTaskColumnId={setTaskColumnId}
          setActiveTaskId={setActiveTaskId}
        />
      ) : (
        <Dashboard boards={boards} setIsBoardView={setIsBoardView} />
      )}

      {/* RIGHT ASIDE */}
      <Aside isOpen={isActiveComponent === "stats"} isBoardView={isBoardView} />

      {/* TOP NAV */}
      <Nav
        setIsActiveComponent={setIsActiveComponent}
        setIsActiveOverlay={setIsActiveOverlay}
        isBoardView={isBoardView}
      />

      {/* NOTIFICATION */}
      <Notification
        isOpen={isActiveComponent === "notification"}
        setIsActiveComponent={setIsActiveComponent}
      />

      {/* PROFILE */}
      <Profile
        isOpen={isActiveComponent === "profile"}
        setIsActiveComponent={setIsActiveComponent}
      />

      {/* ADD PROJECT MODAL */}
      <AddProject
        isOpen={isActiveComponent === "addProject"}
        setIsActiveComponent={setIsActiveComponent}
        setIsActiveOverlay={setIsActiveOverlay}
      />

      {/* OVERLAY */}
      <Overlay
        isActiveOverlay={isActiveOverlay}
        setIsActiveOverlay={setIsActiveOverlay}
        setIsActiveComponent={setIsActiveComponent}
      />

      {/* ADD TASK MODAL */}
      <AddTask
        isOpen={isActiveComponent === "addTask"}
        taskColumnId={taskColumnId}
        board={board}
        setIsActiveOverlay={setIsActiveOverlay}
        setIsActiveComponent={setIsActiveComponent}
      />

      {/* MOBILE MENU BUTTON */}
      <ClickableIcon
        srcIcon="/icons/menu-three-dots-white.svg"
        size={40}
        className="
          absolute
          top-4 left-4
          lg:hidden
        "
        onClick={() => {
          setIsActiveOverlay(true);
          setIsActiveComponent("sidebar");
        }}
      />
    </div>
  );
}

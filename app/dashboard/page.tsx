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
<<<<<<< HEAD
import { getSocket } from "@/lib/socket";
=======
import { apiBoardsToReduxShape } from "@/lib/utils/normalization";
>>>>>>> 45f411fa2bbcfa97574ce57dc25d859447db69a3

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
// Helper removed. Using apiBoardsToReduxShape from normalization utils.

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
    }).catch(err => {
      console.error("Failed to fetch boards", err);
    });

    // 2. Hydrate User if missing
    authService.me().then((userData) => {
      dispatch(setUser(userData));
    }).catch((err) => {
      console.error("Failed to hydrate user", err);
      // If error (unauthorized), Login middleware should handle redirect
    });
    // 3. Fetch all users for name lookups
    usersService.search().then((allUsers) => {
      dispatch(setUsers(allUsers));
    }).catch(err => {
      console.error("Failed to search users", err);
    });

    // 4. Global Socket Listeners (Notifications)
    const socket = getSocket();
    
    socket.on('notification:new', (notif: any) => {
       // Filter locally to ensure the notification is intended for the current user
       // (This prevents the inviter from seeing their own invite if sessions are shared or backend broadcasts)
       if (notif.userId !== currentUser?.id) return;

       import("@/store/userSlice").then(mod => {
         dispatch(mod.addNotification(notif));
       });
    });

    return () => {
      socket.off('notification:new');
    };
  }, [dispatch]);

<<<<<<< HEAD
  // Handle Socket User Room Join
  const currentUser = useAppSelector(state => state.user.currentUser);
  useEffect(() => {
    if (currentUser?.id) {
       const socket = getSocket();
       socket.emit('join:user', currentUser.id);
    }
  }, [currentUser?.id]);
=======
  // Auto-sync overlay based on active component
  useEffect(() => {
    if (isActiveComponent) {
      setIsActiveOverlay(true);
    } else {
      setIsActiveOverlay(false);
    }
  }, [isActiveComponent]);
>>>>>>> 45f411fa2bbcfa97574ce57dc25d859447db69a3



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
        setIsBoardView={setIsBoardView}
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

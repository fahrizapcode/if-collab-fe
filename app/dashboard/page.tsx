"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import { useAppSelector } from "@/store/hooks";
import { ActiveComponent, BoardData } from "@/types/types";

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

export default function DashboardPage() {
  /* ================================
     REDUX STATE
  ================================= */
  const activeBoard = useAppSelector(
    (state) => state.boards.boards[state.boards.activeBoardId],
  );

  const boards = useAppSelector((state) => state.boards.boards);

  /* ================================
     LOCAL STATE
  ================================= */
  const [board, setBoard] = useState<BoardData>(activeBoard);

  const [isActiveOverlay, setIsActiveOverlay] = useState(false);
  const [isActiveComponent, setIsActiveComponent] =
    useState<ActiveComponent>(null);

  const [isBoardView, setIsBoardView] = useState(false);
  const [taskColumnId, setTaskColumnId] = useState<string>("");
  const [activeTaskId, setActiveTaskId] = useState<string>("");

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

      {/* MAIN CONTENT */}
      {isBoardView ? (
        <Board
          board={board}
          activeBoard={activeBoard}
          setBoard={setBoard}
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

"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

import ClickableIcon from "@/components/ui/ClickableIcon";
import Aside from "./components/Aside";
import Overlay from "./components/Overlay";
import Sidebar from "./components/Sidebar";
import Nav from "./components/Nav";
import AddProject from "./components/AddProject";

import { ActiveComponent, BoardData } from "@/types/types";
import AddTask from "./components/AddTask";
import { useAppSelector } from "@/store/hooks";
import ProjectDetail from "./components/ProjectDetail";
import TaskDetail from "./components/TaskDetail";

const Board = dynamic(() => import("./components/Board"), { ssr: false });

export default function DashboardPage() {
  const activeBoard = useAppSelector(
    (state) => state.boards.boards[state.boards.activeBoardId],
  );
  const [board, setBoard] = useState<BoardData>(activeBoard);
  // mobile-only UI state
  const [isActiveOverlay, setIsActiveOverlay] = useState(false);
  const [taskColumnId, setTaskColumnId] = useState<string>("");
  const [isActiveComponent, setIsActiveComponent] =
    useState<ActiveComponent>(null);

  const [activeTaskId, setActiveTaskId] = useState<string>("");
  return (
    <div className="flex relative overflow-hidden justify-center">
      {/* SIDEBAR */}
      <Sidebar
        isOpen={isActiveComponent === "sidebar"}
        setIsActiveComponent={setIsActiveComponent}
        setIsActiveOverlay={setIsActiveOverlay}
        isActiveComponent={isActiveComponent}
      />
      <ProjectDetail
        isOpen={isActiveComponent === "projectDetail"}
        activeBoard={activeBoard}
        setIsActiveComponent={setIsActiveComponent}
      />
      <TaskDetail
        isOpen={isActiveComponent === "taskDetail"}
        setIsActiveComponent={setIsActiveComponent}
        activeTaskId={activeTaskId}
      />

      {/* MAIN CONTENT */}
      <Board
        setIsActiveComponent={setIsActiveComponent}
        setIsActiveOverlay={setIsActiveOverlay}
        setTaskColumnId={setTaskColumnId}
        board={board}
        activeBoard={activeBoard}
        setBoard={setBoard}
        setActiveTaskId={setActiveTaskId}
      />

      {/* RIGHT ASIDE */}
      <Aside isOpen={isActiveComponent === "stats"} />

      {/* TOP NAV */}
      <Nav
        setIsActiveComponent={setIsActiveComponent}
        setIsActiveOverlay={setIsActiveOverlay}
      />

      {/* ADD PROJECT MODAL */}
      <AddProject
        isOpen={isActiveComponent === "addProject"}
        setIsActiveComponent={setIsActiveComponent}
        setIsActiveOverlay={setIsActiveOverlay}
      />

      <Overlay
        isActiveOverlay={isActiveOverlay}
        setIsActiveOverlay={setIsActiveOverlay}
        setIsActiveComponent={setIsActiveComponent}
      />

      {/* OPTIONAL DESKTOP OVERLAY */}
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

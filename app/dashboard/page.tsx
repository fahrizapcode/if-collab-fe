"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

import ClickableIcon from "@/components/ui/ClickableIcon";
import Aside from "./components/Aside";
import Overlay from "./components/Overlay";
import Sidebar from "./components/Sidebar";
import Nav from "./components/Nav";
import AddProject from "./components/AddProject";

import { ActiveComponent } from "@/types/types";

const Board = dynamic(() => import("./components/Board"), { ssr: false });

export default function DashboardPage() {
  // mobile-only UI state
  const [isActiveOverlay, setIsActiveOverlay] = useState(false);
  const [isActiveComponent, setIsActiveComponent] =
    useState<ActiveComponent>(null);

  return (
    <div className="flex relative overflow-hidden justify-center">
      {/* SIDEBAR */}
      <Sidebar
        isOpen={isActiveComponent === "sidebar"}
        setIsActiveComponent={setIsActiveComponent}
        setIsActiveOverlay={setIsActiveOverlay}
      />

      {/* MAIN CONTENT */}
      <Board
        setIsActiveComponent={setIsActiveComponent}
        setIsActiveOverlay={setIsActiveOverlay}
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

"use client";
import { useState } from "react";

import ClickableIcon from "@/components/ui/ClickableIcon";
import Aside from "./components/Aside";
import Overlay from "./components/Overlay";
import Sidebar from "./components/Sidebar";
import Nav from "./components/Nav";
import dynamic from "next/dynamic";

const Board = dynamic(() => import("./components/Board"), { ssr: false });
export default function DashboardPage() {
  const [isActiveOverlay, setIsActiveOverlay] = useState(false);
  const [isActiveComponent, setIsActiveComponent] = useState<
    "sidebar" | "addtask" | "stats" | null
  >(null);

  return (
    <div className="flex relative overflow-hidden justify-center ">
      <Sidebar isOpen={isActiveComponent === "sidebar"} />
      <Board />
      <Aside isOpen={isActiveComponent === "stats"} />
      <Nav
        setIsActiveComponent={setIsActiveComponent}
        setIsActiveOverlay={setIsActiveOverlay}
      />

      <Overlay
        isActiveOverlay={isActiveOverlay}
        setIsActiveOverlay={setIsActiveOverlay}
        setIsActiveComponent={setIsActiveComponent}
      />

      <ClickableIcon
        srcIcon="/icons/menu-three-dots-white.svg"
        size={40} // default < sm
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

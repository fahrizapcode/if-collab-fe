"use client";

import SidebarHeader from "./SidebarHeader";
import SidebarNav from "./SidebarNav";
import { ActiveComponent } from "@/types/types";

interface SidebarProps {
  isOpen: boolean;
  isActiveComponent: ActiveComponent;
  setIsActiveComponent: React.Dispatch<React.SetStateAction<ActiveComponent>>;
  setIsActiveOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  setIsBoardView: React.Dispatch<React.SetStateAction<boolean>>;
  isBoardView: boolean;
}

export default function Sidebar({
  isOpen,
  setIsActiveComponent,
  isActiveComponent,
  setIsActiveOverlay,
  setIsBoardView,
  isBoardView,
}: SidebarProps) {
  return (
    <aside
      className={`
        fixed lg:static
        inset-y-0 left-0
        h-[100dvh]
        w-[16rem] sm:w-70
        flex flex-col
        border-r border-black/10
        px-2
        py-6 sm:py-8
        bg-white
        z-20
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      <SidebarHeader />

      <SidebarNav
        setIsActiveComponent={setIsActiveComponent}
        setIsActiveOverlay={setIsActiveOverlay}
        setIsBoardView={setIsBoardView}
        isBoardView={isBoardView}
        isActiveComponent={isActiveComponent}
      />
    </aside>
  );
}

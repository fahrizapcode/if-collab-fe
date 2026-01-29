"use client";
import CircularProgres from "./CircularProgres";
import { activityData } from "@/data/data";

import ActivityItem from "./ActivityItem";
const ACCENT_COLORS = [
  "bg-fuchsia-300",
  "bg-sky-200",
  "bg-amber-300",
  "bg-emerald-300",
  "bg-rose-300",
];
export default function Aside({ isOpen }: { isOpen: boolean }) {
  return (
    <div
      className={`
      w-[100%] lg:w-80
      h-[65dvh] sm:h-[75dvh] lg:h-[100dvh]
      pt-6 sm:pt-8 lg:pt-14
      pb-5 sm:pb-6
      px-4 sm:px-6
      flex flex-col items-center
      text-[1rem] sm:text-xl
      font-medium text-dp
      absolute lg:static
      bg-white
      bottom-[-10]
      border border-lightgry
      rounded-3xl
      z-20
      lg:border-none
      transition-transform duration-300 ease-in-out
      ${isOpen ? "translate-y-10 sm:translate-y-50" : "translate-y-[110vh] lg:translate-y-10"}
    `}
    >
      <p className="w-full mb-4 sm:mb-6">Progres Tugas</p>

      <CircularProgres progress={79} />

      <p className="w-full mt-5 sm:mt-6 mb-2 sm:mb-3">Riwayat Aktivitas</p>

      <div
        className="
        flex
        flex-row
        lg:flex-col
        overflow-x-auto 
        lg:overflow-y-auto
        h-28 sm:h-30
        lg:h-[60%]
        w-[96%] sm:w-[98%] lg:w-full
        no-scrollbar
        gap-2
      "
      >
        {activityData.map((activity, index) => (
          <ActivityItem
            key={activity.id}
            {...activity}
            accentColor={ACCENT_COLORS[index % ACCENT_COLORS.length]}
          />
        ))}
      </div>
    </div>
  );
}

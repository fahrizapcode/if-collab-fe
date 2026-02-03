import { ActiveComponent } from "@/types/types";

export default function DesktopOverlay({
  isActiveDesktopOverlay,
  setIsActiveDesktopOverlay,
  setIsActiveComponent,
}: {
  isActiveDesktopOverlay: boolean;
  setIsActiveDesktopOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  setIsActiveComponent: React.Dispatch<React.SetStateAction<ActiveComponent>>;
}) {
  return (
    <div
      className={` z-30 fixed inset-0 flex items-center justify-center absolute bg-black/30   ${isActiveDesktopOverlay ? "" : "hidden"}`}
      onClick={() => {
        setIsActiveDesktopOverlay(false);
        setIsActiveComponent(null);
      }}
    ></div>
  );
}

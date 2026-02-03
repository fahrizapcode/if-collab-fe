import { ActiveComponent } from "@/types/types";

export default function Overlay({
  isActiveOverlay,
  setIsActiveOverlay,
  setIsActiveComponent,
}: {
  isActiveOverlay: boolean;
  setIsActiveOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  setIsActiveComponent: React.Dispatch<React.SetStateAction<ActiveComponent>>;
}) {
  return (
    <div
      className={` z-10 fixed inset-0 flex items-center justify-center absolute bg-black/30 lg:hidden  ${isActiveOverlay ? "" : "hidden"}`}
      onClick={() => {
        setIsActiveOverlay(false);
        setIsActiveComponent(null);
      }}
    ></div>
  );
}

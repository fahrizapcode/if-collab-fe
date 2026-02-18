import { ActiveComponent } from "@/types/types";

type OverlayProps = {
  isActiveOverlay: boolean;
  setIsActiveOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  setIsActiveComponent: React.Dispatch<React.SetStateAction<ActiveComponent>>;
};

export default function Overlay({
  isActiveOverlay,
  setIsActiveOverlay,
  setIsActiveComponent,
}: OverlayProps) {
  const handleCloseOverlay = () => {
    setIsActiveOverlay(false);
    setIsActiveComponent(null);
  };

  return (
    <div
      className={`z-10 fixed inset-0 flex items-center justify-center absolute bg-black/30 lg:hidden ${
        isActiveOverlay ? "" : "hidden"
      }`}
      onClick={handleCloseOverlay}
    />
  );
}

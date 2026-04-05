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
      className={`fixed inset-0 bg-black/50 transition-opacity duration-300 z-40 ${
        isActiveOverlay ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={handleCloseOverlay}
    />
  );
}

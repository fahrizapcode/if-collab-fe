import ClickableIcon from "@/components/ui/ClickableIcon";
import { ActiveComponent } from "@/types/types";

type NavProps = {
  setIsActiveOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  setIsActiveComponent: React.Dispatch<React.SetStateAction<ActiveComponent>>;
  isBoardView: boolean;
};

export default function Nav({
  setIsActiveOverlay,
  setIsActiveComponent,
  isBoardView,
}: NavProps) {
  const handleOpenStats = () => {
    setIsActiveOverlay(true);
    setIsActiveComponent("stats");
  };

  const handleOpenNotification = () => {
    setIsActiveComponent("notification");
  };

  const handleOpenProfile = () => {
    setIsActiveComponent("profile");
  };

  return (
    <div className="h-[10dvh] absolute top-0 right-0 items-center px-6 gap-x-2 flex py-4 z-10 lg:z-20">
      {isBoardView && (
        <ClickableIcon
          srcIcon="/icons/analytics-doc-purple.svg"
          size={40}
          className="bg-white lg:hidden"
          onClick={handleOpenStats}
        />
      )}

      <ClickableIcon
        srcIcon="/icons/notif-bell-white.svg"
        size={40}
        className=""
        onClick={handleOpenNotification}
      />

      <ClickableIcon
        srcIcon="/icons/user-white.svg"
        size={40}
        className=""
        onClick={handleOpenProfile}
      />
    </div>
  );
}

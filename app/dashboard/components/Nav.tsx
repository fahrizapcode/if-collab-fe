import ClickableIcon from "@/components/ui/ClickableIcon";
import { notificationsService } from "@/lib/services/notifications.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { markAllNotificationsRead } from "@/store/userSlice";
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
  const dispatch = useAppDispatch();
  const unreadCount = useAppSelector(
    (state) =>
      state.user.currentUser?.notifications.filter((n) => !n.read).length || 0,
  );

  const handleOpenStats = () => {
    setIsActiveOverlay(true);
    setIsActiveComponent("stats");
  };

  const handleOpenNotification = () => {
    setIsActiveOverlay(true);
    setIsActiveComponent("notification");

    // Sync to backend (Fire & forget to keep UI responsive)
    notificationsService.markAllRead().catch((err) => {
      console.error("Failed to mark all notifications read", err);
    });

    dispatch(markAllNotificationsRead());
  };

  const handleOpenProfile = () => {
    setIsActiveOverlay(true);
    setIsActiveComponent("profile");
  };

  return (
    <div className="h-[10dvh] absolute top-0 right-0 items-center px-6 gap-x-2 flex py-4 z-30">
      {isBoardView && (
        <ClickableIcon
          srcIcon="/icons/analytics-doc-purple.svg"
          size={40}
          className="bg-white lg:hidden"
          onClick={handleOpenStats}
        />
      )}

      <div className="relative">
        <ClickableIcon
          srcIcon="/icons/notif-bell-white.svg"
          size={40}
          className=""
          onClick={handleOpenNotification}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-lp shadow-md">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </div>

      <ClickableIcon
        srcIcon="/icons/user-white.svg"
        size={40}
        className=""
        onClick={handleOpenProfile}
      />
    </div>
  );
}

"use client";

import Image from "next/image";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store/hooks";

import { RootState } from "@/store/store";
import { deleteNotification } from "@/store/userSlice";

import { ActiveComponent } from "@/types/types";
import { notificationsService } from "@/lib/services/notifications.service";
import { invitationsService } from "@/lib/services/invitations.service";
import { boardsService } from "@/lib/services/boards.service";
import { setBoards } from "@/store/boardsSlice";
import { apiBoardsToReduxShape } from "@/lib/utils/normalization";

interface NotificationProps {
  isOpen: boolean;
  setIsActiveComponent: React.Dispatch<React.SetStateAction<ActiveComponent>>;
}

import UserAvatar from "./UserAvatar";

export default function Notification({
  isOpen,
  setIsActiveComponent,
}: NotificationProps) {
  const dispatch = useAppDispatch();

  const currentUser = useSelector(
    (state: RootState) => state.user.currentUser,
  );

  const notifications = currentUser?.notifications ?? [];

  const handleAccept = async (notifId: string, invitationId?: string) => {
    try {
      if (invitationId) {
        await invitationsService.respond(invitationId, 'accepted');
        // Re-fetch boards to show the new project immediately
        const apiBoards = await boardsService.getAll();
        const shaped = apiBoardsToReduxShape(apiBoards);
        dispatch(setBoards(shaped));
        
        // Trigger hard refresh as requested to ensure everything is synced
        window.location.reload();
      }

      // Sync backend: always delete notification after it was handled
      await notificationsService.delete(notifId);
      dispatch(deleteNotification({ notificationId: notifId }));
    } catch (err) {
      console.error("Failed to accept invitation", err);
    }
  };

  const handleReject = async (notifId: string, invitationId?: string) => {
    try {
      if (invitationId) {
        await invitationsService.respond(invitationId, 'rejected');
      }

      // Sync backend
      await notificationsService.delete(notifId);
      dispatch(deleteNotification({ notificationId: notifId }));
    } catch (err) {
      console.error("Failed to reject invitation", err);
    }
  };

  const renderFormattedContent = (content: string) => {
    if (!content.includes("“")) return content;

    const beforeQuote = content.split("“")[0];
    const quotedPart = content.split("“")[1].split("”")[0];
    const afterQuote = content.split("”")[1];

    return (
      <>
        {beforeQuote}
        <b>“{quotedPart}”</b>
        {afterQuote}
      </>
    );
  };

  return (
    <div
      className={`${isOpen ? "block" : "hidden"
        } fixed top-[8vh] right-6 w-[90%] max-w-[400px] bg-white border border-gray-300 z-[80] rounded-md shadow-md`}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="font-semibold text-lg">Notifikasi</h2>

        <div className="flex items-center gap-2">
          <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notifications.length}
          </span>

          <Image
            onClick={() => setIsActiveComponent(null)}
            className="text-gray-500 hover:text-gray-700 font-bold rotate-45 cursor-pointer"
            alt="Close"
            width={30}
            height={30}
            src={"/icons/add.svg"}
          />
        </div>
      </div>

      {/* Notification List */}
      <div className="flex flex-col max-h-[60vh] overflow-y-auto">
        {notifications.map((notif) => {
          const isInvitation = notif.content.startsWith("Kamu diundang");

          return (
            <div
              key={notif.id}
              className="flex gap-3 p-4 border-b last:border-b-0"
            >
              <UserAvatar
                userId={notif.actor_id || currentUser?.id || ""}
                userName="User"
                hasAvatar={notif.actor_has_avatar}
                size={48}
              />

              <div className="flex-1 flex flex-col">
                <p className="text-sm">
                  {renderFormattedContent(notif.content)}
                </p>

                <span className="text-xs text-gray-400 mt-1">
                  {new Date(notif.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" • "}
                  <span className="italic">{notif.board_title}</span>
                </span>

                {(isInvitation || notif.invitation_id) && (
                  <div className="flex gap-2 mt-2">
                    <button
                      className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm"
                      onClick={() => handleAccept(notif.id, notif.invitation_id)}
                    >
                      Terima
                    </button>

                    <button
                      className="border border-gray-300 px-3 py-1 rounded-md text-sm"
                      onClick={() => handleReject(notif.id, notif.invitation_id)}
                    >
                      Tolak
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {notifications.length === 0 && (
          <p className="text-center text-gray-400 p-4">Tidak ada notifikasi</p>
        )}
      </div>
    </div>
  );
}

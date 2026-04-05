"use client";

import Image from "next/image";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store/hooks";

import { RootState } from "@/store/store";
import { deleteNotification } from "@/store/userSlice";

import { ActiveComponent } from "@/types/types";
import { notificationsService } from "@/lib/services/notifications.service";
import { invitationsService } from "@/lib/services/invitations.service";
import { notificationsService } from "@/lib/services/notifications.service";
import { boardsService } from "@/lib/services/boards.service";
import { setBoards } from "@/store/boardsSlice";
<<<<<<< HEAD
import { setNotifications, markNotificationRead } from "@/store/userSlice";
=======
import { apiBoardsToReduxShape } from "@/lib/utils/normalization";
>>>>>>> 45f411fa2bbcfa97574ce57dc25d859447db69a3

interface NotificationProps {
  isOpen: boolean;
  setIsActiveComponent: React.Dispatch<React.SetStateAction<ActiveComponent>>;
}

import UserAvatar from "./UserAvatar";
import { useUI } from "@/components/providers/UIProvider";

export default function Notification({
  isOpen,
  setIsActiveComponent,
}: NotificationProps) {
  const dispatch = useAppDispatch();
  const { showToast } = useUI();

  const currentUser = useSelector(
    (state: RootState) => state.user.currentUser,
  );

  const notifications = currentUser?.notifications ?? [];

  const handleAccept = async (notifId: string, invitationId?: string) => {
    try {
      if (invitationId) {
        await invitationsService.respond(invitationId, 'accepted');
        
        // Refresh notifications to show the updated text immediately
        const updatedNotifs = await notificationsService.getAll();
        dispatch(setNotifications(updatedNotifs));

        // Re-fetch boards to show the new project immediately
<<<<<<< HEAD
        const updatedBoards = await boardsService.getAll();
        dispatch(setBoards(updatedBoards));

        showToast("Undangan diterima", "success");
      } catch (err: any) {
        const msg = err.response?.data?.message || "Gagal menerima undangan";
        showToast(msg, "error");
        console.error("Failed to accept invitation", err);
=======
        const apiBoards = await boardsService.getAll();
        const shaped = apiBoardsToReduxShape(apiBoards);
        dispatch(setBoards(shaped));
        
        // Trigger hard refresh as requested to ensure everything is synced
        window.location.reload();
>>>>>>> 45f411fa2bbcfa97574ce57dc25d859447db69a3
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
<<<<<<< HEAD

        // Refresh notifications
        const updatedNotifs = await notificationsService.getAll();
        dispatch(setNotifications(updatedNotifs));

        showToast("Undangan ditolak", "info");
      } catch (err: any) {
        const msg = err.response?.data?.message || "Gagal menolak undangan";
        showToast(msg, "error");
        console.error("Failed to reject invitation", err);
=======
>>>>>>> 45f411fa2bbcfa97574ce57dc25d859447db69a3
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
<<<<<<< HEAD
        } absolute top-[8vh] right-6 w-[95vw] max-w-[420px] bg-white border border-gray-100 z-50 rounded-xl shadow-2xl overflow-hidden`}
=======
        } fixed top-[8vh] right-6 w-[90%] max-w-[400px] bg-white border border-gray-300 z-[80] rounded-md shadow-md`}
>>>>>>> 45f411fa2bbcfa97574ce57dc25d859447db69a3
    >
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-gray-50 bg-gray-50/50">
        <h2 className="font-bold text-gray-800 text-lg">Notifikasi</h2>

        <div className="flex items-center gap-3">
          {notifications.some(n => !n.read) && (
            <button 
              onClick={async () => {
                try {
                  await notificationsService.markAllRead();
                  const updated = await notificationsService.getAll();
                  dispatch(setNotifications(updated));
                } catch (err) { console.error(err); }
              }}
              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              Tandai semua dibaca
            </button>
          )}

          <div className="flex items-center gap-1.5">
            <span className="bg-purple-600 text-white text-[10px] font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
              {notifications.length}
            </span>

            <Image
              onClick={() => setIsActiveComponent(null)}
              className="text-gray-400 hover:text-gray-600 transition-transform hover:rotate-[135deg] cursor-pointer"
              alt="Close"
              width={24}
              height={24}
              src={"/icons/add.svg"}
            />
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div className="flex flex-col max-h-[70vh] overflow-y-auto custom-scrollbar">
        {notifications.map((notif) => {
          const isInvitation = notif.content.includes("diundang");
          const isResponded = notif.content.includes("sudah menerima") || notif.content.includes("sudah menolak");

          return (
            <div
              key={notif.id}
              onClick={async () => {
                if (!notif.read) {
                  try {
                    await notificationsService.markRead(notif.id);
                    dispatch(markNotificationRead({ notificationId: notif.id }));
                  } catch (err) { console.error(err); }
                }
              }}
              className={`flex gap-3 p-4 border-b border-gray-50 cursor-pointer transition-colors ${
                !notif.read ? "bg-purple-50/40 hover:bg-purple-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="relative">
                <UserAvatar
                  userId={notif.actor_id || ""}
                  userName="User"
                  hasAvatar={notif.actor_has_avatar}
                  size={42}
                />
                {!notif.read && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-500 border-2 border-white rounded-full"></span>
                )}
              </div>

              <div className="flex-1 flex flex-col min-w-0">
                <p className={`text-sm leading-relaxed ${!notif.read ? "font-semibold text-gray-900" : "text-gray-600"}`}>
                  {renderFormattedContent(notif.content)}
                </p>

                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-[11px] text-gray-400 font-medium">
                    {new Date(notif.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded italic">
                    {notif.board_title}
                  </span>
                </div>

                {isInvitation && !isResponded && notif.invitation_id && (
                  <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                    <button
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
                      onClick={() => handleAccept(notif.id, notif.invitation_id)}
                    >
                      Terima
                    </button>

                    <button
                      className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-4 py-1.5 rounded-lg text-xs font-semibold transition"
                      onClick={() => handleReject(notif.id, notif.invitation_id)}
                    >
                      Tolak
                    </button>
                  </div>
                )}
                
                {isResponded && (
                  <div className="mt-2 py-1 px-2 bg-gray-50 border border-gray-100 rounded text-[11px] text-gray-500 font-medium w-fit">
                    Undangan telah diproses
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <Image src="/icons/add.svg" alt="empty" width={24} height={24} className="opacity-20 rotate-45" />
            </div>
            <p className="text-sm text-gray-400">Tidak ada notifikasi baru untuk Anda</p>
          </div>
        )}
      </div>
    </div>
  );
}

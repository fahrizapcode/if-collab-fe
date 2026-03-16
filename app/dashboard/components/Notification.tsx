"use client";

import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";

import { RootState } from "@/store/store";
import { deleteNotification } from "@/store/userSlice";

import { ActiveComponent } from "@/types/types";
import { User } from "@/types/typesUser";

interface NotificationProps {
  isOpen: boolean;
  setIsActiveComponent: React.Dispatch<React.SetStateAction<ActiveComponent>>;
}

export default function Notification({
  isOpen,
  setIsActiveComponent,
}: NotificationProps) {
  const dispatch = useDispatch();

  const currentUser: User | null = useSelector(
    (state: RootState) => state.user.currentUser,
  );

  if (!currentUser) return null;

  const notifications = currentUser.notifications;

  const handleDelete = (notifId: string) => {
    dispatch(deleteNotification({ notificationId: notifId }));
  };

  const handleAccept = (notifId: string) => {
    handleDelete(notifId);
    // Future: tambah logic join board di sini
  };

  const handleReject = (notifId: string) => {
    handleDelete(notifId);
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
      className={`${
        isOpen ? "block" : "hidden"
      } absolute top-[8vh] right-6 w-[90%] max-w-[400px] bg-white border border-gray-300 z-30 rounded-md shadow-md`}
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
              <Image
                src={currentUser.avatar || "/images/default.png"}
                alt={currentUser.name}
                width={40}
                height={40}
                className="rounded-full w-12 h-12"
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

                {isInvitation && (
                  <div className="flex gap-2 mt-2">
                    <button
                      className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm"
                      onClick={() => handleAccept(notif.id)}
                    >
                      Terima
                    </button>

                    <button
                      className="border border-gray-300 px-3 py-1 rounded-md text-sm"
                      onClick={() => handleReject(notif.id)}
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

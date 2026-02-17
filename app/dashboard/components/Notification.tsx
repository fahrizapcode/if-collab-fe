"use client";

import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { deleteNotification, User } from "@/store/userSlice";
import { ActiveComponent } from "@/types/types";

export default function Notification({
  isOpen,
  setIsActiveComponent,
}: {
  isOpen: boolean;
  setIsActiveComponent: React.Dispatch<React.SetStateAction<ActiveComponent>>;
}) {
  const dispatch = useDispatch();
  const currentUser: User | null = useSelector(
    (state: RootState) => state.user.currentUser,
  );

  if (!currentUser) return null;

  const handleAccept = (notifId: string) => {
    // Untuk sekarang kita hanya hapus notif
    dispatch(deleteNotification({ notificationId: notifId }));
    // Nanti bisa ditambahkan logic: tambah ke board
  };

  const handleReject = (notifId: string) => {
    dispatch(deleteNotification({ notificationId: notifId }));
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
            {currentUser.notifications.length}
          </span>
          <button
            onClick={() => setIsActiveComponent(null)}
            className="text-gray-500 hover:text-gray-700 font-bold"
          >
            X
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="flex flex-col max-h-[60vh] overflow-y-auto">
        {currentUser.notifications.map((notif) => {
          const isInvitation = notif.content.startsWith("Kamu diundang");

          return (
            <div
              key={notif.id}
              className="flex gap-3 p-4 border-b last:border-b-0"
            >
              <Image
                src={currentUser.avatar}
                alt={currentUser.name}
                width={40}
                height={40}
                className="rounded-full w-12 h-12"
              />

              <div className="flex-1 flex flex-col">
                <p className="text-sm">
                  {notif.content.includes("“") ? (
                    <>
                      {notif.content.split("“")[0]}
                      <b>“{notif.content.split("“")[1].split("”")[0]}”</b>
                      {notif.content.split("”")[1]}
                    </>
                  ) : (
                    notif.content
                  )}
                </p>
                <span className="text-xs text-gray-400 mt-1">
                  {new Date(notif.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" • "}
                  <span className="italic">{notif.board_title}</span>
                </span>

                {/* Actions untuk invitation */}
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

        {currentUser.notifications.length === 0 && (
          <p className="text-center text-gray-400 p-4">Tidak ada notifikasi</p>
        )}
      </div>
    </div>
  );
}

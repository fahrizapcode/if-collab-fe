import { User } from "@/types/typesUser";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Notification {
  id: string;
  content: string;
  board_title: string;
  created_at: string;
}

interface UserState {
  currentUser: User | null;
}

const initialState: UserState = {
  currentUser: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // ✅ SET USER (LOGIN)
    setUser(state, action: PayloadAction<User>) {
      state.currentUser = action.payload;
    },
    // ✅ UPDATE PROFILE
    updateProfile(
      state,
      action: PayloadAction<{ name?: string; password?: string }>,
    ) {
      if (!state.currentUser) return;

      if (action.payload.name !== undefined) {
        state.currentUser.name = action.payload.name;
      }

      if (action.payload.password !== undefined) {
        state.currentUser.password = action.payload.password;
      }
    },

    // ✅ LOGOUT (DELETE USER SESSION)
    logout(state) {
      state.currentUser = null;
    },

    // ✅ DELETE NOTIFICATION
    deleteNotification(
      state,
      action: PayloadAction<{ notificationId: string }>,
    ) {
      if (!state.currentUser) return;

      state.currentUser.notifications = state.currentUser.notifications.filter(
        (notif) => notif.id !== action.payload.notificationId,
      );
    },

    // ✅ CLEAR ALL NOTIFICATIONS
    clearNotifications(state) {
      if (!state.currentUser) return;
      state.currentUser.notifications = [];
    },

    // ✅ UPDATE NOTIFICATION (kalau suatu saat perlu)
    updateNotification(
      state,
      action: PayloadAction<{
        notificationId: string;
        content?: string;
      }>,
    ) {
      if (!state.currentUser) return;

      const notif = state.currentUser.notifications.find(
        (n) => n.id === action.payload.notificationId,
      );

      if (!notif) return;

      if (action.payload.content !== undefined) {
        notif.content = action.payload.content;
      }
    },
  },
});

export const {
  setUser,
  logout,
  deleteNotification,
  clearNotifications,
  updateNotification,
  updateProfile,
} = userSlice.actions;

export default userSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Notification, User } from "@/types/typesUser";

// ==============================
// STATE
// ==============================

interface UserState {
  currentUser: User | null;
}

const initialState: UserState = {
  currentUser: null,
};

// ==============================
// SLICE
// ==============================

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // ==========================
    // AUTH
    // ==========================

    setUser(state, action: PayloadAction<User>) {
      state.currentUser = action.payload;
    },

    logout(state) {
      state.currentUser = null;
    },

    // ==========================
    // PROFILE
    // ==========================

    updateProfile(
      state,
      action: PayloadAction<{
        name?: string;
        has_avatar?: boolean;
      }>,
    ) {
      if (!state.currentUser) return;

      const { name, has_avatar } = action.payload;

      if (name !== undefined) {
        state.currentUser.name = name;
      }

      if (has_avatar !== undefined) {
        state.currentUser.has_avatar = has_avatar;
      }
    },

    // ==========================
    // NOTIFICATIONS
    // ==========================

    setNotifications(state, action: PayloadAction<Notification[]>) {
      if (!state.currentUser) return;
      state.currentUser.notifications = action.payload;
    },

    addNotification(state, action: PayloadAction<Notification>) {
      if (!state.currentUser) return;
      state.currentUser.notifications.unshift(action.payload);
    },

    deleteNotification(
      state,
      action: PayloadAction<{ notificationId: string }>,
    ) {
      if (!state.currentUser) return;

      state.currentUser.notifications = state.currentUser.notifications.filter(
        (notif) => notif.id !== action.payload.notificationId,
      );
    },

    clearNotifications(state) {
      if (!state.currentUser) return;
      state.currentUser.notifications = [];
    },

    markNotificationRead(
      state,
      action: PayloadAction<{ notificationId: string }>,
    ) {
      if (!state.currentUser) return;
      const notif = state.currentUser.notifications.find(
        (n) => n.id === action.payload.notificationId,
      );
      if (notif) notif.read = true;
    },
  },
});

// ==============================
// EXPORTS
// ==============================

export const {
  setUser,
  logout,
  updateProfile,
  setNotifications,
  addNotification,
  deleteNotification,
  clearNotifications,
  markNotificationRead,
} = userSlice.actions;

export default userSlice.reducer;

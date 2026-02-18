import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types/typesUser";

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
        password?: string;
      }>,
    ) {
      if (!state.currentUser) return;

      const { name, password } = action.payload;

      if (name !== undefined) {
        state.currentUser.name = name;
      }

      if (password !== undefined) {
        state.currentUser.password = password;
      }
    },

    // ==========================
    // NOTIFICATIONS
    // ==========================

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

// ==============================
// EXPORTS
// ==============================

export const {
  setUser,
  logout,
  updateProfile,
  deleteNotification,
  clearNotifications,
  updateNotification,
} = userSlice.actions;

export default userSlice.reducer;

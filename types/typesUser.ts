// ==============================
// NOTIFICATION
// ==============================

export interface Notification {
  id: string;
  content: string;
  board_title: string;
  created_at: string;
}

// ==============================
// USER
// ==============================

export interface User {
  name: string;
  nim_nip: string;
  password: string;
  general_role: "student" | "admin";

  avatar?: string;
  notifications: Notification[];

  last_active: string;
}

// ==============================
// PUBLIC USER
// ==============================

export type PublicUser = Omit<User, "password">;

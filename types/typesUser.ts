// ==============================
// NOTIFICATION
// ==============================

export interface Notification {
  id: string;
  content: string;
  board_title: string;
  read: boolean;
  created_at: string;
  actor_id?: string;
  actor_has_avatar?: boolean;
  invitation_id?: string;
}

// ==============================
// USER (API user — no password in client state)
// ==============================

export interface User {
  id: string;
  name: string;
  nim_nip: string;
  general_role: "student" | "admin";

  has_avatar?: boolean;
  notifications: Notification[];

  last_active: string;
}

// ==============================
// PUBLIC USER (for board members / search)
// ==============================

export type PublicUser = {
  id: string;
  name: string;
  nim_nip: string;
  general_role: "student" | "admin";
  has_avatar?: boolean;
  last_active: string;
};

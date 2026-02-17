export interface User {
  name: string;
  nim_nip: string;
  password: string;
  avatar?: string;
  general_role: "student" | "admin";
  notifications: {
    id: string;
    content: string;
    board_title: string;
    created_at: string;
  }[];
  last_active: string;
}

export type PublicUser = Omit<User, "password">;

export type User = {
  name: string;
  nim_nip: string;
  password: string;
  avatar: string;
};
export type PublicUser = Omit<User, "password">;

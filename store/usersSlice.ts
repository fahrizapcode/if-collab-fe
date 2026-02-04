import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PublicUser, User } from "@/types/typesUser";
import { initialUsers } from "@/data/dataUsers"; // sesuaikan path
import { RootState } from "./store";

type UsersState = {
  users: User[];
  activeUser?: User | null;
};

const initialState: UsersState = {
  users: initialUsers,
  activeUser: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    // ➕ tambah user
    addUser(state, action: PayloadAction<User>) {
      state.users.push(action.payload);
    },

    // ❌ hapus user berdasarkan NIM/NIP
    removeUser(state, action: PayloadAction<string>) {
      state.users = state.users.filter(
        (user) => user.nim_nip !== action.payload,
      );
    },
  },
});

export const selectUserByNim = (nim_nip: string) => (state: RootState) =>
  state.users.users.find((user: User) => user.nim_nip === nim_nip);

export const selectUsersByNims =
  (nims: string[]) =>
  (state: RootState): PublicUser[] =>
    state.users.users
      .filter((user: User) => nims.includes(user.nim_nip))
      .map(({ password, ...publicUser }) => publicUser);

export const { addUser, removeUser } = usersSlice.actions;

export default usersSlice.reducer;

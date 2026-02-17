import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PublicUser, User } from "@/types/typesUser";
import { initialUsers } from "@/data/dataUsers";
import { RootState } from "./store";

type UsersState = {
  users: User[];
  activeUser: User | null;
  loginError: string | null;
};

const initialState: UsersState = {
  users: initialUsers,
  activeUser: null,
  loginError: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    // ✅ LOGIN
    login(state, action: PayloadAction<{ nim_nip: string; password: string }>) {
      const { nim_nip, password } = action.payload;

      const foundUser = state.users.find(
        (user) => user.nim_nip === nim_nip && user.password === password,
      );

      if (!foundUser) {
        state.loginError = "NIM/NIP atau password salah";
        state.activeUser = null;
        return;
      }

      state.activeUser = foundUser;
      state.loginError = null;
    },

    // ✅ LOGOUT
    logout(state) {
      state.activeUser = null;
    },

    // ➕ tambah user
    addUser(state, action: PayloadAction<User>) {
      state.users.push(action.payload);
    },

    // ❌ hapus user
    removeUser(state, action: PayloadAction<string>) {
      state.users = state.users.filter(
        (user) => user.nim_nip !== action.payload,
      );
    },
    updateUser(state, action: PayloadAction<User>) {
      const index = state.users.findIndex(
        (user) => user.nim_nip === action.payload.nim_nip,
      );

      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
  },
});

export const selectActiveUser = (state: RootState) => state.users.activeUser;

export const selectLoginError = (state: RootState) => state.users.loginError;

export const selectAllUsers = (state: RootState) => state.users.users;
export const selectUserByNim = (nim_nip: string) => (state: RootState) =>
  state.users.users.find((user: User) => user.nim_nip === nim_nip);

export const selectUsersByNims =
  (nims: string[]) =>
  (state: RootState): PublicUser[] =>
    state.users.users
      .filter((user: User) => nims.includes(user.nim_nip))
      .map(({ password, ...publicUser }) => publicUser);

export const { login, logout, addUser, removeUser, updateUser } =
  usersSlice.actions;

export default usersSlice.reducer;

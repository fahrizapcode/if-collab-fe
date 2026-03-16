import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PublicUser } from "@/types/typesUser";
import { RootState } from "./store";

// ==============================
// STATE
// ==============================

type UsersState = {
  users: PublicUser[];
  searchLoading: boolean;
};

const initialState: UsersState = {
  users: [],
  searchLoading: false,
};

// ==============================
// SLICE
// ==============================

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<PublicUser[]>) {
      state.users = action.payload;
    },
    setSearchLoading(state, action: PayloadAction<boolean>) {
      state.searchLoading = action.payload;
    },
  },
});

// ==============================
// SELECTORS
// ==============================

export const selectAllUsers = (state: RootState) => state.users.users;
export const selectSearchLoading = (state: RootState) =>
  state.users.searchLoading;

export const selectUserById = (id: string) => (state: RootState) =>
  state.users.users.find((u) => u.id === id);

// ==============================
// EXPORTS
// ==============================

export const { setUsers, setSearchLoading } = usersSlice.actions;

export default usersSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  nama: string;
  nim_nip: string;
  password: string;
}

const initialState: UserState = {
  nama: "",
  nim_nip: "",
  password: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserState>) {
      state.nama = action.payload.nama;
      state.nim_nip = action.payload.nim_nip;
      state.password = action.payload.password;
    },
    clearUser() {
      return initialState;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;

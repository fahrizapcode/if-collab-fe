import { configureStore } from "@reduxjs/toolkit";
import boardsReducer from "./boardsSlice";
import usersReducer from "./usersSlice";
import userReducer from "./userSlice";

export const store = configureStore({
  reducer: {
    boards: boardsReducer,
    users: usersReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

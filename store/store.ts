import { configureStore } from "@reduxjs/toolkit";
import boardsReducer from "./boardsSlice";
import usersReducer from "./usersSlice";

export const store = configureStore({
  reducer: {
    boards: boardsReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

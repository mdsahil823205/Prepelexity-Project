import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/context/auth.slice.js";
import chatReducer from "../features/chats/context/chat.slice.js";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
  },
});

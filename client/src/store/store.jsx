import { configureStore } from "@reduxjs/toolkit";
import UserReducer from "./Users/user.slice";
import Messages from ".//Message/auth.slice";
import Auth from "./Auth/auth.slice";
const store = configureStore({
  reducer: {
    counter: Auth,
    userAuthData: UserReducer,
    messageData: Messages,
  },
});

export default store;

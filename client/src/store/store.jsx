import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./Users/user.slice";
import Messages from ".//Message/auth.slice";
import Auth from "./Auth/auth.slice";
const store = configureStore({
  reducer: {
    counter: counterReducer,
    userAuthData: Auth,
    messageData: Messages,
  },
});

export default store;

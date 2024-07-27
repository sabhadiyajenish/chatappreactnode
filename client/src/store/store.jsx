import { configureStore } from "@reduxjs/toolkit";
import UserReducer from "./Users/user.slice";
import Messages from "./Message/auth.slice";
import Notification from "./Notification/notification.slice";
import SoketEvents from "./Socket/socket.slice";
import Auth from "./Auth/auth.slice";
const store = configureStore({
  reducer: {
    counter: Auth,
    userAuthData: UserReducer,
    messageData: Messages,
    notificationData: Notification,
    SocketData: SoketEvents,
  },
});

export default store;

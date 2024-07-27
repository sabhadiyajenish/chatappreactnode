import { createSlice } from "@reduxjs/toolkit";
const SocketEvents = createSlice({
  name: "socket",
  initialState: {
    socketConnection: false,
    loading: false,
  },
  reducers: {
    SocketUpdatedEvent: (state, action) => {
      state.socketConnection = action?.payload;
    },
  },
});
const { actions, reducer } = SocketEvents;
export const { SocketUpdatedEvent } = actions;
export default reducer;

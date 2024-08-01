import { createSlice } from "@reduxjs/toolkit";
import { getUserNotification } from "./notificationApi";
const Notification = createSlice({
  name: "Notification",
  initialState: {
    notificationDatas: [],
    loading: false,
  },
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getUserNotification.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserNotification.fulfilled, (state, action) => {
        const { payload } = action;
        state.notificationDatas = payload;
        state.loading = false;
      })
      .addCase(getUserNotification.rejected, (state) => {
        state.loading = false;
      });
  },
});
const { actions, reducer } = Notification;
// export const { "" } = actions;
export default reducer;

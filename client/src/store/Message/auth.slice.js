import { createSlice } from "@reduxjs/toolkit";
import { getUserMessage, getAllUser, getConversation } from "./authApi";
const Message = createSlice({
  name: "message",
  initialState: {
    oneUserMessage: [],
    conversationData: [],
    userLists: [],
    loading: false,
  },
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getUserMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserMessage.fulfilled, (state, action) => {
        const { payload } = action;
        state.oneUserMessage = payload?.data;
        state.loading = false;
      })
      .addCase(getUserMessage.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getAllUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllUser.fulfilled, (state, action) => {
        const { payload } = action;
        state.userLists = payload?.data;
        state.loading = false;
      })
      .addCase(getAllUser.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getConversation.pending, (state) => {
        state.loading = true;
      })
      .addCase(getConversation.fulfilled, (state, action) => {
        const { payload } = action;
        state.conversationData = payload?.data;
        state.loading = false;
      })
      .addCase(getConversation.rejected, (state) => {
        state.loading = false;
      });
  },
});
const { actions, reducer } = Message;
// export const { "" } = actions;
export default reducer;

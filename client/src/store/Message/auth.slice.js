import { createSlice } from "@reduxjs/toolkit";
import { getUserMessage, getAllUser, getConversation } from "./authApi";
const Message = createSlice({
  name: "message",
  initialState: {
    oneUserMessage: [],
    conversationData: [],
    messageLength: false,
    userLists: [],
    loading: false,
    loadingUsers: false,
    loadingConversation: false,
  },
  reducers: {
    changeMessagesLength: (state, action) => {
      state.messageLength = action?.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getUserMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserMessage.fulfilled, (state, action) => {
        const { payload } = action;
        state.oneUserMessage = payload?.messagesByDate;
        state.messageLength = payload?.lengthAllMessages;
        state.loading = false;
      })
      .addCase(getUserMessage.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getAllUser.pending, (state) => {
        state.loadingUsers = true;
      })
      .addCase(getAllUser.fulfilled, (state, action) => {
        const { payload } = action;
        state.userLists = payload;
        state.loadingUsers = false;
      })
      .addCase(getAllUser.rejected, (state) => {
        state.loadingUsers = false;
      })
      .addCase(getConversation.pending, (state) => {
        state.loadingConversation = true;
      })
      .addCase(getConversation.fulfilled, (state, action) => {
        const { payload } = action;
        state.conversationData = payload;
        state.loadingConversation = false;
      })
      .addCase(getConversation.rejected, (state) => {
        state.loadingConversation = false;
      });
  },
});
const { actions, reducer } = Message;
export const { changeMessagesLength } = actions;

export default reducer;

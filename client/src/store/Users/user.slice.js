import { createSlice } from "@reduxjs/toolkit";
import { getOneUser } from "./userApi";
const users = createSlice({
  name: "user",
  initialState: {
    userOneData: [],
    loading: false,
  },
  reducers: {
    //this is used for without calling apis directy send data into redux
  },
  extraReducers(builder) {
    builder
      .addCase(getOneUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOneUser.fulfilled, (state, action) => {
        const { payload } = action;
        state.userOneData = payload?.data;
      })
      .addCase(getOneUser.rejected, (state) => {
        state.loading = false;
      });
  },
});
const { actions, reducer } = users;
export const { addUsers, addImage } = actions;
export default reducer;

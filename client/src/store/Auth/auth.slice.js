import { createSlice } from "@reduxjs/toolkit";
import { getUserData, LogoutUserFun } from "./authApi";
const Auth = createSlice({
  name: "user",
  initialState: {
    userLoggedIn: false,
    authTokenGet: localStorage.getItem("token") || "",
    authUser: null,
    loading: false,
  },
  reducers: {
    //this is used for without calling apis directy send data into redux
    Login: (state, action) => {
      // console.log("actions....", action);
      state.userLoggedIn = true;
      state.authTokenGet = localStorage.getItem("token") || "";
      state.authUser = action?.payload?.data || action?.payload?.user;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getUserData.pending, (state, param) => {
        state.loading = true;
      })
      .addCase(getUserData.fulfilled, (state, action) => {
        const { payload } = action;
        state.userLoggedIn = true;
        state.authTokenGet = localStorage.getItem("token") || "";
        state.authUser = payload?.data || payload?.user;
        state.loading = false;
      })
      .addCase(getUserData.rejected, (state, param) => {
        state.loading = false;
      })
      .addCase(LogoutUserFun.pending, (state, param) => {
        state.loading = true;
      })
      .addCase(LogoutUserFun.fulfilled, (state, action) => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userInfo");
        localStorage.removeItem("userCountInfo");

        state.authTokenGet = "";
        state.userLoggedIn = false;
        state.authUser = null;
        state.loading = false;
      })
      .addCase(LogoutUserFun.rejected, (state, param) => {
        state.loading = false;
      });
  },
});
const { actions, reducer } = Auth;
export const { Login } = actions;
export default reducer;

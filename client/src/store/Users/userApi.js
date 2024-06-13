import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/commonAxios.jsx";

export const getOneUser = createAsyncThunk("user/getOneUser", async () => {
  try {
    const responce = await axios.get("/user/get-userdata");
    // console.log("user one get data is", responce?.data);

    return responce?.data;
  } catch (error) {
    console.log("Error in Store Async thunk in Error Api Catch Block", error);
  }
});

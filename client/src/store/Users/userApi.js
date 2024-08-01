import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/commonAxios.jsx";
import { decryptData } from "../../utils/decrypt.jsx";
import { ENCRYPTION_KEY } from "../../utils/constant.jsx";

export const getOneUser = createAsyncThunk("user/getOneUser", async () => {
  try {
    const responce = await axios.get("/user/get-userdata");
    // console.log("user one get data is", responce?.data);
    const res = await decryptData(responce?.data?.data, ENCRYPTION_KEY);
    return JSON.parse(res);
  } catch (error) {
    console.log("Error in Store Async thunk in Error Api Catch Block", error);
  }
});

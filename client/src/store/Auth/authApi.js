import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/commonAxios.jsx";
import { USERS } from "../../utils/constant.jsx";
import axiosSimple from "axios";
import { useNavigate } from "react-router-dom";

export const getUserData = createAsyncThunk("auth/setDatas", async () => {
  try {
    const userStatus = localStorage.getItem("accessToken");
    if (userStatus && userStatus !== "") {
      const responce = await axios.get(USERS.GET_USER_API);
      console.log("data is", responce?.data);
      return responce?.data;
    }
    return null;
  } catch (error) {
    console.log("Error in Store Async thunk in Error Api Catch Block", error);
  }
});

export const LogoutUserFun = createAsyncThunk("auth/deleteData", async () => {
  try {
    const responce = await axios.get(USERS.LOGOUT_USER_API, {
      withCredentials: true,
    });
    return responce?.data;
  } catch (error) {
    console.log(
      "Error in Logout Store Async thunk in Error Api Catch Block",
      error
    );
  }
});

export const RegisterUser = createAsyncThunk(
  "auth/register",
  async (FormData) => {
    try {
      const responce = await axiosSimple.post(
        USERS.REGISTER_USER_API,
        FormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (responce?.data?.message) {
        alert(responce?.data?.message);
      }
      if (responce?.data?.success == "false") {
        alert("Something is wrong plz check...");
      }
      console.log("respce>>>>>", responce);
      return responce;
    } catch (error) {
      console.log(
        "Error in Logout Store Async thunk in Error Api Catch Block",
        error
      );
    }
  }
);

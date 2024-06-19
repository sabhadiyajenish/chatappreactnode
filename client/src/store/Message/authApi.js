import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/commonAxios.jsx";
import { USERS } from "../../utils/constant.jsx";
import axiosSimple from "axios";
// import { useNavigate } from "react-router-dom";

export const addUserMessage = createAsyncThunk(
  "message/addUserMessage",
  async (data) => {
    try {
      const responce = await axios.post("/messages/", data);
      console.log("data is", responce?.data);
      return responce?.data;
    } catch (error) {
      console.log("Error in Store Async thunk in Error Api Catch Block", error);
    }
  }
);
export const getUserMessage = createAsyncThunk(
  "message/getUserMessage",
  async (data) => {
    try {
      const responce = await axios.post(`/messages/getmessage`, data);
      // console.log("data user one messagwe is<<<<<>>> is", responce?.data);
      return responce?.data;
    } catch (error) {
      console.log("Error in Store Async thunk in Error Api Catch Block", error);
    }
  }
);
export const getAllUser = createAsyncThunk("message/getAllUser", async () => {
  try {
    const responce = await axios.get("/user/get-Alluserdata");
    // console.log("data is", responce?.data);
    return responce?.data;
  } catch (error) {
    console.log("Error in Store Async thunk in Error Api Catch Block", error);
  }
});
export const getConversation = createAsyncThunk(
  "message/getConversation",
  async (data) => {
    try {
      const responce = await axios.get(`/messages/${data}`);
      console.log("data is user conversations...<<<<<", responce?.data);
      return responce?.data;
    } catch (error) {
      console.log("Error in Store Async thunk in Error Api Catch Block", error);
    }
  }
);
export const deleteMessageData = createAsyncThunk(
  "message/deleteMessageData",
  async (data, data1) => {
    try {
      const responce = await axios.post(`/messages/deleteMessage`, data);
      console.log("data is user conversations...<<<<<", responce?.data);
      return responce?.data;
    } catch (error) {
      console.log("Error in Store Async thunk in Error Api Catch Block", error);
    }
  }
);
export const clearChatMessageData = createAsyncThunk(
  "message/clearChatMessage",
  async (data) => {
    try {
      const responce = await axios.post(`/messages/clearChatMessage`, data);
      console.log("data is user clearChatMessage...<<<<<", responce?.data);
      return responce?.data;
    } catch (error) {
      console.log("Error in Store Async thunk in Error Api Catch Block", error);
    }
  }
);
export const LogoutUserFun = createAsyncThunk("auth/deleteData", async () => {
  try {
    const responce = await axios.get(USERS.LOGOUT_USER_API, {
      withCredentials: true,
    });
    return responce;
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

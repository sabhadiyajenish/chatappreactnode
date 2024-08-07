import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/commonAxios.jsx";
import { ENCRYPTION_KEY, USERS } from "../../utils/constant.jsx";
import axiosSimple from "axios";
import { decryptData } from "../../utils/decrypt.jsx";
// import { useNavigate } from "react-router-dom";
import cache from "../../utils/cache.js";
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
      const res = await decryptData(responce?.data?.data, ENCRYPTION_KEY);
      cache.set(`getUserMessage-${data?.reciverId}`, JSON.parse(res));

      return JSON.parse(res);
    } catch (error) {
      console.log("Error in Store Async thunk in Error Api Catch Block", error);
    }
  }
);
export const getAllUser = createAsyncThunk("message/getAllUser", async () => {
  try {
    const responce = await axios.get("/user/get-Alluserdata");
    // console.log("data is", responce?.data);
    const res = await decryptData(responce?.data?.data, ENCRYPTION_KEY);
    cache.set("getAllUsers", JSON.parse(res));
    return JSON.parse(res);
  } catch (error) {
    console.log("Error in Store Async thunk in Error Api Catch Block", error);
  }
});
export const getConversation = createAsyncThunk(
  "message/getConversation",
  async (data) => {
    try {
      const responce = await axios.get(`/messages/${data}`);
      const res = await decryptData(responce?.data?.data, ENCRYPTION_KEY);
      // cache.set("getConversation", JSON.parse(res));

      return JSON.parse(res);
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
export const updateSeenChatMessageData = createAsyncThunk(
  "message/updateSeenChatMessageData",
  async (data) => {
    try {
      const responce = await axios.post(`/messages/updateSeenStatus`, data);
      console.log("data is user updateSeenStatus...<<<<<", responce?.data);
      return responce?.data;
    } catch (error) {
      console.log("Error in Store Async thunk in Error Api Catch Block", error);
    }
  }
);

export const clearMessageseensent = createAsyncThunk(
  "message/clearMessageseensent",
  async (data) => {
    try {
      const responce = await axios.post(`/messages/clearMessageseensent`, data);
      console.log("data is user clearMessageseensent...<<<<<", responce?.data);
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

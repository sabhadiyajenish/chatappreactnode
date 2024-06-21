import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/commonAxios.jsx";
import axiosSimple from "axios";
// import { useNavigate } from "react-router-dom";

export const addUserNotification = createAsyncThunk(
  "notification/addUserNotification",
  async (data) => {
    try {
      const responce = await axios.post("/notification/", data);
      console.log("data is", responce?.data);
      return responce?.data;
    } catch (error) {
      console.log("Error in Store Async thunk in Error Api Catch Block", error);
    }
  }
);
export const getUserNotification = createAsyncThunk(
  "notification/getUserNotification",
  async (data) => {
    try {
      const responce = await axios.post(`/notification/getNotification`, data);
      // console.log("data user one messagwe is<<<<<>>> is", responce?.data);
      return responce?.data;
    } catch (error) {
      console.log("Error in Store Async thunk in Error Api Catch Block", error);
    }
  }
);

export const deleteNotificationData = createAsyncThunk(
  "notification/deleteNotificationData",
  async (data, data1) => {
    try {
      const responce = await axios.post(
        `/notification/deleteNotification`,
        data
      );
      console.log("data is user conversations...<<<<<", responce?.data);
      return responce?.data;
    } catch (error) {
      console.log("Error in Store Async thunk in Error Api Catch Block", error);
    }
  }
);

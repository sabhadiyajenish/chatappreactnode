import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getUserData } from "../../store/Auth/authApi";
import NotificationComponent from "../../component/Notification";
import axios from "../../utils/commonAxios.jsx";
import { Login as SetLoginAuth } from "../../store/Auth/auth.slice";

const Home = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const callUserDataApi = async () => {
    const responce = await axios.get("/user/get-userdata");

    const userInfo = {
      email: responce?.data?.data?.email,
      userId: responce?.data?.data?._id,
    };

    localStorage.setItem("userInfo", JSON.stringify(userInfo || {}));
    dispatch(SetLoginAuth(responce?.data?.data));
    navigate("/");
  };
  useEffect(() => {
    if (searchParams.get("accessToken") && searchParams.get("refreshToken")) {
      localStorage.setItem("accessToken", searchParams.get("accessToken"));
      localStorage.setItem("refreshToken", searchParams.get("refreshToken"));

      callUserDataApi();
    }
  }, [searchParams]);

  return (
    <>
      <h1>Home pages</h1>

      <NotificationComponent />
    </>
  );
};

export default Home;

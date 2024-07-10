import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getUserData } from "../../store/Auth/authApi";
import NotificationComponent from "../../component/Notification";

const Home = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (searchParams.get("accessToken") && searchParams.get("refreshToken")) {
      localStorage.setItem("accessToken", searchParams.get("accessToken"));
      localStorage.setItem("refreshToken", searchParams.get("refreshToken"));
      dispatch(getUserData());
      navigate("/");
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

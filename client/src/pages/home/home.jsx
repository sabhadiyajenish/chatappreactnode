import React, { useEffect } from 'react';
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getUserData } from '../../store/Auth/authApi';

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
    </>
  )
}

export default Home;
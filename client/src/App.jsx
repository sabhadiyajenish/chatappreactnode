import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import "./App.css";
import NavBar from "./pages/NavBarX";
import { getUserData } from "./store/Auth/authApi";
import { Login } from "./store/Auth/auth.slice";
import axios, { Abort } from "./utils/commonAxios";
import { ENCRYPTION_KEY, LOCAL_PATH } from "./utils/constant";
import { decryptData } from "./utils/decrypt";

const App = () => {
  const [loading, setLoading] = useState(true);

  const data1 = useSelector((state) => {
    //get redux data here
    return state.userAuthData;
  });

  const dispatch = useDispatch();

  useEffect(() => {
    axios
      .get(
        `${LOCAL_PATH}/user/get-userdata`
        // {
        //   cancelToken: Abort.token,
        // }
      )
      .then(async (response) => {
        const res = await decryptData(response?.data?.data, ENCRYPTION_KEY);
        dispatch(Login(JSON.parse(res)));
      })
      .catch((err) => {
        // console.log("Something is wrong in UsergetData apis catch block", err);
        console.clear();
      })
      .finally(() => {
        // console.clear();
        setLoading(false);
      });
    // return () => {
    //   Abort.cancel();
    // }
  }, []);

  return !loading ? (
    <>
      <NavBar />
      <main>
        <Outlet />
      </main>
    </>
  ) : (
    <>
      <div
        className="flex w-full h-full text-center"
        style={{ width: "100%", height: "100vh", textAlign: "center" }}
      >
        <h1 className="text-start text-blue-700 text-[25px]">
          Please wait for a seconds because server host in Render-Cloud with
          free domain so if you not use Your server so within 1 minit server go
          to sleep mode so currently in sleeping state now server take time to
          Start......
        </h1>
      </div>
    </>
  );
};

export default App;

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { decryptData } from "../utils/decrypt";
import { ENCRYPTION_KEY } from "../utils/constant.jsx";
import { Login as SetLoginAuth } from "../store/Auth/auth.slice";
import axios from "../utils/commonAxios.jsx";
import { useDispatch } from "react-redux";

const withAuth = (WrappedComponent, authentication = true) => {
  return (props) => {
    const [searchParams] = useSearchParams();

    const [loading, setLoading] = useState(true);
    const { userLoggedIn } = useSelector((state) => state.counter);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const callUserDataApi = async () => {
      const responce1 = await axios.get("/user/get-userdata");
      const res = await decryptData(responce1?.data?.data, ENCRYPTION_KEY);
      const responce = JSON.parse(res);
      const userInfo = {
        email: responce?.email,
        userId: responce?._id,
      };

      localStorage.setItem("userInfo", JSON.stringify(userInfo || {}));
      dispatch(SetLoginAuth(responce));
      navigate("/");
    };
    useEffect(() => {
      if (searchParams.get("accessToken") && searchParams.get("refreshToken")) {
        localStorage.setItem("accessToken", searchParams.get("accessToken"));
        localStorage.setItem("refreshToken", searchParams.get("refreshToken"));

        callUserDataApi();
      }
    }, [searchParams]);
    useEffect(() => {
      const checkAuth = () => {
        if (authentication && !userLoggedIn) {
          navigate("/login");
        } else if (!authentication && userLoggedIn) {
          navigate("/");
          setLoading(false);
        } else {
          setLoading(false);
        }
      };

      checkAuth();
    }, [authentication, userLoggedIn, navigate]);

    if (loading) {
      return <div>Loading...</div>; // Or any loading component you prefer
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;

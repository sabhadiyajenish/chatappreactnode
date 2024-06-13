import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const AuthLayout = ({ children, authentication = true }) => {
  const [Loadings, setLoadings] = useState(true);

  const { authUser, userLoggedIn, authTokenGet, loading } = useSelector(
    (state) => {
      //get redux Auth data here
      return state.counter;
    }
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();
  console.log("authentication status is<<<<<<,", userLoggedIn);
  useEffect(() => {
    if (authentication && userLoggedIn !== authentication) {
      navigate("/login");
      setLoadings(false);
    } else if (!authentication && userLoggedIn !== authentication) {
      navigate("/");
      setLoadings(false);
    }
    setLoadings(false);
  }, [authentication, userLoggedIn, navigate]);

  return <>{children} </>;
};

export default AuthLayout;

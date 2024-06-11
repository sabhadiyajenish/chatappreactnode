import { useGoogleLogin } from "@react-oauth/google";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  Link,
  NavLink,
  useNavigate,
  useParams,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import Input from "../../component/Input.jsx";
import Button from "../../component/Button.jsx";
import { Login as SetLoginAuth } from "../../store/Auth/auth.slice";
import "./login.css";
import axios from "axios";
import {
  EmailValidate,
  PasswordValidate,
} from "../../utils/validation/RegisterValidate.jsx";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  // console.log("parametess<<<<>>><>"), searchParams;

  const { authUser, authTokenGet, loading } = useSelector((state) => {
    //get redux data here
    return state.userAuthData;
  });

  const LoginUser = async (logData) => {
    const res = await axios.post(
      "http://localhost:5000/api/v1/user/login",
      logData
    );
    console.log("res", res);
    if (res && res?.data?.success) {
      localStorage.setItem("accessToken", res?.data?.data?.accessToken);
      localStorage.setItem("refreshToken", res?.data?.data?.refreshToken);
      dispatch(SetLoginAuth(res?.data?.data));
      navigate("/");
      alert(res?.data?.message);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="w-full h-full">
      <section className="w-full flex flex-col md:flex-row items-center">
        <div className="bg-blue-600 hidden md:block w-full md:w-1/2 xl:w-2/3 h-screen">
          <img
            src="https://images.unsplash.com/photo-1444313431167-e7921088a9d3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1441&q=100"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div
          className="bg-white w-full sm:max-w-md md:max-w-md lg:max-w-full md:mx-0 md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12
                                    flex items-center justify-center"
        >
          <div className="w-full h-100">
            <h1 className="text-xl md:text-2xl font-bold leading-tight mt-12">
              Log in to your account
            </h1>

            <form className="mt-6" onSubmit={handleSubmit(LoginUser)}>
              <div>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter Email Address"
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 
                                                     focus:bg-white focus:outline-none"
                  {...register("email", EmailValidate)}
                />
                {errors.email && (
                  <p className="errorMsg">{errors.email.message}</p>
                )}
              </div>

              <div className="mt-4">
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter Password"
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 
                                                      focus:bg-white focus:outline-none"
                  {...register("password", PasswordValidate)}
                />
                {errors.password?.type === "required" && (
                  <p className="errorMsg">Password is required.</p>
                )}
                {errors.password?.type === "checkLength" && (
                  <p className="errorMsg">
                    Password should be at-least 6 characters.
                  </p>
                )}
                {errors.password?.type === "matchPattern" && (
                  <p className="errorMsg">
                    Password should contain at least one uppercase letter,
                    lowercase letter, digit, and special symbol.
                  </p>
                )}
              </div>

              <div className="text-right mt-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-700 hover:text-blue-700 focus:text-blue-700"
                >
                  Forgot Password?
                </Link>
              </div>
              <Button
                type="submit"
                className="w-full block bg-blue-500 hover:bg-blue-400 focus:bg-blue-400 text-white font-semibold rounded-lg
                                                  px-4 py-3 mt-6"
              >
                {" "}
                Log In
              </Button>
            </form>

            <hr className="my-6 border-gray-300 w-full" />

            <button
              onClick={() =>
                (window.location.href =
                  "http://localhost:5000/api/v1/user/google")
              }
              className="w-full block bg-gray-200 hover:bg-gray-100 focus:bg-gray-100 text-gray-900 font-semibold rounded-lg px-4 py-2.5 border border-gray-300"
            >
              <div className="flex items-center justify-center">
                {/* <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" className="w-6 h-6" viewBox="0 0 48 48"><defs><path id="a" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" /></defs><clipPath id="b"><use xlink:href="#a" overflow="visible" /></clipPath><path clip-path="url(#b)" fill="#FBBC05" d="M0 37V11l17 13z" /><path clip-path="url(#b)" fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z" /><path clip-path="url(#b)" fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z" /><path clip-path="url(#b)" fill="#4285F4" d="M48 48L17 24l-4-3 35-10z" /></svg> */}
                <img
                  src="https://cdn.iconscout.com/icon/free/png-256/free-google-152-189813.png"
                  alt="gogle"
                  height="35px"
                  width="35px"
                />
                <span className="ml-4">Log in with Google</span>
              </div>
            </button>

            <p className="mt-8">
              Need an account?{" "}
              <NavLink
                to="/register"
                className="text-blue-500 hover:text-blue-700 font-semibold"
              >
                Create an account
              </NavLink>
            </p>

            <p className="text-sm text-gray-500 mt-12">
              &copy; {new Date().getFullYear()} Jenish Pvt-Ltd - All Rights
              Reserved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;

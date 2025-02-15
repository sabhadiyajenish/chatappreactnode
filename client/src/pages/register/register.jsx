import React, { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import Button from "../../component/Button.jsx";
import Input from "../../component/Input.jsx";
import {
  EmailValidate,
  PasswordValidate,
  ProfileValidate,
  fullNameValidate,
  userNameValidate,
} from "../../utils/validation/RegisterValidate.jsx";
import "./register.css";
import { USERS } from "../../utils/constant.jsx";
import toast from "react-hot-toast";

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [regiLoading, setRegiLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { authUser, authTokenGet, loading } = useSelector((state) => {
    //get redux data here
    return state.userAuthData;
  });

  let formData = new FormData();
  const RegisterUsers = async (item) => {
    setRegiLoading(true);
    formData.append("userName", item.userName);
    formData.append("email", item.email);
    formData.append("password", item.password);
    formData.append("fullName", item.fullName);
    formData.append("avatar", item.profileImage[0]);

    axios
      .post(USERS.REGISTER_USER_API, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((datas) => {
        if (datas?.data?.message) {
          toast.success(`${datas?.data?.message || ""}.`, {
            duration: 3000,
            position: "top-center",
          });
          navigate("/login");
        }
        if (datas?.data?.success == "false") {
          alert("Something is wrong plz check...");
        }
      })
      .catch((e) => {
        console.log("Errror in registering Catch block", e);
      })
      .finally(() => {
        setRegiLoading(false);
      });

    console.log("respce>>>>>", responce);
  };

  return regiLoading ? (
    <h1>Plz wait for a while....</h1>
  ) : (
    <div className="w-full h-full">
      <section className="w-full flex flex-col md:flex-row items-center">
        <div
          className="dark:bg-gray-900 w-full sm:max-w-md md:max-w-md lg:max-w-full md:mx-0 md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12
                                    flex items-center justify-center"
        >
          <div className="w-full h-100">
            <h1 className="text-xl md:text-2xl font-bold leading-tight mt-10 dark:text-white">
              Create new account{" "}
            </h1>

            <form className="mt-3" onSubmit={handleSubmit(RegisterUsers)}>
              <div>
                <Input
                  label="userName*"
                  // name='userName'
                  placeholder="Enter userName"
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 
                                                focus:bg-white focus:outline-none"
                  {...register("userName", userNameValidate)}
                />
                {errors.userName && (
                  <p className="errorMsg">{errors.userName.message}</p>
                )}
              </div>
              <div className="mt-4">
                <Input
                  label="fullName*"
                  placeholder="Enter fullName"
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 
                                                        focus:bg-white focus:outline-none"
                  {...register("fullName", fullNameValidate)}
                />
                {errors.fullName && (
                  <p className="errorMsg">{errors.fullName.message}</p>
                )}
              </div>
              <div className="mt-4">
                <Input
                  label="Email Address*"
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
                  label="Password*"
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
              <div className="mt-4 flex">
                <Input
                  label="Profile Image*"
                  type="file"
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 
                                                        focus:bg-white focus:outline-none"
                  {...register("profileImage", ProfileValidate)}
                />
              </div>
              {errors.profileImage && (
                <p className="errorMsg">{errors.profileImage.message}</p>
              )}

              {/* <div className="mt-2 flex">
                                            <Input label="Cover Image"
                                                type='file'
                                                className='w-full px-4 py-2.5 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 
                                                        focus:bg-white focus:outline-none'
                                                {...register("coverImage", {
                                                    // required: {
                                                    //     value: true,
                                                    //     message: "Image is Required."
                                                    // }, // for making the input required
                                                    validate: {
                                                        // If you want other file format, then add them to the array
                                                        fileType: file => ["jpg", "png", "jpeg"].includes(file[0]?.type?.split("/")[1].toLowerCase()) || "The file type should be Image",

                                                        fileSize: file => file[0].size / (1024 * 1024) < 5 || "The file size should be less than 5MB"
                                                        //Add other validation if you want. For example, checking for file size

                                                    }
                                                })}
                                            />
                                        </div>
                                        {errors.coverImage && <p className="errorMsg">{errors.coverImage.message}</p>} */}
              <Button
                type="submit"
                className="w-full block bg-blue-500 hover:bg-blue-400 focus:bg-blue-400 text-white font-semibold rounded-lg
                                        px-4 py-2.5 mt-10"
              >
                {" "}
                Register User
              </Button>
            </form>

            {/* <hr className="my-6  border-gray-300 w-full" /> */}

            <p className="mt-4 dark:text-white">
              Already have account?{" "}
              <NavLink
                to="/login"
                className="text-blue-500 hover:text-blue-700 font-semibold"
              >
                Please Login
              </NavLink>
            </p>

            {/* <p className="text-sm hidden lg-b text-gray-500 mt-12">&copy; {new Date().getFullYear()} Jenish Pvt-Ltd - All Rights Reserved.</p> */}
          </div>
        </div>
        <div className="bg-blue-600 hidden md:block w-full md:w-1/2 xl:w-2/3 h-screen">
          <img
            src="https://images.unsplash.com/photo-1444313431167-e7921088a9d3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1441&q=100"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      </section>
    </div>
  );
};

export default Register;

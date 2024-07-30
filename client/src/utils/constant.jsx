import Cookies from "js-cookie";
export const LOCAL_PATH = "https://chatappreactnode-1.onrender.com/api/v1";
export const SOCKET_URL = "https://chatappreactnode-1.onrender.com";

// export const LOCAL_PATH = "http://localhost:5000/api/v1";
// export const SOCKET_URL = "http://localhost:2525";
// export const LOCAL_PATH = "http://192.168.1.23:5000/api/v1";
// export const SOCKET_URL = "http://192.168.1.23:5000";

let accessTokenFromStorage =
  localStorage.getItem("accessToken") || Cookies.get("accessToken");
console.log("Token for localhost<<>><><", accessTokenFromStorage);
export const headers = {
  "Access-Control-Allow-Origin": "*",
  "Content-type": "Application/json",
  Authorization: `Bearer ${accessTokenFromStorage}`,
};

export const USERS = {
  GET_USER_API: `${LOCAL_PATH}/user/get-userdata`,
  REGISTER_USER_API: `${LOCAL_PATH}/user/register`,
  LOGIN_USER_API: `${LOCAL_PATH}/user/login`,
  LOGOUT_USER_API: `${LOCAL_PATH}/user/logout`,
};

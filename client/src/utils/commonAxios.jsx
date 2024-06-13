import axios from "axios";
import { LOCAL_PATH } from "./constant.jsx";
axios.defaults.withCredentials = true;

let accessTokenFromStorage = localStorage.getItem("accessToken");

const instance = axios.create({
  baseURL: LOCAL_PATH, // Set your API base URL
  // timeout: 5000, // Set a timeout for requests
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-type": "Application/json",
    // Authorization: `Bearer ${accessTokenFromStorage}`,
  },
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    const accessTokenFromStorage = localStorage.getItem("accessToken");
    if (accessTokenFromStorage) {
      config.headers.Authorization = `Bearer ${accessTokenFromStorage}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export const Abort = axios.CancelToken.source();

export default instance;

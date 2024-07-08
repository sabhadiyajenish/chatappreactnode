import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getUserData } from "../../store/Auth/authApi";
import NotificationComponent from "../../component/Notification";

const CameraComponent = () => {
  const videoRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(true);

  useEffect(() => {
    const constraints = { video: true, audio: true };

    const successCallback = (stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    };

    const errorCallback = (error) => {
      console.error("Error accessing media devices.", error);
      setHasCamera(false);
    };

    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        if (videoDevices.length === 0) {
          setHasCamera(false);
        }
      } catch (error) {
        console.error("Error checking media devices.", error);
        setHasCamera(false);
      }
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(successCallback)
      .catch(errorCallback);

    checkCamera();

    return () => {
      // Clean up: stop video and audio streams when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();

        tracks.forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  return (
    <div>
      {hasCamera ? (
        <video ref={videoRef} autoPlay playsInline muted={false} />
      ) : (
        <div
          style={{ width: "100px", height: "100px", backgroundColor: "black" }}
        />
      )}
    </div>
  );
};
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
      <CameraComponent />
      <NotificationComponent />
    </>
  );
};

export default Home;

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { FaVideo } from "react-icons/fa6";
import { MdOutlineAddAPhoto } from "react-icons/md";
import { BsFillFileEarmarkArrowUpFill } from "react-icons/bs";
import { FaLocationDot } from "react-icons/fa6";
import toast from "react-hot-toast";
import MapPreview from "./MapPreview";
import { addUserMessage } from "../../../store/Message/authApi";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 340,
  border: "2px solid #000",
  boxShadow: 24,
  p: 2,
};
const ButtonModel = ({
  openButtonModel,
  handleCloseButtonModel,
  handleVideoChange,
  handleFileChange,
  emailLocal,
  dispatch,
  reciverEmailAddress,
  socket,
  activeUser,
  modeTheme,
  generateUniqueId,
  userConversationData,
}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [permissionBlocked, setPermissionBlocked] = useState(false);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          const uniqueId = generateUniqueId();

          socket?.emit("addMessage", {
            senderId: emailLocal?.userId,
            reciverId: reciverEmailAddress?.reciverId,
            latitude: latitude,
            longitude: longitude,
            userDelete: false,
            reciverDelete: false,
            uniqueId: uniqueId,
            userName: emailLocal?.email,
            seen: false,
            seenAt: "",
          });
          const receiverId = reciverEmailAddress?.reciverId;

          const CheckUserCon = userConversationData?.find(
            (dr) => dr?._id === receiverId
          );
          if (!CheckUserCon) {
            const newUser = {
              _id: receiverId,
              email: reciverEmailAddress?.email,
              avatar: reciverEmailAddress?.avatar,
              userName: reciverEmailAddress?.userName,
              senderId: emailLocal?.userId,
              reciverId: receiverId,
            };

            socket?.emit("addUserNew", newUser);
          }
          const data = {
            senderId: emailLocal?.userId,
            conversationId: "",
            reciverId: reciverEmailAddress?.reciverId,
            uniqueId: uniqueId,
            latitude: latitude,
            longitude: longitude,
          };

          dispatch(addUserMessage(data));
          handleCloseButtonModel(false);
          setError(null);
          setPermissionBlocked(false);
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            toast.error(
              `Geolocation permission has been blocked. Please reset the permission in your browser settings:`,
              {
                duration: 3000,
                position: "top-center",
              }
            );
            setPermissionBlocked(true);
          } else {
            toast.error(`${error.message}:`, {
              duration: 3000,
              position: "top-center",
            });
            setError(error.message);
          }
          setLocation(null);
        },
        {
          enableHighAccuracy: true, // Request high accuracy
          timeout: 5000, // Timeout after 5 seconds
          maximumAge: 0, // Don't use a cached position
        }
      );
    } else {
      toast.error(`Geolocation is not supported by this browser.:`, {
        duration: 3000,
        position: "top-center",
      });
      setError("Geolocation is not supported by this browser.");
      setPermissionBlocked(false);
    }
  };
  return (
    <>
      <Modal
        open={openButtonModel}
        onClose={handleCloseButtonModel}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className={`bg-[#FFFFF0]`} sx={style}>
          <div className=" flex  items-start flex-wrap gap-x-10 ">
            <div>
              <div className="fileUpload">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  // className="hidden"
                  className="upload"
                />
                <FaVideo className="p-[6px]" />
              </div>
              <p className="text-center font-mono mt-1 ml-1">Video</p>
            </div>
            <div>
              <div className="fileUpload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  // className="hidden"
                  className="upload"
                />
                <MdOutlineAddAPhoto className="p-[6px]" />
              </div>
              <p className="text-center font-mono mt-1 ml-1">Image</p>
            </div>
            <div>
              <div className="fileUpload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  // className="hidden"
                  className="upload"
                />
                <BsFillFileEarmarkArrowUpFill className="p-[6px]" />
              </div>
              <p className="text-center font-mono mt-1 ml-1">File</p>
            </div>
            <div>
              <div className="fileUpload" onClick={handleGetLocation}>
                <FaLocationDot className="p-[6px]" />
              </div>
              <p className="text-center font-mono mt-1 ml-1">Location</p>
            </div>
          </div>
          {/* {location && (
            <MapPreview
              latitude={location?.latitude}
              longitude={location?.longitude}
            />
          )} */}
        </Box>
      </Modal>
    </>
  );
};

export default ButtonModel;

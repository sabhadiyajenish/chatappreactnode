import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
// import { addTag, getAllTag } from "../../../store/tag/tagAction";
import "./chatbox.css";
import Glrs from "../../assets/image/grls.jpg";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import CircularProgress from "@mui/material/CircularProgress";
import imageCompression from "browser-image-compression";
// import SendIcon from "@mui/icons-material/Send";
import { FaVideo } from "react-icons/fa6";
import { v4 as uuidv4 } from "uuid";
// import { apiClient } from "../../../api/general";
import {
  addUserMessage,
  clearChatMessageData,
  deleteMessageData,
  getAllUser,
  getConversation,
  getUserMessage,
  updateSeenChatMessageData,
} from "../../store/Message/authApi";
import { getOneUser } from "../../store/Users/userApi";
import { SOCKET_URL } from "../../utils/constant";
import InfiniteScroll from "react-infinite-scroll-component";
import EmojiPicker from "emoji-picker-react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";
import { MdEmojiEmotions, MdOutlineAddAPhoto } from "react-icons/md";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import EmojiModel from "./emoji/emojiModel";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { TiDeleteOutline } from "react-icons/ti";
import axios from "../../utils/commonAxios.jsx";
import ChatMessage from "./chatMessage/chatMessage.jsx";
import moment from "moment";
import {
  addUserNotification,
  deleteNotificationData,
  getUserNotification,
} from "../../store/Notification/notificationApi.js";
import ChatHeader from "./ChatComponents/ChatHeader.jsx";
import ChatList from "./ChatComponents/ChatList.jsx";
import { IoSend } from "react-icons/io5";
import { MdAddAPhoto } from "react-icons/md";
import { LuSend } from "react-icons/lu";
import toast from "react-hot-toast";
import ConversationLoadingPage from "./loadingPages/conversationLoadingPage.jsx";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 330,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const Chatbox = () => {
  const { userOneData } = useSelector((state) => state.userAuthData);
  const { notificationDatas } = useSelector((state) => state.notificationData);
  const {
    tag,
    oneUserMessage,
    loading,
    loadingUsers,
    loadingConversation,
    conversationData,
    userLists,
  } = useSelector((state) => state.messageData);
  const [open, setOpen] = React.useState(false);
  const [socket, setSocket] = useState(null);
  const [userData, setUserDatas] = useState([]);
  const [deleteMessageForUpdated, setDeleteMessageForUpdated] = useState(false);

  const [allUserListData, setAllUserListData] = useState();

  const [userConversationData, setUserConversationDatas] = useState([]);
  const [activeUser, setActiveUser] = useState([]);
  const [LastSeenUser, setLastSeenUser] = useState({});

  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [loadingForUploadImage, setLoadingForUploadImage] = useState(false);
  const [searchUserByName, setSearchUserByName] = useState("");
  const [message, setMessage] = useState("");
  const [emailLocal, setEmailLocal] = useState("");
  const [reciverEmailAddress, setReciverEmailaddress] = useState({
    email: "",
    reciverId: "",
    avatar: "",
    userName: "",
  });
  const [countMessage, setCountMessage] = useState([
    {
      reciverId: "jenish",
      senderId: "jjs",
      firstMessage: "",
      uniqueId: "",
      date: "",
      count: 0,
    },
  ]);
  const [reciverChatData, setReciverChatData] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [getMessage, setGetMessage] = useState({});
  const [datafunction, SetDataFunction] = useState("");
  const [handleOpenEmoji, setHandleOpenEmoji] = useState(false);
  const [reloadUserConversation, setReloadUserCon] = useState(false);
  const [reloadUserNotification, setreloadUserNotification] = useState(false);
  const [modeTheme, setModeTheme] = useState("light");
  const [seeLoginActiveInfo, setLoginActiveInfo] = useState({
    online: false,
  });
  const [page, setPage] = useState(1);
  const [uploadingImageProgress, setUploadingImageProgress] = useState(0);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoAvatar, setVideoAvatar] = useState(null);

  const messageDom = useRef(null);
  const modalRef = useRef(null);
  const messageRef = useRef(null);

  const todayDate = new Date();
  const TodayDateOnly = todayDate.toISOString().split("T")[0];
  const yesterday = new Date(todayDate);
  yesterday.setDate(todayDate.getDate() - 1);
  const yesterdayDate = yesterday.toISOString().split("T")[0];

  const dispatch = useDispatch();

  useEffect(() => {
    setGetMessage(oneUserMessage);
  }, [oneUserMessage]);
  useEffect(() => {
    if (userData?.length === 0) {
      setUserDatas(tag?.data);
    }
  }, [tag]);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    const getCurrentActiveUser = activeUser?.map(
      (item, key) => item.userId === user?.userId
    );
    if (getCurrentActiveUser) {
      setLoginActiveInfo({
        online: true,
      });
    }
  }, [activeUser]);

  useEffect(() => {
    if (modeTheme !== "") {
      const themeName = localStorage.getItem("Theme");
      setModeTheme(themeName);
    }
  }, []);

  useEffect(() => {
    dispatch(getOneUser());
    dispatch(getAllUser());
  }, []);
  useEffect(() => {
    const socket = io(SOCKET_URL); // Initialize socket connection
    setSocket(socket); // Set the socket state

    // Clean up function to disconnect the socket when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);
  useEffect(() => {
    if (Array.isArray(notificationDatas) && notificationDatas?.length !== 0) {
      setCountMessage(notificationDatas);
    }
  }, [notificationDatas]);
  useEffect(() => {
    setUserConversationDatas(conversationData);
  }, [conversationData]);

  useEffect(() => {
    if (searchUserByName) {
      const lowerCaseQuery = searchUserByName.toLowerCase();
      const filtered = userLists?.filter(
        (user) =>
          user.email.toLowerCase().includes(lowerCaseQuery) ||
          user.userName.toLowerCase().includes(lowerCaseQuery) ||
          user.fullName.toLowerCase().includes(lowerCaseQuery)
      );
      setAllUserListData(filtered);
    } else {
      setAllUserListData(userLists);
    }
  }, [userLists, searchUserByName]);

  useEffect(() => {
    messageDom?.current?.scrollIntoView({ behavior: "smooth" });
  }, [getMessage]);
  useEffect(() => {
    const user = localStorage.getItem("userInfo");
    if (user !== undefined) {
      setEmailLocal(JSON.parse(localStorage.getItem("userInfo")));
      dispatch(getConversation(JSON.parse(user)?.userId || ""));
      dispatch(
        getUserNotification({ senderId: JSON.parse(user)?.userId || "" })
      );
    }
  }, [reloadUserConversation]);
  function generateUniqueId(length = 30) {
    return uuidv4().replace(/-/g, "").slice(0, length);
  }

  useEffect(() => {
    if (reciverEmailAddress?.reciverId !== datafunction[0]?.senderId) {
      // setCountMessage((prevMessages) => {
      //   // Initialize prevMessages as an empty array if it's null or undefined
      //   prevMessages = prevMessages || [];
      //   // Find if the reciverId already exists in the state
      //   const index = prevMessages.findIndex(
      //     (msg) => msg.senderId === datafunction[0]?.senderId
      //   );
      //   // If it exists, update the count
      //   if (index !== -1) {
      //     const updatedMessages = [...prevMessages];
      //     updatedMessages[index] = {
      //       ...updatedMessages[index],
      //       count: updatedMessages[index].count + 1,
      //       date: (updatedMessages[index].date = datafunction[0]?.createdAt),
      //       uniqueId: (updatedMessages[index].uniqueId =
      //         datafunction[0]?.uniqueId),
      //     };
      //     if (Array.isArray(updatedMessages) && updatedMessages?.length !== 0) {
      //       localStorage.setItem(
      //         "userCountInfo",
      //         JSON.stringify(updatedMessages)
      //       );
      //     }
      //     return updatedMessages;
      //   } else {
      //     // If it doesn't exist, add a new entry
      //     localStorage.setItem(
      //       "userCountInfo",
      //       JSON.stringify([
      //         ...prevMessages,
      //         {
      //           reciverId: datafunction[0]?.reciverId,
      //           senderId: datafunction[0]?.senderId,
      //           firstMessage: datafunction[0]?.message,
      //           uniqueId: datafunction[0]?.uniqueId,
      //           date: datafunction[0]?.createdAt,
      //           count: 1,
      //         },
      //       ])
      //     );
      //     return [
      //       ...prevMessages,
      //       {
      //         reciverId: datafunction[0]?.reciverId,
      //         senderId: datafunction[0]?.senderId,
      //         firstMessage: datafunction[0]?.message,
      //         uniqueId: datafunction[0]?.uniqueId,
      //         date: datafunction[0]?.createdAt,
      //         count: 1,
      //       },
      //     ];
      //   }
      // });
    } else {
      socket?.emit("SetMessageSeenConfirm", {
        messageId: datafunction[0]?.uniqueId,
        reciverId: datafunction[0]?.senderId,
        date: datafunction[0]?.createdAt,
      });
      const dataForSeen = {
        messageId: datafunction[0]?.uniqueId,
      };
      setTimeout(() => {
        dispatch(updateSeenChatMessageData(dataForSeen));
      }, 1500);
    }
  }, [datafunction]);
  // const playNotificationSound = () => {
  //   const audio = new Audio("../../../public/iphone_sound.mp3");
  //   audio.play();
  // };
  useEffect(() => {
    if (!reciverEmailAddress || !reloadUserNotification) return;
    if (reciverEmailAddress?.reciverId !== reloadUserNotification?.senderId) {
      dispatch(
        addUserNotification({
          senderId: reloadUserNotification?.senderId,
          reciverId: reloadUserNotification?.reciverId,
          firstMessage: reloadUserNotification?.message
            ? reloadUserNotification?.message
            : "Image",
          date: reloadUserNotification?.createdAt,
          uniqueId: reloadUserNotification?.uniqueId,
        })
      );
      setTimeout(() => {
        dispatch(getUserNotification({ senderId: emailLocal?.userId }));
      }, 1000);

      const displayNoti = `${reloadUserNotification?.userName}:- \n ${
        reloadUserNotification?.message
          ? reloadUserNotification?.message
          : reloadUserNotification?.avatarVideo
          ? "Video"
          : "Image"
      }`;
      if ("Notification" in window) {
        // Check if permission is already granted
        if (Notification.permission === "granted") {
          // If granted, show the notification
          // playNotificationSound();
          new Notification(displayNoti);
        } else if (Notification.permission !== "denied") {
          // Otherwise, request permission from the user
          Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
              // playNotificationSound();

              new Notification(displayNoti);
            }
          });
        }
      }
      setreloadUserNotification(false);
    }
  }, [reloadUserNotification]);

  useEffect(() => {
    if (deleteMessageForUpdated !== null && deleteMessageForUpdated) {
      if (
        getMessage[deleteMessageForUpdated?.date] &&
        Array.isArray(getMessage[deleteMessageForUpdated?.date])
      ) {
        const uniqueData = getMessage[deleteMessageForUpdated?.date].filter(
          (item) => item?.uniqueId !== deleteMessageForUpdated?.uniqueId
        );

        // Update state immutably
        setGetMessage((prevState) => ({
          ...prevState,
          [deleteMessageForUpdated.date || ""]: uniqueData,
        }));
        const data = {
          messageId: deleteMessageForUpdated?.uniqueId,
          title: "All",
          senderId: deleteMessageForUpdated?.senderId,
        };
        dispatch(deleteMessageData(data));
        setDeleteMessageForUpdated(false);
      } else {
        console.log(`getMessage[${date}] is not an array or does not exist.`);
        setDeleteMessageForUpdated(false);
      }
    }
  }, [deleteMessageForUpdated]);

  useEffect(() => {
    socket?.emit("addUser", emailLocal?.userId);
    socket?.on("getUser", (user, lastSeenData) => {
      setActiveUser(user);
      if (lastSeenData) {
        setLastSeenUser(lastSeenData);
      }
    });
    socket?.on("getMessage", (user1) => {
      // setActiveUser(user);
      const date = user1[0].createdAt.split("T")[0]; // Extract date from createdAt
      const currentDate = date; // You need to define a function to get the current date
      setGetMessage((prevState) => {
        return {
          ...prevState,
          [currentDate]: [...(prevState[currentDate] || []), user1[0]],
        };
      });
      SetDataFunction(user1);
    });

    socket?.on("GetdeleteMessageFromBoth", (userDatas) => {
      setDeleteMessageForUpdated(userDatas);
    });

    socket?.on("getMessageNotificationInMongoDb", (userDatas) => {
      dispatch(
        addUserNotification({
          senderId: userDatas[0]?.senderId,
          reciverId: userDatas[0]?.reciverId,
          firstMessage: userDatas[0]?.message
            ? userDatas[0]?.message
            : userDatas[0]?.avatarVideo
            ? "Video"
            : "Image",
          date: userDatas[0]?.createdAt,
          uniqueId: userDatas[0]?.uniqueId,
        })
      );
    });
    socket?.on("getMessageNotification", (userDatas) => {
      setreloadUserNotification(userDatas[0]);
    });
    socket?.on("messageSeenConfirmation", ({ date, messageId, receiver }) => {
      const currentDate = date.split("T")[0]; // Extract date from createdAt
      setGetMessage((prevData) => {
        const newData = { ...prevData };
        if (newData[currentDate]) {
          newData[currentDate] = newData[currentDate].map((msg) =>
            msg.uniqueId === messageId && msg.seen !== true
              ? { ...msg, seen: true, seenAt: new Date().toISOString() }
              : msg
          );
        }
        return newData;
      });
    });
    socket?.on("getNewUserData", (userStatus) => {
      const CheckUserCon = userConversationData?.find(
        (dr) => dr?._id === reciverEmailAddress?.reciverId
      );

      if (CheckUserCon === undefined) {
        setTimeout(() => {
          console.log(
            "get new user is come here<<<<<<<<<<<<<<<<<<<<<<<",
            emailLocal?.userId
          );
          dispatch(getConversation(emailLocal?.userId || ""));
        }, 1000);
      }
    });
    socket?.on("getUserTypingStatus", (userStatus) => {
      setIsTyping(userStatus[0]);
    });
    socket?.on("getUserData", (cate) => {
      setUserDatas((mess) => mess.concat(cate));
    });
    setEmailLocal(JSON.parse(localStorage.getItem("userInfo")));
  }, [socket]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setHandleOpenEmoji(false);
      }
    };

    if (handleOpenEmoji) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleOpenEmoji]);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (!file.type.startsWith("video/")) {
        toast.error("Please select a video file.", {
          duration: 3000,
          position: "top-center",
        });
        return; // Stop further processing
      }
      // Check the size of the file
      const fileSizeInMB = file.size / (1024 * 1024); // Calculate file size in MB
      if (fileSizeInMB > 50) {
        toast.error(
          "Selected video exceeds the maximum allowed size of 50 MB.",
          {
            duration: 3000,
            position: "top-center",
          }
        );
        return; // Stop further processing
      }

      setVideoAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      handleOpen();
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (message !== "") {
      const uniqueId = generateUniqueId();

      socket?.emit("addMessage", {
        message: message,
        senderId: emailLocal?.userId,
        reciverId: reciverEmailAddress?.reciverId,
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
          reciverId: reciverEmailAddress?.reciverId,
        };

        socket?.emit("addUserNew", newUser);
      }
      const data = {
        senderId: emailLocal?.userId,
        conversationId: "",
        reciverId: reciverEmailAddress?.reciverId,
        uniqueId: uniqueId,
        message: message,
      };
      dispatch(addUserMessage(data));
      setMessage("");
    }
  };
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSend(event);
    }
  };

  const formatLastSeen = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    const timeDifference = now - date;

    // Calculate the difference in days
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    if (daysDifference === 0) {
      return `Last seen today at ${moment(date).format("LT")}`;
    } else if (daysDifference === 1) {
      return `Last seen yesterday at ${moment(date).format("LT")}`;
    } else {
      return `Last seen on ${moment(date).format("MMMM D")} at ${moment(
        date
      ).format("LT")}`;
    }
  };
  const getLastMessageIndex = () => {
    let lastMessageIndex = -1;
    let latestDate = null;

    // Find the latest date
    Object.keys(getMessage).forEach((date) => {
      if (!latestDate || new Date(date) > new Date(latestDate)) {
        latestDate = date;
      }
    });

    // If there's a latest date, find the last message index for that date
    if (latestDate) {
      const messages = getMessage[latestDate];
      if (messages && messages.length > 0) {
        lastMessageIndex = messages.length - 1;
      }
    }

    return { lastMessageIndex, latestDate };
  };

  const { lastMessageIndex, latestDate } = getLastMessageIndex();

  const downloadTxtFile = () => {
    // Create an array to hold formatted messages
    const formattedMessages = [];

    // Iterate over each date in the data object
    Object.keys(getMessage)?.forEach((date) => {
      // Iterate over each message on this date
      let j = 0;
      getMessage[date]?.forEach((item) => {
        // Format each message
        if (
          item?.senderId === emailLocal?.userId &&
          item?.userDelete === false
        ) {
          formattedMessages.push(`<div class="custom-message-container">`);
          formattedMessages.push(
            `<p class="main_text">You (${emailLocal?.email})</p> <hr/>`
          );
          {
            if (item?.message) {
              const datap = `<p>${item?.message}</p>`;
              formattedMessages.push(datap);
            } else if (item?.avatar) {
              const datap = `<img src=${item?.avatar} alt="image" width="200" height="200">`;
              formattedMessages.push(datap);
            } else {
              const datap = `<p>Image</p>`;
              formattedMessages.push(datap);
            }
          }

          const formattedMessage = `<p> ${new Date(date).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          )}, ${new Date(item?.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}</p></div>`;
          formattedMessages.push(formattedMessage);
        } else if (
          reciverChatData === item?.senderId &&
          item?.reciverDelete === false
        ) {
          formattedMessages.push(`<div class="custom-message-container">`);
          formattedMessages.push(
            `<p class="main_text">${reciverEmailAddress?.userName}</p> <hr/>`
          );
          {
            if (item?.message) {
              const datap = `<p>${item?.message}</p>`;
              formattedMessages.push(datap);
            } else if (item?.avatar) {
              const datap = `<img src=${item?.avatar} alt="image jacket" width="200" height="200">`;

              formattedMessages.push(datap);
            } else {
              const datap = `<p>Image</p>`;
              formattedMessages.push(datap);
            }
          }

          const formattedMessage = `<p> ${new Date(date).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          )}, ${new Date(item?.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}</p></div>`;
          formattedMessages.push(formattedMessage);
        }
      });
    });

    // Join all formatted messages
    if (Array.isArray(formattedMessages) && formattedMessages?.length !== 0) {
      const fileContent = formattedMessages.join("\n");
      const htmlContent = `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Messages</title>
          <style>
            .custom-message-container {
              width: 600px;
              background-color: #f0f0f0; /* Light grey background */
              padding: 10px;
              margin:10px auto;
              border-radius: 8px;
              box-sizing: border-box;

            }
            .custom-message-container p {
              margin-top: 5px;
            }
              .main_text{
                font-size: 16px;
                font-weight: bold;
              }
                .jenish{
                display: flex;
  justify-content: center;
                }
          </style>
        </head>
        <body><div class="jenish"><div>${fileContent}</div></div></body>
      </html>`;
      const element = document.createElement("a");
      const file = new Blob([htmlContent], { type: "text/html" });
      element.href = URL.createObjectURL(file);
      element.download = "messages.html";
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
    }
  };
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        toast.error("Please select an image file.", {
          duration: 3000,
          position: "top-center",
        });
        return; // Stop further processing
      }

      const fileSizeInMB = selectedFile.size / (1024 * 1024); // Calculate file size in MB
      if (fileSizeInMB > 10) {
        toast.error(
          "Selected Image exceeds the maximum allowed size of 10 MB.",
          {
            duration: 3000,
            position: "top-center",
          }
        );
        return; // Stop further processing
      }

      const compressedFile = await imageCompression(selectedFile, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });
      setFile(compressedFile);

      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewURL(reader.result);
      };
      reader.readAsDataURL(compressedFile); // Read file as data URL
      handleOpen();
    } else {
      // Clear file and preview if no file selected
      setFile(null);
      setPreviewURL(null);
    }
  };

  let formData = new FormData();
  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      const progress = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      console.log(`Upload Progress: ${progress}%,${progressEvent}`);
      // Update your progress state here (e.g., using setState in React)
      setUploadingImageProgress(progress);
    },
  };
  const UploadVideoFileOnCloud = async () => {
    setLoadingForUploadImage(true);
    setUploadingImageProgress(20);

    formData.append("avatarVideo", videoAvatar);
    const getVideoUrl = await axios.post(
      "/messages/uploadVideoInCloud",
      formData,
      config
    );
    // setUploadingImageProgress(20);
    if (getVideoUrl?.data?.data?.url) {
      const uniqueId = generateUniqueId();

      socket?.emit("addMessage", {
        avatarVideo: getVideoUrl?.data?.data?.url,
        avatarVideoThumb: getVideoUrl?.data?.data?.thumb,
        senderId: emailLocal?.userId,
        reciverId: reciverEmailAddress?.reciverId,
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
        avatarVideo: getVideoUrl?.data?.data?.url,
        avatarVideoThumb: getVideoUrl?.data?.data?.thumb,
      };
      setLoadingForUploadImage(false);
      setUploadingImageProgress(0);
      handleClose();

      dispatch(addUserMessage(data));
    } else {
      setUploadingImageProgress(0);
      setLoadingForUploadImage(false);
    }
  };

  const UploadFileOnCloud = async () => {
    setLoadingForUploadImage(true);
    setUploadingImageProgress(20);
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    });
    setUploadingImageProgress(50);

    formData.append("avatar", compressedFile);
    const getImageUrl = await axios.post(
      "/messages/uploadImageInCloud",
      formData,
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );

          setUploadingImageProgress(progress);
        },
      }
    );
    if (getImageUrl?.data?.data?.url) {
      const uniqueId = generateUniqueId();

      socket?.emit("addMessage", {
        avatar: getImageUrl?.data?.data?.url,
        senderId: emailLocal?.userId,
        reciverId: reciverEmailAddress?.reciverId,
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
        avatar: getImageUrl?.data?.data?.url,
      };
      setLoadingForUploadImage(false);
      setUploadingImageProgress(0);
      handleClose();

      dispatch(addUserMessage(data));
    } else {
      setLoadingForUploadImage(false);
    }
  };

  let typingTimeout;

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket?.emit("addUserTypingStatus", {
      status: true,
      senderId: emailLocal?.userId,
      reciverId: reciverEmailAddress?.reciverId,
    });
    typingTimeout = setTimeout(() => {
      socket?.emit("addUserTypingStatus", {
        status: false,
        senderId: emailLocal?.userId,
        reciverId: reciverEmailAddress?.reciverId,
      });
    }, 2000); // Reset typing status after 1 second of inactivity
    return () => clearTimeout(typingTimeout); // Clear previous timeout if any
  };

  const isUserOnline = activeUser?.some(
    (dr) => dr.userId === reciverEmailAddress?.reciverId
  );
  let checkLastSeenParticularUser;
  let lastSeenTextParticularUser;
  if (LastSeenUser && typeof LastSeenUser === "object") {
    checkLastSeenParticularUser = LastSeenUser.hasOwnProperty(
      reciverEmailAddress?.reciverId
    )
      ? LastSeenUser[reciverEmailAddress?.reciverId]
      : null;
    lastSeenTextParticularUser = checkLastSeenParticularUser
      ? formatLastSeen(checkLastSeenParticularUser)
      : "Last seen not available";
  }
  const isUserTyping =
    reciverEmailAddress?.reciverId === isTyping?.senderId && isTyping?.status;

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setPreviewURL(null);
    setVideoPreview(null);
    setVideoAvatar(null);
  };

  return (
    <>
      <div className="main_chat_div">
        <div className="child1_chat_div">
          <div
            className={`w-full h-[96vh]  border border-dark   ${
              modeTheme === "dark" ? "bg-dark" : null
            }`}
          >
            <ChatHeader
              userOneData={userOneData}
              emailLocal={emailLocal}
              seeLoginActiveInfo={seeLoginActiveInfo}
              setModeTheme={setModeTheme}
              modeTheme={modeTheme}
            />
            {loadingConversation ? (
              [1, 2, 3, 4, 5, 6]?.map((dt, key) => (
                <ConversationLoadingPage index={key} modeTheme={modeTheme} />
              ))
            ) : (
              <ChatList
                userConversationData={userConversationData}
                reciverEmailAddress={reciverEmailAddress}
                setReciverEmailaddress={setReciverEmailaddress}
                setReciverChatData={setReciverChatData}
                emailLocal={emailLocal}
                dispatch={dispatch}
                getUserMessage={getUserMessage}
                countMessage={countMessage}
                socket={socket}
                updateSeenChatMessageData={updateSeenChatMessageData}
                deleteNotificationData={deleteNotificationData}
                setCountMessage={setCountMessage}
                activeUser={activeUser}
                LastSeenUser={LastSeenUser}
                formatLastSeen={formatLastSeen}
                modeTheme={modeTheme}
              />
            )}
          </div>
          {reciverEmailAddress?.email === "" ? (
            <>
              <div
                className={`h-[96vh] flex justify-center items-center ${
                  modeTheme === "dark" ? "bg-dark" : null
                } `}
              >
                <h2
                  className={` text-4xl font-thin ${
                    modeTheme === "dark" ? "text-white" : null
                  } `}
                >
                  Chatting with people...
                </h2>
              </div>
            </>
          ) : (
            <div
              className={`all_chat_div  ${
                modeTheme === "dark" ? "bg-dark" : null
              }`}
            >
              <div
                className={`center_icon_div  ${
                  modeTheme === "dark" ? "bg-[#526D82]" : "bg-[#bce2d4]"
                }`}
              >
                <img
                  alt="gdg"
                  src={reciverEmailAddress?.avatar}
                  className="img_girls_icon mt-[6px]"
                />
                <div className="md:ml-5">
                  <p
                    className={`icon_text ${
                      modeTheme === "dark" ? "text-white" : null
                    }`}
                  >
                    {reciverEmailAddress?.email}
                  </p>
                  {isUserOnline && !isUserTyping && (
                    <p
                      className={`text-[15px]  text-start ml-4 ${
                        modeTheme === "dark"
                          ? "text-[#DDE6ED]"
                          : "text-green-500"
                      }`}
                    >
                      online
                    </p>
                  )}
                  {!isUserOnline &&
                    !isUserTyping &&
                    checkLastSeenParticularUser && (
                      <div className="marquee-container">
                        <p
                          className={` text-[15px] text-center marquee-text  ${
                            modeTheme === "dark"
                              ? "text-[#DDE6ED]"
                              : "text-[#7436c5]"
                          } `}
                        >
                          {lastSeenTextParticularUser}
                        </p>
                      </div>
                    )}
                  {isUserOnline && isUserTyping && (
                    <p
                      className={`text-[15px]  ${
                        modeTheme === "dark"
                          ? "text-[#DDE6ED]"
                          : "text-blue-500"
                      } text-start ml-4`}
                    >
                      Typing...
                    </p>
                  )}
                </div>
                <div>
                  <Menu as="div" className="relative">
                    <Menu.Button>
                      <HiOutlineDotsVertical
                        className={`mt-[10px] ml-8 cursor-pointer ${
                          modeTheme === "dark" ? "text-white" : null
                        } `}
                      />
                    </Menu.Button>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute  top-7 right-1 z-50 mt-2 w-32 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              className={classNames(
                                active ? "w-full bg-gray-100" : "",
                                "w-full block px-2 py-2 text-sm text-gray-700"
                              )}
                              onClick={() => {
                                const uniqueIds = [];

                                for (const date in getMessage) {
                                  if (getMessage.hasOwnProperty(date)) {
                                    getMessage[date].forEach((item) => {
                                      uniqueIds.push(item.uniqueId);
                                    });
                                  }
                                }
                                const data = {
                                  senderId: emailLocal?.userId,
                                  uniqueIds,
                                };
                                dispatch(clearChatMessageData(data));
                                setGetMessage({});
                              }}
                            >
                              Clear Chat
                            </button>
                          )}
                        </Menu.Item>
                        <hr />

                        <Menu.Item>
                          {({ active }) => (
                            <button
                              className={classNames(
                                active ? "w-full bg-gray-100" : "",
                                "w-full block px-4 py-2 text-sm text-gray-700"
                              )}
                              onClick={downloadTxtFile}
                            >
                              Export Chat
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
              <div
                className={`center_chat_div relative ${
                  modeTheme === "dark" ? "bg-dark" : null
                }`}
              >
                {loading ? (
                  <div className="h-[80vh] flex justify-center items-center">
                    <h2
                      className={` text-4xl font-thin ${
                        modeTheme === "dark" ? "text-white" : null
                      }`}
                    >
                      Loading chat...
                    </h2>
                  </div>
                ) : Object.keys(getMessage)?.length === 0 ? (
                  <div className="h-[80vh] flex justify-center items-center">
                    <h2
                      className={` text-4xl font-thin  ${
                        modeTheme === "dark" ? "text-white" : null
                      }`}
                    >
                      No Chat found
                    </h2>
                  </div>
                ) : (
                  <>
                    {Object.keys(getMessage).map((date) => {
                      const CheckFilterDate = getMessage[date].some((obj) =>
                        obj.senderId === emailLocal?.userId
                          ? !obj.userDelete === true
                          : !obj.reciverDelete === true
                      );

                      return (
                        <div key={date}>
                          {CheckFilterDate && (
                            <div className="text-center flex justify-center my-4">
                              <h2
                                className={`text-center text-[#f7ebeb] w-fit rounded-lg font-medium py-2 px-6 ${
                                  modeTheme === "dark"
                                    ? "bg-[#7190a8]"
                                    : "bg-[#4682B4]"
                                }  " `}
                              >
                                {TodayDateOnly === date
                                  ? "Today"
                                  : yesterdayDate === date
                                  ? "Yesterday"
                                  : date}
                              </h2>
                            </div>
                          )}
                          {getMessage[date]?.map((dt, index) => {
                            return (
                              <ChatMessage
                                dt={dt}
                                indexKey={index}
                                emailLocal={emailLocal}
                                reciverEmailAddress={reciverEmailAddress}
                                reciverChatData={reciverChatData}
                                socket={socket}
                                date={date}
                                messageDom={messageDom}
                                getMessage={getMessage}
                                setGetMessage={setGetMessage}
                                lastMessageIndex={lastMessageIndex}
                                latestDate={latestDate}
                                activeUser={activeUser}
                                modeTheme={modeTheme}
                              />
                            );
                          })}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              <div
                className={`center_input_div flex justify-center cursor-pointer items-center  ${
                  modeTheme === "dark" ? "bg-dark" : null
                }`}
              >
                {/* <HiOutlineDotsVertical
                  className="mt-[15px] ml-2  cursor-pointer "
                  onClick={handleOpen}
                /> */}
                <div className="fileUpload">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    // className="hidden"
                    className="upload"
                  />
                  <FaVideo className="" />
                </div>
                <div className="fileUpload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    // className="hidden"
                    className="upload"
                  />
                  <MdOutlineAddAPhoto className="-ml-[2px]" />
                </div>
                <MdEmojiEmotions
                  className={`w-8 h-8 md:ml-1 ml-3 mr-3 mt-3  ${
                    modeTheme === "dark" ? "text-white" : null
                  }`}
                  onClick={() => setHandleOpenEmoji((prev) => !prev)}
                />
                <input
                  ref={messageRef} // Attach the ref here
                  onKeyDown={handleKeyDown}
                  value={message}
                  onChange={handleTyping}
                  className={`input_message ${
                    modeTheme === "dark"
                      ? "text-[#fff] bg-dark border border-sky-100"
                      : null
                  } `}
                  placeholder="Enter Message here..."
                />
                <div
                  onClick={handleSend}
                  className="w-9 h-9  rounded-full bg-[#b6f76c] mt-[10px] mr-3 ml-3"
                >
                  <IoSend className="w-auto text-black p-[6px] ml-[3px] my-auto h-full" />
                </div>
                {handleOpenEmoji && (
                  <EmojiModel
                    emojiRef={modalRef}
                    addHandleEmoji={setHandleOpenEmoji}
                    open={handleOpenEmoji}
                    emojiAddInMessage={setMessage}
                  />
                )}
              </div>
            </div>
          )}
          <div
            className={`all_chat_div overflow-y-scroll  pb-3 ${
              modeTheme === "dark" ? "bg-dark" : "bg-slate-200"
            }`}
          >
            {/* <h4 className="mt-4 mb-4 font-bold">All User List</h4> */}
            <div className="max-w-md mx-3 mt-3">
              <div
                className={`relative flex items-center w-full h-12 rounded-full mb-3 focus-within:shadow-lg ${
                  modeTheme === "dark"
                    ? "border border-sky-100 bg-dark"
                    : "bg-white"
                }  overflow-hidden`}
              >
                <div className="grid place-items-center h-full w-12 text-gray-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <input
                  className={`peer h-full w-full outline-none text-sm ${
                    modeTheme === "dark"
                      ? "bg-dark text-white"
                      : "text-gray-700"
                  }    pr-2`}
                  type="text"
                  id="search"
                  placeholder="Search username.."
                  onChange={(e) => setSearchUserByName(e.target.value)}
                  value={searchUserByName}
                />
              </div>
            </div>
            {loadingUsers ? (
              [1, 2, 3, 4, 5, 6, 7]?.map((dt, key) => (
                <ConversationLoadingPage key={dt} modeTheme={modeTheme} />
              ))
            ) : allUserListData?.length === 0 ? (
              <h1
                className={` font-thin text-2xl ${
                  modeTheme === "dark" ? "text-white" : null
                }`}
              >
                No User found
              </h1>
            ) : (
              allUserListData?.map((dt, key) => {
                return (
                  <>
                    {dt.email === emailLocal?.email ? null : (
                      <div
                        className={`flex md:justify-start md:pl-5 pl-2 justify-center flex-wrap font-medium ${
                          reciverEmailAddress?.email === dt.email
                            ? modeTheme === "dark"
                              ? "bg-[#526D82]"
                              : "bg-[#bce2d4]"
                            : modeTheme === "dark"
                            ? "bg-[#27374D] hover:bg-[#4d6381] cursor-pointer "
                            : "bg-[#b7d7e8] hover:bg-[rgb(164,203,218)] cursor-pointer"
                        }   mx-3 mt-2 rounded-lg  items-center gap-x-2  py-2 `}
                        key={key}
                        onClick={async () => {
                          if (reciverEmailAddress?.email !== dt?.email) {
                            setReciverEmailaddress({
                              email: dt.email,
                              reciverId: dt?._id,
                              avatar: dt?.avatar,
                              userName: dt?.userName,
                              _id: dt?._id,
                            });
                            setReciverChatData(dt?._id);
                            const data1 = {
                              senderId: emailLocal?.userId,
                              reciverId: dt._id,
                            };

                            const setCurrentUniueId = countMessage?.filter(
                              (datas) => datas?.senderId === dt?._id
                            );
                            if (
                              setCurrentUniueId?.length !== 0 &&
                              Array.isArray(setCurrentUniueId)
                            ) {
                              socket?.emit("SetMessageSeenConfirm", {
                                messageId: setCurrentUniueId[0]?.uniqueId,
                                reciverId: dt?._id,
                                date: setCurrentUniueId[0]?.date,
                              });
                              const dataForSeen = {
                                messageId: setCurrentUniueId[0]?.uniqueId,
                              };

                              dispatch(updateSeenChatMessageData(dataForSeen));
                            }
                            dispatch(
                              deleteNotificationData({
                                reciverId: emailLocal?.userId,
                                senderId: dt?._id,
                              })
                            );
                            const setCount = countMessage?.filter(
                              (datas) => datas?.senderId !== dt?._id
                            );

                            setCountMessage(setCount);

                            if (
                              Array.isArray(setCount) &&
                              setCount?.length !== 0
                            ) {
                              localStorage.setItem(
                                "userCountInfo",
                                JSON.stringify(setCount)
                              );
                            } else {
                              localStorage.setItem(
                                "userCountInfo",
                                JSON.stringify([
                                  {
                                    reciverId: "jenish",
                                    senderId: "jjs",
                                    firstMessage: "",
                                    count: 0,
                                    date: "",
                                    uniqueId: "",
                                  },
                                ])
                              );
                            }
                            dispatch(getUserMessage(data1));
                          }
                        }}
                      >
                        <div style={{ position: "relative" }}>
                          <img
                            alt="gdg"
                            src={dt?.avatar ? dt?.avatar : Glrs}
                            className=" w-16 h-16 rounded-full "
                          />
                          {activeUser.map((dr, key1) => {
                            return dr.userId === dt._id ? (
                              <span
                                className=" absolute bottom-0 right-1 bg-[#4CBB17] w-4 h-4 rounded-full"
                                key={key1}
                              ></span>
                            ) : (
                              ""
                            );
                          })}
                        </div>
                        <div className=" lg:ml-4">
                          <p
                            className={`${
                              modeTheme === "dark" ? "text-white" : null
                            }`}
                          >
                            {dt?.email?.substring(0, 15)}
                            {dt?.email?.length <= 15 ? null : ".."}
                          </p>
                          <p
                            className={` text-start ${
                              modeTheme === "dark"
                                ? "text-[#b7d7e8]"
                                : "text-gray-600"
                            }  `}
                          >
                            {dt?.userName?.substring(0, 15)}
                            {dt?.userName?.length <= 15 ? null : ".."}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                );
              })
            )}
          </div>
        </div>
      </div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {previewURL && (
            <div className=" relative">
              <img
                src={previewURL}
                alt="Preview"
                style={{ height: "100%", width: "100%" }}
              />
              <TiDeleteOutline
                className=" absolute -top-3 -right-3 text-[#fff] w-8 h-8 bg-[#345445] p-1 cursor-pointer rounded-full"
                onClick={() => {
                  setFile(null);
                  setPreviewURL(null);
                  handleClose();
                }}
              />
            </div>
          )}

          {videoPreview && (
            <div className=" relative">
              <video controls width="270" className="text-black">
                <source src={videoPreview} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <TiDeleteOutline
                className=" absolute -top-3 -right-3 text-[#fff] w-8 h-8 bg-[#345445] p-1 cursor-pointer rounded-full"
                onClick={() => {
                  setVideoPreview(null);
                  handleClose();
                }}
              />
            </div>
          )}

          {uploadingImageProgress > 0 ? (
            <>
              <Box
                className="mx-auto w-full mt-3"
                sx={{ position: "relative", display: "inline-flex" }}
              >
                <CircularProgress
                  variant="determinate"
                  value={uploadingImageProgress}
                  className="mx-auto w-full text-black"
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    component="div"
                    color="text.secondary"
                  >
                    {`${Math.round(uploadingImageProgress)}%`}
                  </Typography>
                </Box>
              </Box>
              <p className="tw-full text-center mt-2">
                {uploadingImageProgress <= 20
                  ? "Startng..."
                  : uploadingImageProgress <= 50
                  ? "Compreesing..."
                  : "Sending..."}
              </p>
            </>
          ) : null}

          {previewURL && !loadingForUploadImage && (
            <div className=" w-full">
              <button
                type="button"
                onClick={UploadFileOnCloud}
                className="text-white mt-3 w-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              >
                {loadingForUploadImage ? "sending... " : "Send"}
              </button>
            </div>
          )}
          {videoPreview && !loadingForUploadImage && (
            <div className=" w-full">
              <button
                type="button"
                onClick={UploadVideoFileOnCloud}
                className="text-white mt-3 w-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              >
                {loadingForUploadImage ? "sending... " : "Send Video"}
              </button>
            </div>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default Chatbox;

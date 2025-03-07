import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
// import { addTag, getAllTag } from "../../../store/tag/tagAction";
import Glrs from "../../assets/image/grls.jpg";
import "./chatbox.css";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import imageCompression from "browser-image-compression";
// import SendIcon from "@mui/icons-material/Send";
import { FaArrowLeftLong, FaVideo } from "react-icons/fa6";
import { v4 as uuidv4 } from "uuid";
// import { apiClient } from "../../../api/general";
import { Menu, Transition } from "@headlessui/react";
import moment from "moment";
import { Fragment } from "react";
import toast from "react-hot-toast";
import { FcDocument } from "react-icons/fc";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { IoSend } from "react-icons/io5";
import { MdEmojiEmotions } from "react-icons/md";
import { TiDeleteOutline } from "react-icons/ti";
import InfiniteScroll from "react-infinite-scroll-component";
import TextareaAutosize from "react-textarea-autosize";
import SimplePeer from "simple-peer";
import {
  addUserMessage,
  clearChatMessageData,
  clearMessageseensent,
  deleteMessageData,
  getAllUser,
  getConversation,
  getUserMessage,
  updateSeenChatMessageData,
} from "../../store/Message/authApi";
import {
  addUserNotification,
  deleteNotificationData,
  getUserNotification,
} from "../../store/Notification/notificationApi.js";
import { getOneUser } from "../../store/Users/userApi";
import axios from "../../utils/commonAxios.jsx";
import { ENCRYPTION_KEY, SOCKET_URL } from "../../utils/constant";
import ButtonModel, {
  formatBytes,
  truncateFileName,
} from "./ChatComponents/ButtonModel.jsx";
import ChatHeader from "./ChatComponents/ChatHeader.jsx";
import ChatList from "./ChatComponents/ChatList.jsx";
import ChatMessage from "./chatMessage/chatMessage.jsx";
import EmojiModel from "./emoji/emojiModel";
import ConversationLoadingPage from "./loadingPages/conversationLoadingPage.jsx";
import VideoCallCutAfterModel from "./videoCall/videoCallCutAfterModel.jsx";
import VideoCallSentModel from "./videoCall/videoCallSentModel.jsx";
import { decryptData } from "../../utils/decrypt.jsx";
import cache from "../../utils/cache.js";
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
    messageLength,
    loading,
    loadingUsers,
    loadingConversation,
    conversationData,
    userLists,
  } = useSelector((state) => state.messageData);
  const [open, setOpen] = React.useState(false);
  const [openVideoSentCall, setOpenVideoSentCall] = useState(false);
  const [cutVideoCallAfterCut, setCutVideoCallAfterCut] = useState(false);

  const [reciveUserCallInvitationData, setReciveUserCallInvitationData] =
    useState("");
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
  const [pageLoadingonScroll, setPageLoadingonScroll] = useState(false);
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
  const [typingStatusChange, setTypingStatusChange] = useState(false);
  const [openButtonModel, setOpenButtonModel] = useState(false);
  const [selectedPdfDocsFile, setPdfDocsSelectedFile] = useState(null);
  const [productPageNumber, setProductPageNumber] = useState(1);

  const [showMainPart, setShowMainpart] = useState(false);
  const [ramdomMuted, setRandomMuted] = useState(false);
  const [uploadingImageProgress, setUploadingImageProgress] = useState(0);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoAvatar, setVideoAvatar] = useState(null);
  const [acceptCallStatus, setAcceptCallStatus] = useState(false);
  const [uniqueRoomId, setUniqueRoomId] = useState("");
  const [isCalling, setIsCalling] = useState(false); // Flag for initiating a call
  const [isCallAccepted, setIsCallAccepted] = useState(false); // Flag for call acceptance
  const [peer, setPeer] = useState(null); // SimplePeer instance for WebRTC connection
  const localVideoRef = useRef(null); // Ref for local video element
  const remoteVideoRef = useRef(null);
  const messageDom = useRef(null);
  const modalRef = useRef(null);
  const messageRef = useRef(null);

  const [me, setMe] = useState("");
  const [callAccepted, setCallAccepted] = useState(false);
  const [stream, setStream] = useState();
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [call, setCall] = useState();

  const myAudio = useRef();
  const userAudio = useRef();
  const connectionRef = useRef();

  const todayDate = new Date();
  const TodayDateOnly = todayDate.toISOString().split("T")[0];
  const yesterday = new Date(todayDate);
  yesterday.setDate(todayDate.getDate() - 1);
  const yesterdayDate = yesterday.toISOString().split("T")[0];

  const dispatch = useDispatch();

  useEffect(() => {
    // setGetMessage(oneUserMessage);
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
    const cachedData = cache.get("getAllUsers");

    if (cachedData) {
      // Use cached data
      setAllUserListData(cachedData);
      return;
    } else {
      dispatch(getAllUser());
    }
  }, []);
  useEffect(() => {
    const socket = io(SOCKET_URL); // Initialize socket connection
    setSocket(socket); // Set the socket state

    return () => {
      socket.disconnect();
    };
  }, []);

  function moveObjectToTop(mainArray, notificationArray) {
    mainArray = [...mainArray];

    for (let notificationObj of notificationArray) {
      const index = mainArray?.findIndex(
        (obj) => obj._id === notificationObj.senderId
      );

      if (index !== -1) {
        const obj = mainArray.splice(index, 1)[0];
        mainArray.unshift(obj);
      }
    }
    return mainArray;
  }

  useEffect(() => {
    // Request access to the user's microphone
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        myAudio.current.srcObject = currentStream;
      })
      .catch((err) => {
        console.error("Error accessing media devices.", err);
      });

    // Listen for the 'me' event from the server to get the socket ID
    socket?.on("me1", (id) => setMe(id));

    // Listen for incoming calls
    socket?.on("receive-call", ({ from, signal, name: callerName }) => {
      setReceivingCall(true);
      setCaller(from);
      setCallerSignal(signal);
      setName(callerName); // Optional: if you send the caller's name
    });

    // Clean up the socket? connection on component unmount
    return () => {
      socket?.off("me");
      socket?.off("receive-call");
    };
  }, []);
  const callUser = (id) => {
    const peer = new SimplePeer({ initiator: true, trickle: false, stream });

    peer?.on("signal", (data) => {
      socket.emit("call-user1", {
        userToCall: id,
        signal: data,
        from: me,
        name,
      });
    });

    peer?.on("stream", (userStream) => {
      console.log(">>>>>>>>>>>>>>stream");

      userAudio.current.srcObject = userStream;
    });

    socket.on("call-accepted1", (signal) => {
      setCallAccepted(true);
      peer?.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new SimplePeer({ initiator: false, trickle: false, stream });

    peer?.on("signal", (data) => {
      socket.emit("answer-call1", { signal: data, to: caller });
    });

    peer?.on("stream", (userStream) => {
      userAudio.current.srcObject = userStream;
    });

    peer?.signal(callerSignal);
    connectionRef.current = peer;
  };

  function moveOneMessageToTop(mainArray, notificationArray) {
    if (notificationArray) {
      mainArray = [...mainArray];

      const index = mainArray.findIndex(
        (obj) => obj._id === notificationArray.reciverId
      );
      console.log("||||||||||||||||<<<<<<<<", index, notificationArray);
      if (index !== -1) {
        const obj = mainArray.splice(index, 1)[0];
        mainArray.unshift(obj);
      }
    } else {
      console.log("||||||||||||||||<<<<<<<<", 12345678);
    }

    return mainArray;
  }
  useEffect(() => {
    if (Array.isArray(notificationDatas)) {
      setCountMessage(notificationDatas);
      if (conversationData) {
        let mainArray = moveObjectToTop(conversationData, notificationDatas);
        setUserConversationDatas(mainArray);
      }
    } else if (conversationData) {
      setUserConversationDatas(conversationData);
    }
  }, [notificationDatas, conversationData]);

  useEffect(() => {
    if (reciveUserCallInvitationData) {
      setOpenVideoSentCall(true);
    }
  }, [reciveUserCallInvitationData]);

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
  }, []);
  function generateUniqueId(length = 30) {
    return uuidv4().replace(/-/g, "").slice(0, length);
  }
  const clearSeenSentMessage = (senderId) => {
    setUserConversationDatas((prevUsers) =>
      prevUsers.map((user) => {
        console.log("come inside for check data<<<<<<<<<<<,", senderId, user);
        if (user._id === senderId) {
          const updatedMessages = user.userLastMessages.map((msg) => {
            if (msg.userId === emailLocal.userId) {
              return {
                ...msg,
                messageId: null,
              };
            }
            return msg;
          });

          return {
            ...user,
            userLastMessages: updatedMessages,
          };
        }
        return user;
      })
    );
    const data = {
      senderId: emailLocal.userId,
      reciverId: senderId,
    };
    dispatch(clearMessageseensent(data));
  };
  useEffect(() => {
    if (reciverEmailAddress?.reciverId !== datafunction[0]?.senderId) {
      //datsa
    } else {
      console.log(
        "inside check directly seen messages<<<<<<<<<<",
        datafunction[0]
      );
      socket?.emit("SetMessageSeenConfirm", {
        messageId: datafunction[0]?.uniqueId,
        reciverId: datafunction[0]?.senderId,
        senderId: datafunction[0]?.reciverId,
        date: datafunction[0]?.createdAt,
      });
      clearSeenSentMessage(datafunction[0]?.senderId);
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
            : reloadUserNotification?.avatarVideo
            ? "Video"
            : reloadUserNotification?.latitude &&
              reloadUserNotification?.longitude
            ? "Map"
            : reloadUserNotification?.fileDocsPdf
            ? "File"
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
          : reloadUserNotification?.latitude &&
            reloadUserNotification?.longitude
          ? "Map"
          : reloadUserNotification?.fileDocsPdf
          ? "File"
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
          reciverId: reciverEmailAddress?.reciverId,
        };
        dispatch(deleteMessageData(data));
        setDeleteMessageForUpdated(false);
      } else {
        setDeleteMessageForUpdated(false);
      }
    }
  }, [deleteMessageForUpdated]);

  const updateSeenStatus = (senderId) => {
    setUserConversationDatas((prevUsers) =>
      prevUsers.map((user) => {
        if (user._id === senderId) {
          const updatedMessages = user.userLastMessages.map((msg) => {
            if (msg.userId === emailLocal.userId) {
              return {
                ...msg,
                messageId: {
                  ...msg.messageId,
                  seen: true,
                  seenAt: new Date(), // Update seenAt to current time
                },
              };
            }
            return msg;
          });

          return {
            ...user,
            userLastMessages: updatedMessages,
          };
        }
        return user;
      })
    );
  };
  let pc;

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
      setPageLoadingonScroll(false);
      const date = user1[0].createdAt.split("T")[0]; // Extract date from createdAt
      const currentDate = date; // You need to define a function to get the current date
      setGetMessage((prevState) => {
        return {
          ...prevState,
          [currentDate]: [...(prevState[currentDate] || []), user1[0]],
        };
      });
      cache.delete(`getUserMessage-${user1[0]?.senderId}`);
      cache.delete(`getUserMessage-${user1[0]?.reciverId}`);

      SetDataFunction(user1);
    });

    socket?.on("GetdeleteMessageFromBoth", (userDatas) => {
      setDeleteMessageForUpdated(userDatas);
    });

    socket?.on("getMessageNotificationInMongoDb", (userDatas) => {
      const validMessage = userDatas[0]?.message
        ? userDatas[0]?.message
        : userDatas[0]?.avatarVideo
        ? "Video"
        : "Image";
      dispatch(
        addUserNotification({
          senderId: userDatas[0]?.senderId,
          reciverId: userDatas[0]?.reciverId,
          firstMessage: validMessage,
          date: userDatas[0]?.createdAt,
          uniqueId: userDatas[0]?.uniqueId,
        })
      );
    });
    socket?.on("getMessageNotification", (userDatas) => {
      setreloadUserNotification(userDatas[0]);
    });
    socket?.on(
      "messageSeenConfirmation",
      ({ date, messageId, receiver, reciverId, senderId }) => {
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

        updateSeenStatus(senderId);
      }
    );
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
        }, 1500);
      }
    });
    socket?.on("getUserTypingStatus", (userStatus) => {
      setIsTyping(userStatus[0]);
    });
    socket?.on("getUserData", (cate) => {
      setUserDatas((mess) => mess.concat(cate));
    });
    socket?.on("getVideoCallInvitation", (userVideoCall) => {
      setUniqueRoomId(userVideoCall.roomId);
      setReciveUserCallInvitationData(userVideoCall);
      // setUserDatas((mess) => mess.concat(cate));
    });
    socket?.on("getCutVideoCall", (userCutVideoCall) => {
      handleVideocallSentClose();
    });
    socket?.on("getCutVideoCallByOutsideUser", (userCutVideoCall) => {
      handleVideocallSentClose();
    });
    socket?.on("getCutVideoCallAfterPopup", (userCutVideoCall) => {
      setCutVideoCallAfterCut(true);
    });
    socket?.on("getAcceptVideoCallByUser", (userCutVideoCall) => {
      setAcceptCallStatus(true);
    });

    socket?.on("streamUser", async ({ signalData, receiverId }) => {
      console.log(`Received signal from ${receiverId}`, signalData);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      // if (localVideoRef.current) {
      //   localVideoRef.current.srcObject = stream;
      // }
      if (signalData.type === "offer") {
        pc = new RTCPeerConnection();

        pc.ontrack = (event) => {
          console.log("Received remote stream:", event.streams[0]);

          if (event.track.kind === "audio") {
            // `event.streams[0]` will contain the incoming audio stream
            const remoteAudio = new Audio();
            remoteAudio.srcObject = event.streams[0];
            console.log(
              "here log is audio remote sideggggggggggggggg",
              remoteAudio
            );
            remoteAudio.play(); // Start playing the received audio
          }

          // Assuming remoteVideoRef is a reference to your <video> element
          if (remoteVideoRef.current.srcObject !== event.streams[0]) {
            console.log(
              "Received remote stream and come inside for setting<<:",
              event.streams[0]
            );

            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        try {
          await pc.setRemoteDescription(
            new RTCSessionDescription({ type: "offer", sdp: signalData.sdp })
          );
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(
            new RTCSessionDescription({ type: "answer", sdp: answer.sdp })
          );

          socket.emit("answer", pc.localDescription);

          if (signalData.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(signalData.candidate));
          }
        } catch (error) {
          toast.error(`Error setting up peer connection:`, {
            duration: 3000,
            position: "top-center",
          });
          console.error("Error setting up peer connection:", error);
          return;
        }
      }
      console.log("enter here<<<<<<<<<<<<<<<------------", remoteVideoRef);
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
  const generateUniqueRoomId = () => {
    return Math.random().toString(36).substring(7); // Generate a random alphanumeric room ID
  };
  const handleVideocallSentClose = (event, reason) => {
    if (reason !== "backdropClick") {
      setOpenVideoSentCall(false);
      setReciveUserCallInvitationData(null);
      setAcceptCallStatus(false);
      if (pc) {
        pc.close();
      }
    }
  };
  const handleCloseButtonModel = () => {
    setOpenButtonModel(false);
  };
  const handleVideoCallSentInvitation = async () => {
    const checkActiveUserIfHave = activeUser?.find(
      (userList) => userList.userId === reciverEmailAddress?.reciverId
    );
    if (!checkActiveUserIfHave) {
      toast.error(`${reciverEmailAddress?.email} is Not Online`, {
        duration: 3000,
        position: "top-center",
      });
      return;
    }
    const roomId = generateUniqueRoomId();
    setUniqueRoomId(roomId);
    // socket.emit("joinRoom", roomId); // Join the room for video call

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      console.log("strea local is here<<<<<<<<<<<", stream);

      // Displaying video

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      let peer;
      peer = new SimplePeer({ initiator: true });
      peer.addStream(stream);
      // Listen for signals from the receiver
      peer.on("signal", (data) => {
        // Send the signal (ICE candidate, SDP) to the receiver
        // Send this 'data' object through your signaling server
        socket.emit("signal", {
          signalData: data,
          receiverId: reciverEmailAddress?.reciverId,
        });
        console.log("come on signal peer");
        socket?.emit("sentVideoCallInvitation", {
          senderId: emailLocal?.userId,
          reciverId: reciverEmailAddress?.reciverId,
          reciverEmail: reciverEmailAddress?.email,
          senderEmail: emailLocal?.email,
          roomId: roomId,
        });
      });
      const closeStream = () => {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      };
      // closeStream();
    } catch (error) {
      if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        // Devices not found
        toast.error(
          `Media devices not found. Please ensure your camera and microphone are connected and accessible.`,
          {
            duration: 3000,
            position: "top-center",
          }
        );
        return;
      } else if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        // Permission denied by user

        toast.error(
          `Permission to access media devices was denied. Please grant permission to proceed.`,
          {
            duration: 3000,
            position: "top-center",
          }
        );
        return;
      } else if (
        error.name === "OverconstrainedError" ||
        error.name === "ConstraintNotSatisfiedError"
      ) {
        // Constraints not satisfied

        toast.error(
          `"Media device constraints not satisfied. Please check your device settings.`,
          {
            duration: 3000,
            position: "top-center",
          }
        );
        return;
      } else {
        // Other errors
        toast.error(
          `Error accessing media devices. Please check your setup and try again.`,
          {
            duration: 3000,
            position: "top-center",
          }
        );
        return;
      }
      // Handle error
    }

    setIsCalling(true);
    // setOpenVideoSentCall(true);
  };

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
  const updateOrAddMessage = (userId, newMessage) => {
    // Assuming `data` is the state containing the user information
    const updatedData = userConversationData?.map((user) => {
      if (user._id === userId) {
        // User found, process their messages
        let updatedUserLastMessages = [...user.userLastMessages];
        const existingMessageIndex = updatedUserLastMessages?.findIndex(
          (msg) => msg.userId === emailLocal.userId
        );

        if (existingMessageIndex > -1) {
          // Existing message found, update it
          const existingMessage = updatedUserLastMessages[existingMessageIndex];

          if (existingMessage) {
            // Update existing messageId
            updatedUserLastMessages[existingMessageIndex] = {
              ...existingMessage,
              messageId: newMessage?.messageId,
            };
          } else {
            // Add new messageId
            updatedUserLastMessages[existingMessageIndex] = {
              ...existingMessage,
              messageId: newMessage.messageId,
            };
          }
        } else {
          // Add new userLastMessages entry if userId does not match
          updatedUserLastMessages.push({
            userId: emailLocal.userId,
            messageId: newMessage.messageId,
          });
        }

        return {
          ...user,
          userLastMessages: updatedUserLastMessages,
        };
      } else {
      }
      return user;
    });

    // Update state with updatedData
    // Assuming you have a setState function to update the state
    setUserConversationDatas(updatedData);
  };
  const handleSend = async (e) => {
    e.preventDefault();
    if (message !== "") {
      setPageLoadingonScroll(false);
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
      const newMessage = {
        messageId: {
          createdAt: new Date(),
          seen: false,
        },
        userId: emailLocal?.userId,
      };
      updateOrAddMessage(reciverEmailAddress?.reciverId, newMessage);

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
    if (getMessage) {
      Object.keys(getMessage)?.forEach((date) => {
        if (!latestDate || new Date(date) > new Date(latestDate)) {
          latestDate = date;
        }
      });
    }

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

  const getTotalMessageCount = () => {
    let totalCount = 0;

    // Iterate over each date's array of messages
    for (const date in getMessage) {
      if (Array.isArray(getMessage[date])) {
        // Sum up the lengths of each array of messages
        totalCount += getMessage[date].length;
      }
    }

    return totalCount;
  };
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
      console.log(`Upload Progress:${progressEvent.loaded}`);
      // Update your progress state here (e.g., using setState in React)
      // setUploadingImageProgress(progress);
    },
  };
  const UploadVideoFileOnCloud = async () => {
    setLoadingForUploadImage(true);
    let intervalId;
    setUploadingImageProgress(10);
    const calculateIncrement = () => {
      if (videoAvatar.size < 23 * 1024 * 1024) {
        return 15;
      } else {
        return 10;
      }
    };
    const increment = calculateIncrement();

    const updateProgress = () => {
      setUploadingImageProgress((prev) => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          clearInterval(intervalId);
          return 100;
        }
        return newProgress;
      });
    };
    // Start interval to update progress
    intervalId = setInterval(updateProgress, 1500);

    formData.append("avatarVideo", videoAvatar);
    const getVideoUrl = await axios.post(
      "/messages/uploadVideoInCloud",
      formData,
      config
    );
    setUploadingImageProgress(20);
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
      const newMessage = {
        messageId: {
          createdAt: new Date(),
          seen: false,
        },
        userId: emailLocal?.userId,
      };
      updateOrAddMessage(reciverEmailAddress?.reciverId, newMessage);
      const data = {
        senderId: emailLocal?.userId,
        conversationId: "",
        reciverId: reciverEmailAddress?.reciverId,
        uniqueId: uniqueId,
        avatarVideo: getVideoUrl?.data?.data?.url,
        avatarVideoThumb: getVideoUrl?.data?.data?.thumb,
      };
      clearInterval(intervalId);
      setLoadingForUploadImage(false);
      setUploadingImageProgress(0);
      handleClose();

      dispatch(addUserMessage(data));
    } else {
      clearInterval(intervalId);
      setUploadingImageProgress(0);
      setLoadingForUploadImage(false);
    }
  };
  const UploadPdfDocsFileOnCloud = async () => {
    setLoadingForUploadImage(true);
    let intervalId;
    setUploadingImageProgress(10);
    const calculateIncrement = () => {
      if (selectedPdfDocsFile.size < 8 * 1024 * 1024) {
        return 15;
      } else {
        return 10;
      }
    };
    const increment = calculateIncrement();

    const updateProgress = () => {
      setUploadingImageProgress((prev) => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          clearInterval(intervalId);
          return 100;
        }
        return newProgress;
      });
    };
    // Start interval to update progress
    intervalId = setInterval(updateProgress, 1500);

    formData.append("avatarFile", selectedPdfDocsFile);
    const getPdfDocsUrl = await axios.post(
      "/messages/uploadFilePdfDocsInCloud",
      formData,
      config
    );
    setUploadingImageProgress(20);
    console.log("get file form cloudn is<<<<<<", getPdfDocsUrl);
    if (getPdfDocsUrl?.data?.data?.avatarVideoSerPath?.url) {
      const uniqueId = generateUniqueId();

      socket?.emit("addMessage", {
        fileDocsPdf: {
          name: getPdfDocsUrl?.data?.data?.avatarVideoSerPath
            ?.original_filename,
          filePath: getPdfDocsUrl?.data?.data?.avatarVideoSerPath?.url,
          size: getPdfDocsUrl?.data?.data?.avatarVideoSerPath?.bytes,
        },
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
      const newMessage = {
        messageId: {
          createdAt: new Date(),
          seen: false,
        },
        userId: emailLocal?.userId,
      };
      updateOrAddMessage(reciverEmailAddress?.reciverId, newMessage);
      const data = {
        senderId: emailLocal?.userId,
        conversationId: "",
        reciverId: reciverEmailAddress?.reciverId,
        uniqueId: uniqueId,
        name: getPdfDocsUrl?.data?.data?.avatarVideoSerPath?.original_filename,
        filePath: getPdfDocsUrl?.data?.data?.avatarVideoSerPath?.url,
        size: getPdfDocsUrl?.data?.data?.avatarVideoSerPath?.bytes,
      };
      clearInterval(intervalId);
      setLoadingForUploadImage(false);
      setUploadingImageProgress(0);
      handleClose();

      dispatch(addUserMessage(data));
    } else {
      clearInterval(intervalId);
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
      const newMessage = {
        messageId: {
          createdAt: new Date(),
          seen: false,
        },
        userId: emailLocal?.userId,
      };
      updateOrAddMessage(reciverEmailAddress?.reciverId, newMessage);
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

  useEffect(() => {
    if (reciverEmailAddress?.reciverId) {
      if (typingStatusChange !== true) {
        socket?.emit("addUserTypingStatus", {
          status: true,
          senderId: emailLocal?.userId,
          reciverId: reciverEmailAddress?.reciverId,
        });
        setTypingStatusChange(true);
      }
      let typingTimeout = setTimeout(() => {
        socket?.emit("addUserTypingStatus", {
          status: false,
          senderId: emailLocal?.userId,
          reciverId: reciverEmailAddress?.reciverId,
        });

        setTypingStatusChange(false);
      }, 1500); // Reset typing status after 1 second of inactivity

      return () => clearTimeout(typingTimeout); // Clear previous timeout if any
    }
  }, [message]);

  const handleTyping = (e) => {
    const newText = e.target.value;
    const lines = newText.split("\n");

    if (lines.length > 3) {
      e.preventDefault();
      return;
    }

    setMessage(newText);
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

  const handleOpen = () => {
    setOpen(true);
    setOpenButtonModel(false);
  };
  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setPreviewURL(null);
    setVideoPreview(null);
    setVideoAvatar(null);
    setPdfDocsSelectedFile(null);
  };
  const hasMore = productPageNumber < Math.ceil(messageLength / 20);

  const fetchDataFromMessageApi = async () => {
    const data1 = {
      senderId: emailLocal?.userId,
      reciverId: reciverEmailAddress?.reciverId,
      limit: 20,
      skip: getTotalMessageCount(),
    };
    const responce1 = await axios.post(`/messages/getmessage`, data1);

    const res = await decryptData(responce1?.data?.data, ENCRYPTION_KEY);
    const responce = JSON.parse(res);
    if (responce1?.data?.success) {
      {
        Object.keys(responce?.messagesByDate).map((date, key) => {
          setGetMessage((prevState) => {
            return {
              ...prevState,
              [date]: [
                ...responce?.messagesByDate[date],
                ...(prevState[date] || []),
              ],
            };
          });
        });
      }
      setProductPageNumber((pre) => pre + 1);
    }
  };
  const handleScroll = () => {
    // const target = event.target;
    if (productPageNumber < Math.ceil(messageLength / 20)) {
      // console.log(
      //   "jenish here<<<<<<<<<<<<><><><><><><><>",
      //   messageLength,
      //   getTotalMessageCount(),
      //   Object.keys(getMessage).length
      // );
      setPageLoadingonScroll(true);
      setTimeout(() => {
        fetchDataFromMessageApi();
      }, 0);
    }
  };

  return (
    <>
      <div className="main_chat_div">
        <div className=" grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2  w-full">
          <div
            className={`w-full h-[96vh] overflow-y-hidden md:col-span-1  col-span-2 ${
              showMainPart ? "md:block hidden" : "block"
            }   border border-dark   ${
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
                <ConversationLoadingPage
                  key={key}
                  index={key}
                  modeTheme={modeTheme}
                />
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
                setGetMessage={setGetMessage}
                countMessage={countMessage}
                socket={socket}
                updateSeenChatMessageData={updateSeenChatMessageData}
                deleteNotificationData={deleteNotificationData}
                setCountMessage={setCountMessage}
                activeUser={activeUser}
                LastSeenUser={LastSeenUser}
                formatLastSeen={formatLastSeen}
                modeTheme={modeTheme}
                setShowMainpart={setShowMainpart}
                allUserListData={allUserListData}
                loadingUsers={loadingUsers}
                setSearchUserByName={setSearchUserByName}
                searchUserByName={searchUserByName}
                setProductPageNumber={setProductPageNumber}
                setUserConversationDatas={setUserConversationDatas}
              />
            )}
          </div>
          {reciverEmailAddress?.email === "" ? (
            <>
              <div
                className={` md:block  ${
                  showMainPart ? "block" : "hidden"
                }   col-span-2 ${modeTheme === "dark" ? "bg-dark" : null} `}
              >
                <h2
                  className={`flex justify-center h-[96vh]  items-center text-4xl font-thin ${
                    modeTheme === "dark" ? "text-white" : null
                  } `}
                >
                  Chatting with people...
                </h2>
              </div>
            </>
          ) : (
            <div
              className={`all_chat_div overflow-y-auto col-span-2 md:block  ${
                showMainPart ? "block" : "hidden"
              }  ${modeTheme === "dark" ? "bg-dark" : null}`}
            >
              <div
                className={`${
                  modeTheme === "dark" ? "bg-[#526D82]" : "bg-[#bce2d4]"
                }`}
              >
                <div className={`center_icon_div  sm:w-[400px] sm:mx-auto`}>
                  <div className="md:hidden block">
                    <p
                      className="mr-4"
                      onClick={() => {
                        setShowMainpart(false);
                        setReciverEmailaddress({
                          email: "",
                          reciverId: "",
                          avatar: "",
                          userName: "",
                          _id: "",
                        });
                      }}
                    >
                      <FaArrowLeftLong
                        className={` ml-2 ${
                          modeTheme === "dark" ? "text-white" : null
                        } `}
                      />
                    </p>
                  </div>
                  <div className="flex items-center">
                    <img
                      alt="gdg"
                      src={reciverEmailAddress?.avatar}
                      className="md:w-16 w-12 md:h-16 h-12 rounded-full p-0  mt-[6px] object-cover md:mr-0 mr-1 sm:ml-0 -ml-5"
                    />
                    <div className="md:ml-5">
                      <p
                        className={` sm:text-[18px] text-[15px] sm:ml-4 ml-2  font-serif ${
                          modeTheme === "dark" ? "text-white" : null
                        }`}
                      >
                        {reciverEmailAddress?.email}
                      </p>
                      {isUserOnline && !isUserTyping && (
                        <p
                          className={`text-[15px]  text-start sm:ml-4 ml-2 ${
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
                              className={` sm:text-[15px] text-[12px] text-center marquee-text  ${
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
                          } text-start sm:ml-4 ml-2`}
                        >
                          Typing...
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center sm:ml-10">
                    <FaVideo
                      className={`sm:ml-5 mt-1 ml-2 cursor-pointer ${
                        modeTheme === "dark" ? "text-white" : null
                      }`}
                      onClick={handleVideoCallSentInvitation}
                    />

                    <Menu as="div" className="relative">
                      <Menu.Button>
                        <HiOutlineDotsVertical
                          className={`mt-[10px] md:ml-5 ml-3 md:mr-2 mr-1  cursor-pointer ${
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
                                    reciverId: reciverEmailAddress?.reciverId,
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
              </div>
              <div
                className={`center_chat_div relative ${
                  getTotalMessageCount() > 19 ? "flex flex-col-reverse" : null
                }  ${modeTheme === "dark" ? "bg-dark" : null}`}
                id="center_chat_div"
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
                    {/* {pageLoadingonScroll && (
                      <h1 className="text-white  mt-4 mb-2 text-1xl font-thin">
                        Loading...
                      </h1>
                    )} */}
                    <InfiniteScroll
                      dataLength={getTotalMessageCount()}
                      next={handleScroll}
                      hasMore={hasMore}
                      loader={
                        <div role="status" className="mt-3">
                          <svg
                            aria-hidden="true"
                            className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-green-500"
                            viewBox="0 0 100 101"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                              fill="currentColor"
                            />
                            <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              fill="currentFill"
                            />
                          </svg>
                          <span className="sr-only">Loading...</span>
                        </div>
                      }
                      endMessage={
                        getTotalMessageCount() > 20 ? (
                          <p
                            className={`text-center sm:text-[16px] text-[12px]  font-bolder mt-3 ${
                              modeTheme === "dark" ? "text-white" : null
                            }`}
                          >
                            You&apos;s Visited all Messages!🐰🥕
                          </p>
                        ) : null
                      }
                      className="flex flex-col-reverse overflow-visible"
                      scrollableTarget="center_chat_div"
                      inverse={true}
                    >
                      {Object.keys(getMessage)
                        .sort((a, b) => new Date(b) - new Date(a))
                        .map((date, key1) => {
                          const CheckFilterDate = getMessage[date].some((obj) =>
                            obj.senderId === emailLocal?.userId
                              ? !obj.userDelete === true
                              : !obj.reciverDelete === true
                          );

                          return (
                            <>
                              <div key={key1}>
                                {CheckFilterDate && (
                                  <div className="text-center flex justify-center my-4">
                                    <h2
                                      className={`text-center text-[#f7ebeb] w-fit sm:text-[15px] text-[12px] rounded-lg font-medium py-2 px-6 ${
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
                                      key={index}
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
                                      pageLoadingonScroll={pageLoadingonScroll}
                                    />
                                  );
                                })}
                              </div>
                            </>
                          );
                        })}
                    </InfiniteScroll>
                    {/* <InfiniteScroll
                      dataLength={messageLength || 0}
                      hasMore={true}
                      onScroll={handleScroll}
                      scrollableTarget="center_chat_div"
                    > */}
                    {/* {Object.keys(getMessage).map((date, key) => {
                        const CheckFilterDate = getMessage[date].some((obj) =>
                          obj.senderId === emailLocal?.userId
                            ? !obj.userDelete === true
                            : !obj.reciverDelete === true
                        );

                        return (
                          <>
                            <div key={key}>
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
                                    key={index}
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
                          </>
                        );
                      })} */}
                    {/* </InfiniteScroll> */}
                    {/* {Object.keys(getMessage).map((date, key) => {
                      const CheckFilterDate = getMessage[date].some((obj) =>
                        obj.senderId === emailLocal?.userId
                          ? !obj.userDelete === true
                          : !obj.reciverDelete === true
                      );

                      return (
                        <div key={key}>
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
                                key={index}
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
                    })} */}
                  </>
                )}
              </div>

              <div
                className={`center_input_div flex justify-center items-center cursor-pointer md:pb-0 pb-2 relative  ${
                  modeTheme === "dark" ? "bg-dark" : null
                }`}
              >
                {/* <div className=" absolute -top-16 w-full h-16 bg-red-300"></div> */}

                <HiOutlineDotsVertical
                  className={`mt-[10px] ml-2 w-10 h-10  cursor-pointer ${
                    modeTheme === "dark" ? "text-white" : null
                  }`}
                  onClick={() => setOpenButtonModel(true)}
                />

                <MdEmojiEmotions
                  className={`md:w-10 w-12 md:h-10 h-12 sm:ml-[6px] ml-1 mr-3 mt-2 ${
                    modeTheme === "dark" ? "text-white" : null
                  }`}
                  onClick={() => setHandleOpenEmoji((prev) => !prev)}
                />
                <TextareaAutosize
                  ref={messageRef} // Attach the ref here
                  onKeyDown={handleKeyDown}
                  value={message}
                  maxRows={2.5}
                  onChange={handleTyping}
                  className={`w-full mt-[8px] md:mt-[6px] rounded-xl px-2 py-1 ${
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
                    modeTheme={modeTheme}
                  />
                )}
              </div>
            </div>
          )}
          <div
            className={`all_chat_div col-span-1 overflow-y-scroll lg:block hidden  pb-3 ${
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
                <ConversationLoadingPage index={dt} modeTheme={modeTheme} />
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
                              console.log(
                                "check email is valid or not<<<<<<",
                                emailLocal
                              );
                              socket?.emit("SetMessageSeenConfirm", {
                                messageId: setCurrentUniueId[0]?.uniqueId,
                                reciverId: dt?._id,
                                date: setCurrentUniueId[0]?.date,
                                senderId: emailLocal?.userId,

                                // senderId: emailLocal,
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
                            setProductPageNumber(1);
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
                            className=" w-16 h-16 rounded-full object-cover"
                          />
                          {activeUser?.map((dr, key1) => {
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

      {openVideoSentCall && (
        <VideoCallSentModel
          openVideoSentCall={openVideoSentCall}
          handleVideocallSentClose={handleVideocallSentClose}
          reciveUserCallInvitationData={reciveUserCallInvitationData}
          emailLocal={emailLocal}
          socket={socket}
          uniqueRoomId={uniqueRoomId}
          localVideoRef={localVideoRef}
          SimplePeer={SimplePeer}
          setPeer={setPeer}
          remoteVideoRef={remoteVideoRef}
          setIsCallAccepted={setIsCallAccepted}
          setIsCalling={setIsCalling}
          isCallAccepted={isCallAccepted}
          acceptCallStatus={acceptCallStatus}
          setAcceptCallStatus={setAcceptCallStatus}
          reciverEmailAddress={reciverEmailAddress}
          setRandomMuted={setRandomMuted}
        />
      )}
      {cutVideoCallAfterCut && (
        <VideoCallCutAfterModel
          cutVideoCallAfterCut={cutVideoCallAfterCut}
          setCutVideoCallAfterCut={setCutVideoCallAfterCut}
        />
      )}
      {open && (
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

            {selectedPdfDocsFile && (
              <div className="relative">
                <div className="w-full h-20 border-[1px] border-green-400 rounded-md flex items-center">
                  <div className="w-16 h-full bg-green-200">
                    <FcDocument className="w-12 h-20" />
                  </div>
                  <div className="w-full ml-2">
                    <p className="font-medium">
                      {truncateFileName(selectedPdfDocsFile.name, 20)}
                    </p>
                    <p className="font-medium">
                      {formatBytes(selectedPdfDocsFile.size)}
                    </p>
                  </div>
                </div>
                <TiDeleteOutline
                  className="absolute -top-3 -right-3 text-[#fff] w-8 h-8 bg-[#345445] p-1 cursor-pointer rounded-full"
                  onClick={handleClose}
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
            {selectedPdfDocsFile && !loadingForUploadImage && (
              <div className="w-full">
                <button
                  type="button"
                  onClick={UploadPdfDocsFileOnCloud}
                  className="text-white mt-3 w-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                >
                  {loadingForUploadImage ? "sending... " : "Send File"}
                </button>
              </div>
            )}
          </Box>
        </Modal>
      )}
      {openButtonModel && (
        <ButtonModel
          openButtonModel={openButtonModel}
          handleCloseButtonModel={handleCloseButtonModel}
          handleFileChange={handleFileChange}
          handleVideoChange={handleVideoChange}
          emailLocal={emailLocal}
          dispatch={dispatch}
          reciverEmailAddress={reciverEmailAddress}
          socket={socket}
          activeUser={activeUser}
          modeTheme={modeTheme}
          generateUniqueId={generateUniqueId}
          userConversationData={userConversationData}
          setPdfDocsSelectedFile={setPdfDocsSelectedFile}
          handleOpen={handleOpen}
          updateOrAddMessage={updateOrAddMessage}
        />
      )}

      {/* <div>
        <h1>Audio Call</h1>
        <audio playsInline ref={myAudio} autoPlay />
        <audio playsInline ref={userAudio} autoPlay />

        {receivingCall && !callAccepted ? (
          <div>
            <h2>{name} is calling...</h2>
            <button onClick={answerCall}>Answer</button>
          </div>
        ) : null}

        <button onClick={() => callUser(me)}>Call User</button>
      </div> */}
      {/* <div className="flex">
        <video ref={localVideoRef} width={300} height={200} autoPlay />
        <video
          ref={remoteVideoRef}
          width={300}
          height={200}
          autoPlay
          // muted
        />
      </div> */}
    </>
  );
};

export default Chatbox;

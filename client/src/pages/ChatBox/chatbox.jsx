import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
// import { addTag, getAllTag } from "../../../store/tag/tagAction";
import "./chatbox.css";
import Glrs from "../../assets/image/grls.jpg";
// import SendIcon from "@mui/icons-material/Send";
import { v4 as uuidv4 } from "uuid";
// import { apiClient } from "../../../api/general";
import {
  addUserMessage,
  deleteMessageData,
  getAllUser,
  getConversation,
  getUserMessage,
} from "../../store/Message/authApi";
import { getOneUser } from "../../store/Users/userApi";
import { SOCKET_URL } from "../../utils/constant";
import InfiniteScroll from "react-infinite-scroll-component";
import EmojiPicker from "emoji-picker-react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";
import { MdEmojiEmotions } from "react-icons/md";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import EmojiModel from "./emoji/emojiModel";
import { HiOutlineDotsVertical } from "react-icons/hi";
import DeleteModel from "./deleteModel/deleteModel";
import axios from "../../utils/commonAxios.jsx";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const Chatbox = () => {
  const { userOneData } = useSelector((state) => state.userAuthData);
  const { tag, oneUserMessage, loading, conversationData, userLists } =
    useSelector((state) => state.messageData);

  const [socket, setSocket] = useState(null);
  const [userData, setUserDatas] = useState([]);
  const [deleteMessageForUpdated, setDeleteMessageForUpdated] = useState(false);

  const [userConversationData, setUserConversationDatas] = useState([]);
  const [activeUser, setActiveUser] = useState([]);
  const [message, setMessage] = useState("");
  const [emailLocal, setEmailLocal] = useState("");
  const [reciverEmailAddress, setReciverEmailaddress] = useState({
    email: "",
    reciverId: "",
    avatar: "",
    userName: "",
  });
  const [countMessage, setCountMessage] = useState([
    { reciverId: "jenish", senderId: "jjs", firstMessage: "", count: 0 },
  ]);
  const [reciverChatData, setReciverChatData] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [getMessage, setGetMessage] = useState({});
  const [datafunction, SetDataFunction] = useState("");
  const [handleOpenEmoji, setHandleOpenEmoji] = useState(false);
  const [reloadUserConversation, setReloadUserCon] = useState(false);
  const [reloadUserNotification, setreloadUserNotification] = useState(false);

  const [seeLoginActiveInfo, setLoginActiveInfo] = useState({
    online: false,
  });
  const [page, setPage] = useState(1);

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
    dispatch(getOneUser());
    dispatch(getAllUser());

    const userInfo = localStorage.getItem("userCountInfo");
    userInfo !== undefined && userInfo?.length !== 0
      ? setCountMessage(JSON.parse(userInfo))
      : null;
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
    setUserConversationDatas(conversationData);
  }, [conversationData]);
  useEffect(() => {
    messageDom?.current?.scrollIntoView({ behavior: "smooth" });
  }, [getMessage]);
  useEffect(() => {
    const user = localStorage.getItem("userInfo");
    if (user !== undefined) {
      setEmailLocal(JSON.parse(localStorage.getItem("userInfo")));
      dispatch(getConversation(JSON.parse(user)?.userId || ""));
    }
  }, [reloadUserConversation]);
  function generateUniqueId(length = 30) {
    return uuidv4().replace(/-/g, "").slice(0, length);
  }
  useEffect(() => {
    if (!datafunction || !reciverEmailAddress) return;

    if (reciverEmailAddress?.reciverId !== datafunction[0]?.senderId) {
      setCountMessage((prevMessages) => {
        // Initialize prevMessages as an empty array if it's null or undefined
        prevMessages = prevMessages || [];

        // Find if the reciverId already exists in the state
        const index = prevMessages.findIndex(
          (msg) => msg.senderId === datafunction[0]?.senderId
        );

        // If it exists, update the count
        if (index !== -1) {
          const updatedMessages = [...prevMessages];
          updatedMessages[index] = {
            ...updatedMessages[index],
            count: updatedMessages[index].count + 1,
          };
          if (Array.isArray(updatedMessages) && updatedMessages?.length !== 0) {
            localStorage.setItem(
              "userCountInfo",
              JSON.stringify(updatedMessages)
            );
          }
          return updatedMessages;
        } else {
          // If it doesn't exist, add a new entry
          localStorage.setItem(
            "userCountInfo",
            JSON.stringify([
              ...prevMessages,
              {
                reciverId: datafunction[0]?.reciverId,
                senderId: datafunction[0]?.senderId,
                firstMessage: datafunction[0]?.message,
                count: 1,
              },
            ])
          );

          return [
            ...prevMessages,
            {
              reciverId: datafunction[0]?.reciverId,
              senderId: datafunction[0]?.senderId,
              firstMessage: datafunction[0]?.message,
              count: 1,
            },
          ];
        }
      });
    }
  }, [datafunction]);
  // const playNotificationSound = () => {
  //   const audio = new Audio("../../../public/iphone_sound.mp3");
  //   audio.play();
  // };
  useEffect(() => {
    if (!reciverEmailAddress || !reloadUserNotification) return;
    if (reciverEmailAddress?.reciverId !== reloadUserNotification?.senderId) {
      if ("Notification" in window) {
        // Check if permission is already granted
        if (Notification.permission === "granted") {
          // If granted, show the notification
          // playNotificationSound();
          new Notification(reloadUserNotification?.message);
        } else if (Notification.permission !== "denied") {
          // Otherwise, request permission from the user
          Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
              // playNotificationSound();

              new Notification(reloadUserNotification?.message);
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
    socket?.on("getUser", (user) => {
      setActiveUser(user);
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
      // setGetMessage((prevMessagesByDate) => {
      //   const newMessagesByDate = { ...prevMessagesByDate };
      //   if (!newMessagesByDate[date]) {
      //     newMessagesByDate[date] = [];
      //   }
      //   newMessagesByDate[date].push(user1[0]);
      //   return newMessagesByDate;
      // });
      // setGetMessage((mess) => mess.concat(user1));
      SetDataFunction(user1);
    });

    socket?.on("GetdeleteMessageFromBoth", (userDatas) => {
      setDeleteMessageForUpdated(userDatas);
    });

    socket?.on("getMessageNotification", (userDatas) => {
      setreloadUserNotification(userDatas[0]);
    });

    socket?.on("getNewUserData", (userStatus) => {
      const CheckUserCon = userConversationData?.find(
        (dr) => dr?._id === reciverEmailAddress?.reciverId
      );
      if (CheckUserCon === undefined) {
        setTimeout(() => {
          dispatch(getConversation(emailLocal?.userId || ""));
        }, 500);
      }
    });
    socket?.on("getUserTypingStatus", (userStatus) => {
      setIsTyping(userStatus[0]);
    });
    socket?.on("getUserData", (cate) => {
      console.log(cate);
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
      });
      const CheckUserCon = userConversationData?.find(
        (dr) => dr?._id === reciverEmailAddress?.reciverId
      );
      if (CheckUserCon === undefined) {
        socket?.emit("addUserNew", {
          _id: reciverEmailAddress?.reciverId,
          email: reciverEmailAddress?.email,
          avatar: reciverEmailAddress?.avatar,
          userName: reciverEmailAddress?.userName,
          senderId: emailLocal?.userId,
          reciverId: reciverEmailAddress?.reciverId,
        });
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
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // Handle midnight
    minutes = minutes < 10 ? "0" + minutes : minutes; // Add leading zero to minutes if less than 10
    return hours + ":" + minutes + " " + ampm;
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
  const isUserTyping =
    reciverEmailAddress?.reciverId === isTyping?.senderId && isTyping?.status;
  return (
    <>
      <div className="main_chat_div">
        <div className="child1_chat_div">
          <div className="all_chat_div">
            <div
              style={{ borderBottom: "1px solid black" }}
              className="mt-2 p-4 flex justify-center items-center flex-wrap "
            >
              <div className=" relative">
                <img
                  alt="gdg"
                  src={userOneData?.avatar ? userOneData?.avatar : Glrs}
                  className=" w-16 h-16 rounded-full "
                />
                {seeLoginActiveInfo?.online && (
                  <span className=" absolute bottom-0 right-1 bg-[#4CBB17] w-4 h-4 rounded-full"></span>
                )}
              </div>
              <div className="md:ml-3 ml-1">
                <h1 className="text-center p-2 font-bold ">Me</h1>
                <h4>{emailLocal?.email}</h4>
              </div>
            </div>
            <h1 className="mx-3 my-4 text-center font-medium">Your Chat</h1>
            {userConversationData?.map((dt, key) => {
              return (
                <>
                  <div
                    className="flex md:justify-start md:pl-5 pl-2 justify-center flex-wrap  items-center gap-x-2 border-b-2 py-2 cursor-pointer"
                    key={key}
                    onClick={async () => {
                      if (reciverEmailAddress?.email !== dt?.email) {
                        setReciverEmailaddress({
                          email: dt?.email,
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
                        dispatch(getUserMessage(data1));
                        const setCount = countMessage?.filter(
                          (datas) => datas?.senderId !== dt?._id
                        );
                        setCountMessage(setCount);
                        if (Array.isArray(setCount) && setCount?.length !== 0) {
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
                              },
                            ])
                          );
                        }
                        // localStorage.setItem(
                        //   "userCountInfo",
                        //   JSON.stringify(setCount !== undefined ? setCount : [])
                        // );
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
                        return dr?.userId === dt?._id ? (
                          <span
                            className=" absolute bottom-0 right-1 bg-[#4CBB17] w-4 h-4 rounded-full"
                            key={key1}
                          ></span>
                        ) : (
                          ""
                        );
                      })}
                    </div>
                    <div>
                      <p className="icon_text">
                        {dt?.userName?.substring(0, 10)}
                        {dt?.userName?.length <= 10 ? null : ".."}
                      </p>
                      {countMessage?.map((itm) => {
                        return itm.senderId === dt._id ? (
                          <p className="text-[#00C000]">
                            {itm?.firstMessage?.substring(0, 10)}
                            {itm?.firstMessage?.length <= 10 ? null : ".."}
                          </p>
                        ) : null;
                      })}
                    </div>
                    {countMessage?.map((itm) => {
                      return itm.senderId === dt._id ? (
                        <h1 className="h-7 w-7 rounded-full  bg-[#00C000] text-white text-center flex justify-center items-center text-[15px]">
                          {itm?.count < 10 ? itm?.count : "9+"}
                        </h1>
                      ) : null;
                    })}
                  </div>
                </>
              );
            })}
          </div>
          {reciverEmailAddress?.email === "" ? (
            <>
              <div className="h-[80vh] flex justify-center items-center">
                <h2 className=" text-4xl font-thin">Chatting with people...</h2>
              </div>
            </>
          ) : (
            <div className="all_chat_div">
              <div className="center_icon_div">
                <img
                  alt="gdg"
                  src={reciverEmailAddress?.avatar}
                  className="img_girls_icon"
                />
                <div>
                  <p className="icon_text">{reciverEmailAddress?.email}</p>
                  {isUserOnline && !isUserTyping && (
                    <p className="text-[15px] text-green-500 text-start ml-4">
                      online
                    </p>
                  )}
                  {isUserOnline && isUserTyping && (
                    <p className="text-[15px] text-blue-500 text-start ml-4">
                      Typing...
                    </p>
                  )}
                </div>
                <div>
                  <Menu as="div" className="relative">
                    <Menu.Button>
                      <HiOutlineDotsVertical className="mt-[10px] ml-8 cursor-pointer " />
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
              <div className="center_chat_div">
                {loading ? (
                  <div className="h-[80vh] flex justify-center items-center">
                    <h2 className=" text-4xl font-thin">Loading chat...</h2>
                  </div>
                ) : Object.keys(getMessage)?.length === 0 ? (
                  <div className="h-[80vh] flex justify-center items-center">
                    <h2 className=" text-4xl font-thin">No Chat found</h2>
                  </div>
                ) : (
                  <>
                    {Object.keys(getMessage).map((date) => {
                      const CheckFilterDate = !getMessage[date].every(
                        (obj) =>
                          obj.userDelete === true &&
                          obj.senderId === emailLocal?.userId
                      );
                      console.log(
                        "I am looking what is come from this",
                        date,
                        CheckFilterDate
                      );
                      return (
                        <div key={date}>
                          {/* {emailLocal?.userId !==
                          reciverEmailAddress?.reciverId ? ( */}
                          <div className="text-center flex justify-center my-4">
                            {CheckFilterDate && (
                              <h2 className=" text-center font-medium py-2 px-6 bg-[#4682B4] text-white w-fit rounded-lg">
                                {TodayDateOnly === date
                                  ? "Today"
                                  : yesterdayDate === date
                                  ? "Yesterday"
                                  : date}
                              </h2>
                            )}
                          </div>
                          {/* ) : null} */}
                          {getMessage[date]?.map((dt, key) => {
                            return dt.senderId === emailLocal?.userId &&
                              dt?.userDelete === false ? (
                              <>
                                <div
                                  className="you_chat md:pl-20 pl-5 "
                                  key={key}
                                  ref={messageDom}
                                >
                                  <p className="you_chat_text pl-2 text-start pr-2 py-1">
                                    {dt?.message}
                                    <span className="text-[11px] text-gray-200">
                                      {dt?.createdAt &&
                                        formatDate(dt?.createdAt)}
                                    </span>
                                  </p>
                                  <Menu as="div" className="relative">
                                    <Menu.Button>
                                      <HiOutlineDotsVertical className="mt-[10px] -ml-1 mr-1 cursor-pointer " />
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
                                      <Menu.Items className="absolute  top-0 right-2 z-50 mt-2 w-32 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <Menu.Item>
                                          {({ active }) => (
                                            <button
                                              className={classNames(
                                                active
                                                  ? "w-full bg-gray-100"
                                                  : "",
                                                "w-full block px-2 py-2 text-sm text-gray-700"
                                              )}
                                              onClick={() => {
                                                const uniqueData = getMessage[
                                                  date
                                                ]?.filter(
                                                  (items) =>
                                                    items?.uniqueId !==
                                                    dt?.uniqueId
                                                );

                                                setGetMessage((prevState) => {
                                                  return {
                                                    ...prevState,
                                                    [date]: uniqueData,
                                                  };
                                                });

                                                const data = {
                                                  messageId: dt?.uniqueId,
                                                  title: "Me",
                                                  senderId: emailLocal?.userId,
                                                };
                                                dispatch(
                                                  deleteMessageData(data)
                                                );
                                              }}
                                            >
                                              delete for Me
                                            </button>
                                          )}
                                        </Menu.Item>
                                        <hr />
                                        {TodayDateOnly === date && (
                                          <Menu.Item>
                                            {({ active }) => (
                                              <button
                                                className={classNames(
                                                  active
                                                    ? "w-full bg-gray-100"
                                                    : "",
                                                  "w-full block px-4 py-2 text-sm text-gray-700"
                                                )}
                                                onClick={() => {
                                                  socket?.emit(
                                                    "deleteMessageFromBoth",
                                                    {
                                                      senderId:
                                                        emailLocal?.userId,
                                                      reciverId:
                                                        reciverEmailAddress?.reciverId,
                                                      date: date,
                                                      uniqueId: dt?.uniqueId,
                                                    }
                                                  );
                                                }}
                                              >
                                                delete both
                                              </button>
                                            )}
                                          </Menu.Item>
                                        )}
                                      </Menu.Items>
                                    </Transition>
                                  </Menu>
                                </div>
                              </>
                            ) : reciverChatData === dt?.senderId &&
                              dt?.reciverDelete === false ? (
                              <>
                                <div
                                  className="you_chat_div md:mr-20 mr-5 flex"
                                  key={key}
                                  ref={messageDom}
                                >
                                  {/* <HiOutlineDotsVertical className="ml-1 -mr-1 mt-[10px] cursor-pointer " /> */}
                                  <Menu as="div" className="relative">
                                    <Menu.Button>
                                      <HiOutlineDotsVertical className="ml-1 z-10 -mr-1 mt-[10px] cursor-pointer " />
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
                                      <Menu.Items className="absolute top-0 z-50 mt-2 ml-3 w-32 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <Menu.Item>
                                          {({ active }) => (
                                            <button
                                              className={classNames(
                                                active
                                                  ? "w-full bg-gray-100"
                                                  : "",
                                                "w-full block px-2 py-2 text-sm text-gray-700"
                                              )}
                                              onClick={() => {
                                                const uniqueData = getMessage[
                                                  date
                                                ]?.filter(
                                                  (items) =>
                                                    items?.uniqueId !==
                                                    dt?.uniqueId
                                                );

                                                setGetMessage((prevState) => {
                                                  return {
                                                    ...prevState,
                                                    [date]: uniqueData,
                                                  };
                                                });

                                                const data = {
                                                  messageId: dt?.uniqueId,
                                                  title: "Me",
                                                };
                                                dispatch(
                                                  deleteMessageData(data)
                                                );
                                              }}
                                            >
                                              delete for Me
                                            </button>
                                          )}
                                        </Menu.Item>
                                      </Menu.Items>
                                    </Transition>
                                  </Menu>
                                  <p className="you_chat_text1 text-start ">
                                    {dt?.message}{" "}
                                    <span className="text-[11px] text-gray-200">
                                      {dt?.createdAt &&
                                        formatDate(dt?.createdAt)}
                                    </span>
                                  </p>
                                </div>
                              </>
                            ) : null;
                          })}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
              <div className="center_input_div flex justify-center cursor-pointer items-center">
                <MdEmojiEmotions
                  className="w-8 h-8 md:ml-1 ml-3 mr-3 mt-3"
                  onClick={() => setHandleOpenEmoji((prev) => !prev)}
                />
                <input
                  ref={messageRef} // Attach the ref here
                  onKeyDown={handleKeyDown}
                  value={message}
                  onChange={handleTyping}
                  className="input_message"
                  placeholder="Enter Message here..."
                />
                <input
                  type="button"
                  value="Send"
                  name="User"
                  onClick={handleSend}
                  className="message_button px-3 py-1 mt-3 md:mr-1 mr-3"
                />
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
          <div className="all_chat_div">
            <h4 className="mt-4 mb-4 font-bold">All User List</h4>
            {userLists?.map((dt, key) => {
              return (
                <>
                  {dt.email === emailLocal?.email ? null : (
                    <div
                      className="flex md:justify-start md:pl-5 pl-2 justify-center flex-wrap  items-center gap-x-2 border-b-2 py-2 cursor-pointer"
                      key={key}
                      onClick={async () => {
                        if (reciverEmailAddress?.email !== dt?.email) {
                          setReciverEmailaddress({
                            email: dt.email,
                            reciverId: dt._id,
                            avatar: dt?.avatar,
                            userName: dt?.userName,
                            _id: dt?._id,
                          });
                          setReciverChatData(dt?._id);
                          const data1 = {
                            senderId: emailLocal?.userId,
                            reciverId: dt._id,
                          };
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
                      <div>
                        <p className="icon_text">
                          {dt?.email?.substring(0, 15)}
                          {dt?.email?.length <= 15 ? null : ".."}
                        </p>
                        <p className=" text-start md:pl-4 pl-2 text-gray-600">
                          {dt?.userName?.substring(0, 15)}
                          {dt?.userName?.length <= 15 ? null : ".."}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbox;

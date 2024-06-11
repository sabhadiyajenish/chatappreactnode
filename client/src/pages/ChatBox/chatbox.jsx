import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
// import { addTag, getAllTag } from "../../../store/tag/tagAction";
import "./chatbox.css";
import Glrs from "../../assets/image/grls.jpg";
// import SendIcon from "@mui/icons-material/Send";

// import { apiClient } from "../../../api/general";
import {
  addUserMessage,
  getAllUser,
  getConversation,
  getUserMessage,
} from "../../store/Message/authApi";
import { getOneUser } from "../../store/Users/userApi";
const SOCKET_URL = "http://localhost:2525";

const Chatbox = () => {
  const { userOneData } = useSelector((state) => state.userAuthData);
  const { tag, oneUserMessage, loading, conversationData, userLists } =
    useSelector((state) => state.messageData);

  const [socket, setSocket] = useState(null);
  const [userData, setUserDatas] = useState([]);
  const [userConversationData, setUserConversationDatas] = useState([]);
  const [activeUser, setActiveUser] = useState([]);
  const [message, setMessage] = useState("");
  const [emailLocal, setEmailLocal] = useState("");
  const [reciverEmailAddress, setReciverEmailaddress] = useState({
    email: "",
    reciverId: "",
    avatar: "",
  });
  const [countMessage, setCountMessage] = useState([
    { reciverId: "jenish", senderId: "jjs", firstMessage: "", count: 0 },
  ]);
  const [reciverChatData, setReciverChatData] = useState("");
  const [getMessage, setGetMessage] = useState([]);
  const [seeLoginActiveInfo, setLoginActiveInfo] = useState({
    online: false,
  });
  const messageDom = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    setGetMessage(oneUserMessage);
  }, [oneUserMessage]);

  useEffect(() => {
    if (userData?.length === 0) {
      setUserDatas(tag?.data);
    }
  }, [tag]);
  console.log("use coutn isd<<<<<<<<<", countMessage);
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
    setEmailLocal(JSON.parse(localStorage.getItem("userInfo")));
    dispatch(getOneUser());
    dispatch(getAllUser());
    const user = JSON.parse(localStorage.getItem("userInfo"));
    dispatch(getConversation(user?.userId));
  }, []);
  useEffect(() => {
    setUserConversationDatas(conversationData);
  }, [conversationData]);
  useEffect(() => {
    messageDom?.current?.scrollIntoView({ behavior: "smooth" });
  }, [getMessage]);
  useEffect(() => {
    setSocket(io(SOCKET_URL));
  }, []);

  useEffect(() => {
    socket?.emit("addUser", emailLocal?.userId);
    socket?.on("getUser", (user) => {
      //   console.log("user:=", user);
      setActiveUser(user);
    });
    socket?.on("getMessage", (user1) => {
      console.log("getMessage>>>:=", user1);
      // setActiveUser(user);
      setGetMessage((mess) => mess.concat(user1));
      setCountMessage((prevMessages) => {
        // Find if the reciverId already exists in the state
        const index = prevMessages.findIndex(
          (msg) => msg.senderId === user1[0]?.senderId
        );

        // If it exists, update the count
        if (index !== -1) {
          const updatedMessages = [...prevMessages];
          updatedMessages[index] = {
            ...updatedMessages[index],
            count: updatedMessages[index].count + 1,
          };
          return updatedMessages;
        } else {
          // If it doesn't exist, add a new entry
          return [
            ...prevMessages,
            {
              reciverId: user1[0]?.reciverId,
              senderId: user1[0]?.senderId,
              firstMessage: user1[0]?.message,
              count: 1,
            },
          ];
        }
      });

      // setCountMessage((prev) => [...prev,{reciverId:"",count: }]);
      // setButtonMessage((mes) => mes.concat(user1));
    });
    socket?.on("getUserData", (cate) => {
      console.log(cate);
      setUserDatas((mess) => mess.concat(cate));
    });
    setEmailLocal(JSON.parse(localStorage.getItem("userInfo")));
  }, [socket]);

  const handleSend = (e) => {
    e.preventDefault();
    if (e.target.name === "User") {
      if (message !== "") {
        console.log("click.... messaged", emailLocal);
        socket?.emit("addMessage", {
          message: message,
          senderId: emailLocal?.userId,
          reciverId: reciverEmailAddress?.reciverId,
        });

        const data = {
          senderId: emailLocal?.userId,
          conversationId: "",
          reciverId: reciverEmailAddress?.reciverId,
          message: message,
        };
        dispatch(addUserMessage(data));
        setMessage("");
      }
    } else {
      // socket?.emit("addUserData", ForData);
      // const data = {
      //   userName: ForData?.userName,
      //   email: ForData?.email,
      //   password: ForData?.password,
      // };
      // dispatch(addTag(data));
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
                      setReciverEmailaddress({
                        email: dt?.email,
                        reciverId: dt?._id,
                        avatar: dt?.avatar,
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
                        <h1 className="h-7 w-7 rounded-full  bg-[#00C000] text-white text-center flex justify-center items-center text-[18px]">
                          {itm?.count}
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
                <p className="icon_text">{reciverEmailAddress?.email}</p>
              </div>
              <div className="center_chat_div">
                {loading ? (
                  <div className="h-[80vh] flex justify-center items-center">
                    <h2 className=" text-4xl font-thin">Loading chat...</h2>
                  </div>
                ) : getMessage?.length === 0 ? (
                  <div className="h-[80vh] flex justify-center items-center">
                    <h2 className=" text-4xl font-thin">No Chat found</h2>
                  </div>
                ) : (
                  <>
                    {getMessage?.map((dt, key) => {
                      return dt.senderId === emailLocal?.userId ? (
                        <>
                          <div className="you_chat" key={key} ref={messageDom}>
                            <p className="you_chat_text">
                              {dt?.message}{" "}
                              <span className="text-[11px] text-gray-200">
                                {dt?.createdAt && formatDate(dt?.createdAt)}
                              </span>
                            </p>
                          </div>
                        </>
                      ) : reciverChatData === dt?.senderId ? (
                        <>
                          <div
                            className="you_chat_div"
                            key={key}
                            ref={messageDom}
                          >
                            <p className="you_chat_text1 ">
                              {dt?.message}{" "}
                              <span className="text-[11px] text-gray-200">
                                {dt?.createdAt && formatDate(dt?.createdAt)}
                              </span>
                            </p>
                          </div>
                        </>
                      ) : null;
                    })}{" "}
                  </>
                )}
              </div>
              <div className="center_input_div">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input_message"
                  placeholder="Enter Message here..."
                />
                <input
                  type="button"
                  value="Send"
                  name="User"
                  onClick={handleSend}
                  className="message_button px-3 py-1"
                />
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
                        setReciverEmailaddress({
                          email: dt.email,
                          reciverId: dt._id,
                          avatar: dt?.avatar,
                        });
                        setReciverChatData(dt?._id);
                        const data1 = {
                          senderId: emailLocal?.userId,
                          reciverId: dt._id,
                        };

                        dispatch(getUserMessage(data1));
                        // apiClient({
                        //   method: "POST",
                        //   url: `${API_URL.message.getMessage}`,
                        //   data: data1,
                        // })
                        //   .then((response) => {
                        //     console.log(">>>>>>data is>>>", response);
                        //     setGetMessage(response?.data);
                        //   })
                        //   .catch((error) => {});
                        // dispatch(getUserMessage(data));
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
      {/* <div>
        <div>
          <input
            name="userName"
            placeholder="userName"
            value={ForData.userName}
            onChange={handleSignup}
          />
          <input
            name="email"
            placeholder="email"
            value={ForData.email}
            onChange={handleSignup}
          />
          <input
            name="password"
            placeholder="Password"
            value={ForData.password}
            onChange={handleSignup}
          />
          <input
            type="button"
            value="submit"
            name="Login"
            onClick={handleSend}
          />
        </div>
        <div className="mt-5">
          <input value={message} onChange={(e) => setMessage(e.target.value)} />
          <input
            type="button"
            value="submit"
            name="User"
            onClick={handleSend}
          />
        </div>
        <div>
          <h1 style={{ color: "red" }}>User is := {emailLocal.email}</h1>
        </div>
        <div>
          <p>This is all Accouts here</p>
          {userData?.map((dt, key) => {
            // console.log("map log>>>>", dt);
            return <h3>{dt.email}</h3>;
          })}
        </div>
      </div> */}
    </>
  );
};

export default Chatbox;

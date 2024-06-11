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
  const { tag } = useSelector((state) => state.messageData);
  const { userOneData } = useSelector((state) => state.userAuthData);
  const { oneUserMessage, loading, conversationData, userLists } = useSelector(
    (state) => state.messageData
  );

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

  const [reciverChatData, setReciverChatData] = useState("");
  // const [buttonMessage, setButtonMessage] = useState([]);
  const [getMessage, setGetMessage] = useState([]);
  const [seeLoginActiveInfo, setLoginActiveInfo] = useState({
    online: false,
  });
  const [ForData, setForData] = useState({
    userName: "",
    email: "",
    password: "",
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
      // setButtonMessage((mes) => mes.concat(user1));
    });
    socket?.on("getUserData", (cate) => {
      console.log(cate);
      setUserDatas((mess) => mess.concat(cate));
    });
    setEmailLocal(JSON.parse(localStorage.getItem("userInfo")));
  }, [socket]);
  //   console.log(">>>>>>>>>>>", getMessage);
  // const handleSignup = (e) => {
  //   e.preventDefault();
  //   setForData({
  //     ...ForData,
  //     [e.target.name]: e.target.value,
  //   });
  // };
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

                      // apiClient({
                      //   method: "POST",
                      //   url: `${API_URL.message.getMessage}`,
                      //   data: data1,
                      // })
                      //   .then((response) => {
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
                    <p className="icon_text">{dt?.userName}</p>
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
                            <p className="you_chat_text">{dt?.message}</p>
                          </div>
                        </>
                      ) : reciverChatData === dt?.senderId ? (
                        <>
                          <div
                            className="you_chat_div"
                            key={key}
                            ref={messageDom}
                          >
                            <p className="you_chat_text1 ">{dt?.message}</p>
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
                        <p className="icon_text">{dt?.email}</p>
                        <p className=" text-start md:pl-4 pl-2 text-gray-600">
                          {dt?.userName}
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

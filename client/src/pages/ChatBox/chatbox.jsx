import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
// import { addTag, getAllTag } from "../../../store/tag/tagAction";
import "./chatbox.css";
import Glrs from "../../assets/image/grls.jpg";
// import SendIcon from "@mui/icons-material/Send";

// import { apiClient } from "../../../api/general";
import { addUserMessage, getAllUser } from "../../store/Message/authApi";
const SOCKET_URL = "http://localhost:2525";

const Chatbox = () => {
  const { tag, getMessageData, userLists } = useSelector(
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
  });
  // const [buttonMessage, setButtonMessage] = useState([]);
  const [getMessage, setGetMessage] = useState([]);
  const [ForData, setForData] = useState({
    userName: "",
    email: "",
    password: "",
  });
  const messageDom = useRef(null);
  const dispatch = useDispatch();
  // console.log(">>>data is>>>>", emailLocal.email);
  useEffect(() => {
    if (userData.length === 0) {
      setUserDatas(tag?.data);
    }
  }, [tag]);

  useEffect(() => {
    setEmailLocal(JSON.parse(localStorage.getItem("user")));
    dispatch(getAllUser());
    // dispatch(getConversation(JSON.parse(localStorage.getItem("user"))));
  }, []);
  useEffect(() => {
    setUserConversationDatas(getMessageData?.conversationData);
  }, [getMessageData?.conversationData]);
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
    setEmailLocal(JSON.parse(localStorage.getItem("user")));
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
        console.log("click.... messaged");
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
      socket?.emit("addUserData", ForData);
      const data = {
        userName: ForData?.userName,
        email: ForData?.email,
        password: ForData?.password,
      };
      // dispatch(addTag(data));
    }
  };

  return (
    <>
      <div className="main_chat_div">
        <div className="child1_chat_div">
          <div className="all_chat_div">
            <h4 style={{ borderBottom: "1px solid black" }}>
              {emailLocal?.email}
            </h4>
            {userConversationData?.map((dt, key) => {
              return (
                <>
                  <div
                    className="center_icon_div"
                    key={key}
                    onClick={async () => {
                      setReciverEmailaddress({
                        email: dt?.email,
                        reciverId: dt?._id,
                      });
                      // const data1 = {
                      //   senderId: emailLocal.userId,
                      //   reciverId: dt._id,
                      // };
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
                      <img alt="gdg" src={Glrs} className="img_girls_icon" />
                      {activeUser.map((dr, key1) => {
                        return dr?.userId === dt?._id ? (
                          <span className="online_icon online_icon_active"></span>
                        ) : (
                          ""
                        );
                      })}
                    </div>
                    <p className="icon_text">{dt?.email}</p>
                  </div>
                </>
              );
            })}
          </div>
          {reciverEmailAddress?.email === "" ? (
            <>
              <div>
                <h2>Chatting with people...</h2>
              </div>
            </>
          ) : (
            <div className="all_chat_div">
              <div className="center_icon_div">
                <img alt="gdg" src={Glrs} className="img_girls_icon" />
                <p className="icon_text">{reciverEmailAddress?.email}</p>
              </div>
              <div className="center_chat_div">
                {getMessage?.length === 0 ? (
                  <h3>No Chat Found..</h3>
                ) : (
                  <>
                    {getMessage?.map((dt, key) => {
                      return dt.senderId === emailLocal?.userId ? (
                        <>
                          <div className="you_chat" key={key} ref={messageDom}>
                            <p className="you_chat_text">{dt?.message}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            className="you_chat_div"
                            key={key}
                            ref={messageDom}
                          >
                            <p className="you_chat_text">{dt?.message}</p>
                          </div>
                        </>
                      );
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
                  className="message_button"
                />
              </div>
            </div>
          )}
          <div className="all_chat_div">
            <h4 style={{ borderBottom: "1px solid black" }}>All User List</h4>
            {userLists?.map((dt, key) => {
              return (
                <>
                  <div
                    className="center_icon_div"
                    key={key}
                    onClick={async () => {
                      setReciverEmailaddress({
                        email: dt.email,
                        reciverId: dt._id,
                      });
                      setEmailLocal(dt?.email);
                      // const data1 = {
                      //   senderId: emailLocal.userId,
                      //   reciverId: dt._id,
                      // };
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
                        className="img_girls_icon"
                      />
                      {activeUser.map((dr, key1) => {
                        return dr.userId === dt._id ? (
                          <span className="online_icon online_icon_active"></span>
                        ) : (
                          ""
                        );
                      })}
                    </div>
                    <p className="icon_text">{dt?.email}</p>
                  </div>
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

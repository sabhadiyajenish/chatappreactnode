import React, { useState } from "react";
import ChatItem from "./ChatItem";
import { MdAddCircle } from "react-icons/md";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { IoMdCloseCircle } from "react-icons/io";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 340,
  maxWidth: 400,
  minHeight: 350,
  bgcolor: "#344C64",
  border: "2px solid #000",
  borderRadius: "30px",
  boxShadow: 24,
  p: 2,
};
const ChatList = ({
  userConversationData,
  reciverEmailAddress,
  setReciverEmailaddress,
  setReciverChatData,
  emailLocal,
  dispatch,
  getUserMessage,
  countMessage,
  socket,
  updateSeenChatMessageData,
  deleteNotificationData,
  setCountMessage,
  activeUser,
  LastSeenUser,
  modeTheme,
  formatLastSeen,
  setShowMainpart,
  allUserListData,
  loadingUsers,
  searchUserByName,
  setSearchUserByName,
  setUserConversationDatas,
  setProductPageNumber,
}) => {
  const [openSearchModel, setOpenSearchModel] = useState(false);

  const handleClose = () => {
    setOpenSearchModel(false);
  };

  return (
    <>
      <div
        className={` 
       py-4 h-[90vh] overflow-y-scroll center_div_chatApp`}
      >
        <div className="lg:block flex justify-between items-center   ">
          <h1
            className={`text-center sm:text-[16px] text-[12px] font-medium pb-3 lg:ml-0 ml-2 ${
              modeTheme === "dark" ? "text-white" : null
            }`}
          >
            Your Chat
          </h1>
          <MdAddCircle
            className={`sm:w-10 sm:h-10 w-8 h-8 mt-[-8px] mr-1 lg:hidden block cursor-pointer ${
              modeTheme === "dark" ? "text-white" : "text-gray-600"
            }`}
            onClick={() => setOpenSearchModel(true)}
          />
        </div>

        {userConversationData?.map((dt, key) => {
          let checkLastSeen;
          let lastSeenText;
          if (LastSeenUser && typeof LastSeenUser === "object") {
            checkLastSeen = LastSeenUser.hasOwnProperty(dt._id)
              ? LastSeenUser[dt._id]
              : null;
            lastSeenText = checkLastSeen
              ? formatLastSeen(checkLastSeen)
              : "Last seen not available";
          }
          const checkOnorNot = !activeUser?.some((dr) => dr.userId === dt._id);
          return (
            <ChatItem
              index={key}
              key={key}
              dt={dt}
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
              checkLastSeen={checkLastSeen}
              lastSeenText={lastSeenText}
              checkOnorNot={checkOnorNot}
              modeTheme={modeTheme}
              setShowMainpart={setShowMainpart}
              setProductPageNumber={setProductPageNumber}
              setUserConversationDatas={setUserConversationDatas}
            />
          );
        })}
        {openSearchModel && (
          <Modal
            open={openSearchModel}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <div className="w-full p-0 m-0 flex justify-between items-center ">
                <h1 className="text-white ml-2 sm:text-[16px] text-[12px]">
                  All User List
                </h1>
                <IoMdCloseCircle
                  className={` sm:w-10 sm:h-10 w-8 h-8 float-right  mr-[-4px] ${
                    modeTheme === "dark" ? "text-white" : null
                  }`}
                  onClick={handleClose}
                />
              </div>
              <div className="w-full mt-3">
                <div
                  className={`relative flex items-center w-full h-12 rounded-full mb-3 focus-within:shadow-lg ${
                    modeTheme === "dark"
                      ? "border border-sky-100 bg-dark"
                      : "bg-white"
                  }  overflow-hidden`}
                >
                  <div className="grid place-items-center h-full w-16 text-gray-300">
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
              <div className=" max-h-96 overflow-y-scroll">
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
                            className={`flex  md:pl-5 pl-2 justify-start gap-3 flex-wrap font-medium ${
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

                                  dispatch(
                                    updateSeenChatMessageData(dataForSeen)
                                  );
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

                                dispatch(getUserMessage(data1));
                                setShowMainpart(true);
                                handleClose();
                              }
                            }}
                          >
                            <div style={{ position: "relative" }}>
                              <img
                                alt="gdg"
                                src={dt?.avatar ? dt?.avatar : Glrs}
                                className=" w-12 h-12 rounded-full object-cover"
                              />
                              {activeUser.map((dr, key1) => {
                                return dr.userId === dt._id ? (
                                  <span
                                    className=" absolute bottom-0 right-1 bg-[#4CBB17] sm:w-4 w-3 sm:h-4 h-3 rounded-full"
                                    key={key1}
                                  ></span>
                                ) : (
                                  ""
                                );
                              })}
                            </div>
                            <div>
                              <p
                                className={` text-[13px] ${
                                  modeTheme === "dark" ? "text-white" : null
                                }`}
                              >
                                {dt?.email?.substring(0, 25)}
                                {dt?.email?.length <= 25 ? null : ".."}
                              </p>
                              <p
                                className={` text-[13px] text-start ${
                                  modeTheme === "dark"
                                    ? "text-[#b7d7e8]"
                                    : "text-gray-600"
                                }  `}
                              >
                                {dt?.userName?.substring(0, 20)}
                                {dt?.userName?.length <= 20 ? null : ".."}
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })
                )}
              </div>
            </Box>
          </Modal>
        )}
      </div>
    </>
  );
};

export default React.memo(ChatList);

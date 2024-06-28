import React from "react";
import ChatItem from "./ChatItem";

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
  formatLastSeen,
}) => (
  <>
    <div className="bg-white py-4 h-[83vh] overflow-y-scroll">
      <h1 className="text-center font-medium pb-3">Your Chat</h1>
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
          />
        );
      })}
    </div>
  </>
);

export default React.memo(ChatList);

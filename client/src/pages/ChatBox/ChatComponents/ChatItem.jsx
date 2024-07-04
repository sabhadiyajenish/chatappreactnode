import { useEffect, useRef, useState } from "react";
import Glrs from "../../../assets/image/grls.jpg";

const ChatItem = ({
  dt,
  index,
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
  checkLastSeen,
  lastSeenText,
  checkOnorNot,
  modeTheme,
}) => {
  return (
    <div
      key={index}
      className={`lg:flex ${
        reciverEmailAddress?.email === dt.email
          ? modeTheme === "dark"
            ? "bg-[#526D82] text-[#DDE6ED]"
            : "bg-[#bce2d4] text-black "
          : modeTheme === "dark"
          ? "bg-[#27374D]"
          : "bg-[#034f84]"
      }  md:justify-between md:pl-5 pl-2 justify-center flex-wrap items-center gap-x-2  py-2 my-2 mx-3 rounded-md cursor-pointer `}
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
          if (Array.isArray(setCount) && setCount?.length !== 0) {
            localStorage.setItem("userCountInfo", JSON.stringify(setCount));
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
        }
      }}
    >
      <div className="flex  items-center">
        <div style={{ position: "relative" }}>
          <img
            alt="gdg"
            src={dt?.avatar || Glrs}
            className="lg:w-16 md:w-12 w-10 lg:h-16 md:h-12 h-10  rounded-full"
          />
          {activeUser.map((dr, key1) =>
            dr?.userId === dt?._id ? (
              <span
                className="absolute bottom-0 right-1 bg-[#4CBB17] w-4 h-4 rounded-full"
                key={key1}
              ></span>
            ) : (
              ""
            )
          )}
        </div>
        <div className="lg:ml-8 md:ml-3 ml-2">
          <p
            className={`${
              reciverEmailAddress?.email === dt.email
                ? modeTheme === "dark"
                  ? "text-white "
                  : " text-black "
                : " text-white text-[18px]"
            } text-start  font-semibold`}
          >
            {dt?.userName?.substring(0, 10)}
            {dt?.userName?.length <= 10 ? null : ".."}
          </p>
          {countMessage?.map((itm, key1) =>
            itm.senderId === dt._id ? (
              <p
                className="text-[#00C000] text-start lg:w-[8rem] md:w-[6rem] w-[5rem]"
                key={key1}
              >
                {itm?.firstMessage?.substring(0, 10)}
                {itm?.firstMessage?.length <= 10 ? null : ".."}
              </p>
            ) : null
          )}
          {checkOnorNot && checkLastSeen ? (
            <p
              className={` ${
                reciverEmailAddress?.email === dt.email
                  ? modeTheme === "dark"
                    ? "text-[#DDE6ED]"
                    : "text-[#65448d]"
                  : "text-[#dfd7e9]"
              } text-[15px] mt-1 text-center`}
            >
              {checkOnorNot && checkLastSeen && lastSeenText}
            </p>
          ) : null}
        </div>
      </div>
      {countMessage?.map((itm, key1) =>
        itm.senderId === dt._id ? (
          <div className="mr-3" key={key1}>
            <h1 className="h-7 w-7 rounded-full bg-[#00C000] text-white text-center flex justify-center items-center text-[15px]">
              {itm?.count < 10 ? itm?.count : "9+"}
            </h1>
          </div>
        ) : null
      )}
    </div>
  );
};

export default ChatItem;

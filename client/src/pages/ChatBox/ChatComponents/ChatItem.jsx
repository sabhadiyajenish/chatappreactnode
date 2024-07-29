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
  setShowMainpart,
  setProductPageNumber,
}) => {
  const [seenMessageDate, setSeenMessageDate] = useState("");
  const [sentMessageDate, setSentMessageDate] = useState("");

  const updateTimeDifference = () => {
    const seenMessage = dt?.userLastMessages?.find(
      (item) =>
        item?.userId === emailLocal?.userId &&
        item?.messageId !== null &&
        item?.messageId?.seen === true
    );
    const unreadMessage = dt?.userLastMessages?.find(
      (item) =>
        item?.userId === emailLocal?.userId &&
        item?.messageId !== null &&
        item?.messageId?.seen !== true
    );
    if (seenMessage) {
      const createdAt = new Date(seenMessage?.messageId?.createdAt);
      setSeenMessageDate(formatTimeDifference(createdAt));
    }
    if (unreadMessage) {
      const createdAt = new Date(unreadMessage?.messageId?.createdAt);
      setSentMessageDate(formatTimeDifference(createdAt));
    }
  };

  useEffect(() => {
    updateTimeDifference(); // Initial update

    // Set up an interval to update the time difference every minute
    const intervalId = setInterval(() => {
      updateTimeDifference();
    }, 60000); // 60,000 ms = 1 minute

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [dt, emailLocal?.userId]);

  const formatTimeDifference = (previousDate) => {
    const currentDateTime = new Date();
    const previousDateTime = new Date(previousDate);

    const timeDifference =
      currentDateTime.getTime() - previousDateTime.getTime();
    const secondsDifference = Math.floor(timeDifference / 1000);

    // Handle different time units: seconds, minutes, hours, days, weeks, etc.
    if (secondsDifference < 60) {
      // return `${secondsDifference} sec${
      //   secondsDifference !== 1 ? "s" : ""
      // } ago`;
      return `just now`;
    } else if (secondsDifference < 3600) {
      const minutesDifference = Math.floor(secondsDifference / 60);
      return `${minutesDifference} min${
        minutesDifference !== 1 ? "s" : ""
      } ago`;
    } else if (secondsDifference < 86400) {
      const hoursDifference = Math.floor(secondsDifference / 3600);
      return `${hoursDifference} hour${hoursDifference !== 1 ? "s" : ""} ago`;
    } else {
      const daysDifference = Math.floor(secondsDifference / 86400);
      return `${daysDifference} day${daysDifference !== 1 ? "s" : ""} ago`;
    }
  };
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
      }  md:justify-between md:pl-5 pl-2 justify-center flex-wrap items-center gap-x-2 min-h-16  py-2 md:my-2 my-[6px] md:mx-3 mx-[6px] rounded-md cursor-pointer `}
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
          setShowMainpart(true);
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
          setProductPageNumber(1);
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
        }
      }}
    >
      <div className="flex justify-between items-center  w-full ">
        <div className="flex items-center">
          <div style={{ position: "relative" }}>
            <img
              alt="gdg"
              src={dt?.avatar || Glrs}
              className="lg:w-16 md:w-12 w-12 lg:h-16 md:h-12 h-12  rounded-full object-cover"
            />
            {activeUser.map((dr, key1) =>
              dr?.userId === dt?._id ? (
                <span
                  className="absolute bottom-0 right-1 bg-[#4CBB17] sm:w-4 sm:h-4 w-3 h-3 rounded-full"
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
                  : " text-white"
              } sm:text-[15px] text-[13px] text-start  font-semibold `}
            >
              {dt?.userName?.substring(0, 10)}
              {dt?.userName?.length <= 10 ? null : ".."}
            </p>
            {countMessage?.map((itm, key1) =>
              itm.senderId === dt._id ? (
                <p
                  className="text-[#00C000] text-start lg:w-[8rem] md:w-[6rem] w-[5rem] sm:text-[15px] text-[14px]"
                  key={key1}
                >
                  {itm?.firstMessage?.substring(0, 10)}
                  {itm?.firstMessage?.length <= 10 ? null : ".."}
                </p>
              ) : null
            )}
            {sentMessageDate ? (
              <p
                className={`${
                  modeTheme === "dark" ? "text-[#DDE6ED]" : "text-[#65448d]"
                } mt-1 text-center sm:text-[15px] text-[14px]`}
              >
                Sent {sentMessageDate}
              </p>
            ) : seenMessageDate ? (
              <p
                className={`${
                  modeTheme === "dark" ? "text-[#DDE6ED]" : "text-[#65448d]"
                } mt-1 text-center sm:text-[15px] text-[14px]`}
              >
                seen {seenMessageDate}
              </p>
            ) : checkOnorNot && checkLastSeen ? (
              <p
                className={`${
                  reciverEmailAddress?.email === dt.email
                    ? modeTheme === "dark"
                      ? "text-[#DDE6ED]"
                      : "text-[#65448d]"
                    : "text-[#dfd7e9]"
                } mt-1 text-center sm:text-[15px] text-[14px]`}
              >
                {lastSeenText}
              </p>
            ) : null}
          </div>
        </div>
        {countMessage?.map((itm, key1) =>
          itm.senderId === dt._id ? (
            <div className="mr-3" key={key1}>
              <h1 className="sm:h-7 sm:w-7 w-5 h-5 rounded-full  bg-[#00C000] text-white text-center flex justify-center items-center sm:text-[15px] text-[12px] font-mono">
                {itm?.count < 10 ? itm?.count : "9+"}
              </h1>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};

export default ChatItem;

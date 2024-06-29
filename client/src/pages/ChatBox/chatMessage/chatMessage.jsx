import "../chatbox.css";
import { Menu, Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useState } from "react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { deleteMessageData } from "../../../store/Message/authApi";
import { useDispatch } from "react-redux";
import { SiTicktick } from "react-icons/si";
import ChatImageModal from "./chatImageModal";
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

const ChatMessage = ({
  dt,
  indexKey,
  emailLocal,
  reciverChatData,
  socket,
  date,
  messageDom,
  getMessage,
  setGetMessage,
  reciverEmailAddress,
  lastMessageIndex,
  activeUser,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(false);

  const dispatch = useDispatch();
  const todayDate = new Date();
  const TodayDateOnly = todayDate.toISOString().split("T")[0];
  const yesterday = new Date(todayDate);
  yesterday.setDate(todayDate.getDate() - 1);
  const yesterdayDate = yesterday.toISOString().split("T")[0];
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  const handleOpenImageModel = (imges) => {
    setImageUrl(imges);
    setOpen(true);
  };
  const toggleReadMore = () => {
    setIsExpanded(!isExpanded);
  };
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
  // if (indexKey === lastMessageIndex && !dt.seen) {
  //   setInterval(() => {
  //   dateSetForUpdated =  formatTimeDifference(new Date(dt.seenAt));
  //   }, 5000);
  // }
  const handleDownload = (imageUrl) => {
    fetch(imageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "image.jpg");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error("Error downloading image:", error);
      });
  };
  return (
    <>
      {" "}
      {dt.senderId === emailLocal?.userId && dt?.userDelete === false ? (
        <>
          {dt.senderId === emailLocal?.userId && !dt.userDelete && (
            <div
              className="you_chat md:pl-20 pl-5 "
              key={indexKey}
              ref={messageDom}
            >
              {dt.message ? (
                <p className="you_chat_text pl-2 text-start pr-2 py-1 chat_time">
                  {isExpanded ? dt.message : dt.message.slice(0, 300)}
                  {dt.message.length > 300 && (
                    <span
                      className="text-blue-500 cursor-pointer"
                      onClick={toggleReadMore}
                    >
                      {isExpanded ? " read Less" : "... read More"}
                    </span>
                  )}{" "}
                  <span className="text-[11px] text-gray-200 ml-1">
                    {dt.createdAt && formatDate(dt.createdAt)}
                  </span>
                </p>
              ) : dt.avatar ? (
                <div className="you_chat_text mr-3 p-0 bg-white text-start chat_time relative mt-2">
                  <img
                    src={dt.avatar}
                    alt="image"
                    height={200}
                    width={200}
                    className=" cursor-pointer"
                    onClick={() => handleOpenImageModel(dt?.avatar)}
                  />
                  <span className="text-[11px] text-gray-700 float-end absolute bottom-0 right-1">
                    {dt.createdAt && formatDate(dt.createdAt)}
                  </span>
                </div>
              ) : null}

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
                            active ? "w-full bg-gray-100" : "",
                            "w-full block px-2 py-2 text-sm text-gray-700"
                          )}
                          onClick={() => {
                            const uniqueData = getMessage[date]?.filter(
                              (items) => items?.uniqueId !== dt?.uniqueId
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
                            dispatch(deleteMessageData(data));
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
                              active ? "w-full bg-gray-100" : "",
                              "w-full block px-4 py-2 text-sm text-gray-700"
                            )}
                            onClick={() => {
                              socket?.emit("deleteMessageFromBoth", {
                                senderId: emailLocal?.userId,
                                reciverId: reciverEmailAddress?.reciverId,
                                date: date,
                                uniqueId: dt?.uniqueId,
                              });
                            }}
                          >
                            delete both
                          </button>
                        )}
                      </Menu.Item>
                    )}
                    {dt?.avatar && (
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={classNames(
                              active ? "w-full bg-gray-100" : "",
                              "w-full block px-2 py-2 text-sm text-gray-700"
                            )}
                            onClick={() => handleDownload(dt?.avatar)}
                          >
                            download
                          </button>
                        )}
                      </Menu.Item>
                    )}
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          )}

          {indexKey === lastMessageIndex && dt.seen && (
            <div className="text-end mr-6 mb-2 text-blue-500">
              <p> Seen {formatTimeDifference(new Date(dt.seenAt))}.</p>
            </div>
          )}

          {indexKey === lastMessageIndex && !dt.seen && (
            <div className="text-end mr-6 mb-4 text-blue-500">
              <SiTicktick className="text-end float-right h-4 w-4 mt-1" />
            </div>
          )}
        </>
      ) : reciverChatData === dt?.senderId && dt?.reciverDelete === false ? (
        <>
          <div
            className="you_chat_div md:mr-20 mr-5 flex"
            key={indexKey}
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
                          active ? "w-full bg-gray-100" : "",
                          "w-full block px-2 py-2 text-sm text-gray-700"
                        )}
                        onClick={() => {
                          const uniqueData = getMessage[date]?.filter(
                            (items) => items?.uniqueId !== dt?.uniqueId
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
                          dispatch(deleteMessageData(data));
                        }}
                      >
                        delete for Me
                      </button>
                    )}
                  </Menu.Item>
                  {dt?.avatar && (
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={classNames(
                            active ? "w-full bg-gray-100" : "",
                            "w-full block px-2 py-2 text-sm text-gray-700"
                          )}
                          onClick={() => handleDownload(dt?.avatar)}
                        >
                          download
                        </button>
                      )}
                    </Menu.Item>
                  )}
                </Menu.Items>
              </Transition>
            </Menu>
            {dt?.message ? (
              <p className="you_chat_text1 text-start chat_time1 ">
                {isExpanded ? dt?.message : dt?.message?.slice(0, 300)}
                {dt?.message?.length > 300 && (
                  <span
                    className="text-blue-500 cursor-pointer"
                    onClick={toggleReadMore}
                  >
                    {isExpanded ? " read Less" : "... read More"}
                  </span>
                )}

                <span className="text-[11px] text-gray-200 ml-1">
                  {dt?.createdAt && formatDate(dt?.createdAt)}
                  {/* {isSeen && lastMessageIndex && "seen"} */}
                </span>
              </p>
            ) : dt?.avatar ? (
              <div className="you_chat_text mr-3 p-0 bg-white text-start chat_time relative mt-2">
                <img
                  src={dt?.avatar}
                  alt="image"
                  className=" cursor-pointer"
                  height={200}
                  width={200}
                  onClick={() => handleOpenImageModel(dt?.avatar)}
                />
                <span className="text-[11px] text-gray-700  absolute bottom-0 right-1">
                  {dt?.createdAt && formatDate(dt?.createdAt)}
                  {/* {isSeen && lastMessageIndex && "seen"} */}
                </span>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
      <ChatImageModal
        open={open}
        handleClose={() => {
          setOpen(false), setImageUrl(false);
        }}
        imageUrl={imageUrl}
      />
    </>
  );
};

export default React.memo(ChatMessage);

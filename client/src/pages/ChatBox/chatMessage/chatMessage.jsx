import "../chatbox.css";
import { Menu, Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useState } from "react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { deleteMessageData } from "../../../store/Message/authApi";
import { useDispatch } from "react-redux";
import { SiTicktick } from "react-icons/si";
import ChatImageModal from "./chatImageModal";
import MapPreview from "../ChatComponents/MapPreview";
import { FcDocument } from "react-icons/fc";
import { RiDownloadCloudLine } from "react-icons/ri";
import {
  formatBytes,
  truncateFileName,
  truncateFileNameViaMessage,
} from "../ChatComponents/ButtonModel";

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
  latestDate,
  setGetMessage,
  reciverEmailAddress,
  lastMessageIndex,
  activeUser,
  modeTheme,
  pageLoadingonScroll,
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
  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${dt?.latitude},${dt?.longitude}`;
    window.open(url, "_blank");
  };
  const getFileTypeFromUrl = (fileUrl) => {
    const urlParts = fileUrl.split(".");
    const extension = urlParts[urlParts.length - 1].toLowerCase(); // Get the extension part and convert to lowercase

    switch (extension) {
      case "pdf":
        return "pdf";
      case "zip":
        return "zip";
      case "doc":
      case "docx":
        return "doc"; // Example for other file types, add more cases as needed
      default:
        return null; // Unknown file type
    }
  };
  const handleDownloadfile = async (fileUrl) => {
    try {
      const fileType = getFileTypeFromUrl(fileUrl);

      if (!fileType) {
        throw new Error("Unable to determine file type.");
      }

      const response = await fetch(fileUrl, {
        method: "GET",
        headers: {
          Authorization: `API-Key ${673335253975921}`,
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
      });

      const blob = await response.blob();

      // Create a temporary anchor element
      const downloadLink = document.createElement("a");
      downloadLink.href = window.URL.createObjectURL(new Blob([blob]));
      downloadLink.setAttribute("download", `file.${fileType}`);

      // Append the anchor element to the body
      document.body.appendChild(downloadLink);

      // Click the link to trigger the download
      downloadLink.click();

      // Clean up: remove the temporary link
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const handleClickForDownloadFiles = (url) => {
    const fileUrl = url;
    console.log("file url is ", fileUrl);
    handleDownloadfile(fileUrl);
  };

  return (
    <>
      {dt.senderId === emailLocal?.userId &&
      dt.reciverId === reciverEmailAddress?.reciverId &&
      dt?.userDelete === false ? (
        <>
          {dt.senderId === emailLocal?.userId && !dt.userDelete && (
            <div className="you_chat md:pl-20 pl-12" key={indexKey}>
              {dt.message ? (
                <p
                  className={`you_chat_text sm:text-[20px] text-[15px] pl-2 text-start pr-2 py-1 chat_time ${
                    modeTheme === "dark"
                      ? "bg-[#27374D] text-[#DDE6ED]"
                      : "bg-[#25d366] text-white"
                  } `}
                  ref={
                    date === latestDate &&
                    indexKey === lastMessageIndex &&
                    pageLoadingonScroll === false
                      ? messageDom
                      : null
                  }
                >
                  {isExpanded ? dt.message : dt.message.slice(0, 300)}
                  {dt.message.length > 300 && (
                    <span
                      className="text-blue-500 cursor-pointer"
                      onClick={toggleReadMore}
                    >
                      {isExpanded ? " read Less" : "... read More"}
                    </span>
                  )}{" "}
                  <span className="sm:text-[11px] text-[9px] text-gray-200 ml-1">
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
                    ref={
                      date === latestDate &&
                      indexKey === lastMessageIndex &&
                      pageLoadingonScroll === false
                        ? messageDom
                        : null
                    }
                  />
                  <span
                    className={`text-[11px] ${
                      modeTheme === "dark" ? " text-white" : "text-blue-300"
                    }  float-end absolute bottom-0 right-1`}
                  >
                    {dt.createdAt && formatDate(dt.createdAt)}
                  </span>
                </div>
              ) : dt.avatarVideo ? (
                <div className="you_chat_text mr-3 p-0 bg-white text-start chat_time relative mt-2">
                  <video controls width="270" className="text-black">
                    <source src={dt.avatarVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <span
                    className={`text-[11px] ${
                      modeTheme === "dark" ? " text-white" : "text-blue-300"
                    }  float-end absolute bottom-0 right-1`}
                  >
                    {dt.createdAt && formatDate(dt.createdAt)}
                  </span>
                </div>
              ) : dt.latitude && dt.longitude ? (
                <div className="flex items-center justify-center md:h-40 h-28 md:w-80 w-60 mr-1  border-[2px] border-red-500 relative cursor-pointer">
                  <img
                    src="https://img.freepik.com/premium-vector/map-with-destination-location-point-city-map-with-street-river-gps-map-navigator-concept_34645-1078.jpg"
                    className="w-full h-full object-cover"
                    onClick={openGoogleMaps}
                  />
                  <p
                    className={` absolute bottom-0 right-0  bg-black text-white px-2 font-mono `}
                  >
                    Current Location{" "}
                    <span className="sm:text-[11px] text-[9px] text-gray-200 ml-1">
                      {dt.createdAt && formatDate(dt.createdAt)}
                    </span>
                  </p>
                  {/* <MapPreview latitude={dt.latitude} longitude={dt.longitude} /> */}
                </div>
              ) : dt.fileDocsPdf ? (
                <div className="md:w-80 w-60 h-20 border-[1px] mr-2 border-green-400 rounded-md flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-16 h-full bg-green-200">
                      <FcDocument className="w-12 h-20 ml-2" />
                    </div>
                    <div className=" ml-2">
                      <p
                        className={`font-medium text-start  ${
                          modeTheme === "dark" ? "text-white" : null
                        }`}
                      >
                        {truncateFileNameViaMessage(dt.fileDocsPdf?.name, 20)}
                      </p>
                      <p
                        className={`font-medium text-start  ${
                          modeTheme === "dark" ? "text-white" : null
                        }`}
                      >
                        {formatBytes(dt.fileDocsPdf?.size)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <RiDownloadCloudLine
                      onClick={() =>
                        handleClickForDownloadFiles(dt.fileDocsPdf?.filePath)
                      }
                      className={` w-12 h-12 mr-1  cursor-pointer ${
                        modeTheme === "dark" ? "text-white" : null
                      }`}
                    />
                  </div>
                </div>
              ) : null}

              <Menu as="div" className="relative">
                <Menu.Button>
                  <HiOutlineDotsVertical
                    className={`mt-[10px] -ml-1 mr-1 cursor-pointer ${
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
                  <Menu.Items className="absolute  top-[-60px] right-2 z-50 mt-2 w-32 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={classNames(
                            active ? "w-full bg-gray-100" : "",
                            "w-full block md:px-4 px-2 text-center md:py-2 py-1 text-sm text-gray-700"
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
                              reciverId: reciverEmailAddress?.reciverId,
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
                              "w-full block md:px-4 px-2 text-center md:py-2 py-1 text-sm text-gray-700"
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
                              "w-full block md:px-4 px-2 text-center md:py-2 py-1 text-sm text-gray-700"
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

          {date === latestDate && indexKey === lastMessageIndex && dt.seen && (
            <div
              className={`text-end mr-6 mb-4 sm:text-[16px] text-[12px] ${
                modeTheme === "dark" ? "text-[#E0D8D1]" : "text-blue-500"
              }`}
            >
              <p> Seen {formatTimeDifference(new Date(dt.seenAt))}.</p>
            </div>
          )}

          {date === latestDate && indexKey === lastMessageIndex && !dt.seen && (
            <div className="text-end mr-6 mb-4 text-blue-500">
              <SiTicktick className="text-end float-right h-4 w-4 mt-1" />
            </div>
          )}
        </>
      ) : reciverChatData === dt?.senderId && dt?.reciverDelete === false ? (
        <>
          <div
            className="you_chat_div md:mr-20 mr-5 flex mb-2"
            key={indexKey}
            ref={
              date === latestDate &&
              indexKey === lastMessageIndex &&
              pageLoadingonScroll === false
                ? messageDom
                : null
            }
          >
            {/* <HiOutlineDotsVertical className="ml-1 -mr-1 mt-[10px] cursor-pointer " /> */}
            <Menu as="div" className="relative">
              <Menu.Button>
                <HiOutlineDotsVertical
                  className={`ml-1 z-10 -mr-1 mt-[10px] cursor-pointer ${
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
                <Menu.Items className="absolute top-[-60px] z-50 mt-2 ml-3 w-32 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={classNames(
                          active ? "w-full bg-gray-100" : "",
                          "w-full block md:px-4 px-2 text-center md:py-2 py-1 text-sm text-gray-700"
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
                            reciverId: reciverEmailAddress?.reciverId,
                            senderId: emailLocal?.userId,
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
                            "w-full block md:px-4 px-2 text-center md:py-2 py-1 text-sm text-gray-700"
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
              <p
                className={`you_chat_text1 sm:text-[20px] text-[15px]  text-start chat_time1 ${
                  modeTheme === "dark"
                    ? "bg-[#526D82] text-[#DDE6ED]"
                    : "bg-[#075e54] text-white"
                } `}
              >
                {isExpanded ? dt?.message : dt?.message?.slice(0, 300)}
                {dt?.message?.length > 300 && (
                  <span
                    className="text-blue-500 cursor-pointer"
                    onClick={toggleReadMore}
                  >
                    {isExpanded ? " read Less" : "... read More"}
                  </span>
                )}

                <span className="text-[11px] text-gray-200 ml-2">
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
                <span
                  className={`text-[11px] ${
                    modeTheme === "dark" ? " text-white" : "text-blue-300"
                  } absolute bottom-0 right-1`}
                >
                  {dt?.createdAt && formatDate(dt?.createdAt)}
                  {/* {isSeen && lastMessageIndex && "seen"} */}
                </span>
              </div>
            ) : dt.avatarVideo ? (
              <div className="you_chat_text mr-3 p-0 bg-white text-start chat_time relative mt-2">
                <video controls width="270" className="text-black">
                  <source src={dt.avatarVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <span
                  className={`text-[11px] ${
                    modeTheme === "dark" ? " text-white" : "text-blue-300"
                  }  float-end absolute bottom-0 right-1`}
                >
                  {dt.createdAt && formatDate(dt.createdAt)}
                </span>
              </div>
            ) : dt.latitude && dt.longitude ? (
              <div className="flex items-center justify-center md:h-40 h-28 md:w-80 w-60 ml-1  border-[2px] border-red-500 relative cursor-pointer">
                <img
                  src="https://img.freepik.com/premium-vector/map-with-destination-location-point-city-map-with-street-river-gps-map-navigator-concept_34645-1078.jpg"
                  className="w-full h-full object-cover"
                  onClick={openGoogleMaps}
                />
                <p
                  className={` absolute bottom-0 right-0  bg-black text-white px-2 font-mono `}
                >
                  Current Location{" "}
                  <span className="sm:text-[11px] text-[9px] text-gray-200 ml-1">
                    {dt.createdAt && formatDate(dt.createdAt)}
                  </span>
                </p>

                {/* <MapPreview latitude={dt.latitude} longitude={dt.longitude} /> */}
              </div>
            ) : dt.fileDocsPdf ? (
              <div className="md:w-80 w-60 h-20 border-[1px] ml-2 border-green-400 rounded-md flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-16 h-full bg-green-200">
                    <FcDocument className="w-12 h-20 ml-2" />
                  </div>
                  <div className=" ml-2">
                    <p
                      className={`font-medium text-start  ${
                        modeTheme === "dark" ? "text-white" : null
                      }`}
                    >
                      {truncateFileNameViaMessage(dt.fileDocsPdf?.name, 20)}
                    </p>
                    <p
                      className={`font-medium text-start  ${
                        modeTheme === "dark" ? "text-white" : null
                      }`}
                    >
                      {formatBytes(dt.fileDocsPdf?.size)}
                    </p>
                  </div>
                </div>
                <div>
                  <RiDownloadCloudLine
                    onClick={() =>
                      handleClickForDownloadFiles(dt.fileDocsPdf?.filePath)
                    }
                    className={` w-12 h-12 mr-1  cursor-pointer ${
                      modeTheme === "dark" ? "text-white" : null
                    }`}
                  />
                </div>
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

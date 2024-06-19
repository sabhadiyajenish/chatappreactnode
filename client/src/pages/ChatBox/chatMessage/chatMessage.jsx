import "../chatbox.css";
import { Menu, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { deleteMessageData } from "../../../store/Message/authApi";
import { useDispatch } from "react-redux";
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
  key,
  emailLocal,
  reciverChatData,
  socket,
  date,
  messageDom,
  getMessage,
  setGetMessage,
  reciverEmailAddress,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const dispatch = useDispatch();
  const todayDate = new Date();
  const TodayDateOnly = todayDate.toISOString().split("T")[0];
  const yesterday = new Date(todayDate);
  yesterday.setDate(todayDate.getDate() - 1);
  const yesterdayDate = yesterday.toISOString().split("T")[0];
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  const toggleReadMore = () => {
    setIsExpanded(!isExpanded);
  };
  return dt.senderId === emailLocal?.userId && dt?.userDelete === false ? (
    <>
      <div className="you_chat md:pl-20 pl-5 " key={key} ref={messageDom}>
        <p className="you_chat_text pl-2 text-start pr-2 py-1">
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
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </>
  ) : reciverChatData === dt?.senderId && dt?.reciverDelete === false ? (
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
            </Menu.Items>
          </Transition>
        </Menu>
        <p className="you_chat_text1 text-start  ">
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
          </span>
        </p>
      </div>
    </>
  ) : null;
};

export default ChatMessage;

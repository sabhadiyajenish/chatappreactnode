import React from "react";
import Glrs from "../../../assets/image/grls.jpg";

const ChatHeader = ({
  userOneData,
  emailLocal,
  seeLoginActiveInfo,
  setModeTheme,
  modeTheme,
}) => (
  <div
    style={{ borderBottom: "1px solid black" }}
    className={`p-1 flex md:gap-0 gap-x-4 justify-center items-center flex-wrap ${
      modeTheme === "dark" ? "bg-[#272626]" : "bg-[#d5e1df]"
    } `}
  >
    <div className="relative">
      <img
        alt="gdg"
        src={userOneData?.avatar || Glrs}
        className="sm:w-16 w-10 sm:h-16 h-10 rounded-full object-cover border-2  border-red-300"
      />
      {seeLoginActiveInfo?.online && (
        <span className="absolute bottom-0 right-1 bg-[#4CBB17] sm:w-4 w-3 sm:h-4 h-3 rounded-full"></span>
      )}
    </div>
    <div className="md:ml-3 ml-1">
      <h1
        className={`p-2 font-bold lg:text-start sm:text-[16px] text-[12px] ${
          modeTheme === "dark" ? "text-white" : null
        }`}
      >
        Me
      </h1>
      <h4
        className={`ml-2 sm:text-[16px] text-[12px] ${
          modeTheme === "dark" ? "text-white" : null
        }`}
      >
        {emailLocal?.email}
      </h4>
    </div>
    <label className="inline-flex items-center cursor-pointer md:ml-10">
      <input
        type="checkbox"
        value={modeTheme}
        className="sr-only peer"
        onChange={(e) => {
          setModeTheme((prev) => (prev === "dark" ? "light" : "dark"));
          localStorage.setItem(
            "Theme",
            e.target.value === "dark" ? "light" : "dark"
          );
        }}
      />
      <div className="relative w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4  rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
      <span
        className={`ms-3 sm:text-[16px] text-[12px] font-medium  dark:text-gray-300  ${
          modeTheme === "dark" ? "text-white" : "text-black"
        }`}
      >
        {modeTheme === "dark" ? "Dark" : "Light"}
      </span>
    </label>
  </div>
);

export default React.memo(ChatHeader);

import React from "react";
import Glrs from "../../../assets/image/grls.jpg";

const ChatHeader = ({ userOneData, emailLocal, seeLoginActiveInfo }) => (
  <div
    style={{ borderBottom: "1px solid black" }}
    className="mt-2 p-4 flex justify-center items-center flex-wrap bg-[#d5e1df]"
  >
    <div className="relative">
      <img
        alt="gdg"
        src={userOneData?.avatar || Glrs}
        className="w-16 h-16 rounded-full border-2  border-red-300"
      />
      {seeLoginActiveInfo?.online && (
        <span className="absolute bottom-0 right-1 bg-[#4CBB17] w-4 h-4 rounded-full"></span>
      )}
    </div>
    <div className="md:ml-3 ml-1">
      <h1 className="p-2 font-bold lg:text-start">Me</h1>
      <h4 className="ml-2">{emailLocal?.email}</h4>
    </div>
  </div>
);

export default React.memo(ChatHeader);

import React from "react";
import Glrs from "../../../assets/image/grls.jpg";

const ChatHeader = ({ userOneData, emailLocal, seeLoginActiveInfo }) => (
  <div
    style={{ borderBottom: "1px solid black" }}
    className="mt-2 p-4 flex justify-center items-center flex-wrap"
  >
    <div className="relative">
      <img
        alt="gdg"
        src={userOneData?.avatar || Glrs}
        className="w-16 h-16 rounded-full"
      />
      {seeLoginActiveInfo?.online && (
        <span className="absolute bottom-0 right-1 bg-[#4CBB17] w-4 h-4 rounded-full"></span>
      )}
    </div>
    <div className="md:ml-3 ml-1">
      <h1 className="text-center p-2 font-bold">Me</h1>
      <h4>{emailLocal?.email}</h4>
    </div>
  </div>
);

export default React.memo(ChatHeader);

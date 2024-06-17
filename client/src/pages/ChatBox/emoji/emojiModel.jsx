import EmojiPicker from "emoji-picker-react";
import React from "react";

const EmojiModel = ({ emojiRef, addHandleEmoji, open, emojiAddInMessage }) => {
  return (
    <div
      id="default-modal"
      tabIndex="-1"
      aria-hidden="true"
      className="fixed top-0 right-0 bottom-0 left-0 z-50 flex justify-center items-center bg-black bg-opacity-50"
    >
      <div className="relative p-4 w-full max-w-[25rem]" ref={emojiRef}>
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <EmojiPicker
            open={open}
            onEmojiClick={(e) => {
              console.log("emoji<<<<<<", e.emoji);
              emojiAddInMessage((prev) => prev + e.emoji);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EmojiModel;

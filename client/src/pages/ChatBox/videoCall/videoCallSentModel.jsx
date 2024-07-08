import React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { FaVideo } from "react-icons/fa6";
import { FaVideoSlash } from "react-icons/fa";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 290,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};
const VideoCallSentModel = ({
  openVideoSentCall,
  handleVideocallSentClose,
  reciveUserCallInvitationData,
  socket,
  emailLocal = {},
}) => {
  const CutVideoCall = () => {
    socket?.emit("cutVideoCall", {
      senderId: reciveUserCallInvitationData?.senderId,
      reciverId: reciveUserCallInvitationData?.reciverId,
      reciverEmail: reciveUserCallInvitationData?.reciverEmail,
      senderEmail: reciveUserCallInvitationData?.senderEmail,
    });
  };
  const CutVideoCallByOutsideUser = () => {
    socket?.emit("CutVideoCallByOutsideUser", {
      senderId: reciveUserCallInvitationData?.senderId,
      reciverId: reciveUserCallInvitationData?.reciverId,
      reciverEmail: reciveUserCallInvitationData?.reciverEmail,
      senderEmail: reciveUserCallInvitationData?.senderEmail,
    });
  };
  return (
    <Modal
      open={openVideoSentCall}
      onClose={handleVideocallSentClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      disableBackdropClick={true}
    >
      {reciveUserCallInvitationData?.senderId === emailLocal?.userId ? (
        <>
          <div>
            <Box sx={style}>
              <h1 className="text-center text-[20px]">
                {reciveUserCallInvitationData?.reciverEmail}
              </h1>
              <p className="text-center my-8">Calling...</p>
              <div className="flex justify-evenly">
                <div
                  className=" w-16 h-16 rounded-full bg-red-500"
                  onClick={CutVideoCall}
                >
                  <FaVideoSlash
                    className={" w-7 h-7 mt-3 cursor-pointer m-auto"}
                  />
                </div>
              </div>
            </Box>
          </div>
        </>
      ) : (
        <>
          <div>
            <Box sx={style}>
              <h1 className="text-center text-[20px]">
                {reciveUserCallInvitationData?.senderEmail}
              </h1>
              <p className="text-center my-8">Receiving...</p>
              <div className="flex justify-evenly">
                <div className=" w-16 h-16 rounded-full bg-green-400">
                  <FaVideo className={" w-7 h-7 mt-3 cursor-pointer m-auto"} />
                </div>

                <div
                  className=" w-16 h-16 rounded-full bg-red-500"
                  onClick={CutVideoCallByOutsideUser}
                >
                  <FaVideoSlash
                    className={" w-7 h-7 mt-3 cursor-pointer m-auto"}
                  />
                </div>
              </div>
            </Box>
          </div>
        </>
      )}
    </Modal>
  );
};

export default VideoCallSentModel;

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
  width: 300,
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
  localVideoRef,
  remoteVideoRef,
  acceptCallStatus,
  reciverEmailAddress,
  setAcceptCallStatus,
}) => {
  const CutVideoCall = () => {
    socket?.emit("cutVideoCall", {
      senderId: reciveUserCallInvitationData?.senderId,
      reciverId: reciveUserCallInvitationData?.reciverId,
      reciverEmail: reciveUserCallInvitationData?.reciverEmail,
      senderEmail: reciveUserCallInvitationData?.senderEmail,
    });
    setAcceptCallStatus(false);
  };
  const CutVideoCallByOutsideUser = () => {
    setAcceptCallStatus(false);
    socket?.emit("CutVideoCallByOutsideUser", {
      senderId: reciveUserCallInvitationData?.senderId,
      reciverId: reciveUserCallInvitationData?.reciverId,
      reciverEmail: reciveUserCallInvitationData?.reciverEmail,
      senderEmail: reciveUserCallInvitationData?.senderEmail,
    });
  };
  const handleAcceptInvitation = async () => {
    socket?.emit("AcceptVideoCallByUser", {
      senderId: reciveUserCallInvitationData?.senderId,
      reciverId: reciveUserCallInvitationData?.reciverId,
      reciverEmail: reciveUserCallInvitationData?.reciverEmail,
      senderEmail: reciveUserCallInvitationData?.senderEmail,
    });
    setAcceptCallStatus(true);
  };

  return (
    <Modal
      open={openVideoSentCall}
      onClose={handleVideocallSentClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div>
        {reciveUserCallInvitationData?.senderId === emailLocal?.userId ? (
          <>
            <div>
              <Box sx={style}>
                <h1 className="text-center text-[20px]">
                  {reciveUserCallInvitationData?.reciverEmail}
                </h1>
                <p className="text-center my-8">
                  {acceptCallStatus ? "call Start" : "Calling..."}
                </p>
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
              {acceptCallStatus && (
                <div className=" w-fit h-fit border border-red-400">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: "240px", height: "180px" }}
                  ></video>
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    style={{ width: "240px", height: "180px" }}
                  ></video>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div>
              <Box sx={style}>
                <h1 className="text-center text-[20px]">
                  {reciveUserCallInvitationData?.senderEmail}
                </h1>
                <p className="text-center my-8">
                  {acceptCallStatus ? "call Start" : "Receiving..."}
                </p>
                <div className="flex justify-evenly">
                  {!acceptCallStatus && (
                    <div
                      className=" w-16 h-16 rounded-full bg-green-400"
                      onClick={handleAcceptInvitation}
                    >
                      <FaVideo
                        className={" w-7 h-7 mt-3 cursor-pointer m-auto"}
                      />
                    </div>
                  )}

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
              {acceptCallStatus && (
                <div className=" w-fit h-fit border border-red-400">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: "240px", height: "180px" }}
                  ></video>
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    style={{ width: "240px", height: "180px" }}
                  ></video>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default VideoCallSentModel;

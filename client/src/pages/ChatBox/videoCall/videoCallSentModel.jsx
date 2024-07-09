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
  uniqueRoomId,
  localVideoRef,
  SimplePeer,
  setPeer,
  remoteVideoRef,
  setIsCallAccepted,
  setIsCalling,
  isCallAccepted,
  handleAcceptInvitation,
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

  // const handleAcceptInvitation = async () => {
  //   socket.emit("joinRoom", uniqueRoomId); // Join the room for video call

  //   // Start local video stream
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       audio: true,
  //     });

  //     if (localVideoRef.current) {
  //       localVideoRef.current.srcObject = stream;
  //       const peerInstance = new SimplePeer({ initiator: true, stream });
  //       setPeer(peerInstance);

  //       peerInstance.on("signal", (data) => {
  //         socket.emit("signal", {
  //           signalData: data,
  //           roomId: uniqueRoomId,
  //           senderId: emailLocal?.userId,
  //         });
  //       });

  //       peerInstance.on("stream", (remoteStream) => {
  //         if (remoteVideoRef.current) {
  //           remoteVideoRef.current.srcObject = remoteStream;
  //           setIsCallAccepted(true); // Update state to indicate call accepted
  //           console.log("Remote stream received:", remoteStream);
  //         }
  //       });

  //       peerInstance.signal(); // Signal to establish WebRTC connection
  //     } else {
  //       console.log("come here video aduiod partss");
  //     }
  //   } catch (error) {
  //     console.error("Error accessing media devices:", error);
  //     // Handle specific error scenarios
  //     if (
  //       error.name === "NotFoundError" ||
  //       error.name === "DevicesNotFoundError"
  //     ) {
  //       // Devices not found
  //       alert(
  //         "Media devices not found. Please ensure your camera and microphone are connected and accessible."
  //       );
  //     } else if (
  //       error.name === "NotAllowedError" ||
  //       error.name === "PermissionDeniedError"
  //     ) {
  //       // Permission denied by user
  //       alert(
  //         "Permission to access media devices was denied. Please grant permission to proceed."
  //       );
  //     } else if (
  //       error.name === "OverconstrainedError" ||
  //       error.name === "ConstraintNotSatisfiedError"
  //     ) {
  //       // Constraints not satisfied
  //       alert(
  //         "Media device constraints not satisfied. Please check your device settings."
  //       );
  //     } else {
  //       // Other errors
  //       alert(
  //         "Error accessing media devices. Please check your setup and try again."
  //       );
  //     }
  //   }

  //   setIsCalling(true); // Update state to indicate calling
  // };

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
          {isCallAccepted && (
            <div>
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
                {!isCallAccepted && (
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
          </div>
          {isCallAccepted && (
            <div>
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
        </>
      )}
    </Modal>
  );
};

export default VideoCallSentModel;

import React, { useEffect } from "react";
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
const VideoCallCutAfterModel = ({
  cutVideoCallAfterCut,
  setCutVideoCallAfterCut,
}) => {
  const handleVideocallSentClose = () => {
    setCutVideoCallAfterCut(false);
  };
  useEffect(() => {
    setTimeout(() => {
      handleVideocallSentClose();
    }, 3000);
  }, []);
  return (
    <Modal
      open={cutVideoCallAfterCut}
      onClose={handleVideocallSentClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      disableBackdropClick={true}
    >
      <div>
        <Box sx={style}>
          <p className="text-center my-8">They Cut the Call...</p>
          <div className="flex justify-evenly">
            <div
              className=" w-16 h-16 rounded-full bg-red-500"
              onClick={handleVideocallSentClose}
            >
              <FaVideoSlash className={" w-7 h-7 mt-3 cursor-pointer m-auto"} />
            </div>
          </div>
        </Box>
      </div>
    </Modal>
  );
};

export default VideoCallCutAfterModel;

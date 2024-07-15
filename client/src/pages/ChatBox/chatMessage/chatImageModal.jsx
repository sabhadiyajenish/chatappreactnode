import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  // width: "80%",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
};
const ChatImageModal = ({ open, handleClose, imageUrl }) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style} className="h-fit  md:w-1/2 w-full md:p-2">
        <div className="w-full h-full">
          <img
            src={imageUrl}
            alt="userSendImages"
            className="w-full h-full object-cover"
          />
        </div>
      </Box>
    </Modal>
  );
};

export default ChatImageModal;

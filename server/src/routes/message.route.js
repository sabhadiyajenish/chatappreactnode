import express from "express";

import {
  addMessage,
  getMessage,
  getConversation,
  getAllUser,
  deleteMessage,
  clearChatMessage,
  updateSeenStatus,
} from "../controllers/message.controller.js";

const router = express.Router(); // eslint-disable-line new-cap
// get cart
router.route("/").post(addMessage);
router.route("/getmessage").post(getMessage);

router.route("/:senderId").get(getConversation);
router.route("/getalluser/users").get(getAllUser);
router.route("/deleteMessage").post(deleteMessage);
router.route("/clearChatMessage").post(clearChatMessage);
router.route("/updateSeenStatus").post(updateSeenStatus);

export default router;

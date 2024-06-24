import express from "express";
import { authMiddleWare } from "../middlewares/auth.middleware.js";

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
router.route("/").post(authMiddleWare, addMessage);
router.route("/getmessage").post(authMiddleWare, getMessage);

router.route("/:senderId").get(authMiddleWare, getConversation);
router.route("/getalluser/users").get(authMiddleWare, getAllUser);
router.route("/deleteMessage").post(authMiddleWare, deleteMessage);
router.route("/clearChatMessage").post(authMiddleWare, clearChatMessage);
router.route("/updateSeenStatus").post(authMiddleWare, updateSeenStatus);

export default router;

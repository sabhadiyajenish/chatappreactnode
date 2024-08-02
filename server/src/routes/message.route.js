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
  AddImageInClound,
  AddVideoInClound,
  AddFilePdfDocsInClound,
  getMapDatas,
  Clearseensent,
  getUserLastMessage,
} from "../controllers/message.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router(); // eslint-disable-line new-cap
// get cart
router.route("/getMapDatas").get(getMapDatas);

router.route("/").post(authMiddleWare, addMessage);
router.route("/getmessage").post(authMiddleWare, getMessage);

router.route("/:senderId").get(authMiddleWare, getConversation);
router.route("/getalluser/users").get(authMiddleWare, getAllUser);
router.route("/deleteMessage").post(authMiddleWare, deleteMessage);
router.route("/clearChatMessage").post(authMiddleWare, clearChatMessage);
router.route("/updateSeenStatus").post(authMiddleWare, updateSeenStatus);
router.route("/clearMessageseensent").post(authMiddleWare, Clearseensent);
router.route("/getUserLastMessage/:senderId").post(getUserLastMessage);

router.route("/uploadImageInCloud").post(
  authMiddleWare,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  AddImageInClound
);
router.route("/uploadVideoInCloud").post(
  authMiddleWare,
  upload.fields([
    {
      name: "avatarVideo",
      maxCount: 1,
    },
  ]),
  AddVideoInClound
);
router.route("/uploadFilePdfDocsInCloud").post(
  // authMiddleWare,
  upload.fields([
    {
      name: "avatarFile",
      maxCount: 1,
    },
  ]),
  AddFilePdfDocsInClound
);
export default router;

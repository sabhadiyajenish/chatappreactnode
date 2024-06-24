import express from "express";

import {
  addNotification,
  deleteNotification,
  getNotification,
} from "../controllers/notification.controller.js";
import { authMiddleWare } from "../middlewares/auth.middleware.js";

const router = express.Router(); // eslint-disable-line new-cap
// get cart
router.route("/").post(authMiddleWare, addNotification);
router.route("/getNotification").post(authMiddleWare, getNotification);
router.route("/deleteNotification").post(authMiddleWare, deleteNotification);

export default router;

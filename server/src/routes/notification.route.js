import express from "express";

import {
  addNotification,
  deleteNotification,
  getNotification,
} from "../controllers/notification.controller.js";

const router = express.Router(); // eslint-disable-line new-cap
// get cart
router.route("/").post(addNotification);
router.route("/getNotification").post(getNotification);
router.route("/deleteNotification").post(deleteNotification);

export default router;

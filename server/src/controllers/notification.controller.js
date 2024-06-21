import Notification from "../models/notification.model.js";
import Coversation from "../models/conversation.model.js";
import tagModel from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";

const addNotification = asyncHandler(async (req, res, next) => {
  const { senderId, reciverId, firstMessage, lastMessage, date, uniqueId } =
    req.body;
  const Sender = new mongoose.Types.ObjectId(senderId);
  const Reciver = new mongoose.Types.ObjectId(reciverId);

  const checkHaveRecord = await Notification.findOne({
    senderId: Sender,
    reciverId: Reciver,
  });

  if (checkHaveRecord) {
    checkHaveRecord.count = checkHaveRecord.count + 1;
    await checkHaveRecord.save();
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          checkHaveRecord,
          "notification Updated successfully"
        )
      );
  } else {
    const messageComeData = new Notification({
      senderId: Sender,
      reciverId: Reciver,
      firstMessage,
      count: 1,
      date,
      uniqueId,
    });
    const messageData = await messageComeData.save();
    return res
      .status(200)
      .json(
        new ApiResponse(200, messageData, "notification inserted successfully")
      );
  }
});

const getNotification = asyncHandler(async (req, res, next) => {
  const { senderId } = req.body;
  const Sender = new mongoose.Types.ObjectId(senderId);

  const checkHaveRecord = await Notification.find({
    senderId: Sender,
  });
  if (checkHaveRecord.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "No data found in Notification"));
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        checkHaveRecord,
        "notification data get successfully"
      )
    );
});
const deleteNotification = asyncHandler(async (req, res, next) => {
  const { senderId, reciverId } = req.body;
  const Sender = new mongoose.Types.ObjectId(senderId);
  const Reciver = new mongoose.Types.ObjectId(reciverId);
  const checkHaveRecord = await Notification.findOne({
    senderId: Sender,
    reciverId: Reciver,
  });

  if (!checkHaveRecord) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "No id match with Notification"));
  }

  const deleteRecord = await Notification.findByIdAndDelete({
    _id: checkHaveRecord?._id,
  });

  if (!deleteRecord) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, {}, "something wrong while deleting Notification")
      );
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, deleteRecord, "notification  deleted successfully")
    );
});
export { addNotification, getNotification, deleteNotification };
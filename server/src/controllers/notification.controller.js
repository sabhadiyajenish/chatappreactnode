import Notification from "../models/notification.model.js";
import Coversation from "../models/conversation.model.js";
import tagModel from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { encrypt } from "../utils/EncryptDecrypt/encryptDescrypt.js";
import { nodeCache } from "../app.js";

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
    checkHaveRecord.uniqueId = uniqueId;
    checkHaveRecord.date = new Date();
    await checkHaveRecord.save();
    nodeCache.del(`userNotification_${senderId}`);
    nodeCache.del(`userNotification_${reciverId}`);

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
    nodeCache.del(`userNotification_${senderId}`);
    nodeCache.del(`userNotification_${reciverId}`);

    return res
      .status(200)
      .json(
        new ApiResponse(200, messageData, "notification inserted successfully")
      );
  }
});

const getNotification = asyncHandler(async (req, res, next) => {
  const { senderId } = req.body;
  let checkHaveRecord;
  if (nodeCache.has(`userNotification_${senderId}`)) {
    checkHaveRecord = JSON.parse(nodeCache.get(`userNotification_${senderId}`));
  } else {
    // const Sender = new mongoose.Types.ObjectId(senderId);

    checkHaveRecord = await Notification.find({
      $or: [{ senderId: senderId }, { reciverId: senderId }],
    }).sort({ date: 1 });
    nodeCache.set(
      `userNotification_${senderId}`,
      JSON.stringify(checkHaveRecord)
    );
  }
  // .populate({ path: "senderId", select: "email userName" })
  // .populate({ path: "reciverId", select: "email userName" });
  const data = JSON.stringify(checkHaveRecord);
  const encryptedData = encrypt(data);
  return res
    .status(200)
    .json(
      new ApiResponse(200, encryptedData, "notification data get successfully")
    );
});
const deleteNotification = asyncHandler(async (req, res, next) => {
  const { senderId, reciverId } = req.body;
  const Sender = new mongoose.Types.ObjectId(senderId);
  const Reciver = new mongoose.Types.ObjectId(reciverId);

  try {
    // Check if a record exists with the given senderId and reciverId
    const checkHaveRecord = await Notification.findOne({
      senderId: Sender,
      reciverId: Reciver,
    });

    if (!checkHaveRecord) {
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "No id match with Notification"));
    }

    // Delete the record by its _id
    const deleteRecord = await Notification.findByIdAndDelete(
      checkHaveRecord._id
    );

    if (!deleteRecord) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            {},
            "something wrong while deleting Notification"
          )
        );
    }
    nodeCache.del(`userNotification_${senderId}`);
    nodeCache.del(`userNotification_${reciverId}`);

    return res
      .status(200)
      .json(
        new ApiResponse(200, deleteRecord, "notification deleted successfully")
      );
  } catch (error) {
    return next(error);
  }
});

export { addNotification, getNotification, deleteNotification };

import Message from "../models/message.model.js";
import Coversation from "../models/conversation.model.js";
import tagModel from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";

const addMessage = asyncHandler(async (req, res, next) => {
  const {
    senderId,
    reciverId,
    conversationIds = "",
    message,
    uniqueId,
  } = req.body;
  const userData = await Coversation.find({
    members: { $all: [senderId, reciverId] },
  });
  // console.log(">>>id>>>", userData);
  if (userData.length === 0) {
    const data = new Coversation({
      members: [senderId, reciverId],
    });
    const converData = await data.save();
    // console.log(">>>>>>>>>>>>>>>>>>>>>", converData);
    const messageComeData = new Message({
      conversationId: converData._id,
      senderId: senderId,
      message: message,
      uniqueId,
    });
    const messageData = await messageComeData.save();
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          messageData,
          "conversation create and  message inserted successfully"
        )
      );
  }
  // console.log(">>>>convoid", userData?._id);
  const messageComewithComIdData = new Message({
    conversationId: userData[0]?._id,
    senderId: senderId,
    message: message,
    uniqueId,
  });
  // console.log(">>>message>>>", messageComewithComIdData);
  const messageData1 = await messageComewithComIdData.save();
  return res
    .status(200)
    .json(new ApiResponse(200, messageData1, "message inserted successfully"));
});

const deleteMessage = asyncHandler(async (req, res, next) => {
  const { messageId, title = "", senderId } = req.body;

  const userMessage = await Message.findOne({ uniqueId: messageId });
  const Sender = new mongoose.Types.ObjectId(senderId);
  if (!userMessage) {
    return res
      .status(200)
      .json(new ApiResponse(500, "something is wrong in message id"));
  }
  if (title === "Me") {
    if (userMessage.senderId.equals(Sender)) {
      console.log("sender come in if part<<<", userMessage?.senderId, Sender);
      userMessage.userDelete = true;
      await userMessage.save();
    } else {
      console.log(
        "sender come in else part<<<",
        userMessage?.senderId === Sender,
        userMessage?.senderId,
        Sender,
        userMessage
      );

      userMessage.reciverDelete = true;
      await userMessage.save();
    }
  } else {
    const userMessageDelete = await Message.findByIdAndDelete({
      _id: userMessage?._id,
    });
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "message Deleted successfully"));
});

const getMessage = asyncHandler(async (req, res, next) => {
  const { senderId, reciverId } = req.body;

  const userData = await Coversation.find({
    members: { $all: [senderId, reciverId] },
  });
  if (!userData) {
    return res
      .status(200)
      .json(new ApiResponse(500, "something is wrong in conversation id"));
  }
  const allMessages = await Message.find({
    conversationId: userData[0]?._id,
    $or: [{ userDelete: false }, { reciverDelete: false }],
  })
    .sort({ createdAt: -1 }) // Sort in descending order by createdAt
    .limit(50);

  const formatDate = (date) => date.toISOString().split("T")[0];

  // Organize messages by date
  const messagesByDate = allMessages.reverse().reduce((acc, message) => {
    const date = formatDate(new Date(message.createdAt));
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {});

  return res.status(200).json(
    new ApiResponse(
      200,
      // allMessages.reverse(),
      messagesByDate,
      "get all message successfully"
    )
  );
});

const getConversation = asyncHandler(async (req, res) => {
  const { senderId } = req.params;
  const userData = await Coversation.find({
    members: { $in: [senderId] },
  });
  let getUserId = [];
  userData?.map((dr, key) =>
    dr.members.filter((dt, kk) => {
      if (dt !== senderId) {
        getUserId.push(dt);
      }
    })
  );

  const userIs = await tagModel.find({ _id: getUserId });
  return res
    .status(200)
    .json(new ApiResponse(200, userIs, "get user conversation successfully"));
});

const getAllUser = asyncHandler(async (req, res, next) => {
  const userIs = await tagModel.find();
  return res
    .status(200)
    .json(new ApiResponse(200, userIs, "get All User successfully"));
});

export { addMessage, getMessage, getConversation, getAllUser, deleteMessage };

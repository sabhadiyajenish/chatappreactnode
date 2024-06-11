import Message from "../models/message.model.js";
import Coversation from "../models/conversation.model.js";
import tagModel from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";

const addMessage = asyncHandler(async (req, res, next) => {
  const { senderId, reciverId, conversationIds = "", message } = req.body;
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
  });
  // console.log(">>>message>>>", messageComewithComIdData);
  const messageData1 = await messageComewithComIdData.save();
  return res
    .status(200)
    .json(new ApiResponse(200, messageData1, "message inserted successfully"));
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
  console.log(">>>", userData);
  const allMessages = await Message.find({
    conversationId: userData[0]?._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, allMessages, "get all message successfully"));
});

const getConversation = asyncHandler(async (req, res, next) => {
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

export { addMessage, getMessage, getConversation, getAllUser };

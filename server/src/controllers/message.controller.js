import Message from "../models/message.model.js";
import Coversation from "../models/conversation.model.js";
import tagModel from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  cloudinaryFile,
  deleteImage,
  fileUploadCloud,
} from "../utils/cloudinary.js";
import NodeCache from "node-cache";
import { nodeCache } from "../app.js";

function extractPublicIdFromUrl(url) {
  // Example URL: https://res.cloudinary.com/your_cloud_name/image/upload/public_id.jpg
  const regex = /\/([^\/]+)\.[a-zA-Z0-9]{3,4}(?:$|\?)/;
  const match = url.match(regex);
  if (match && match.length > 1) {
    return match[1]; // public_id is captured by the first group in the regex
  }
  return null; // Return null if no match found
}
const addMessage = asyncHandler(async (req, res, next) => {
  const {
    senderId,
    reciverId,
    avatarVideo = "",
    avatarVideoThumb = "",
    conversationIds = "",
    message = "",
    uniqueId,
    avatar = "",
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

    const messageData = {
      conversationId: converData._id,
      senderId: senderId,
      reciverId: reciverId,
      uniqueId: uniqueId,
    };

    // Add optional fields if they are present
    if (message) {
      messageData.message = message;
      messageData.Filetype = "message";
    }
    if (avatar) {
      messageData.avatar = avatar;
      messageData.Filetype = "image";
    }
    if (avatarVideo) {
      messageData.avatarVideo = avatarVideo;
      messageData.Filetype = "video";
    }
    if (avatarVideoThumb) {
      messageData.avatarVideoThumb = avatarVideoThumb;
    }

    const messageComeData = new Message(messageData);

    const messageDataValue = await messageComeData.save();
    nodeCache.del(`message${senderId}-${reciverId}`);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          messageDataValue,
          "conversation create and  message inserted successfully"
        )
      );
  }
  // console.log(">>>>convoid", userData?._id);

  const messageData = {
    conversationId: userData[0]?._id,
    senderId: senderId,
    reciverId: reciverId,
    uniqueId: uniqueId,
  };

  // Add optional fields if they are present
  if (message) {
    messageData.message = message;
    messageData.Filetype = "message";
  }
  if (avatar) {
    messageData.avatar = avatar;
    messageData.Filetype = "image";
  }
  if (avatarVideo) {
    messageData.avatarVideo = avatarVideo;
    messageData.Filetype = "video";
  }
  if (avatarVideoThumb) {
    messageData.avatarVideoThumb = avatarVideoThumb;
  }
  const messageComewithComIdData = new Message(messageData);

  // console.log(">>>message>>>", messageComewithComIdData);
  const messageData1 = await messageComewithComIdData.save();
  nodeCache.del(`message${senderId}-${reciverId}`);

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

      if (userMessage.userDelete === true) {
        if (userMessage?.avatar) {
          const publicId = extractPublicIdFromUrl(userMessage?.avatar);
          const pub = await deleteImage(publicId, "image");
          console.log("delete image<<<<<<<<<", pub);
        }
        if (userMessage?.avatarVideo) {
          const publicId = extractPublicIdFromUrl(userMessage?.avatarVideo);
          const pub = await deleteImage(publicId, "video");
          console.log("delete image<<<<<<<<<", pub);
        }
        await Message.findByIdAndDelete({
          _id: userMessage?._id,
        });
      } else if (userMessage.reciverDelete === true) {
        if (userMessage?.avatar) {
          const publicId = extractPublicIdFromUrl(userMessage?.avatar);
          const pub = await deleteImage(publicId, "image");
          console.log("delete image<<<<<<<<<", pub);
        }
        if (userMessage?.avatarVideo) {
          const publicId = extractPublicIdFromUrl(userMessage?.avatarVideo);
          const pub = await deleteImage(publicId, "video");
          console.log("delete image<<<<<<<<<", pub);
        }
        await Message.findByIdAndDelete({
          _id: userMessage?._id,
        });
      } else {
        userMessage.userDelete = true;
        await userMessage.save();
      }
    } else {
      userMessage.reciverDelete = true;
      await userMessage.save();
    }
  } else {
    if (userMessage?.avatar) {
      const publicId = extractPublicIdFromUrl(userMessage?.avatar);
      console.log("public keyu is<<<<", publicId);
      const pub = await deleteImage(publicId, "image");
      console.log("delete image<<<<<<<<<", pub);
    }
    if (userMessage?.avatarVideo) {
      const publicId = extractPublicIdFromUrl(userMessage?.avatarVideo);
      const pub = await deleteImage(publicId, "video");
      console.log("delete image<<<<<<<<<", pub);
    }
    await Message.findByIdAndDelete({
      _id: userMessage?._id,
    });
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "message Deleted successfully"));
});
const updateSeenStatus = asyncHandler(async (req, res, next) => {
  const { messageId } = req.body;
  const messages = await Message.findOne({
    uniqueId: messageId,
  });
  if (!messages) {
    return res
      .status(200)
      .json(new ApiResponse(500, "something is wrong in message id"));
  }
  if (messages.seen === true) {
    return res.status(200).json(new ApiResponse(500, "already seen message"));
  }
  messages.seen = true;
  messages.seenAt = new Date();
  await messages.save();
  return res
    .status(200)
    .json(new ApiResponse(200, messages, "message Seen successfully"));
});
const getMessage = asyncHandler(async (req, res, next) => {
  const { senderId, reciverId } = req.body;
  let messagesByDate;
  if (nodeCache.has(`message${senderId}-${reciverId}`)) {
    messagesByDate = JSON.parse(
      nodeCache.get(`message${senderId}-${reciverId}`)
    );
  } else {
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
    messagesByDate = allMessages.reverse().reduce((acc, message) => {
      const date = formatDate(new Date(message.createdAt));
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(message);
      return acc;
    }, {});
    nodeCache.set(
      `message${senderId}-${reciverId}`,
      JSON.stringify(messagesByDate)
    );
  }

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
  // nodeCache.get();
  let userIs;
  if (nodeCache.has(`conversation${senderId}`)) {
    userIs = JSON.parse(nodeCache.get(`conversation${senderId}`));
  } else {
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

    userIs = await tagModel.find({ _id: getUserId });
    nodeCache.set(`conversation${senderId}`, JSON.stringify(userIs), 120);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userIs, "get user conversation successfully"));
});

const getAllUser = asyncHandler(async (req, res, next) => {
  let userIs;
  if (nodeCache.has("allUserList")) {
    userIs = JSON.parse(nodeCache.get("allUserList"));
  } else {
    userIs = await tagModel.find();
    nodeCache.set(`allUserList`, JSON.stringify(userIs), 120);
  }
  return res
    .status(200)
    .json(new ApiResponse(200, userIs, "get All User successfully"));
});

const clearChatMessage = asyncHandler(async (req, res, next) => {
  const { uniqueIds = [], senderId } = req.body;

  const userMessage = await Message.find({ uniqueId: uniqueIds });
  const Sender = new mongoose.Types.ObjectId(senderId);

  if (userMessage?.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(500, "something is wrong in clear chat id"));
  }

  userMessage?.forEach(async (userId) => {
    if (userId.senderId.equals(Sender)) {
      console.log("sender come in if part<<<", userId?.senderId, Sender);

      if (userId.userDelete === true) {
        if (userId?.avatar) {
          const publicId = extractPublicIdFromUrl(userId?.avatar);
          const pub = await deleteImage(publicId);
          console.log("delete image<<<<<<<<<", pub);
        }
        await Message.findByIdAndDelete({
          _id: userId?._id,
        });
      } else if (userId.reciverDelete === true) {
        if (userId?.avatar) {
          const publicId = extractPublicIdFromUrl(userId?.avatar);
          const pub = await deleteImage(publicId);
          console.log("delete image<<<<<<<<<", pub);
        }
        await Message.findByIdAndDelete({
          _id: userId?._id,
        });
      } else {
        userId.userDelete = true;
        await userId.save();
      }
    } else {
      userId.reciverDelete = true;
      await userId.save();
    }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "chatClear successfully"));
});

const AddImageInClound = asyncHandler(async (req, res) => {
  const avatarLocalFile = req.files?.avatar[0]?.path;

  if (!avatarLocalFile) {
    return res
      .status(300)
      .json(new ApiResponse(300, "avatar image is required.."));
  }
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (!allowedMimeTypes.includes(req?.files?.avatar[0]?.mimetype)) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Only image files are allowed."));
  }

  const avatarSerPath = await fileUploadCloud(avatarLocalFile);
  if (!avatarSerPath) {
    return res
      .status(300)
      .json(new ApiResponse(300, "avatar image is required.."));
  }
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        url: avatarSerPath?.url,
      },
      "image upload in clound successfully"
    )
  );
});

const AddVideoInClound = asyncHandler(async (req, res) => {
  const avatarVideoLocalFile = req.files?.avatarVideo[0]?.path;

  if (!avatarVideoLocalFile) {
    return res
      .status(300)
      .json(new ApiResponse(300, "avatar Video is required.."));
  }

  const allowedMimeTypes = [
    "video/mp4",
    "video/quicktime",
    "video/mpeg",
    "video/webm",
  ];
  if (!allowedMimeTypes.includes(req?.files?.avatarVideo[0]?.mimetype)) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Only video files are allowed."));
  }

  const avatarVideoSerPath = await fileUploadCloud(avatarVideoLocalFile);
  if (!avatarVideoSerPath) {
    return res
      .status(300)
      .json(new ApiResponse(300, "avatar Video is required.."));
  }
  const thumbnailUrl = cloudinaryFile.url(avatarVideoSerPath.public_id, {
    resource_type: "video",
    format: "jpg",
    quality: "auto",
    width: 300,
    height: 300,
    crop: "thumb",
  });
  let cleanImageUrl = thumbnailUrl.split("?")[0];
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        url: avatarVideoSerPath?.url,
        thumb: cleanImageUrl,
      },
      "Video upload in clound successfully"
    )
  );
});

export {
  addMessage,
  getMessage,
  getConversation,
  getAllUser,
  deleteMessage,
  clearChatMessage,
  updateSeenStatus,
  AddImageInClound,
  AddVideoInClound,
};

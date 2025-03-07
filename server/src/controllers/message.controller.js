import Message from "../models/message.model.js";
import Coversation from "../models/conversation.model.js";
import tagModel from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import axios from "axios";
import querystring from "querystring";
import {
  cloudinaryFile,
  deleteImage,
  fileUploadCloud,
} from "../utils/cloudinary.js";
import NodeCache from "node-cache";
import { nodeCache } from "../app.js";
import { encrypt } from "../utils/EncryptDecrypt/encryptDescrypt.js";

function extractPublicIdFromUrl(url) {
  // Example URL: https://res.cloudinary.com/your_cloud_name/image/upload/public_id.jpg
  const regex = /\/([^\/]+)\.[a-zA-Z0-9]{3,4}(?:$|\?)/;
  const match = url.match(regex);
  if (match && match.length > 1) {
    return match[1]; // public_id is captured by the first group in the regex
  }
  return null; // Return null if no match found
}
const invalidateCache = (receiverId, senderId) => {
  // You might want to invalidate all relevant cache entries
  // For simplicity, we'll just delete by cache key pattern
  nodeCache.keys().forEach((key) => {
    if (
      key.startsWith(`messages:${receiverId}:${senderId}`) ||
      key.startsWith(`messages:${senderId}:${receiverId}`)
    ) {
      nodeCache.del(key);
    }
  });
};

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
    latitude = "",
    longitude = "",
    name = "",
    filePath = "",
    size = "",
  } = req.body;
  nodeCache.del(`conversation-${senderId}`);
  nodeCache.del(`conversation-${reciverId}`);

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
    if (longitude && latitude) {
      messageData.latitude = latitude;
      messageData.longitude = longitude;
    }
    if (filePath && name && size) {
      messageData.fileDocsPdf = {
        name,
        filePath,
        size,
      };
    }

    const messageComeData = new Message(messageData);

    const messageDataValue = await messageComeData.save();

    try {
      // Find the document with the matching criteria
      const userLastMessage = await tagModel.findOne({
        _id: reciverId,
        userLastMessages: {
          $elemMatch: {
            userId: senderId,
          },
        },
      });

      if (userLastMessage) {
        // Document found, check if the specific message exists
        const messageIndex = userLastMessage.userLastMessages.findIndex(
          (message) => message.userId.equals(senderId)
        );

        if (messageIndex !== -1) {
          // Message exists, update it
          userLastMessage.userLastMessages[messageIndex].messageId =
            messageData1._id;
        } else {
          // Message does not exist, add it
          userLastMessage.userLastMessages.push({
            _id: null,
            userId: senderId,
            messageId: messageData1._id,
          });
        }

        // Save the updated user document
        await userLastMessage.save();
        console.log("Updated or added message successfully.");
      } else {
        // If the document is not found, create a new document
        await tagModel.updateOne(
          { _id: reciverId },
          {
            $push: {
              userLastMessages: {
                userId: senderId,
                messageId: messageData1._id,
              },
            },
          },
          { upsert: true } // Create the document if it doesn't exist
        );
        console.log("Added new message to a newly created document.");
      }
    } catch (err) {
      console.error("Error updating or adding message:", err);
    }
    invalidateCache(reciverId, senderId);

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
  if (longitude && latitude) {
    messageData.latitude = latitude;
    messageData.longitude = longitude;
  }
  if (filePath && name && size) {
    messageData.fileDocsPdf = {
      name,
      filePath,
      size,
    };
  }

  const messageComewithComIdData = new Message(messageData);

  // console.log(">>>message>>>", messageComewithComIdData);
  const messageData1 = await messageComewithComIdData.save();

  try {
    // Find the document with the matching criteria
    const userLastMessage = await tagModel.findOne({
      _id: reciverId,
      userLastMessages: {
        $elemMatch: {
          userId: senderId,
        },
      },
    });

    if (userLastMessage) {
      // Document found, check if the specific message exists
      const messageIndex = userLastMessage.userLastMessages.findIndex(
        (message) => message.userId.equals(senderId)
      );

      if (messageIndex !== -1) {
        // Message exists, update it
        userLastMessage.userLastMessages[messageIndex].messageId =
          messageData1._id;
      } else {
        // Message does not exist, add it
        userLastMessage.userLastMessages.push({
          _id: null,
          userId: senderId,
          messageId: messageData1._id,
        });
      }

      // Save the updated user document
      await userLastMessage.save();
      console.log("Updated or added message successfully.");
    } else {
      // If the document is not found, create a new document
      await tagModel.updateOne(
        { _id: reciverId },
        {
          $push: {
            userLastMessages: {
              userId: senderId,
              messageId: messageData1._id,
            },
          },
        },
        { upsert: true } // Create the document if it doesn't exist
      );
      console.log("Added new message to a newly created document.");
    }
  } catch (err) {
    console.error("Error updating or adding message:", err);
  }

  invalidateCache(reciverId, senderId);

  return res
    .status(200)
    .json(new ApiResponse(200, messageData1, "message inserted successfully"));
});

const deleteMessage = asyncHandler(async (req, res, next) => {
  const { messageId, title = "", senderId, reciverId } = req.body;
  invalidateCache(reciverId, senderId);
  nodeCache.del(`conversation-${senderId}`);
  nodeCache.del(`conversation-${reciverId}`);
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
  try {
    const { senderId, reciverId, skip = 0, limit = 20 } = req.body;

    // Check cache first
    const cacheKey = `messages:${reciverId}:${senderId}:${limit}:${skip}`;
    if (nodeCache.has(cacheKey)) {
      const cachedData = JSON.parse(nodeCache.get(cacheKey));
      const encryptedData = encrypt(JSON.stringify(cachedData));
      return res
        .status(200)
        .json(new ApiResponse(200, encryptedData, "Fetched from cache"));
    }

    // Fetch conversation ID
    const userData = await Coversation.findOne({
      members: { $all: [senderId, reciverId] },
    }).select("_id");

    if (!userData) {
      return res
        .status(404)
        .json(new ApiResponse(404, "Conversation not found"));
    }

    const conversationId = userData._id;

    // Get messages using aggregation for faster grouping
    const messagesPipeline = [
      {
        $match: {
          conversationId,
          $or: [{ userDelete: false }, { reciverDelete: false }],
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          messages: { $push: "$$ROOT" },
        },
      },
      { $sort: { _id: -1 } }, // Sort by date descending
    ];

    const allMessages = await Message.aggregate(messagesPipeline);

    // Count total messages more efficiently
    const lengthAllMessages = await Message.countDocuments({
      conversationId,
      $or: [{ userDelete: false }, { reciverDelete: false }],
    });

    const responseData = {
      messagesByDate: Object.fromEntries(
        allMessages.map((d) => [d._id, d.messages])
      ),
      lengthAllMessages,
    };

    // Cache the result
    nodeCache.set(cacheKey, JSON.stringify(responseData), 300); // Cache for 5 minutes

    // Encrypt and send response
    const encryptedData = encrypt(JSON.stringify(responseData));
    return res
      .status(200)
      .json(
        new ApiResponse(200, encryptedData, "Fetched messages successfully")
      );
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json(new ApiResponse(500, "Internal Server Error"));
  }
});

const Clearseensent = asyncHandler(async (req, res) => {
  const { senderId, reciverId } = req.body;

  const userLastMessage = await tagModel.findOne({
    _id: reciverId,
    userLastMessages: {
      $elemMatch: {
        userId: senderId,
      },
    },
  });

  if (userLastMessage) {
    // Document found, check if the specific message exists
    const messageIndex = userLastMessage.userLastMessages.findIndex((message) =>
      message.userId.equals(senderId)
    );

    if (messageIndex !== -1) {
      // Message exists, update it
      userLastMessage.userLastMessages[messageIndex].messageId = null;
    }
    // Save the updated user document
    await userLastMessage.save();
    console.log("Updated or added message successfully.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userLastMessage,
        "Clearseensent user conversation successfully"
      )
    );
});

const getConversation = asyncHandler(async (req, res) => {
  const { senderId } = req.params;
  // nodeCache.get();
  let userIs;
  if (nodeCache.has(`conversation-${senderId}`)) {
    userIs = JSON.parse(nodeCache.get(`conversation-${senderId}`));
  } else {
    const userData = await Coversation.find({
      members: { $in: [senderId] },
    });
    let getUserId = [];
    userData?.map((dr, key) =>
      dr.members.filter((dt, kk) => {
        if (dt !== senderId) {
          getUserId.push(new mongoose.Types.ObjectId(dt));
        }
      })
    );

    const userDatas = await tagModel
      .find({ _id: getUserId })
      .populate({
        path: "userLastMessages.messageId", // Populate messageId field in userLastMessages
        select: "createdAt seen seenAt", // Specify which fields to include from Message
      })
      .select(
        "-password -refreshToken -watchHistory -updatedAt -isEmailVerified -loginType"
      )
      .exec();

    userIs = await getUserLastMessage(senderId, getUserId, userDatas);

    nodeCache.set(`conversation-${senderId}`, JSON.stringify(userIs));
  }
  const data = JSON.stringify(userIs);
  const encryptedData = encrypt(data);
  return res
    .status(200)
    .json(
      new ApiResponse(200, encryptedData, "get user conversation successfully")
    );
});

const getAllUser = asyncHandler(async (req, res, next) => {
  let userIs;
  if (nodeCache.has("allUserList")) {
    userIs = JSON.parse(nodeCache.get("allUserList"));
  } else {
    userIs = await tagModel
      .find({})
      .select(
        "-password -refreshToken -loginType -userLastMessages -watchHistory -updatedAt -isEmailVerified"
      )
      .exec();
    nodeCache.set(`allUserList`, JSON.stringify(userIs), 120);
  }
  return res
    .status(200)
    .json(new ApiResponse(200, userIs, "get All User successfully"));
});

const clearChatMessage = asyncHandler(async (req, res, next) => {
  const { uniqueIds = [], senderId, reciverId } = req.body;
  invalidateCache(reciverId, senderId);
  nodeCache.del(`conversation-${senderId}`);
  nodeCache.del(`conversation-${reciverId}`);
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
        if (userId?.avatarVideo) {
          const publicId = extractPublicIdFromUrl(userId?.avatarVideo);
          const pub = await deleteImage(publicId, "video");
          console.log("delete video<<<<<<<<<", pub);
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
        if (userId?.avatarVideo) {
          const publicId = extractPublicIdFromUrl(userId?.avatarVideo);
          const pub = await deleteImage(publicId, "video");
          console.log("delete video<<<<<<<<<", pub);
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

const AddFilePdfDocsInClound = asyncHandler(async (req, res) => {
  console.log("Come in <<<<<<<<<<<<<<<<<<<<");

  // Check if avatarFile exists and has at least one file
  if (
    !req.files ||
    !req.files.avatarFile ||
    req.files.avatarFile.length === 0
  ) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Avatar File is required."));
  }

  const avatarFileLocalPath = req.files.avatarFile[0].path;
  console.log("Avatar File Local Path:", avatarFileLocalPath);

  // Check if avatarVideo exists and has at least one file
  if (!req.files.avatarFile || req.files.avatarFile.length === 0) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Avatar  File is required."));
  }

  const avatarVideoLocalPath = req.files.avatarFile[0].path;
  console.log("Avatar File  Path:", avatarVideoLocalPath);

  // Validate MIME type of avatarVideo
  const allowedMimeTypes = [
    "application/pdf",
    "application/zip",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!allowedMimeTypes.includes(req.files.avatarFile[0].mimetype)) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          "Only specific file types are allowed for avatar File."
        )
      );
  }

  // Example function fileUploadCloud to upload files to cloud
  const avatarVideoSerPath = await fileUploadCloud(avatarVideoLocalPath);
  if (!avatarVideoSerPath) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, "Failed to upload avatar File file to cloud.")
      );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        avatarVideoSerPath,
      },
      "Avatar Video uploaded to cloud successfully."
    )
  );
});

const getMapDatas = asyncHandler(async (req, res, next) => {
  const clientId = "f8ea4c60-7b90-4242-a9ab-8d7768fa332e";
  const clientSecret = "sPICanD3cVP41jrTjpHk8vjXbSpIEyRJ";
  const apiUrl = "https://api.olamaps.io";

  try {
    // Step 1: Get Access Token
    const tokenEndpoint =
      "https://account.olamaps.io/realms/olamaps/protocol/openid-connect/token";
    const tokenData = {
      grant_type: "client_credentials",
      scope: "openid",
      client_id: clientId,
      client_secret: clientSecret,
    };

    const tokenResponse = await axios.post(
      tokenEndpoint,
      querystring.stringify(tokenData),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Step 2: Use Access Token to call autocomplete API
    const searchText = "Surat"; // assuming searchText comes from query params

    const autocompleteResponse = await axios.get(
      `${apiUrl}/places/v1/autocomplete`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          input: searchText,
        },
      }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, autocompleteResponse, "get All User successfully")
      );
  } catch (error) {
    console.error("Error fetching data:", error);
    return res
      .status(400)
      .json(new ApiResponse(400, error, "Error fetching data"));
  }
});

const getUserLastMessage = async (senderId, getUserIds, userList) => {
  const userIs = await Message.aggregate([
    {
      $match: {
        $or: [
          {
            senderId: new mongoose.Types.ObjectId(senderId),
            reciverId: { $in: getUserIds },
            $or: [{ userDelete: false }, { reciverDelete: false }],
          },
          {
            senderId: { $in: getUserIds },
            reciverId: new mongoose.Types.ObjectId(senderId),
            $or: [{ userDelete: false }, { reciverDelete: false }],
          },
        ],
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: "$reciverId",
        lastMessage: { $first: "$$ROOT" },
      },
    },
    {
      $replaceRoot: { newRoot: "$lastMessage" },
    },
    {
      $sort: { createdAt: 1 },
    },
  ]);

  for (let notificationObj of userIs) {
    const index = userList.findIndex((obj) => {
      return obj._id.equals(notificationObj.reciverId);
    });
    if (index !== -1) {
      const [obj] = userList.splice(index, 1);
      userList.unshift(obj);
    }
  }
  return userList;
};

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
  AddFilePdfDocsInClound,
  getMapDatas,
  Clearseensent,
  getUserLastMessage,
};

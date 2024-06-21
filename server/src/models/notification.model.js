import mongoose from "mongoose";
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
import UserSchema from "..//models/user.model.js";

const MessageNotificationSchema = mongoose.Schema({
  uniqueId: {
    type: String,
    required: true,
  },
  senderId: {
    type: ObjectId,
    ref: UserSchema,
    required: true,
  },
  reciverId: {
    type: ObjectId,
    ref: UserSchema,
    required: true,
  },
  firstMessage: {
    type: String,
    required: true,
  },
  lastMessage: {
    type: String,
  },
  count: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model(
  "messagesNotification",
  MessageNotificationSchema
);

import mongoose from "mongoose";
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
import UserSchema from "..//models/user.model.js";
import ConId from "../models/conversation.model.js";

const MessageSchema = mongoose.Schema({
  conversationId: {
    type: ObjectId,
    ref: ConId,
    required: true,
  },
  uniqueId: {
    type: String,
    required: true,
  },
  senderId: {
    type: ObjectId,
    ref: UserSchema,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  seen: { type: Boolean, default: false },
  seenAt: { type: Date },
  userDelete: {
    type: Boolean,
    default: false,
  },
  reciverDelete: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("messages", MessageSchema);

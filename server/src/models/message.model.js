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
  senderId: {
    type: ObjectId,
    ref: UserSchema,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("messages", MessageSchema);

import mongoose from "mongoose";
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
import UserSchema from "../models/user.model.js";
import ConId from "../models/conversation.model.js";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
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
  reciverId: {
    type: ObjectId,
    ref: UserSchema,
    // required: true,
  },
  message: {
    type: String,
  },
  avatar: {
    type: String,
  },
  avatarVideo: {
    type: String,
  },
  avatarVideoThumb: {
    type: String,
  },
  Filetype: {
    type: String,
  },
  latitude: {
    type: String,
  },
  longitude: {
    type: String,
  },
  fileDocsPdf: {
    name: { type: String },
    filePath: { type: String },
    size: { type: String },
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
MessageSchema.plugin(aggregatePaginate);
export default mongoose.model("messages", MessageSchema);

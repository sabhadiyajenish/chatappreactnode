import mongoose from "mongoose";
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const CoversationSchema = mongoose.Schema({
  members: [],
});

export default mongoose.model("conversations", CoversationSchema);

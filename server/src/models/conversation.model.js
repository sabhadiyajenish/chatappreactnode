import mongoose from "mongoose";
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const CoversationSchema = mongoose.Schema({
  members: [],
});

CoversationSchema.index({ members: 1 }); // Optimizes lookups for conversations between members

export default mongoose.model("conversations", CoversationSchema);

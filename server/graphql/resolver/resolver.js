import userModel from "../../src/models/user.model.js";
import Message from "../../src/models/message.model.js";
import Coversation from "../../src/models/conversation.model.js";

const ResolverGraphql = {
  Query: {
    getAllUsers: async () => await userModel.find({}),
    getAllMessage: async () => await Message.find(),
    getUserById: async (parents, { id }) =>
      await userModel.findById({ _id: id }),
  },
  Message: {
    senderId: async (user) => {
      return await userModel.find({ _id: user.senderId });
    },
  },
  ConverSation: {
    members: async (conv) => {
      const dt = await Coversation.findById(conv);
      const data = await userModel.find({ _id: { $in: dt.members } });
      return data;
    },
  },
};

export default ResolverGraphql;

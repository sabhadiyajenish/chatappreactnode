let users = [];
let lastSeen = {};

const SocketEvents = (io) => {
  io.on("connection", (socket) => {
    console.log(`New connection: ${socket.id}`);

    socket.on("addUser", (userId) => {
      socket.userId = userId;
      const isUser = users.find((user) => user.userId === userId);

      if (!isUser) {
        const user = { userId, socketId: socket.id };
        users.push(user);
        io.emit("getUser", users, lastSeen);
      }
      console.log("Connected users:", users);
    });

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Handle WebRTC signaling for audio call
    socket.on("offer", (data) => {
      socket.broadcast.emit("offer", data);
    });

    socket.on("answer", (data) => {
      socket.broadcast.emit("answer", data);
    });

    socket.on("ice-candidate", (data) => {
      socket.broadcast.emit("ice-candidate", data);
    });

    socket.on("disconnect", () => {
      const user = users.find((user) => user.socketId === socket.id);
      if (user) {
        lastSeen[user.userId] = new Date().toISOString();
        users = users.filter((user) => user.socketId !== socket.id);
        io.emit("getUser", users, lastSeen);
        console.log(`User disconnected: ${socket.id}`);
      }
    });
  });
};

export default SocketEvents;

// let users = [];
// let lastSeen = {};

// const SocketEvents = (io) => {
//   io.on("connection", (socket) => {
//     console.log(`New connection: ${socket.id}`);

//     socket.on("addUser", (userId) => {
//       socket.userId = userId;
//       const isUser = users.find((user) => user.userId === userId);

//       if (!isUser) {
//         const user = { userId, socketId: socket.id };
//         users.push(user);
//         io.emit("getUser", users, lastSeen);
//       }
//       console.log("Connected users:", users);
//     });

//     socket.on("joinRoom", (roomId) => {
//       socket.join(roomId);
//       console.log(`Socket ${socket.id} joined room ${roomId}`);
//     });
//     socket.on("signal", ({ signalData, receiverId }) => {
//       console.log(
//         "comen here>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
//         signalData,
//         receiverId
//       );
//       const receiver = users.find((user) => user.userId === receiverId);

//       console.log(receiver, "<<<<<<<<<<<<<<<<<<<", users);
//       io.to(receiver?.socketId).emit("streamUser", { signalData, receiverId });
//     });

//     socket.on(
//       "addMessage",
//       ({
//         message,
//         avatar,
//         avatarVideo,
//         avatarVideoThumb,
//         reciverId,
//         senderId,
//         userDelete,
//         reciverDelete,
//         uniqueId,
//         seen,
//         seenAt,
//         userName,
//         latitude,
//         longitude,
//         fileDocsPdf,
//       }) => {
//         const receiver = users.find((user) => user.userId === reciverId);
//         const sender = users.find((user) => user.userId === senderId);

//         if (receiver) {
//           io.to(receiver?.socketId)
//             .to(sender?.socketId)
//             .emit("getMessage", [
//               {
//                 message,
//                 avatar,
//                 avatarVideo,
//                 avatarVideoThumb,
//                 senderId,
//                 reciverId,
//                 userDelete,
//                 reciverDelete,
//                 uniqueId,
//                 latitude,
//                 longitude,
//                 fileDocsPdf,
//                 seen,
//                 seenAt,
//                 createdAt: new Date(),
//               },
//             ]);
//           io.to(receiver?.socketId).emit("getMessageNotification", [
//             {
//               message,
//               avatar,
//               avatarVideo,
//               avatarVideoThumb,
//               senderId,
//               reciverId,
//               userDelete,
//               reciverDelete,
//               uniqueId,
//               userName,
//               latitude,
//               longitude,
//               fileDocsPdf,
//               seen,
//               seenAt,
//               createdAt: new Date(),
//             },
//           ]);
//         } else {
//           io.to(sender?.socketId).emit("getMessage", [
//             {
//               message,
//               avatar,
//               avatarVideo,
//               avatarVideoThumb,
//               senderId,
//               reciverId,
//               userDelete,
//               reciverDelete,
//               uniqueId,
//               latitude,
//               longitude,
//               fileDocsPdf,
//               seen,
//               seenAt,
//               createdAt: new Date(),
//             },
//           ]);
//           io.to(sender?.socketId).emit("getMessageNotificationInMongoDb", [
//             {
//               message,
//               avatar,
//               avatarVideo,
//               avatarVideoThumb,
//               senderId,
//               reciverId,
//               userDelete,
//               reciverDelete,
//               latitude,
//               longitude,
//               uniqueId,
//               userName,
//               fileDocsPdf,
//               seen,
//               seenAt,
//               createdAt: new Date(),
//             },
//           ]);
//         }
//       }
//     );

//     socket.on(
//       "sentVideoCallInvitation",
//       ({ senderId, reciverId, reciverEmail, senderEmail, roomId }) => {
//         const receiver = users.find((user) => user.userId === reciverId);
//         const sender = users.find((user) => user.userId === senderId);

//         if (receiver) {
//           io.to(receiver?.socketId)
//             .to(sender?.socketId)
//             .emit("getVideoCallInvitation", {
//               senderId,
//               reciverId,
//               reciverEmail,
//               senderEmail,
//               roomId,
//               createdAt: new Date(),
//             });
//         } else {
//           io.to(sender?.socketId).emit("getVideoCallInvitation", {
//             senderId,
//             reciverId,
//             reciverEmail,
//             senderEmail,
//             roomId,
//             createdAt: new Date(),
//           });
//         }
//       }
//     );

//     socket.on(
//       "cutVideoCall",
//       ({ senderId, reciverId, reciverEmail, senderEmail }) => {
//         const receiver = users.find((user) => user.userId === reciverId);
//         const sender = users.find((user) => user.userId === senderId);

//         if (receiver) {
//           io.to(receiver?.socketId)
//             .to(sender?.socketId)
//             .emit("getCutVideoCall", {
//               senderId,
//               reciverId,
//               reciverEmail,
//               senderEmail,
//               createdAt: new Date(),
//             });
//         } else {
//           io.to(sender?.socketId).emit("getCutVideoCall", {
//             senderId,
//             reciverId,
//             reciverEmail,
//             senderEmail,
//             createdAt: new Date(),
//           });
//         }
//       }
//     );
//     socket.on(
//       "AcceptVideoCallByUser",
//       ({ senderId, reciverId, reciverEmail, senderEmail }) => {
//         const sender = users.find((user) => user.userId === senderId);

//         if (sender) {
//           io.to(sender?.socketId).emit("getAcceptVideoCallByUser", {
//             senderId,
//             reciverId,
//             reciverEmail,
//             senderEmail,
//             createdAt: new Date(),
//           });
//         }
//       }
//     );
//     socket.on(
//       "CutVideoCallByOutsideUser",
//       ({ senderId, reciverId, reciverEmail, senderEmail }) => {
//         const receiver = users.find((user) => user.userId === reciverId);
//         const sender = users.find((user) => user.userId === senderId);

//         if (receiver) {
//           io.to(receiver?.socketId)
//             .to(sender?.socketId)
//             .emit("getCutVideoCallByOutsideUser", {
//               senderId,
//               reciverId,
//               reciverEmail,
//               senderEmail,
//               createdAt: new Date(),
//             });
//           io.to(sender?.socketId).emit("getCutVideoCallAfterPopup", {
//             senderId,
//             reciverId,
//             reciverEmail,
//             senderEmail,
//             createdAt: new Date(),
//           });
//         } else {
//           io.to(sender?.socketId).emit("getCutVideoCallByOutsideUser", {
//             senderId,
//             reciverId,
//             reciverEmail,
//             senderEmail,
//             createdAt: new Date(),
//           });
//           io.to(sender?.socketId).emit("getCutVideoCallAfterPopup", {
//             senderId,
//             reciverId,
//             reciverEmail,
//             senderEmail,
//             createdAt: new Date(),
//           });
//         }
//       }
//     );

//     socket.on("addUserTypingStatus", ({ status, reciverId, senderId }) => {
//       const receiver = users.find((user) => user.userId === reciverId);
//       const sender = users.find((user) => user.userId === senderId);
//       if (receiver) {
//         io.to(receiver.socketId).emit("getUserTypingStatus", [
//           {
//             status,
//             senderId,
//             reciverId,
//           },
//         ]);
//       }
//     });
//     socket.on(
//       "addUserNew",
//       ({ email, _id, avatar, userName, senderId, reciverId }) => {
//         const receiver = users.find((user) => user.userId === reciverId);
//         const sender = users.find((user) => user.userId === senderId);

//         if (receiver) {
//           io.to(receiver?.socketId)
//             .to(sender?.socketId)
//             .emit("getNewUserData", {
//               _id,
//               email,
//               avatar,
//               userName,
//               senderId,
//               reciverId,
//             });
//         } else {
//           io.to(sender?.socketId).emit("getNewUserData", {
//             _id,
//             email,
//             avatar,
//             userName,
//             senderId,
//             reciverId,
//           });
//         }
//       }
//     );

//     socket.on(
//       "deleteMessageFromBoth",
//       ({ date, uniqueId, senderId, reciverId }) => {
//         const receiver = users.find((user) => user.userId === reciverId);
//         const sender = users.find((user) => user.userId === senderId);

//         if (receiver) {
//           io.to(receiver?.socketId)
//             .to(sender?.socketId)
//             .emit("GetdeleteMessageFromBoth", {
//               uniqueId,
//               date,
//               senderId,
//               reciverId,
//             });
//         } else {
//           io.to(sender?.socketId).emit("GetdeleteMessageFromBoth", {
//             uniqueId,
//             date,
//             senderId,
//             reciverId,
//           });
//         }
//       }
//     );

//     socket.on(
//       "SetMessageSeenConfirm",
//       ({ date, messageId, reciverId, senderId }) => {
//         const receiver = users.find((user) => user.userId === reciverId);
//         if (receiver) {
//           io.to(receiver?.socketId).emit("messageSeenConfirmation", {
//             date,
//             messageId,
//             receiver,
//             reciverId,
//             senderId,
//           });
//         }
//       }
//     );
//     socket.on("addUserData", ({ userName, email, password }) => {
//       io.emit("getUserData", [
//         {
//           userName,
//           email,
//           password,
//         },
//       ]);
//     });

//     socket.on("offer", (data) => {
//       console.log("offers", data);

//       socket.broadcast.emit("offer", data);
//     });
//     socket.emit("me1", socket.id);
//     socket.on("call-user1", (data) => {
//       io.to(data.userToCall).emit("receive-call1", {
//         signal: data.signal,
//         from: data.from,
//       });
//     });

//     socket.on("answer-call1", (data) => {
//       io.to(data.to).emit("call-accepted1", data.signal);
//     });

//     socket.on("answer", (data) => {
//       console.log("answer", data);

//       socket.broadcast.emit("answer", data);
//     });

//     socket.on("ice-candidate", (data) => {
//       console.log("ice-candeldate", data);

//       socket.broadcast.emit("ice-candidate", data);
//     });

//     socket.on("disconnect", () => {
//       const user = users.find((user) => user.socketId === socket.id);
//       if (user) {
//         // Record the last seen time for the disconnected user
//         lastSeen[user.userId] = new Date().toISOString();
//         users = users.filter((user) => user.socketId !== socket.id);
//         io.emit("getUser", users, lastSeen);
//         console.log(`User disconnected: ${socket.id}`);
//         console.log("Remaining users:", users);
//       }
//     });
//   });
// };

// export default SocketEvents;

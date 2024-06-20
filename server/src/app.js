import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import passport from "passport";
import session from "express-session";
const io = new Server(2525, {
  cors: {
    origin: true,
  },
});
const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.options(
  "*",
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "20kb",
  })
);

app.use(express.urlencoded({ extended: true, limit: "20kb" }));

app.use(express.static("public"));

app.use(cookieParser());
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    name: "clone_app",
    // cookie: { secure: true }
  })
);
app.use(passport.initialize());
app.use(passport.session());

import userRoutes from "./routes/user.route.js";
import messageRoutes from "./routes/message.route.js";

let users = [];
let lastSeen = {};

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

  socket.on(
    "addMessage",
    ({
      message,
      reciverId,
      senderId,
      userDelete,
      reciverDelete,
      uniqueId,
      seen,
      seenAt,
      userName,
    }) => {
      const receiver = users.find((user) => user.userId === reciverId);
      const sender = users.find((user) => user.userId === senderId);

      if (receiver) {
        io.to(receiver?.socketId)
          .to(sender?.socketId)
          .emit("getMessage", [
            {
              message,
              senderId,
              reciverId,
              userDelete,
              reciverDelete,
              uniqueId,
              seen,
              seenAt,
              createdAt: new Date(),
            },
          ]);
        io.to(receiver?.socketId).emit("getMessageNotification", [
          {
            message,
            senderId,
            reciverId,
            userDelete,
            reciverDelete,
            uniqueId,
            userName,
            seen,
            seenAt,
            createdAt: new Date(),
          },
        ]);
      } else {
        io.to(sender?.socketId).emit("getMessage", [
          {
            message,
            senderId,
            reciverId,
            userDelete,
            reciverDelete,
            uniqueId,
            seen,
            seenAt,
            createdAt: new Date(),
          },
        ]);
      }
    }
  );

  socket.on("addUserTypingStatus", ({ status, reciverId, senderId }) => {
    const receiver = users.find((user) => user.userId === reciverId);
    const sender = users.find((user) => user.userId === senderId);
    if (receiver) {
      io.to(receiver.socketId).emit("getUserTypingStatus", [
        {
          status,
          senderId,
          reciverId,
        },
      ]);
    }
  });
  socket.on(
    "addUserNew",
    ({ email, _id, avatar, userName, senderId, reciverId }) => {
      const receiver = users.find((user) => user.userId === reciverId);
      const sender = users.find((user) => user.userId === senderId);

      if (receiver) {
        io.to(receiver?.socketId).to(sender?.socketId).emit("getNewUserData", {
          _id,
          email,
          avatar,
          userName,
          senderId,
          reciverId,
        });
      } else {
        io.to(sender?.socketId).emit("getNewUserData", {
          _id,
          email,
          avatar,
          userName,
          senderId,
          reciverId,
        });
      }
    }
  );

  socket.on(
    "deleteMessageFromBoth",
    ({ date, uniqueId, senderId, reciverId }) => {
      const receiver = users.find((user) => user.userId === reciverId);
      const sender = users.find((user) => user.userId === senderId);

      if (receiver) {
        io.to(receiver?.socketId)
          .to(sender?.socketId)
          .emit("GetdeleteMessageFromBoth", {
            uniqueId,
            date,
            senderId,
            reciverId,
          });
      } else {
        io.to(sender?.socketId).emit("GetdeleteMessageFromBoth", {
          uniqueId,
          date,
          senderId,
          reciverId,
        });
      }
    }
  );

  socket.on("SetMessageSeenConfirm", ({ date, messageId, reciverId }) => {
    const receiver = users.find((user) => user.userId === reciverId);
    if (receiver) {
      io.to(receiver?.socketId).emit("messageSeenConfirmation", {
        date,
        messageId,
        receiver,
      });
    }
  });
  socket.on("addUserData", ({ userName, email, password }) => {
    io.emit("getUserData", [
      {
        userName,
        email,
        password,
      },
    ]);
  });

  socket.on("disconnect", () => {
    const user = users.find((user) => user.socketId === socket.id);
    if (user) {
      // Record the last seen time for the disconnected user
      lastSeen[user.userId] = new Date().toISOString();
      users = users.filter((user) => user.socketId !== socket.id);
      io.emit("getUser", users, lastSeen);
      console.log(`User disconnected: ${socket.id}`);
      console.log("Remaining users:", users);
    }
  });
});

app.get("/", (req, res) => {
  res.json(
    "This Apis Working Perfectly in Vercel it is just for checking pupose only so dont mind."
  );
});
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/messages", messageRoutes);

// socket connection code

// const io = new Server(2525, {
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"]
//     }
// });

// io.on("connection", (socket) => {
//     // socket.emit("me", socket.id);
// });

export default app;

// let arr = ["jenish", "rahul", "maulik", "chetan", "pradip", "mohit", "ram", "sita", "gita"];
// const arr1 = ["gunjan", "sumit", "arpit", "sdd"];
// const arrr = [1, 2, [3, 4, [5, 6, [7, 8, [9, 10]]], [34]], 10];
// let newArr = [];

// const arr = [{ name: "jenish", password: "12345" }, { name: "maulik", password: "12345" }];

// function jens(d) {
//     arr.forEach((date) => {
//         attendance[date] = {};
//     });
//     let i = 0;
//     Object.keys(attendance).map((date) => {
//         attendance[date] = userInfo1[i];
//         i++;
//     })
//     // console.log(attendance);

//     Object.entries(attendance).map(async (d) => {
//         // console.log(d);

//         const pro = await new Promise((res, rej) => {

//             setTimeout(() => {
//                 console.count("suhsuhsb");
//                 res("completed..");
//             }, 2000);
//         })

//         console.log(pro);

//     })
//     return attendance;
// };
// let data = jens();
// console.log(data);

// const user = 3957;

// Number.prototype.ConvertArr = function () {
//     const data = this.toString().split("").join("");
//     console.log(Number(data));
// }
// Array.prototype.ConvertFlat = function () {
//     let sum = [];
//     function jens(ele) {

//         ele.forEach(Element => {
//             typeof Element == "object" ? jens(Element) : sum.push(Element)
//         })
//     }
//     jens(this);
//     // console.log(sum);
//     return sum;
// }
// // user.ConvertArr();
// // let arr1 = [];
// let a = [1, 2, [3, 4, [5, 6, [7, 8]], [9]]].ConvertFlat();
// console.log(a);

// const java1 = {
//     name: "jenish sabhadiya",
//     jenish: function () {
//         console.log(this.name);
//     }
// };
// const java2 = {
//     name: "parv jiyani",
//     __proto__: java1
// };
// java2.jenish();

// Array.prototype.customForEach = function (callBack, thiscontext) {
//     if (typeof callBack !== "function") {
//         throw "not a function";
//     }
//     // console.log(this);
//     const length = this.length;
//     let i = 0;
//     while (i < length) {
//         if (this.hasOwnProperty(4)) {
//             callBack(this[i], i, thiscontext, this);
//         }
//         i++;
//     }
// }

// const arr1 = [1, 2, 3, 4, 8, 355, 353, 5];
// arr1.customForEach((...args) => {
//     console.log(`${args[0]}`);
// }, 15);

// const arr1 = [1, 2, 3, 4, 5, 6, 7];
// arr1.forEach(element => {
//     console.log(element);
// });

// let sum = 0;
// function jens(a) {
//     for (let i = 0; i < a; i++) {
//         sum += i;
//     }
//     return sum;
// }
// const memorize = (fun) => {
//     let cache = {};
//     return function (...args) {
//         let n = args[0];
//         // console.log(cache[n]);
//         if (n in cache) {
//             console.log("ha che");
//             return cache[n];
//         } else {
//             console.log("nathi");
//             let res = fun(n);
//             cache[n] = res;
//             console.log(cache);
//             return res;
//         }
//     }
// }
// console.time();
// const dt = memorize(jens)(20);

// console.log(dt);
// console.timeEnd();

// console.time();
// const dt1 = memorize(jens)(20);

// console.log(dt1);
// console.timeEnd();

// function jens(arr) {
//     arr.forEach(element => {
//         typeof element == "object" ? jens(element) : newArr.push(element);
//     });
// }
// jens(arrr);
// console.log(newArr);
// const arr = [1, 2, 3, 4, 5];
// const [a, ...b] = arr;
// console.log(b);

// const arr = [1, 2, 3, 4, 5, 6];
// const arr1 = [4, 5, 10, 20, 30, 40];
// let arr2 = [];
// let a = 0;
// for (let i = 0; i < arr.length; i++) {
//     for (let j = 0; j < arr1.length; j++) {
//         const sum = arr[i] + arr1[j]
//         if (sum > a) {
//             a = sum;
//         }
//     }
// }
// console.log(a);

// function findFactorial(num) {
//     if (num === 0) return 1
//     console.log("num", num);
//     let factorial = num * findFactorial(num - 1)
//     console.log("fact", factorial);
//     return factorial;
// }

// console.log(findFactorial(2));

// const arr = { jenish: "123", maulik: "456", rahul: "789" };
// const { jenish, ...data } = arr;
// console.log(data);

// const asy = new Promise((resolve, reject) => {
//     resolve("running code....");
// }).then((e) => console.log(e + " very niche ways")).catch(() => console.log("somehiung wrong here...."));

// jens();
// function jens() {
//     console.log("good morning");
// }

// const name1 = "jenish";
// const xyz = function (a) {
//     console.log(">>>>>>>>>>>");
//     let incre = 0;
//     return {
//         Increment: function (b) {
//             incre += b;
//         },
//         Decrement: function (c) {
//             incre -= c;
//         },
//         View: function () {
//             return incre;
//         }
//     };
// }
// const data1 = xyz(10);
// data1.Increment(10);
// console.log(data1.View());
// data1.Decrement(5);
// console.log(data1.View());

// console.log(data1(10));

// const arr = "jenishSabhadiya";
// console.log(arr.toLocaleLowerCase());

// const arr = [20, 10, 40, 60, 30, 70, 50, 80, 90];
// const arr1 = ["jenish", "maulik", "rahul", "sabhadiya"];

// function jens() {
//     let data = [];
//     for (let i = arr.length - 1; i >= 0; i--) {
//         console.log(arr[i]);
//         const name = arr1[0];
//         data.push({
//             "monday": [{
//                 name: "ram",
//                 value: arr[i]
//             }, {
//                 name: "sita",
//                 value: arr[i]
//             }, {
//                 name: "shyam",
//                 value: arr[i]
//             }, {
//                 name: "radha",
//                 value: arr[i]
//             }]
//         });
//     }
//     data?.map((a, key) => a.monday.map((b, k) => console.log(b.name)));
// }
// jens();

// // const arr = ["jenish", "maulik", "rahul", "sumit", "arpit"];
// // const arr1 = [20, 10, 40, 60, 30, 70, 50, 80, 90];
// // function checking() {
// //     const data = [];
// //     for (let i = 0; i < arr1.length; i++) {
// //         for (let j = 0; j < arr1.length; j++) {
// //             if (arr1[j] > arr1[i]) {
// //                 let temp = arr1[j];
// //                 arr1[j] = arr1[i];
// //                 arr1[i] = temp;
// //                 console.log(">>>>>temp", temp);
// //                 console.log(">>>>>iiii", arr1[i]);
// //                 console.log(">>>>>jjjj", arr1[j]);

// //             }
// //         }
// //         console.log(` ${arr1.indexOf(arr1[i])} idex done ${arr1}`);
// //     }
// //     console.log(arr1);
// //     // console.log(40 > 30);
// // }
// // checking();

// // console.log(20 > 30);

// // const data = arr.toString(); convert array into string
// // const data = arr1.join("-"); convert array into string using any specific icons
// // const data = arr1.concat(arr);  merge all array into one array
// // const data = arr.pop(); delete last element of an array
// // const data = arr.push("gunjan"); add last Element of an array
// // const data = arr.shift(); delete first element of an array
// // const data = arr.unshift("gunjan"); add fisrt element of an array
// // const data = delete arr[0]; delete element from array using index id and display empty item
// // const data = arr1.sort((a, b) => b - a); sort the array from lowest and highest numbers
// // const data = arr.splice(2, 0,"gunjan"); add element in array in specific using index id and delete
// // const data = arr.slice(1,3); give array base upon start and end index id
// // const data = arr1.reverse(); reverse array.
// // const data = Array.isArray(arr); check ia array if have return true otherwise false
// // const data = arr1.indexOf(90); find index id using element if not found return -1 this work left to  right
// // const data = arr1.lastIndexOf(50, 6); find index id using element and start index id this work right to left
// // const data = arr1.find((e) => e == 40);  if find value return only this element
// // const data = arr1.findIndex((e) => e == "90"); if find value return index id particular element
// // const data = arr1.includes(70); this return true if find this value otherwise return false
// // const data = arr1.entries();
// // for (let x of data) {
// //   console.log(x);    return key value pair data
// // }

// // const data = arr1.reduce((a, b) => {
// //     console.log("valuje b", b, a);
// //     return a + b                 use for singlw value left to right
// // });
// // const data = arr1.reduceRight((a, b) => {
// //     console.log("valuje b", b, a);
// //     return a + b                use for single value right to left
// // });

// // const data = Array.from("jenish"); create array for specific character
// // console.log(data);

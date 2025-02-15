import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import NotificationComponent from "../../component/Notification";
import useForm from "./useForm";
import TodoList from "./TodoList";
import FolStruc from "./FolStruc";

const Home = () => {
  return (
    <>
      <h1>Home</h1>
      {/* <TodoList /> */}
      <FolStruc />
    </>
  );
};
// const Accordion = () => {
//   const [userCount, setUserCount] = useState(0);
//   const [userCount1, setUserCount1] = useState(0);

//   const userNameRef = useRef(0);
//   const userNameRef1 = useRef(0);

//   const Debouncing = (fun, delay) => {
//     let timer;
//     return (...args) => {
//       clearTimeout(timer);
//       timer = setTimeout(() => {
//         fun(...args);
//       }, delay);
//     };
//   };
//   const Thoatlings = (fun, delay) => {
//     let timer;
//     return (...args) => {
//       if (!timer) {
//         timer = setTimeout(() => {
//           fun(...args);
//           timer = null;
//         }, delay);
//       }
//     };
//   };

//   const forLogs = () => {
//     setUserCount(userNameRef.current || 0);

//     console.log("userCount", userNameRef.current);
//   };
//   const forLogs1 = () => {
//     setUserCount1(userNameRef1.current);
//     console.log("userCount", userNameRef1.current);
//   };
//   const howManytimesCluicks = () => {
//     userNameRef.current += 1;
//   };
//   const howManytimesCluicks1 = () => {
//     userNameRef1.current += 1;
//   };
//   const MainDebounce = useMemo(() => Debouncing(forLogs, 1000), []);
//   const MainDebounce1 = useMemo(() => Thoatlings(forLogs1, 2000), []);

//   return (
//     <>
//       <div className=" prose">
//         <h1>{userCount}</h1>

//         <button
//           onClick={(e) => {
//             howManytimesCluicks(e);
//             MainDebounce(e);
//           }}
//           className=" bg-red-300 px-3 active:bg-red-700"
//         >
//           Debounce
//         </button>
//         <h1>{userCount1}</h1>

//         <button
//           onClick={(e) => {
//             howManytimesCluicks1(e);
//             MainDebounce1(e);
//           }}
//           className=" bg-red-300 ml-5 px-3 active:bg-red-700"
//         >
//           Troatling{" "}
//         </button>
//       </div>
//     </>
//   );
// };
// const Apple = () => {
//   const [userName, setUserName] = useState(0);
//   const [userName1, setUserName1] = useState(0);

//   const userNameRef = useRef(0);
//   const userNameRef1 = useRef(0);

//   console.log("<<<<<", userNameRef);

//   const setDebounciing = (fn, delay) => {
//     let timer;
//     return (...args) => {
//       clearTimeout(timer);
//       timer = setTimeout(() => {
//         fn(...args);
//       }, delay);
//     };
//   };

//   const thorlingS = (fn, delay) => {
//     let timer1;

//     return (...args) => {
//       if (!timer1) {
//         fn(...args); // Call the function immediately
//         timer1 = setTimeout(() => {
//           timer1 = null; // Reset the timer after the delay
//         }, delay);
//       }
//     };
//   };

//   const jenish = (e) => {
//     console.log("Throttled value:", e.target.value);
//     setUserName(userNameRef.current);
//   };
//   const SecondFun = () => {
//     userNameRef.current = userNameRef.current + 1;
//   };
//   const FirsrtNameData = () => {
//                          userNameRef1.current = userNameRef1.current + 1;
//   };
//   const thusIsfun = setDebounciing(jenish, 1000); // Debouncing for the first input
//   const thusIsThrot = useMemo(
//     () =>
//       thorlingS((e) => {
//         console.log("sabhadoiya");
//         setUserName1(userNameRef1.current);
//       }, 1000),
//     []
//   ); // Throttling for the second input

//   return (
//     <>
//       <h1>Home pages</h1>
//       <h4>{userName}</h4>

//       <div
//         className="w-10 h-10 bg-black"
//         onClick={(e) => {
//           SecondFun(e);
//           thusIsfun(e);
//         }}
//       ></div>
//       <h4>{userName1}</h4>

//       <div
//         className="w-10 mt-10 h-10 bg-black"
//         onClick={(e) => {
//           FirsrtNameData(e);
//           thusIsThrot(e);
//         }}
//       ></div>
//       <form>
//         <input name="userName" onChange={thusIsfun} placeholder="Enter name" />
//         <input
//           name="password"
//           onChange={thusIsThrot}
//           placeholder="Enter password"
//         />
//       </form>
//     </>
//   );
// };

// const Home = () => {
//   const { values, handleChange, reset } = useForm({
//     userName: "",
//     password: "",
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("Values:", values);
//     reset();
//   };

//   return (
//     <>
//       <h1>Home pages</h1>
//       {/* Uncomment if needed */}
//       {/* <form onSubmit={handleSubmit}>
//         <input
//           name="userName"
//           onChange={handleChange}
//           placeholder="Enter name"
//           value={values.userName}
//         />
//         <input
//           name="password"
//           onChange={handleChange}
//           placeholder="Enter password"
//           value={values.password}
//         />
//         <input type="submit" />
//       </form> */}
//       <NotificationComponent />
//       <Apple />
//     </>
//   );
// };

export default Home;

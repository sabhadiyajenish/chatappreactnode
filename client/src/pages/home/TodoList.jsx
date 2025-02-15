import React, { useId, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
const TodoList = () => {
  const [editable, setEditable] = useState(null);
  const [getValue, setGetValue] = useState({
    userName: "",
    category: "",
    id: "",
  });
  const [userInput, setUserInput] = useState({
    userName: "",
    category: "todo",
  });
  const [task, setTask] = useState({
    todo: [
      {
        id: uuidv4(),
        userName: "jenish",
        category: "todo",
      },
      {
        id: uuidv4(),
        userName: "maulik",
        category: "todo",
      },
    ],
    process: [
      {
        id: uuidv4(),
        userName: "sumit",
        category: "process",
      },
      {
        id: uuidv4(),
        userName: "arpit",
        category: "process",
      },
    ],
    completed: [
      {
        id: uuidv4(),
        userName: "shyam",
        category: "completed",
      },
    ],
  });

  const getCategory = useMemo(() => Object.keys(task), [task]);

  const HandleChange = (e) => {
    setUserInput((prev) => ({
      ...prev, // Spread the previous state object
      [e.target.name]: e.target.value, // Update the specific field
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editable) {
      if (userInput.userName && userInput.category) {
        setTask((prev) => ({
          ...prev,
          [userInput.category]: [
            ...prev[userInput.category],
            {
              id: uuidv4(),
              userName: userInput.userName,
              category: userInput.category,
            },
          ],
        }));
        setUserInput({
          userName: "",
          category: "todo",
        });
      }
    } else {
      // console.log(userInput, editable);
      if (editable.oldCategory !== userInput.category) {
        getCategory?.map((item) => {
          if (editable.oldCategory === item) {
            const data = task[item]?.filter(
              (dt) =>
                dt?.id !== editable.id || dt?.category !== editable.oldCategory
            );
            setTask((prev) => ({ ...prev, [item]: data }));
          }
        });
        if (userInput.userName && userInput.category) {
          setTask((prev) => ({
            ...prev,
            [userInput.category]: [
              ...prev[userInput.category],
              {
                id: uuidv4(),
                userName: userInput.userName,
                category: userInput.category,
              },
            ],
          }));
        }
      } else {
        getCategory?.map((item) => {
          if (userInput.category === item) {
            const data = task[item]?.map((dt) =>
              dt?.id === editable.id
                ? { ...dt, userName: userInput.userName }
                : dt
            );
            setTask((prev) => ({ ...prev, [item]: data }));
          }
        });
      }

      setEditable(null);
      setUserInput({
        userName: "",
        category: "todo",
      });
    }
  };

  const handleDelete = (id) => {
    getCategory?.map((item) => {
      const data = task[item]?.filter((dt) => dt?.id !== id);
      setTask((prev) => ({ ...prev, [item]: data }));
    });
  };

  return (
    <>
      <div>
        <div className="container mx-auto">
          <div>
            <form onSubmit={handleSubmit}>
              <input
                className="p-2 border-3 border-green-200"
                placeholder="enter username"
                name="userName"
                defaultValue={getValue.userName || ""}
                onChange={HandleChange}
                value={userInput.userName}
              />
              <select
                name="category"
                value={userInput?.category}
                defaultChecked={getValue?.category || ""}
                onChange={HandleChange}
                className="border-3 border-green-200"
              >
                {getCategory?.map((dt) => (
                  <option value={dt}>{dt}</option>
                ))}
              </select>
              <button type="submit">{editable ? "Edit" : "Add"}</button>
            </form>
            <button
              className="bg-green-300 m-4"
              onClick={() => {
                setEditable(null);
                setUserInput({
                  userName: "",
                  category: "todo",
                });
              }}
            >
              Clear
            </button>
          </div>
          <div className="w-full">
            <div className="flex justify-center text-center gap-x-8">
              {getCategory?.map((dt, key) => {
                return (
                  <PersonalTodo name={dt} key1={key}>
                    {task[dt]?.map((cate, key1) => {
                      return (
                        <>
                          <div className=" flex gap-x-6  ml-5  items-center">
                            <h3 className="h-10">{cate?.userName}</h3>
                            <button
                              onClick={() => {
                                setUserInput({
                                  userName: cate?.userName,
                                  category: cate?.category,
                                });
                                setEditable({
                                  id: cate?.id,
                                  oldCategory: cate.category,
                                });
                              }}
                              className="bg-green-400 h-10 px-3 mt-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(cate?.id)}
                              className="bg-red-400 h-10 px-3 mt-2"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      );
                    })}
                  </PersonalTodo>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const PersonalTodo = ({ name, key1, children }) => {
  return (
    <>
      <div className="prose border-4 w-full border-red-400 h-fit" key={key1}>
        <h1>{name}</h1>
        {children}
      </div>
    </>
  );
};

export default TodoList;

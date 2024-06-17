import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { HiOutlineDotsVertical } from "react-icons/hi";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const DeleteModel = ({ data }) => {
  console.log("i check data is updated or not<<<<", data);
  return (
    <Menu as="div" className="relative ml-3">
      <Menu.Button>
        <HiOutlineDotsVertical className="ml-1 z-10 -mr-1 mt-[10px] cursor-pointer " />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute top-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Menu.Item>
            {({ active }) => (
              <button
                className={classNames(
                  active ? "w-full bg-gray-100" : "",
                  "w-full block px-4 py-2 text-sm text-gray-700"
                )}
              >
                delete Message
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default DeleteModel;

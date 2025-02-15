import React, { useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const arr = [
  {
    id: uuidv4(),
    type: "folder",
    name: "Root",
    children: [
      {
        id: uuidv4(),
        type: "folder",
        name: "Folder 1",
      },

      {
        id: uuidv4(),
        type: "folder",
        name: "Folder 3",
        children: [],
      },
    ],
  },
];

const Files = ({ name, folderId, DeleteFilesInTree, EditFileName }) => {
  return (
    <div className="flex h-fit items-end gap-x-5">
      <h4 className="text-[16px] mt-3 font-normal">📄 {name}</h4>
      <button
        className="bg-red-300 px-2"
        onClick={() => DeleteFilesInTree(folderId)}
      >
        - delete
      </button>
      <button
        className="bg-pink-300 px-2"
        onClick={() => EditFileName(folderId, name)}
      >
        - Edit
      </button>
    </div>
  );
};

const Folders = ({
  name,
  children,
  AddFolderInTree,
  AddFilesInTree,
  DeleteFilesInTree,
  EditFileName,
  folderId,
  index,
}) => {
  return (
    <div className="">
      <div className="flex items-end gap-x-5">
        <h3 className="text-[20px] mt-3 font-medium">📁 {name}</h3>
        <button
          className="bg-green-300 px-2"
          onClick={() => AddFolderInTree(folderId)}
        >
          + Folder
        </button>
        <button
          className="bg-blue-300 px-2"
          onClick={() => AddFilesInTree(folderId)}
        >
          + File
        </button>
        <button
          className="bg-red-300 px-2"
          onClick={() => DeleteFilesInTree(folderId)}
        >
          - delete
        </button>
        <button
          className="bg-pink-300 px-2"
          onClick={() => EditFileName(folderId, name)}
        >
          - Edit
        </button>
      </div>
      <div className="ml-4">{children}</div>
    </div>
  );
};

const FolStruc = () => {
  const [tree, setTree] = useState(arr);

  const [nameOfFolder, setNameOfFolder] = useState("");
  const [editfile, setEditFile] = useState(null);

  const AddFolderInTree = (folderId) => {
    if (nameOfFolder !== "") {
      const checkDuplicate = (nodes) => {
        return nodes?.some(
          (node) =>
            node.id === folderId &&
            node.children?.some((child) => child.name === nameOfFolder)
        );
      };

      if (checkDuplicate(tree)) {
        alert("A folder with this name already exists!");
        return;
      }

      const sum = (nodes) => {
        return nodes?.map((node) => {
          if (node.id === folderId) {
            return {
              ...node,
              children: [
                ...(node.children || []),
                {
                  id: uuidv4(),
                  type: "folder",
                  name: nameOfFolder || "Auto folder",
                  children: [],
                },
              ],
            };
          }
          if (node && node.children) {
            return {
              ...node,
              children: sum(node.children),
            };
          }
          return node;
        });
      };
      setTree(sum(tree));
    }
    setNameOfFolder("");
  };

  const AddFilesInTree = (folderId) => {
    if (nameOfFolder !== "") {
      const sum = (nodes) => {
        return nodes?.map((node) => {
          if (node.id === folderId) {
            return {
              ...node,
              children: [
                ...(node.children || []),
                {
                  id: uuidv4(),
                  type: "file",
                  name: `${nameOfFolder}.txt` || "Auto file",
                },
              ],
            };
          }
          if (node && node.children) {
            return {
              ...node,
              children: sum(node.children),
            };
          }
          return node;
        });
      };
      setTree(sum(tree));
    }
    setNameOfFolder("");
  };

  const DeleteFilesInTree = (fileId) => {
    const filterTree = (nodes) => {
      return nodes
        ?.filter((node) => node.id !== fileId) // Filter out the node to be deleted
        .map((node) => {
          if (node.children) {
            return {
              ...node,
              children: filterTree(node.children), // Recursively filter children
            };
          }
          return node;
        });
    };
    setTree(filterTree(tree));
  };

  const EditFileName = (fileId, name) => {
    console.log(fileId, name);
    setEditFile(fileId);
    setNameOfFolder(name);
  };
  const renderTree = (nodes) => {
    return nodes?.map((node) => {
      if (node.type === "folder") {
        return (
          <Folders
            name={node.name}
            userFileInfo={nameOfFolder}
            AddFolderInTree={AddFolderInTree}
            AddFilesInTree={AddFilesInTree}
            DeleteFilesInTree={DeleteFilesInTree}
            EditFileName={EditFileName}
            folderId={node.id}
            key={node.id}
          >
            {renderTree(node.children)}
          </Folders>
        );
      }
      return (
        <Files
          name={node.name}
          key={node.id}
          DeleteFilesInTree={DeleteFilesInTree}
          EditFileName={EditFileName}
          folderId={node.id}
        />
      );
    });
  };

  const handleEditFiles = () => {
    if (editfile && nameOfFolder !== "") {
      const updateTree = (nodes) => {
        return nodes?.map((node) => {
          if (node.id === editfile) {
            return {
              ...node,
              name: nameOfFolder,
            };
          }
          if (node.children) {
            return {
              ...node,
              children: updateTree(node.children),
            };
          }
          return node;
        });
      };
      setTree(updateTree(tree));
      setEditFile(null);
      setNameOfFolder("");
    }
  };

  return (
    <div className="">
      <input
        name="nameOfFolder"
        placeholder="Enter Name of Files or Folders"
        value={nameOfFolder}
        onChange={(e) => setNameOfFolder(e.target.value)}
        minLength={1}
        maxLength={12}
      />
      {editfile && (
        <button className="bg-green-500 px-2 ml-4" onClick={handleEditFiles}>
          Edit
        </button>
      )}
      {editfile && (
        <button
          className="bg-green-500 px-2 ml-4"
          onClick={() => {
            setNameOfFolder("");
            setEditFile(null);
          }}
        >
          Reset
        </button>
      )}

      <div>{renderTree(tree)}</div>
    </div>
  );
};

export default FolStruc;

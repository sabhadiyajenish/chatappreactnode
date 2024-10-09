import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { useDropzone } from "react-dropzone";
import "./about.css";

const About = () => {
  const [canvas, setCanvas] = useState(null);
  const [baseImageSet, setBaseImageSet] = useState(false);
  const [isItemSelected, setIsItemSelected] = useState(false);
  const [isPaletteVisible, setPaletteVisible] = useState(true);
  const [selectedTextObject, setSelectedTextObject] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [fontSize, setFontSize] = useState(30);
  const [textColor, setTextColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#000000");
  const [borderRadius, setBorderRadius] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.2);
  const [textSpacing, setTextSpacing] = useState(0);
  const [wordSpacing, setWordSpacing] = useState(0);
  const [shapeBgColor, setShapeBgColor] = useState("#ff0000");
  const [layers, setLayers] = useState([]); // Layers state to manage layers
  const canvasRef = useRef(null);

  useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 1080,
      height: 800,
      selection: true,
    });
    setCanvas(fabricCanvas);

    const onSelectionChange = () => {
      const activeObject = fabricCanvas.getActiveObject();
      setIsItemSelected(!!activeObject);

      if (activeObject && activeObject.type === "textbox") {
        setSelectedTextObject(activeObject);
        setFontSize(activeObject.fontSize || 30);
        setTextColor(activeObject.fill || "#ffffff");
        setBgColor(activeObject.backgroundColor || "#000000");
        setBorderRadius(activeObject.cornerRadius || 0);
        setLineHeight(activeObject.lineHeight || 1.2);
        setTextSpacing(activeObject.textSpacing || 0);
        setWordSpacing(activeObject.wordSpacing || 0);
      } else if (
        activeObject &&
        (activeObject.type === "rect" || activeObject.type === "circle")
      ) {
        setSelectedObject(activeObject);
        setShapeBgColor(activeObject.fill || "#ff0000");
      } else {
        setSelectedTextObject(null);
        setSelectedObject(null);
      }
    };

    fabricCanvas.on("selection:created", onSelectionChange);
    fabricCanvas.on("selection:updated", onSelectionChange);
    fabricCanvas.on("selection:cleared", onSelectionChange);

    return () => {
      fabricCanvas.off("selection:created", onSelectionChange);
      fabricCanvas.off("selection:updated", onSelectionChange);
      fabricCanvas.off("selection:cleared", onSelectionChange);
      fabricCanvas.dispose();
    };
  }, []);

  const handleImageDrop = (acceptedFiles) => {
    if (!canvas) return;

    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgElement = new Image();
      imgElement.src = e.target.result;
      imgElement.onload = () => {
        if (!baseImageSet) {
          canvas.setWidth(imgElement.width);
          canvas.setHeight(imgElement.height);

          const imgInstance = new fabric.Image(imgElement, {
            left: 0,
            top: 0,
            scaleX: canvas.width / imgElement.width,
            scaleY: canvas.height / imgElement.height,
            selectable: false,
          });

          canvas.clear();
          canvas.add(imgInstance);
          canvas.renderAll();

          setBaseImageSet(true);
        } else {
          const imgInstance = new fabric.Image(imgElement, {
            left: 50,
            top: 50,
          });

          canvas.add(imgInstance);
          imgInstance.bringToFront();
          bringTextToFront();
          canvas.renderAll();
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const bringTextToFront = () => {
    if (canvas) {
      canvas.getObjects().forEach((obj) => {
        if (obj.type === "textbox") {
          obj.bringToFront();
        }
      });
      canvas.renderAll();
    }
  };

  const handleAddText = () => {
    if (!canvas) return;

    const text = new fabric.Textbox("Your Text Here", {
      left: 50,
      top: 50,
      fontSize: fontSize,
      fill: textColor,
      backgroundColor: bgColor,
      cornerRadius: borderRadius,
      lineHeight: lineHeight,
      textSpacing: textSpacing,
      wordSpacing: wordSpacing,
      editable: true,
      selectable: true,
    });

    canvas.add(text);
    addLayer(`Text Layer`);
    bringTextToFront();
    canvas.renderAll();
  };

  const handleDeleteSelected = () => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        canvas.remove(activeObject);
        canvas.discardActiveObject();
        canvas.renderAll();
        setIsItemSelected(false);
        setSelectedTextObject(null);
        setSelectedObject(null);
        removeLayer();
      }
    }
  };

  const handleAddShape = (shape) => {
    if (canvas) {
      let newShape;
      if (shape === "rectangle") {
        newShape = new fabric.Rect({
          left: 50,
          top: 50,
          fill: shapeBgColor,
          width: 100,
          height: 100,
        });
      } else if (shape === "circle") {
        newShape = new fabric.Circle({
          left: 50,
          top: 50,
          fill: shapeBgColor,
          radius: 50,
        });
      }
      canvas.add(newShape);
      addLayer(`Shape Layer: ${shape}`);
      canvas.renderAll();
    }
  };

  const addLayer = (name) => {
    setLayers((prevLayers) => [
      ...prevLayers,
      { name, id: new Date().getTime() },
    ]);
  };

  const removeLayer = () => {
    setLayers((prevLayers) => prevLayers.slice(0, -1));
  };

  const swapLayers = (index1, index2) => {
    const updatedLayers = [...layers];
    [updatedLayers[index1], updatedLayers[index2]] = [
      updatedLayers[index2],
      updatedLayers[index1],
    ];
    setLayers(updatedLayers);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: handleImageDrop,
  });

  // Function to update text object properties
  const updateTextObject = (prop, value) => {
    if (selectedTextObject) {
      selectedTextObject.set(prop, value);
      canvas.renderAll();
    }
  };

  // Function to update selected shape's background color
  const updateShapeBgColor = (value) => {
    if (selectedObject) {
      selectedObject.set("fill", value);
      canvas.renderAll();
      setShapeBgColor(value);
    }
  };

  return (
    <div className="flex">
      <div className="w-1/6 h-screen bg-gray-100 p-4">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-semibold">Layers</h2>
          <button
            className="bg-blue-500 text-white px-2 py-1 rounded"
            onClick={handleAddText}
          >
            Add Layer
          </button>
        </div>
        <ul className="space-y-2">
          {layers.map((layer, index) => (
            <li
              key={layer.id}
              className="layer-item flex items-center justify-between bg-white shadow-sm p-2 rounded-md"
            >
              <span>{layer.name}</span>
              <div className="flex space-x-2">
                {index > 0 && (
                  <button
                    className="swap-up bg-gray-300 px-2 py-1 rounded"
                    onClick={() => swapLayers(index, index - 1)}
                  >
                    ↑
                  </button>
                )}
                {index < layers.length - 1 && (
                  <button
                    className="swap-down bg-gray-300 px-2 py-1 rounded"
                    onClick={() => swapLayers(index, index + 1)}
                  >
                    ↓
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 p-4">
        <h1 className="text-3xl font-bold mb-4">Instagram Story Designer</h1>
        <div className="flex justify-center mb-4">
          <div {...getRootProps({ className: "dropzone" })}>
            <input {...getInputProps()} />
            <p className="text-gray-600">
              Drag & drop an image here, or click to select one
            </p>
          </div>
        </div>
        <div className="flex justify-center mb-4">
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded mr-2"
            onClick={handleAddText}
          >
            Add Text
          </button>
          <button
            className={`bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded mr-2 ${
              !isItemSelected ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleDeleteSelected}
            disabled={!isItemSelected}
          >
            Delete Selected
          </button>
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mr-2"
            onClick={() => handleAddShape("rectangle")}
          >
            Add Rectangle
          </button>
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            onClick={() => handleAddShape("circle")}
          >
            Add Circle
          </button>
        </div>
        <div className="flex justify-center mb-4">
          <canvas
            ref={canvasRef}
            className="w-full h-80 border border-gray-300"
          />
        </div>
        <div className="flex justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => {
              const dataURL = canvas.toDataURL("image/png");
              const link = document.createElement("a");
              link.href = dataURL;
              link.download = "story.png";
              link.click();
            }}
          >
            Export Image
          </button>
        </div>
      </div>

      {isPaletteVisible && (
        <div className="w-80 p-4 bg-gray-200 border-l border-gray-400">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Editing Palette</h2>
            <button
              className="text-gray-600 hover:text-gray-800"
              onClick={() => setPaletteVisible(false)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          {selectedTextObject && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Font Size
                </label>
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    setFontSize(value);
                    updateTextObject("fontSize", value);
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Text Color
                </label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTextColor(value);
                    updateTextObject("fill", value);
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Background Color
                </label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => {
                    const value = e.target.value;
                    setBgColor(value);
                    updateTextObject("backgroundColor", value);
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Border Radius
                </label>
                <input
                  type="number"
                  value={borderRadius}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    setBorderRadius(value);
                    updateTextObject("cornerRadius", value);
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Line Height
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={lineHeight}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setLineHeight(value);
                    updateTextObject("lineHeight", value);
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Text Spacing
                </label>
                <input
                  type="number"
                  value={textSpacing}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    setTextSpacing(value);
                    updateTextObject("textSpacing", value);
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Word Spacing
                </label>
                <input
                  type="number"
                  value={wordSpacing}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    setWordSpacing(value);
                    updateTextObject("wordSpacing", value);
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              </div>

              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => {
                  if (selectedTextObject) {
                    canvas.renderAll();
                  }
                }}
              >
                Apply
              </button>
            </>
          )}

          {selectedObject && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Shape Background Color
              </label>
              <input
                type="color"
                value={shapeBgColor}
                onChange={(e) => updateShapeBgColor(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default About;

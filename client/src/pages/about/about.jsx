import React, { useEffect, useRef, useState, useCallback } from "react";
import * as fabric from "fabric";
import { useDropzone } from "react-dropzone";
import "./about.css";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";
import { CiText } from "react-icons/ci";
import { FaRegCirclePlay } from "react-icons/fa6";
import { BsStopCircle } from "react-icons/bs";
import { FaSquare, FaCircle, FaStar } from "react-icons/fa";
import { MdRectangle } from "react-icons/md";
import { IoTriangleSharp } from "react-icons/io5";
import { BsFillPentagonFill } from "react-icons/bs";
import { IoEllipseOutline } from "react-icons/io5";
import { GiHeartBeats } from "react-icons/gi";
import { TbDiamond } from "react-icons/tb";
import { MdParagliding } from "react-icons/md";
import { GiHexagonalNut } from "react-icons/gi";
const About = () => {
  const [canvas, setCanvas] = useState(null);
  const [isItemSelected, setIsItemSelected] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [fontSize, setFontSize] = useState(30);
  const [textColor, setTextColor] = useState("blue");
  const [bgColor, setBgColor] = useState("");
  const [fontWeight, setFontWeight] = useState("normal");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [selectedAnimation, setSelectedAnimation] = useState("none");
  const [textAlign, setTextAlign] = useState("left");
  const [animationDelay, setAnimationDelay] = useState(0);
  const [shapeColor, setShapeColor] = useState("gray"); // New state for shape color
  const [editingAnimation, setEditingAnimation] = useState(null);
  const [layers, setLayers] = useState([]);
  const canvasRef = useRef(null);
  const animationsQueue = useRef([]);
  const [selectedObjectAnimations, setSelectedObjectAnimations] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  console.log("layers", layers);

  useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 1080,
      height: 600,
      selection: true,
    });
    setCanvas(fabricCanvas);
    const updateLayers = () => {
      setLayers(fabricCanvas.getObjects());
    };
    const onSelectionChange = () => {
      const activeObject = fabricCanvas.getActiveObject();
      setIsItemSelected(!!activeObject);
      setSelectedObject(activeObject);

      if (activeObject && activeObject.type === "textbox") {
        setFontSize(activeObject.fontSize || 30);
        setTextColor(activeObject.fill || "blue");
        setBgColor(activeObject.backgroundColor || "white");
        setFontWeight(activeObject.fontWeight || "normal");
        setFontFamily(activeObject.fontFamily || "Arial");
        setTextAlign(activeObject.textAlign || "left");

        const animationsForObject = animationsQueue.current.filter(
          (item) => item.object === activeObject
        );
        setSelectedObjectAnimations(animationsForObject);
      } else {
        setSelectedObjectAnimations([]);
      }
    };
    fabricCanvas.on("object:added", updateLayers);
    fabricCanvas.on("object:removed", updateLayers);
    fabricCanvas.on("object:modified", updateLayers);
    fabricCanvas.on("selection:created", onSelectionChange);
    fabricCanvas.on("selection:updated", onSelectionChange);
    fabricCanvas.on("selection:cleared", () => {
      setSelectedObject(null);
      setIsItemSelected(false);
      setSelectedObjectAnimations([]);
    });

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  const handleTextColorChange = (color) => {
    setTextColor(color);
    if (selectedObject && selectedObject.type === "textbox") {
      selectedObject.set({ fill: color });
      selectedObject.customFill = color; // Store color in a custom property
      canvas.renderAll();
    }
  };

  const handleBgColorChange = (color) => {
    setBgColor(color);
    if (selectedObject && selectedObject.type === "textbox") {
      selectedObject.set({ backgroundColor: color });
      selectedObject.customBgColor = color; // Store background color in a custom property
      canvas.renderAll();
    }
  };

  const handleAddText = () => {
    if (!canvas) return;

    const text = new fabric.Textbox("Your Text Here", {
      left: 100,
      top: 100,
      fontSize: fontSize,
      fill: textColor,
      backgroundColor: bgColor,
      fontWeight: fontWeight,
      fontFamily: fontFamily,
      textAlign: textAlign,
      editable: true,
    });

    text.customFill = textColor; // Store the custom fill color
    text.customBgColor = bgColor; // Store the custom background color

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };
  // Delete the selected layer
  const handleDeleteLayer = (index) => {
    const objToRemove = layers[index];
    canvas.remove(objToRemove);
    canvas.renderAll();
  };

  // Move layer up in z-order
  const moveLayerUp = (index) => {
    const object = layers[index];
    if (index === 0) return; // Prevent moving the top layer further up
    canvas.bringForward(object);
    canvas.renderAll();
    updateLayers(); // After the change, update layers state
  };

  // Move layer down in z-order
  const moveLayerDown = (index) => {
    const object = layers[index];
    if (index === layers.length - 1) return; // Prevent moving the bottom layer further down
    canvas.sendBackwards(object);
    canvas.renderAll();
    updateLayers(); // After the change, update layers state
  };

  // Update the layers after reordering
  const updateLayers = () => {
    setLayers(canvas.getObjects().reverse());
  };
  const applyTextAnimation = (object, animation, resolve) => {
    resetTextProperties(object);
    switch (animation) {
      case "fadeIn":
        object.set({ opacity: 0 });
        object.animate("opacity", 1, {
          duration: 1000,
          onChange: canvas.renderAll.bind(canvas),
          onComplete: resolve, // Call resolve after the animation completes
        });
        break;

      case "fadeOut":
        object.set({ opacity: 1 });
        object.animate("opacity", 0, {
          duration: 1000,
          onChange: canvas.renderAll.bind(canvas),
          onComplete: resolve, // Call resolve after the animation completes
        });
        break;

      case "scaleUp":
        object.set({ scaleX: 1, scaleY: 1 });
        object.animate(
          { scaleX: 2, scaleY: 2 },
          {
            duration: 1000,
            onChange: canvas.renderAll.bind(canvas),
            onComplete: resolve, // Call resolve after the animation completes
          }
        );
        break;

      case "slideIn":
        object.set({ left: -200 });
        object.animate(
          { left: 100 },
          {
            duration: 1000,
            onChange: canvas.renderAll.bind(canvas),
            onComplete: resolve, // Call resolve after the animation completes
          }
        );
        break;

      // New animations added below
      case "flip":
        object.set({ scaleX: 1, scaleY: 1 });
        object.animate(
          { scaleX: -1 },
          {
            duration: 1000,
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease.easeInOutQuad,
            onComplete: resolve,
          }
        );
        break;

      case "bounce":
        object.set({ scaleY: 1 });
        object.animate(
          { scaleY: 1.2 },
          {
            duration: 500,
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease.easeInOutQuad,
            repeat: true,
            alternate: true,
            onComplete: resolve,
          }
        );
        break;

      case "swing":
        object.set({ angle: 0 });
        object.animate(
          { angle: 10 },
          {
            duration: 500,
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease.easeInOutQuad,
            repeat: true,
            alternate: true,
            onComplete: resolve,
          }
        );
        break;

      case "zoomIn":
        object.set({ scaleX: 1, scaleY: 1 });
        object.animate(
          { scaleX: 1.5, scaleY: 1.5 },
          {
            duration: 1000,
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease.easeInOutQuad,
            onComplete: resolve,
          }
        );
        break;

      case "blur":
        object.set({ opacity: 1 });
        object.animate(
          { opacity: 0.2 },
          {
            duration: 1000,
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease.easeInOutQuad,
            onComplete: resolve,
          }
        );
        break;

      case "shake":
        object.set({ left: 100 });
        object.animate(
          { left: 120 },
          {
            duration: 500,
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease.easeInOutQuad,
            repeat: true,
            alternate: true,
            onComplete: resolve,
          }
        );
        break;

      case "spin":
        object.set({ angle: 0 });
        object.animate(
          { angle: 360 },
          {
            duration: 1000,
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease.easeInOutQuad,
            repeat: true,
            alternate: true,
            onComplete: resolve,
          }
        );
        break;

      case "pulse":
        object.set({ scaleY: 1 });
        object.animate(
          { scaleY: 1.5 },
          {
            duration: 500,
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease.easeInOutQuad,
            repeat: true,
            alternate: true,
            onComplete: resolve,
          }
        );
        break;

      case "flipHorizontal":
        object.set({ scaleX: 1 });
        object.animate(
          { scaleX: -1 },
          {
            duration: 1000,
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease.easeInOutQuad,
            onComplete: resolve,
          }
        );
        break;

      case "flipVertical":
        object.set({ scaleY: 1 });
        object.animate(
          { scaleY: -1 },
          {
            duration: 1000,
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease.easeInOutQuad,
            onComplete: resolve,
          }
        );
        break;

      case "rotate3d":
        object.set({ angle: 0 });
        object.animate(
          { angle: 360 },
          {
            duration: 1000,
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease.easeInOutQuad,
            repeat: true,
            alternate: true,
            onComplete: resolve,
          }
        );
        break;

      case "glow":
        object.set({ fill: textColor });
        object.animate(
          { strokeWidth: 5 },
          {
            duration: 1000,
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease.easeInOutQuad,
            repeat: true,
            alternate: true,
            onComplete: resolve,
          }
        );
        break;

      case "wave":
        object.set({ scaleX: 1, scaleY: 1 });
        object.animate(
          { scaleX: 1.2, scaleY: 0.8 },
          {
            duration: 500,
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease.easeInOutQuad,
            repeat: true,
            alternate: true,
            onComplete: resolve,
          }
        );
        break;

      case "squeeze":
        object.set({ scaleX: 1, scaleY: 1 });
        object.animate(
          { scaleX: 0.8, scaleY: 1.2 },
          {
            duration: 500,
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease.easeInOutQuad,
            repeat: true,
            alternate: true,
            onComplete: resolve,
          }
        );
        break;

      case "explode":
        object.set({ scaleX: 1, scaleY: 1 });
        object.animate(
          { scaleX: 2, scaleY: 2 },
          {
            duration: 1000,
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease.easeInOutQuad,
            onComplete: resolve,
          }
        );
        break;

      case "implode":
        object.set({ scaleX: 2, scaleY: 2 });
        object.animate(
          { scaleX: 1, scaleY: 1 },
          {
            duration: 1000,
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease.easeInOutQuad,
            onComplete: resolve,
          }
        );
        break;

      case "ripple":
        object.set({ scaleX: 1, scaleY: 1 });
        object.animate(
          { scaleX: 1.2, scaleY: 1.2 },
          {
            duration: 500,
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease.easeInOutQuad,
            repeat: true,
            alternate: true,
            onComplete: resolve,
          }
        );
        break;

      case "stretch":
        object.set({ scaleX: 1, scaleY: 1 });
        object.animate(
          { scaleX: 1.5, scaleY: 0.5 },
          {
            duration: 500,
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease.easeInOutQuad,
            repeat: true,
            alternate: true,
            onComplete: resolve,
          }
        );
        break;

      case "compress":
        object.set({ scaleX: 1, scaleY: 1 });
        object.animate(
          { scaleX: 0.5, scaleY: 1.5 },
          {
            duration: 500,
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease.easeInOutQuad,
            repeat: true,
            alternate: true,
            onComplete: resolve,
          }
        );
        break;

      case "roll":
        object.set({ angle: 0 });
        object.animate(
          { angle: 360 },
          {
            duration: 1000,
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease.easeInOutQuad,
            repeat: true,
            onComplete: resolve,
          }
        );
        break;

      case "flash":
        object.set({ fill: textColor });
        object.animate(
          { fill: "rgba(255, 255, 255, 0)" },
          {
            duration: 500,
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease.easeInOutQuad,
            repeat: true,
            alternate: true,
            onComplete: resolve,
          }
        );
        break;

      case "bounceIn":
        object.set({ scaleX: 1, scaleY: 1 });
        object.animate(
          { scaleX: 1.2, scaleY: 1.2 },
          {
            duration: 500,
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease.easeInOutQuad,
            onComplete: resolve,
          }
        );
        break;

      case "fadeToColor":
        object.set({ fill: textColor });
        object.animate(
          { fill: "rgb(255, 0, 0)" },
          {
            duration: 1000,
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease.easeInOutQuad,
            onComplete: resolve,
          }
        );
        break;

      default:
        resolve(); // If no animation, resolve immediately
        break;
    }
  };

  const resetTextProperties = (object) => {
    object.set({
      fill: object.customFill || textColor, // Use the custom fill color
      backgroundColor: object.customBgColor || bgColor, // Use the custom background color
      scaleX: 1,
      scaleY: 1,
      angle: 0,
      opacity: 1,
    });
    canvas.renderAll();
  };

  const playAllAnimations = async () => {
    setIsPlaying(true);
    const animations = animationsQueue.current;

    canvas.getObjects().forEach((obj) => {
      if (obj.type === "textbox") {
        obj.set({ opacity: 0 });
      } else if (obj.type === "image") {
        obj.set({ opacity: 1 });
      }
    });
    canvas.renderAll();

    let totalTimeElapsed = 0;

    for (let i = 0; i < animations.length; i++) {
      const animation = animations[i];

      await new Promise((resolve) => {
        setTimeout(() => {
          canvas.getObjects().forEach((obj) => {
            if (
              obj.type === "textbox" &&
              animations.slice(0, i).some((a) => a.object === obj)
            ) {
              obj.set({ opacity: 1 });
            }
          });

          if (animation.object.type === "textbox") {
            animation.object.set({ opacity: 1 });
            applyTextAnimation(animation.object, animation.animation, resolve);
          } else {
            resolve();
          }

          canvas.renderAll();
        }, totalTimeElapsed + animation.delay);
      });

      totalTimeElapsed += animation.delay;
    }

    canvas.getObjects().forEach((obj) => {
      if (obj.type === "textbox") {
        obj.set({ opacity: 1 });
      }
    });
    canvas.renderAll();
    setIsPlaying(false);
  };

  const stopAnimations = () => {
    setIsPlaying(false);
    canvas.getObjects().forEach((obj) => obj.set({ opacity: 1 }));
    canvas.renderAll();
  };

  const handleTextAlignChange = (align) => {
    if (selectedObject && selectedObject.type === "textbox") {
      selectedObject.set({ textAlign: align });
      canvas.renderAll();
    }
    setTextAlign(align);
  };

  const updateAnimationDelay = (delay) => {
    setAnimationDelay(delay);
    if (selectedObject) {
      const queuedAnimation = animationsQueue.current.find(
        (item) => item.object === selectedObject
      );
      if (queuedAnimation) {
        queuedAnimation.delay = delay;
      }
    }
  };

  const handleEditAnimation = (anim) => {
    setSelectedAnimation(anim.animation);
    setAnimationDelay(anim.delay);
    setEditingAnimation(anim);
  };

  const saveEditedAnimation = () => {
    if (editingAnimation) {
      const updatedQueue = animationsQueue.current.map((anim) => {
        if (anim === editingAnimation) {
          return {
            ...anim,
            animation: selectedAnimation,
            delay: animationDelay,
          };
        }
        return anim;
      });

      animationsQueue.current = updatedQueue;

      const updatedAnimations = selectedObjectAnimations.map((anim) => {
        if (anim === editingAnimation) {
          return {
            ...anim,
            animation: selectedAnimation,
            delay: animationDelay,
          };
        }
        return anim;
      });

      setSelectedObjectAnimations(updatedAnimations);
      setEditingAnimation(null);
    }
  };

  const removeAnimationFromQueue = (animationToRemove) => {
    animationsQueue.current = animationsQueue.current.filter(
      (item) => item !== animationToRemove
    );
    setSelectedObjectAnimations(
      selectedObjectAnimations.filter((item) => item !== animationToRemove)
    );
  };

  const deleteSelectedObject = () => {
    if (selectedObject) {
      canvas.remove(selectedObject);
      animationsQueue.current = animationsQueue.current.filter(
        (item) => item.object !== selectedObject
      );

      setSelectedObject(null);
      setIsItemSelected(false);
      setSelectedObjectAnimations([]);
      setAnimationDelay(0);
      canvas.renderAll();
    }
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const image = new Image();
          image.src = e.target.result;
          image.onload = () => {
            const fabricImage = new fabric.Image(image, {
              left: 100,
              top: 100,
              scaleX: 0.5,
              scaleY: 0.5,
            });
            canvas.add(fabricImage);
            canvas.renderAll();
          };
        };
        reader.readAsDataURL(file);
      });
    },
    [canvas]
  );
  const handleAddShape = (shapeType) => {
    if (!canvas) return;

    let shape;
    switch (shapeType) {
      case "rectangle":
        shape = new fabric.Rect({
          width: 100,
          height: 60,
          left: 100,
          top: 100,
          fill: shapeColor,
        });
        break;

      case "square":
        shape = new fabric.Rect({
          width: 80,
          height: 80,
          left: 100,
          top: 100,
          fill: shapeColor,
        });
        break;

      case "circle":
        shape = new fabric.Circle({
          radius: 50,
          left: 100,
          top: 100,
          fill: shapeColor,
        });
        break;

      case "triangle":
        shape = new fabric.Triangle({
          width: 100,
          height: 100,
          left: 100,
          top: 100,
          fill: shapeColor,
        });
        break;

      case "ellipse":
        shape = new fabric.Ellipse({
          rx: 75,
          ry: 50,
          left: 100,
          top: 100,
          fill: shapeColor,
        });
        break;

      case "pentagon":
        shape = new fabric.Polygon(
          [
            { x: 50, y: 0 },
            { x: 100, y: 38 },
            { x: 81, y: 100 },
            { x: 19, y: 100 },
            { x: 0, y: 38 },
          ],
          {
            left: 100,
            top: 100,
            fill: shapeColor,
            scaleX: 1.5,
            scaleY: 1.5,
          }
        );
        break;

      case "star":
        shape = new fabric.Polygon(
          [
            { x: 50, y: 0 },
            { x: 61, y: 35 },
            { x: 98, y: 35 },
            { x: 68, y: 57 },
            { x: 79, y: 91 },
            { x: 50, y: 70 },
            { x: 21, y: 91 },
            { x: 32, y: 57 },
            { x: 2, y: 35 },
            { x: 39, y: 35 },
          ],
          {
            left: 100,
            top: 100,
            fill: shapeColor,
            scaleX: 1.5,
            scaleY: 1.5,
          }
        );
        break;

      case "hexagon":
        shape = new fabric.Polygon(
          [
            { x: 50, y: 0 },
            { x: 100, y: 25 },
            { x: 100, y: 75 },
            { x: 50, y: 100 },
            { x: 0, y: 75 },
            { x: 0, y: 25 },
          ],
          {
            left: 100,
            top: 100,
            fill: shapeColor,
            scaleX: 1.5,
            scaleY: 1.5,
          }
        );
        break;

      case "heart":
        shape = new fabric.Path(
          "M 272 64 C 272 36.8 250.2 16 224 16 C 207.3 16 193.6 24.3 186.4 35.5 L 160 74.5 L 133.6 35.5 C 126.4 24.3 112.7 16 96 16 C 69.8 16 48 36.8 48 64 C 48 85.6 57.2 101.8 69.7 114.4 L 156.7 202.3 C 159.9 205.6 164.1 205.6 167.3 202.3 L 254.3 114.4 C 266.8 101.8 276 85.6 276 64 Z",
          {
            left: 100,
            top: 100,
            fill: shapeColor,
            scaleX: 0.2,
            scaleY: 0.2,
          }
        );
        break;

      case "parallelogram":
        shape = new fabric.Polygon(
          [
            { x: 50, y: 0 },
            { x: 120, y: 0 },
            { x: 100, y: 50 },
            { x: 30, y: 50 },
          ],
          {
            left: 100,
            top: 100,
            fill: shapeColor,
            scaleX: 1.5,
            scaleY: 1.5,
          }
        );
        break;

      case "diamond":
        shape = new fabric.Polygon(
          [
            { x: 50, y: 0 },
            { x: 100, y: 50 },
            { x: 50, y: 100 },
            { x: 0, y: 50 },
          ],
          {
            left: 100,
            top: 100,
            fill: shapeColor,
            scaleX: 1.5,
            scaleY: 1.5,
          }
        );
        break;

      default:
        return;
    }

    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
  };

  const handleShapeColorChange = (color) => {
    setShapeColor(color);
    if (selectedObject && selectedObject.type !== "textbox") {
      selectedObject.set({ fill: color });
      canvas.renderAll();
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="flex dark:bg-black">
      <div className="w-1/6 h-screen bg-gray-100 dark:bg-gray-950 p-4 overflow-y-scroll">
        <div {...getRootProps()} className="dropzone">
          <input {...getInputProps()} />
          <p className="text-center dark:text-gray-400">
            Drag 'n' drop some Image here, or click to select Image
          </p>
        </div>

        {/* Add Text Button */}
        <div className="mt-6">
          <CiText
            className="w-9 h-9 p-1 rounded-md border border-red-900 dark:border-gray-300 dark:text-white 
             hover:border-red-700 dark:hover:border-gray-500"
            onClick={handleAddText}
          />
          <h4 className="dark:text-gray-100 text-[16px] mt-3">Shapes</h4>

          <div className="flex justify-start items-center flex-wrap mt-3 gap-x-1 w-full">
            <FaSquare
              className="w-9 h-9 p-1 rounded-md border border-red-900 dark:border-gray-300 dark:text-white 
             hover:border-red-700 dark:hover:border-gray-500 cursor-pointer"
              onClick={() => handleAddShape("square")}
            />
            <MdRectangle
              className="w-9 h-9 p-1 rounded-md border border-red-900 dark:border-gray-300 dark:text-white 
             hover:border-red-700 dark:hover:border-gray-500 cursor-pointer"
              onClick={() => handleAddShape("rectangle")}
            />
            <FaCircle
              className="w-9 h-9 p-1 rounded-md border border-red-900 dark:border-gray-300 dark:text-white 
             hover:border-red-700 dark:hover:border-gray-500 cursor-pointer"
              onClick={() => handleAddShape("circle")}
            />
            <IoTriangleSharp
              className="w-9 h-9 p-1 rounded-md border border-red-900 dark:border-gray-300 dark:text-white 
             hover:border-red-700 dark:hover:border-gray-500 cursor-pointer"
              onClick={() => handleAddShape("triangle")}
            />
            <BsFillPentagonFill
              className="w-9 h-9 p-1 rounded-md border border-red-900 dark:border-gray-300 dark:text-white 
             hover:border-red-700 dark:hover:border-gray-500 cursor-pointer"
              onClick={() => handleAddShape("pentagon")}
            />
            <IoEllipseOutline
              className="w-9 h-9 p-1 rounded-md border border-red-900 dark:border-gray-300 dark:text-white 
             hover:border-red-700 dark:hover:border-gray-500 cursor-pointer"
              onClick={() => handleAddShape("ellipse")}
            />
            <FaStar
              className="w-9 h-9 p-1 rounded-md border border-red-900 dark:border-gray-300 dark:text-white 
             hover:border-red-700 dark:hover:border-gray-500 cursor-pointer"
              onClick={() => handleAddShape("star")}
            />
            <TbDiamond
              className="w-9 h-9 p-1 rounded-md border border-red-900 dark:border-gray-300 dark:text-white 
             hover:border-red-700 dark:hover:border-gray-500 cursor-pointer"
              onClick={() => handleAddShape("diamond")}
            />
            <MdParagliding
              className="w-9 h-9 p-1 rounded-md border border-red-900 dark:border-gray-300 dark:text-white 
             hover:border-red-700 dark:hover:border-gray-500 cursor-pointer"
              onClick={() => handleAddShape("parallelogram")}
            />
            <GiHeartBeats
              className="w-9 h-9 p-1 rounded-md border border-red-900 dark:border-gray-300 dark:text-white 
             hover:border-red-700 dark:hover:border-gray-500 cursor-pointer"
              onClick={() => handleAddShape("heart")}
            />
            <GiHexagonalNut
              className="w-9 h-9 p-1 rounded-md border border-red-900 dark:border-gray-300 dark:text-white 
             hover:border-red-700 dark:hover:border-gray-500 cursor-pointer"
              onClick={() => handleAddShape("hexagon")}
            />
          </div>
        </div>

        {/* Animation options */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold dark:text-gray-200">
            Select Animation
          </h2>
          <select
            className="mt-2 w-full p-2 border border-gray-300 rounded"
            value={selectedAnimation}
            onChange={(e) => setSelectedAnimation(e.target.value)} // Only set animation, don't apply immediately
          >
            <option value="none">None</option>
            <option value="scaleUp">Scale Up</option>
            {/* <option value="fadeIn">Fade In</option>
            <option value="fadeOut">Fade Out</option> */}
            <option value="slideIn">Slide In</option>
            <option value="flip">Flip</option>
            <option value="bounce">Bounce</option>
            <option value="swing">Swing</option>
            <option value="zoomIn">Zoom In</option>
            <option value="blur">Blur</option>
            <option value="shake">Shake</option>
            <option value="spin">Spin</option>
            <option value="pulse">Pulse</option>
            <option value="flipHorizontal">Flip Horizontal</option>
            <option value="flipVertical">Flip Vertical</option>
            <option value="rotate3d">Rotate 3D</option>
            <option value="glow">Glow</option>
            <option value="wave">Wave</option>
            <option value="squeeze">Squeeze</option>
            <option value="explode">Explode</option>
            <option value="implode">Implode</option>
            <option value="ripple">Ripple</option>
            <option value="stretch">Stretch</option>
            <option value="compress">Compress</option>
            <option value="roll">Roll</option>
            <option value="flash">Flash</option>
            <option value="bounceIn">Bounce In</option>
            <option value="fadeToColor">Fade to Color</option>
          </select>
          <h2 className="text-lg font-semibold mt-4 dark:text-gray-200">
            Set Animation Delay (ms)
          </h2>
          <input
            type="number"
            value={animationDelay}
            onChange={(e) => updateAnimationDelay(Number(e.target.value))}
            className="mt-2 w-full p-2 border border-gray-300 rounded"
            placeholder="Enter delay in milliseconds"
          />
          {editingAnimation ? (
            <button
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              onClick={saveEditedAnimation}
            >
              Save Changes
            </button>
          ) : (
            <button
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => {
                if (selectedObject && selectedAnimation !== "none") {
                  applyTextAnimation(selectedObject, selectedAnimation, () => {
                    console.log(`Animation ${selectedAnimation} completed`);
                  });

                  animationsQueue.current.push({
                    object: selectedObject,
                    animation: selectedAnimation,
                    delay: animationDelay,
                  });

                  setSelectedObjectAnimations([
                    ...selectedObjectAnimations,
                    {
                      object: selectedObject,
                      animation: selectedAnimation,
                      delay: animationDelay,
                    },
                  ]);
                }
              }}
            >
              Apply Animation
            </button>
          )}
        </div>

        <div className="mt-10">
          <div className="flex justify-center gap-x-10  items-center">
            <div className=" cursor-pointer" onClick={playAllAnimations}>
              <FaRegCirclePlay className="w-10 h-10 dark:text-white" />
              <p className="dark:text-gray-400 text-center">Play</p>
            </div>
            <div className=" cursor-pointer" onClick={stopAnimations}>
              <BsStopCircle className="w-10 h-10 dark:text-white" />
              <p className="dark:text-gray-400 text-center">Stop</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4">
        <h1 className="text-3xl font-bold mb-4 dark:text-gray-400">
          Text and Image Animation on Canvas
        </h1>
        <div className="flex justify-center mb-4 ">
          <canvas
            ref={canvasRef}
            className="w-full h-80 border border-gray-30"
          />
        </div>
      </div>
      <div className="w-1/6 h-screen overflow-y-scroll  bg-gray-100 dark:bg-gray-900 p-3">
        <div className="mt-6">
          <h2 className="text-lg font-semibold dark:text-gray-200">
            Font Size
          </h2>
          <input
            type="number"
            value={fontSize}
            onChange={(e) => {
              setFontSize(Number(e.target.value));
              if (selectedObject && selectedObject.type === "textbox") {
                selectedObject.set({ fontSize: Number(e.target.value) });
                canvas.renderAll();
              }
            }}
            className="mt-2 w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Font Weight */}

        {/* Font Family */}
        <div className="w-full flex gap-x-2">
          <div className="mt-6 w-1/2">
            <h2 className="text-lg font-semibold dark:text-gray-200">Weight</h2>
            <select
              className="mt-2 w-full p-2 border border-gray-300 rounded"
              value={fontWeight}
              onChange={(e) => {
                setFontWeight(e.target.value);
                if (selectedObject && selectedObject.type === "textbox") {
                  selectedObject.set({ fontWeight: e.target.value });
                  canvas.renderAll();
                }
              }}
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
              <option value="lighter">Lighter</option>
              <option value="italic">Italic</option>
            </select>
          </div>
          <div className="mt-6 w-1/2">
            <h2 className="text-lg font-semibold dark:text-gray-200">Family</h2>
            <select
              className="mt-2 w-full p-2 border border-gray-300 rounded"
              value={fontFamily}
              onChange={(e) => {
                setFontFamily(e.target.value);
                if (selectedObject && selectedObject.type === "textbox") {
                  selectedObject.set({ fontFamily: e.target.value });
                  canvas.renderAll();
                }
              }}
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
            </select>
          </div>
        </div>
        <div className="w-full flex gap-x-2">
          <div className="mt-6 w-1/2">
            <h2 className="text-lg font-semibold dark:text-gray-200">
              Text Color
            </h2>
            <input
              type="color"
              value={textColor}
              onChange={(e) => handleTextColorChange(e.target.value)}
              className="mt-2 w-full p-2 border border-gray-300 rounded"
            />
          </div>
          {/* Background Color */}
          <div className="mt-6 w-1/2">
            <h2 className="text-lg font-semibold dark:text-gray-200">
              Bg Color
            </h2>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => handleBgColorChange(e.target.value)}
              className="mt-2 w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
        <div className="mt-6">
          <h2 className="text-lg font-semibold dark:text-gray-200">
            Shape Color
          </h2>
          <input
            type="color"
            value={shapeColor}
            onChange={(e) => handleShapeColorChange(e.target.value)}
            className="mt-2 w-full p-2 border border-gray-300 rounded"
          />
        </div>
        {/* Current animations */}
        <h2 className="text-lg font-semibold dark:text-gray-200  mt-4">
          Layers
        </h2>
        <div className="max-h-60 overflow-y-scroll">
          {layers.map((layer, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-gray-200 px-2 py-1 mt-2"
            >
              <span>Layer {index + 1}</span>
              <div className="flex items-center">
                <FiArrowUp
                  className={`cursor-pointer ${
                    index === 0 ? "opacity-50" : "opacity-100"
                  }`}
                  onClick={() => moveLayerDown(index)}
                />
                <FiArrowDown
                  className={`cursor-pointer ml-2 ${
                    index === layers.length - 1 ? "opacity-50" : "opacity-100"
                  }`}
                  onClick={() => moveLayerUp(index)}
                />
                <MdDelete
                  className="ml-4 text-red-500 cursor-pointer"
                  onClick={() => handleDeleteLayer(index)}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <h2 className="text-lg font-semibold dark:text-gray-200">
            Current Animations
          </h2>
          <div className="max-h-60 overflow-y-scroll">
            {selectedObjectAnimations.map((anim, index) => (
              <div
                key={index}
                className="flex justify-between bg-gray-200 px-2 py-1 mt-2"
              >
                <span>
                  {anim.animation} (Delay: {anim.delay}ms)
                </span>
                <div className="flex">
                  <FaEdit className=" w-5 h-6 text-[blue] cursor-pointer onClick={() => handleEditAnimation(anim)} " />

                  <MdDelete
                    className=" w-6 h-6 text-[red] cursor-pointer "
                    onClick={() => removeAnimationFromQueue(anim)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delete Selected Object */}
        {isItemSelected && (
          <div className="mt-6">
            <MdDelete
              className=" w-10 h-10 text-[red] cursor-pointer "
              onClick={deleteSelectedObject}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default About;

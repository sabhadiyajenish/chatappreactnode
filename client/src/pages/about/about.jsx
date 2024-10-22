import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import "./about.css";

const About = () => {
  const [canvas, setCanvas] = useState(null);
  const [isItemSelected, setIsItemSelected] = useState(false);
  const [selectedTextObject, setSelectedTextObject] = useState(null);
  const [fontSize, setFontSize] = useState(30);
  const [textColor, setTextColor] = useState("blue");
  const [bgColor, setBgColor] = useState("white");
  const [selectedAnimation, setSelectedAnimation] = useState("none");
  const [textAlign, setTextAlign] = useState("left");
  const canvasRef = useRef(null);

  useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 1080,
      height: 600,
      selection: true,
    });
    setCanvas(fabricCanvas);

    const onSelectionChange = () => {
      const activeObject = fabricCanvas.getActiveObject();
      setIsItemSelected(!!activeObject);
      if (activeObject && activeObject.type === "textbox") {
        setSelectedTextObject(activeObject);
        setFontSize(activeObject.fontSize || 30);
        setTextColor(activeObject.fill || "blue");
        setBgColor(activeObject.backgroundColor || "white");
        setTextAlign(activeObject.textAlign || "left");
      } else {
        setSelectedTextObject(null);
      }
    };

    fabricCanvas.on("selection:created", onSelectionChange);
    fabricCanvas.on("selection:updated", onSelectionChange);
    fabricCanvas.on("selection:cleared", onSelectionChange);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  const handleAddText = () => {
    if (!canvas) return;

    const text = new fabric.Textbox("Your Text Here", {
      left: 100,
      top: 100,
      fontSize: fontSize,
      fill: textColor,
      backgroundColor: bgColor,
      textAlign: textAlign,
      editable: true,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };
  const resetTextProperties = () => {
    selectedTextObject.set({
      fill: textColor,
      scaleX: 1,
      scaleY: 1,
      angle: 0,
      opacity: 1,
    });
    canvas.renderAll();
  };

  const applyTextAnimation = () => {
    if (selectedTextObject) {
      resetTextProperties();
      const animationType = selectedAnimation;

      switch (animationType) {
        case "fadeIn":
          selectedTextObject.set({ fill: `rgba(0, 0, 0, 0)` }); // Fully transparent initially
          selectedTextObject.animate(
            { fill: `rgba(0, 0, 0, 1)` }, // Animate to fully opaque
            {
              duration: 1000,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
            }
          );
          break;

        case "fadeOut":
          selectedTextObject.animate(
            { fill: `rgba(0, 0, 0, 0)` }, // Animate to fully transparent
            {
              duration: 1000,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
            }
          );
          break;

        case "scaleUp":
          selectedTextObject.set({ scaleX: 1, scaleY: 1 });
          selectedTextObject.animate(
            { scaleX: 2, scaleY: 2 },
            {
              duration: 1000,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
            }
          );
          break;

        case "slideIn":
          selectedTextObject.set({ left: -200 });
          selectedTextObject.animate(
            { left: 100 },
            {
              duration: 1000,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
            }
          );
          break;

        case "flip":
          selectedTextObject.set({ scaleX: 1, scaleY: 1 });
          selectedTextObject.animate(
            { scaleX: -1 },
            {
              duration: 1000,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
            }
          );
          break;

        case "bounce":
          selectedTextObject.set({ scaleY: 1 });
          selectedTextObject.animate(
            { scaleY: 1.2 },
            {
              duration: 500,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
              repeat: true, // Repeat the animation
              alternate: true, // Alternate animation direction
            }
          );
          break;

        case "swing":
          selectedTextObject.set({ angle: 0 });
          selectedTextObject.animate(
            { angle: 10 },
            {
              duration: 500,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
              repeat: true,
              alternate: true,
            }
          );
          break;

        case "zoomIn":
          selectedTextObject.set({ scaleX: 1, scaleY: 1 });
          selectedTextObject.animate(
            { scaleX: 1.5, scaleY: 1.5 },
            {
              duration: 1000,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
            }
          );
          break;

        case "blur":
          selectedTextObject.set({ opacity: 1 });
          selectedTextObject.animate(
            { opacity: 0.2 },
            {
              duration: 1000,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
            }
          );
          break;

        case "shake":
          selectedTextObject.set({ left: 100 });
          selectedTextObject.animate(
            { left: 120 },
            {
              duration: 500,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
              repeat: true,
              alternate: true,
            }
          );
          break;
        case "spin":
          selectedTextObject.set({ angle: 0 });
          selectedTextObject.animate(
            { angle: 360 },
            {
              duration: 1000,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
              repeat: true,
              alternate: true,
            }
          );
          break;

        case "pulse":
          selectedTextObject.set({ scaleY: 1 });
          selectedTextObject.animate(
            { scaleY: 1.5 },
            {
              duration: 500,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
              repeat: true,
              alternate: true,
            }
          );
          break;

        case "flipHorizontal":
          selectedTextObject.set({ scaleX: 1 });
          selectedTextObject.animate(
            { scaleX: -1 },
            {
              duration: 1000,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
            }
          );
          break;

        case "flipVertical":
          selectedTextObject.set({ scaleY: 1 });
          selectedTextObject.animate(
            { scaleY: -1 },
            {
              duration: 1000,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
            }
          );
          break;

        case "rotate3d":
          selectedTextObject.set({ angle: 0 });
          selectedTextObject.animate(
            { angle: 360 },
            {
              duration: 1000,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
              repeat: true,
              alternate: true,
            }
          );
          break;
        case "glow":
          selectedTextObject.set({ fill: textColor });
          selectedTextObject.animate(
            { strokeWidth: 5 },
            {
              duration: 1000,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
              repeat: true,
              alternate: true,
            }
          );
          break;

        case "wave":
          selectedTextObject.set({ scaleX: 1, scaleY: 1 });
          selectedTextObject.animate(
            { scaleX: 1.2, scaleY: 0.8 },
            {
              duration: 500,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
              repeat: true,
              alternate: true,
            }
          );
          break;

        case "squeeze":
          selectedTextObject.set({ scaleX: 1, scaleY: 1 });
          selectedTextObject.animate(
            { scaleX: 0.8, scaleY: 1.2 },
            {
              duration: 500,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
              repeat: true,
              alternate: true,
            }
          );
          break;

        case "explode":
          selectedTextObject.set({ scaleX: 1, scaleY: 1 });
          selectedTextObject.animate(
            { scaleX: 2, scaleY: 2 },
            {
              duration: 1000,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
            }
          );
          break;

        case "implode":
          selectedTextObject.set({ scaleX: 2, scaleY: 2 });
          selectedTextObject.animate(
            { scaleX: 1, scaleY: 1 },
            {
              duration: 1000,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
            }
          );
          break;
        case "ripple":
          selectedTextObject.set({ scaleX: 1, scaleY: 1 });
          selectedTextObject.animate(
            { scaleX: 1.2, scaleY: 1.2 },
            {
              duration: 500,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
              repeat: true,
              alternate: true,
            }
          );
          break;

        case "stretch":
          selectedTextObject.set({ scaleX: 1, scaleY: 1 });
          selectedTextObject.animate(
            { scaleX: 1.5, scaleY: 0.5 },
            {
              duration: 500,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
              repeat: true,
              alternate: true,
            }
          );
          break;

        case "compress":
          selectedTextObject.set({ scaleX: 1, scaleY: 1 });
          selectedTextObject.animate(
            { scaleX: 0.5, scaleY: 1.5 },
            {
              duration: 500,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
              repeat: true,
              alternate: true,
            }
          );
          break;

        case "roll":
          selectedTextObject.set({ angle: 0 });
          selectedTextObject.animate(
            { angle: 360 },
            {
              duration: 1000,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
              repeat: true,
            }
          );
          break;

        case "flash":
          selectedTextObject.set({ fill: textColor });
          selectedTextObject.animate(
            { fill: "rgba(255, 255, 255, 0)" },
            {
              duration: 500,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
              repeat: true,
              alternate: true,
            }
          );
          break;

        case "bounceIn":
          selectedTextObject.set({ scaleX: 1, scaleY: 1 });
          selectedTextObject.animate(
            { scaleX: 1.2, scaleY: 1.2 },
            {
              duration: 500,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
            }
          );
          break;

        case "fadeToColor":
          selectedTextObject.set({ fill: textColor });
          selectedTextObject.animate(
            { fill: "rgb(255, 0, 0)" },
            {
              duration: 1000,
              onChange: canvas.renderAll.bind(canvas),
              easing: fabric.util.ease.easeInOutQuad,
            }
          );
          break;
        case "none":
          selectedTextObject.set({
            fill: textColor,
            scaleX: 1,
            scaleY: 1,
            angle: 0,
            opacity: 1, // Reset opacity
          });
          canvas.renderAll();
          break;

        default:
          break;
      }
    }
  };

  const handleTextAlignChange = (align) => {
    if (selectedTextObject) {
      selectedTextObject.set({ textAlign: align });
      canvas.renderAll();
    }
    setTextAlign(align);
  };
  return (
    <div className="flex">
      <div className="w-1/6 h-screen bg-gray-100 p-4">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-semibold">Text Animations</h2>
        </div>

        {/* Animation options */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Select Animation</h2>
          <select
            className="mt-2 w-full p-2 border border-gray-300 rounded"
            value={selectedAnimation}
            onChange={(e) => setSelectedAnimation(e.target.value)}
          >
            <option value="none">None</option>
            <option value="scaleUp">Scale Up</option>
            <option value="fadeIn">Fade In</option>
            <option value="fadeOut">Fade Out</option>
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
          <button
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            onClick={applyTextAnimation}
          >
            Apply Animation
          </button>
        </div>

        {/* Add text */}
        <div className="mt-6">
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded mr-2"
            onClick={handleAddText}
          >
            Add Text
          </button>
        </div>

        {/* Text Alignment */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Text Alignment</h2>
          <div className="mt-2 flex justify-around">
            <button
              className={`px-4 py-2 rounded ${
                textAlign === "left" ? "bg-blue-500 text-white" : "bg-gray-300"
              }`}
              onClick={() => handleTextAlignChange("left")}
            >
              Left
            </button>
            <button
              className={`px-4 py-2 rounded ${
                textAlign === "center"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300"
              }`}
              onClick={() => handleTextAlignChange("center")}
            >
              Center
            </button>
            <button
              className={`px-4 py-2 rounded ${
                textAlign === "right" ? "bg-blue-500 text-white" : "bg-gray-300"
              }`}
              onClick={() => handleTextAlignChange("right")}
            >
              Right
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4">
        <h1 className="text-3xl font-bold mb-4">Text Animation on Canvas</h1>
        <div className="flex justify-center mb-4">
          <canvas
            ref={canvasRef}
            className="w-full h-80 border border-gray-300"
          />
        </div>
      </div>
    </div>
  );
};

export default About;

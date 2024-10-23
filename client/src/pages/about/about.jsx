import React, { useEffect, useRef, useState, useCallback } from "react";
import * as fabric from "fabric";
import { useDropzone } from "react-dropzone";
import "./about.css";

const About = () => {
  const [canvas, setCanvas] = useState(null);
  const [isItemSelected, setIsItemSelected] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [fontSize, setFontSize] = useState(30);
  const [textColor, setTextColor] = useState("blue");
  const [bgColor, setBgColor] = useState("");
  const [selectedAnimation, setSelectedAnimation] = useState("none");
  const [textAlign, setTextAlign] = useState("left");
  const [animationDelay, setAnimationDelay] = useState(0);
  const [editingAnimation, setEditingAnimation] = useState(null);
  const canvasRef = useRef(null);
  const animationsQueue = useRef([]);
  const [selectedObjectAnimations, setSelectedObjectAnimations] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false); // To track if animation is playing

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
      setSelectedObject(activeObject);

      if (activeObject) {
        const animationsForObject = animationsQueue.current.filter(
          (item) => item.object === activeObject
        );
        setSelectedObjectAnimations(animationsForObject);

        const queuedAnimation = animationsQueue.current.find(
          (item) => item.object === activeObject
        );
        if (queuedAnimation) {
          setAnimationDelay(queuedAnimation.delay || 0);
        } else {
          setAnimationDelay(0);
        }

        if (activeObject.type === "textbox") {
          setFontSize(activeObject.fontSize || 30);
          setTextColor(activeObject.fill || "blue");
          setBgColor(activeObject.backgroundColor || "white");
          setTextAlign(activeObject.textAlign || "left");
        }
      } else {
        setSelectedObject(null);
      }
    };

    fabricCanvas.on("selection:created", onSelectionChange);
    fabricCanvas.on("selection:updated", onSelectionChange);
    fabricCanvas.on("selection:cleared", () => {
      setSelectedObject(null);
      setIsItemSelected(false);
      setAnimationDelay(0);
      setSelectedObjectAnimations([]);
    });

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
      fill: textColor,
      scaleX: 1,
      scaleY: 1,
      angle: 0,
      opacity: 1,
    });
    canvas.renderAll();
  };

  // Play all animations in the queue sequentially with hiding and showing objects
  const playAllAnimations = async () => {
    setIsPlaying(true);
    const animations = animationsQueue.current;

    // Initially hide all text objects except for images
    canvas.getObjects().forEach((obj) => {
      if (obj.type === "textbox") {
        obj.set({ opacity: 0 }); // Hide text objects initially
      } else if (obj.type === "image") {
        obj.set({ opacity: 1 }); // Keep images visible
      }
    });
    canvas.renderAll(); // Render after hiding text objects

    let totalTimeElapsed = 0; // Cumulative delay time to track

    for (let i = 0; i < animations.length; i++) {
      const animation = animations[i];

      // Wait for the delay for this animation
      await new Promise((resolve) => {
        setTimeout(() => {
          // Instead of hiding all objects, show the previous animated objects
          canvas.getObjects().forEach((obj) => {
            if (
              obj.type === "textbox" &&
              animations.slice(0, i).some((a) => a.object === obj)
            ) {
              obj.set({ opacity: 1 }); // Keep previously animated objects visible
            }
          });

          // Show and animate the current text object
          if (animation.object.type === "textbox") {
            animation.object.set({ opacity: 1 }); // Show current object
            applyTextAnimation(animation.object, animation.animation, resolve);
          } else {
            resolve(); // If not a text object, resolve immediately
          }

          // Render the canvas after showing and starting the animation
          canvas.renderAll();
        }, totalTimeElapsed + animation.delay); // Trigger based on cumulative delay
      });

      totalTimeElapsed += animation.delay; // Add the delay for the next animation
    }

    // After all animations, keep all text objects visible
    canvas.getObjects().forEach((obj) => {
      if (obj.type === "textbox") {
        obj.set({ opacity: 1 });
      }
    });
    canvas.renderAll();
    setIsPlaying(false);
  };

  // Stop all animations and reset objects to their original state
  const stopAnimations = () => {
    setIsPlaying(false);
    // Restore all objects visibility
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
        console.log(
          `Updated delay to ${delay}ms for the selected object in the queue.`
        );
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

      console.log("Selected object and all associated data removed.");
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

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="flex">
      <div className="w-1/6 h-screen bg-gray-100 p-4">
        <div {...getRootProps()} className="dropzone">
          <input {...getInputProps()} />
          <p className="text-center">
            Drag 'n' drop some Image here, or click to select Image
          </p>
        </div>

        {/* Add Text Button */}
        <div className="mt-6">
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded mr-2"
            onClick={handleAddText}
          >
            Add Text
          </button>
        </div>

        {/* Animation options */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Select Animation</h2>
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

          <h2 className="text-lg font-semibold mt-4">
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

        {/* Current animations */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Current Animations</h2>
          {selectedObjectAnimations.map((anim, index) => (
            <div
              key={index}
              className="flex justify-between bg-gray-200 px-2 py-1 mt-2"
            >
              <span>
                {anim.animation} (Delay: {anim.delay}ms)
              </span>
              <div className="flex">
                <button
                  className="text-blue-500 hover:text-blue-700 mr-2"
                  onClick={() => handleEditAnimation(anim)}
                >
                  Edit
                </button>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => removeAnimationFromQueue(anim)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {isItemSelected && (
          <div className="mt-6">
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              onClick={deleteSelectedObject}
            >
              Delete Selected Object
            </button>
          </div>
        )}

        {/* Text alignment */}
        {selectedObject && selectedObject.type === "textbox" && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold">Text Alignment</h2>
            <div className="mt-2 flex justify-around">
              <button
                className={`px-4 py-2 rounded ${
                  textAlign === "left"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
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
                  textAlign === "right"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
                onClick={() => handleTextAlignChange("right")}
              >
                Right
              </button>
            </div>
          </div>
        )}

        <div className="mt-6">
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            onClick={playAllAnimations} // Trigger sequential animations
          >
            Play All Animations
          </button>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded mt-4"
            onClick={stopAnimations} // Stop all animations and reset
          >
            Stop Playing
          </button>
        </div>
      </div>

      <div className="flex-1 p-4">
        <h1 className="text-3xl font-bold mb-4">
          Text and Image Animation on Canvas
        </h1>
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

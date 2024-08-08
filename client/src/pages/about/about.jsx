import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { useDropzone } from "react-dropzone";
import "./about.css";

const About = () => {
  const [canvas, setCanvas] = useState(null);
  const [baseImageSet, setBaseImageSet] = useState(false); // Track if base image is set
  const canvasRef = useRef(null);
  console.log("CANVAS IS", canvas);
  useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 1080, // Instagram story width
      height: 1920, // Instagram story height
      selection: true, // Allow selecting objects
    });
    setCanvas(fabricCanvas);

    return () => fabricCanvas.dispose(); // Clean up on unmount
  }, []);

  const handleImageDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgElement = new Image();
      imgElement.src = e.target.result;
      imgElement.onload = () => {
        if (!baseImageSet) {
          // Set the canvas size to the image size
          canvas.setWidth(imgElement.width);
          canvas.setHeight(imgElement.height);

          const imgInstance = new fabric.Image(imgElement, {
            left: 0,
            top: 0,

            scaleX: canvas.width / imgElement.width,
            scaleY: canvas.height / imgElement.height,
            selectable: true, // Prevent resizing and moving
          });

          canvas.clear(); // Clear previous content
          canvas.add(imgInstance);
          canvas.renderAll();

          setBaseImageSet(true); // Mark the base image as set
        } else {
          // Handle additional images
          const imgInstance = new fabric.Image(imgElement, {
            left: 50, // Default position, adjust as needed
            top: 50, // Default position, adjust as needed
          });

          canvas.add(imgInstance);
          imgInstance.bringToFront(); // Ensure new images are behind existing content
          bringTextToFront(); // Ensure all text objects are on top
          canvas.renderAll();
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const bringTextToFront = () => {
    canvas.getObjects().forEach((obj) => {
      if (obj.type === "textbox") {
        obj.bringToFront(); // Ensure all text objects are on top
      }
    });
    canvas.renderAll(); // Redraw the canvas
  };

  const handleAddText = () => {
    if (!canvas) return;

    const text = new fabric.Textbox("Your Text Here", {
      left: 50, // Default position, adjust as needed
      top: 50, // Default position, adjust as needed
      fontSize: 30,
      fill: "#fff",
      backgroundColor: "rgba(0,0,0,0.5)",
      editable: true,
      selectable: true, // Ensure the text is selectable
    });

    canvas.add(text);
    bringTextToFront(); // Ensure the text is on top
    canvas.renderAll();
  };

  const handleDeleteSelected = () => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        canvas.remove(activeObject); // Remove the selected object
        canvas.discardActiveObject(); // Discard the selection
        canvas.renderAll();
      }
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: handleImageDrop,
  });

  const handleExport = () => {
    if (canvas) {
      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "story.png";
      link.click();
    }
  };

  return (
    <div className="canvas-container mx-auto">
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <p>Drag & drop an image here, or click to select one</p>
      </div>
      <button onClick={handleAddText}>Add Text</button>
      <button onClick={handleDeleteSelected}>Delete Selected</button>{" "}
      {/* Button to delete selected objects */}
      <canvas ref={canvasRef} className="canvas" />
      <button onClick={handleExport} className="bg-slate-400">
        Export Image
      </button>
    </div>
  );
};

export default About;

import React from "react";

const NotificationComponent = () => {
  const showNotification = () => {
    // Check if the browser supports notifications
    if ("Notification" in window) {
      // Check if permission is already granted
      if (Notification.permission === "granted") {
        // If granted, show the notification
        new Notification("Hello, world!");
      } else if (Notification.permission !== "denied") {
        // Otherwise, request permission from the user
        Notification.requestPermission().then(function (permission) {
          if (permission === "granted") {
            new Notification("Hello, world!");
          }
        });
      }
    }
  };

  return (
    <div>
      <h2>Desktop Notification Example</h2>
      <button className=" bg-slate-600" onClick={showNotification}>
        Show Notification
      </button>
    </div>
  );
};

export default NotificationComponent;

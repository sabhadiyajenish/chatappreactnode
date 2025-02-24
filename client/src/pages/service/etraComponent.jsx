import {
  FaCamera,
  FaCameraRetro,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";

export const renderLocalVideo = (
  permissionDenied,
  localStream,
  localVideoRef,
  hasVideo,
  currentFacingMode,
  setLocalStream,
  setPermissionDenied,
  pcRef,
  setCurrentFacingMode,
  isCallActive
) => {
  const switchCamera = async () => {
    if (!localStream) return;

    const newFacingMode =
      currentFacingMode === "environment" ? "user" : "environment";
    setCurrentFacingMode(newFacingMode);

    try {
      // 1. Get current video track and its sender
      const videoTrack = localStream.getVideoTracks()[0];
      const sender = pcRef.current
        ?.getSenders()
        .find((s) => s.track === videoTrack);

      if (!videoTrack || !sender) {
        console.error("Video track or sender not found.");
        return; // Handle the error appropriately
      }

      // 2. Create new stream with desired facing mode.  Crucially, stop the old track first.
      await videoTrack.stop(); // Stop the old track before getting the new one.
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: true, // Include audio to avoid issues.
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      if (!newVideoTrack) {
        console.error("New video track not found.");
        return;
      }

      // 3. Replace the track in the existing stream
      localStream.removeTrack(videoTrack); // Remove old track
      localStream.addTrack(newVideoTrack); // Add new track
      localVideoRef.current.srcObject = localStream; // Update local video element.

      // 4. Update the sender in the peer connection (if call is active)
      if (pcRef.current && isCallActive) {
        await sender.replaceTrack(newVideoTrack);
      }

      // Stop all other video tracks in the new stream.
      newStream
        .getVideoTracks()
        .slice(1)
        .forEach((track) => track.stop());
    } catch (error) {
      console.error("Error switching camera:", error);
    }
  };
  const renderPermissionRequest = () => {
    const requestPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true, // Add video permission request
        });
        setLocalStream(stream);
        setPermissionDenied(false);

        // Add tracks to peer connection (important!)
        stream.getTracks().forEach((track) => {
          pcRef.current?.addTrack(track, stream);
        });
      } catch (error) {
        console.error("Error requesting permissions:", error);
        if (error.name === "NotAllowedError") {
          setPermissionDenied(true);
        }
      }
    };
    return (
      <div className="mt-4 text-center">
        <p className="text-red-500">
          {permissionDenied
            ? "Permissions denied. Please allow access to microphone and camera."
            : "Permissions required for video calls"}
        </p>

        <button
          onClick={requestPermissions}
          className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {permissionDenied ? "Retry Permissions" : "Allow Permissions"}
        </button>

        {permissionDenied && (
          <div className="mt-2 text-sm text-gray-600">
            <p>If permissions are blocked:</p>
            <p>1. Click the lock icon in the address bar</p>
            <p>2. Set Camera/Microphone to "Allow"</p>
          </div>
        )}
      </div>
    );
  };

  if (permissionDenied) {
    return renderPermissionRequest();
  }

  if (localStream) {
    return (
      <div className="relative w-full h-full border-[1px] border-green-400 bg-black  rounded-lg overflow-hidden ">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        {!hasVideo && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <p>Video not available</p>
          </div>
        )}
        {localStream && (
          <button
            onClick={switchCamera}
            disabled={!hasVideo}
            className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full p-2 hover:bg-opacity-90"
          >
            {currentFacingMode === "environment" ? (
              <FaCamera size={16} />
            ) : (
              <FaCameraRetro size={16} />
            )}
          </button>
        )}
      </div>
    );
  }

  return null;
};

export const AcceptOrRejectPopup = ({
  stopRingtone,
  setIncomingCall,
  socket,
  setCallStatus,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg text-center shadow-xl">
        <h2 className="text-xl font-bold mb-4">Incoming Call!</h2>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              stopRingtone();
              setIncomingCall(false);
              setCallStatus("in-progress");
              socket.emit("call-accepted");
            }}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Accept
          </button>
          <button
            onClick={() => {
              stopRingtone();
              setIncomingCall(false);
              setCallStatus("idle");
              socket.emit("call-denied");
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

const RenderRemoteComponent = ({
  remoteStream,
  remoteVideoRef,
  remoteAudioRef,
  isMuted,
  isVideoEnabled,
  isCallActive,
  pcRef,
  setIsVideoEnabled,
  localStream,
  setIsMuted,
  hasVideo,
}) => {
  const toggleVideo = () => {
    if (localStream) {
      console.log("come in toggle video<<<<");

      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach((track) => (track.enabled = !isVideoEnabled));
      setIsVideoEnabled((prev) => !prev);

      // Update the sender in the peer connection (if call is active)
      if (pcRef.current && isCallActive) {
        const sender = pcRef.current
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");
        if (sender) {
          sender.replaceTrack(videoTracks[0]); // Replace track with the current track (enabled or disabled)
        }
      }
    }
  };
  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach((track) => (track.enabled = isMuted));
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="relative h-full w-full border-[1px] border-blue-400 rounded-lg">
      {remoteStream ? (
        <>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-[calc(100vh-120px)] object-cover bg-black rounded-lg"
          />
          <audio ref={remoteAudioRef} autoPlay className="hidden" />
          {/* Controls overlay */}
          <div className="absolute bottom-16 left-4 flex gap-2">
            <button
              onClick={toggleMute}
              className={`w-10 h-10 rounded-full bg-gray-800 bg-opacity-70 text-white flex items-center justify-center hover:bg-opacity-90`}
            >
              {isMuted ? (
                <FaMicrophoneSlash size={20} />
              ) : (
                <FaMicrophone size={20} />
              )}
            </button>
            <button
              onClick={toggleVideo}
              disabled={!hasVideo}
              className={`w-10 h-10 rounded-full ${
                !hasVideo ? "bg-gray-500" : "bg-gray-800 hover:bg-opacity-90"
              } bg-opacity-70 text-white flex items-center justify-center`}
            >
              {isVideoEnabled ? (
                <FaVideo size={20} />
              ) : (
                <FaVideoSlash size={20} />
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="w-full h-[calc(100vh-120px)] bg-black flex items-center justify-center rounded-lg">
          <span className="text-white text-lg">
            Waiting for remote video...
          </span>
        </div>
      )}
    </div>
  );
};

export default RenderRemoteComponent;

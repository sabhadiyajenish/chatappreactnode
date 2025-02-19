import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { SOCKET_URL } from "../../utils/constant";
import {
  FaCamera,
  FaCameraRetro,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo, // Import Video Icon
  FaVideoSlash, // Import Video Slash Icon
} from "react-icons/fa";
const socket = io(SOCKET_URL);

export default function Home() {
  const pcRef = useRef(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const remoteAudioRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const localVideoRef = useRef(null);
  const [callInProgress, setCallInProgress] = useState(false);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState(null);
  const [incomingCall, setIncomingCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasVideo, setHasVideo] = useState(true); // Track video availability
  const [localVideoError, setLocalVideoError] = useState(null); // Store video error
  const audioRef = useRef(new Audio("/iphone.mp3"));
  const [isRingtonePlaying, setIsRingtonePlaying] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [currentFacingMode, setCurrentFacingMode] = useState("environment");
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  // Check permissions on component mount
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // Attempt to get media to check permissions
        const testStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        testStream.getTracks().forEach((track) => track.stop());
        setPermissionDenied(false);
      } catch (error) {
        console.log("M<<<<<<<<<<<<<<<<<<<", error.name);

        if (
          error.name === "NotAllowedError" ||
          error.name === "NotFoundError"
        ) {
          setPermissionDenied(true);
        }
      }
    };

    checkPermissions();
  }, []);
  // Request permissions when the user clicks "Allow Permissions"
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
  const renderPermissionRequest = () => {
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

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      // Ensure video plays on mobile
      localVideoRef.current.play().catch((error) => {
        console.error("Error playing local video:", error);
      });
    }
  }, [localStream]);
  useEffect(() => {
    let isMounted = true;

    const getAudioDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(
        (device) => device.kind === "audioinput"
      );
      setAudioDevices(audioInputs);
      if (audioInputs.length > 0) {
        setSelectedAudioDevice(audioInputs[0].deviceId);
      }
    };

    getAudioDevices();

    const initializeMediaAndConnection = async () => {
      pcRef.current = initializePeerConnection();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        if (isMounted) {
          setLocalStream(stream);
          setHasVideo(true);
          // Removed direct assignment to srcObject here
        }
        // Add tracks to peer connection
        stream.getTracks().forEach((track) => {
          pcRef.current.addTrack(track, stream);
        });
      } catch (error) {
        console.error("Error accessing media:", error);
        setLocalVideoError(error.message);

        // Fallback to audio with canvas video
        try {
          const audioConstraints = {
            audio: selectedAudioDevice
              ? { deviceId: { exact: selectedAudioDevice } }
              : true,
          };
          const audioStream = await navigator.mediaDevices.getUserMedia(
            audioConstraints
          );

          // Create canvas with continuous updates
          const blackCanvas = document.createElement("canvas");
          blackCanvas.width = 640;
          blackCanvas.height = 480;
          const blackCtx = blackCanvas.getContext("2d");

          const drawBlack = () => {
            blackCtx.fillStyle = "black";
            blackCtx.fillRect(0, 0, blackCanvas.width, blackCanvas.height);
            requestAnimationFrame(drawBlack);
          };
          drawBlack();

          const canvasStream = blackCanvas.captureStream();
          const videoTrack = canvasStream.getVideoTracks()[0];
          const combinedStream = new MediaStream([
            ...audioStream.getTracks(),
            videoTrack,
          ]);

          if (isMounted) {
            setLocalStream(combinedStream);
            setHasVideo(false); // Indicate video is simulated
            combinedStream.getTracks().forEach((track) => {
              pcRef.current.addTrack(track, combinedStream);
            });
          }
        } catch (audioError) {
          console.error("Error getting audio:", audioError);

          // Handle audio failure (show error, etc.)
        }
      }
    };

    initializeMediaAndConnection();

    socket.on("offer", async (offer) => {
      const pc = pcRef.current;
      if (!pc || pc.signalingState === "closed") {
        console.warn("Peer connection was closed, reinitializing...");
        pcRef.current = initializePeerConnection();
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", answer);
      } catch (error) {
        console.error("Error handling offer:", error);
      }
    });

    socket.on("answer", async (answer) => {
      const pc = pcRef.current;
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    });
    socket.on("incoming-call", () => {
      setIncomingCall(true);
      playRingtone();
    });

    socket.on("call-accepted", async () => {
      stopRingtone();
      const pc = pcRef.current;
      if (!pc || pc.signalingState === "closed") {
        pcRef.current = initializePeerConnection(); // Reinitialize if needed

        // Important: Add tracks *before* creating the offer
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
          });

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          stream.getTracks().forEach((track) => {
            pcRef.current.addTrack(track, stream);
          });
        } catch (error) {
          console.error("Error accessing media:", error);
        }
      }
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", offer);
        setIsCallActive(true);
      } catch (error) {
        console.error("Error creating/setting offer:", error);
        setCallInProgress(false);
        setIsCallActive(false);
      }
    });

    socket.on("call-denied", () => {
      stopRingtone();
      setCallInProgress(false);
      setIsCallActive(false);
      alert("Call was rejected");
    });

    socket.on("call-ended", () => {
      handleCallEnded("Call ended by the other party.");
    });

    socket.on("ice-candidate", (candidate) => {
      const pc = pcRef.current;
      if (!pc) {
        console.warn("PeerConnection is NULL when handling ICE candidates!");
        return;
      }
      try {
        if (candidate) {
          pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        console.error("Failed to add ICE candidate:", error);
      }
    });

    return () => {
      isMounted = false;
      if (pcRef.current) {
        pcRef.current.close();
      }
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("call-ended");

      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      setCallInProgress(false);
      setIsCallActive(false);
      stopRingtone();
    };
  }, []);
  useEffect(() => {
    if (remoteStream && remoteAudioRef.current && remoteVideoRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const initializePeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", event.candidate);
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state changed:", pc.iceConnectionState);
      if (pc.iceConnectionState === "connected") {
        console.log("WebRTC Connected!");
        setCallInProgress(true);
      } else if (
        pc.iceConnectionState === "failed" ||
        pc.iceConnectionState === "disconnected"
      ) {
        console.error("ICE connection failed or disconnected. Restarting...");
        handleCallEnded("Connection failed.");
        setCallInProgress(false);
        pc.close();
        pcRef.current = initializePeerConnection();
        startCall();
      }
    };

    return pc;
  };
  const handleCallEnded = (reason) => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null; // Important: Reset pcRef
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    setIsCallActive(false);
    setCallInProgress(false);
    setCallEnded(true); // Set callEnded to true
    stopRingtone();

    alert(reason); // Display the reason for the call ending

    // Reset callEnded after a short delay to allow the alert to show
    setTimeout(() => setCallEnded(false), 500);
  };

  const playRingtone = () => {
    if (!isRingtonePlaying) {
      audioRef.current.loop = true; // Set loop *after* initializing
      audioRef.current
        .play()
        .then(() => setIsRingtonePlaying(true))
        .catch((error) => console.log("Audio play failed:", error));
    }
  };

  const stopRingtone = () => {
    if (isRingtonePlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsRingtonePlaying(false); // Update *before* setting to null for proper state management
    }
  };

  const startCall = async () => {
    if (callInProgress) return;
    setCallInProgress(true);
    socket.emit("call-request");
  };
  const endCall = () => {
    if (isCallActive) {
      socket.emit("end-call"); // Notify the other peer
      handleCallEnded("Call ended.");
    }
  };
  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach((track) => (track.enabled = isMuted));
      setIsMuted(!isMuted);
    }
  };
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
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach((track) => (track.enabled = isVideoEnabled));
      setIsVideoEnabled(!isVideoEnabled);

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

  // Render local video or fallback UI
  const renderLocalVideo = () => {
    if (permissionDenied) {
      return renderPermissionRequest();
    }

    if (localStream) {
      return (
        <div>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-64 border-2 border-green-500 rounded-xl"
          />
          {!hasVideo && (
            <div className="text-center text-sm text-gray-600 mt-2">
              <p>Video not available.</p>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center sm:p-4 p-3">
      <h1 className="sm:text-3xl text-lg font-bold mb-4 text-center">
        Audio/Video Call App
      </h1>

      <div className="bg-white rounded-lg shadow-lg sm:p-6 p-2 w-full max-w-md">
        <button
          onClick={startCall}
          disabled={callInProgress || permissionDenied}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
        >
          {callInProgress ? "Call in Progress" : "Start Call"}
        </button>
        {isCallActive && (
          <button
            onClick={endCall}
            className="w-full mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            End Call
          </button>
        )}

        {!remoteStream && (
          <div className="mt-4 flex justify-center relative">
            {renderLocalVideo()}
            {localStream && ( // Only show button if there's a local stream
              <button
                onClick={switchCamera}
                disabled={!hasVideo}
                className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full p-2 hover:bg-opacity-90"
              >
                {currentFacingMode === "environment" ? (
                  <FaCamera /> // Back camera icon
                ) : (
                  <FaCameraRetro /> // Front camera icon
                )}
              </button>
            )}
          </div>
        )}

        {/* Remote Video & Audio */}
        <div className="mt-4 flex justify-center">
          {remoteStream && (
            <div className=" relative">
              <div className=" sm:hidden w-40 h-auto z-20 absolute bottom-5 right-0 flex justify-center">
                {renderLocalVideo()}
                {localStream && ( // Only show button if there's a local stream
                  <button
                    onClick={switchCamera}
                    disabled={!hasVideo}
                    className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full p-2 hover:bg-opacity-90"
                  >
                    {currentFacingMode === "environment" ? (
                      <FaCamera /> // Back camera icon
                    ) : (
                      <FaCameraRetro /> // Front camera icon
                    )}
                  </button>
                )}
              </div>

              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-[550px] border-2 border-blue-500 rounded-xl"
              />
              <audio
                ref={remoteAudioRef}
                autoPlay
                controls
                className="mt-2 w-full"
              />
              <div className="flex items-center justify-center gap-x-5">
                <button
                  onClick={toggleMute}
                  className="flex items-center justify-center gap-2 w-16 h-16 rounded-full bg-gray-800 text-white shadow-lg hover:bg-gray-700 transition-all duration-200"
                >
                  {isMuted ? (
                    <FaMicrophoneSlash size={24} />
                  ) : (
                    <FaMicrophone size={24} />
                  )}
                </button>
                <button
                  onClick={toggleVideo}
                  className="flex items-center justify-center gap-2 w-16 h-16 rounded-full bg-gray-800 text-white shadow-lg hover:bg-gray-700 transition-all duration-200"
                >
                  {isVideoEnabled ? (
                    <FaVideo size={24} />
                  ) : (
                    <FaVideoSlash size={24} />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Incoming Call Popup */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg text-center shadow-xl">
            <h2 className="text-xl font-bold mb-4">Incoming Call!</h2>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  stopRingtone();
                  setIncomingCall(false);
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
                  socket.emit("call-denied");
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

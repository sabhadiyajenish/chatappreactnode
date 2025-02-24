import { useEffect, useRef, useState } from "react";
import { FaPhone, FaPhoneSlash } from "react-icons/fa";
import io from "socket.io-client";
import { SOCKET_URL } from "../../utils/constant";
import RenderRemoteComponent, {
  AcceptOrRejectPopup,
  renderLocalVideo,
} from "./etraComponent";
import { LuScreenShare, LuScreenShareOff } from "react-icons/lu";
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
  const [callStatus, setCallStatus] = useState("idle");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenShareStream, setScreenShareStream] = useState(null);
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
        console.log("Sending answer...");
        socket.emit("answer", answer);
        console.log("Answer sent.");

        if (remoteVideoRef.current && remoteStream) {
          console.log("Resetting remote video srcObject...");
          remoteVideoRef.current.srcObject = null;
          remoteVideoRef.current.srcObject = remoteStream;
          console.log("Remote video srcObject reset complete.");
        }
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
      setCallStatus("incoming"); // Update call status
    });

    socket.on("call-accepted", async () => {
      stopRingtone();
      setCallStatus("in-progress");
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
      setCallStatus("idle"); // Update call status
      setCallInProgress(false);
      setIsCallActive(false);
      alert("Call was rejected");
    });
    socket.on("call-ended", (reason) => {
      handleCallEnded(reason || "Call ended by the other party.");
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
      setCallStatus("idle");
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
    setCallStatus("idle");
    // Reset callEnded after a short delay to allow the alert to show
    setTimeout(() => setCallEnded(false), 500);
    stopScreenSharing();
    window?.location.reload();
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
    if (callStatus !== "idle") return; // Use callStatus instead of callInProgress
    setCallStatus("calling"); // Update call status
    socket.emit("call-request");
  };

  const endCall = () => {
    if (callStatus === "in-progress") {
      // Check if call is in progress
      socket.emit("end-call");
      handleCallEnded("Call ended.");
    }
  };
  const toggleScreenSharing = async () => {
    if (!isScreenSharing) {
      try {
        // Check for browser support FIRST
        if (
          !(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)
        ) {
          alert("Screen sharing is not supported on this browser/device.");
          return; // Exit early if not supported
        }

        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });

        setScreenShareStream(stream);
        setIsScreenSharing(true);

        const videoTrack = stream.getVideoTracks()[0];

        // Handle the case where the peer connection might not be initialized yet
        if (pcRef.current) {
          // Check if pcRef.current exists
          const sender = pcRef.current
            .getSenders()
            .find((s) => s.track?.kind === "video"); // Optional chaining

          if (sender) {
            sender.replaceTrack(videoTrack, stream);
            setLocalStream(stream);
            setHasVideo(true);
          } else {
            console.warn(
              "Sender not found. Peer connection might not be fully established."
            );
            // Consider adding the track directly if the sender isn't available yet:
            // pcRef.current.addTrack(videoTrack, stream);  // Add track to pc
            // setLocalStream(stream);
            // setHasVideo(true);
          }
        } else {
          console.warn("Peer connection is not initialized yet.");
          // Handle appropriately:  e.g., inform user, retry later
        }

        stream.oninactive = () => {
          stopScreenSharing();
        };
      } catch (err) {
        console.error("Error sharing screen:", err);
        stopScreenSharing();
        // Provide more user-friendly error messages:
        if (err.name === "NotAllowedError") {
          alert("Screen sharing permission was denied.");
        } else {
          alert("An error occurred during screen sharing: " + err.message);
        }
      }
    } else {
      stopScreenSharing();
    }
  };
  const stopScreenSharing = async () => {
    if (screenShareStream) {
      const videoTrack = screenShareStream.getVideoTracks()[0];
      const sender = pcRef.current
        .getSenders()
        .find((s) => s.track?.kind === "video");

      if (sender && localStream) {
        console.log("Replacing track...");
        // Get the original video track from localStream
        const originalVideoTrack = localStream.getVideoTracks()[0];
        sender.replaceTrack(originalVideoTrack, localStream);
        setLocalStream(localStream);
        console.log("Track replaced.");
      }

      screenShareStream.getTracks().forEach((track) => track.stop());
      setScreenShareStream(null);
      setIsScreenSharing(false);
      setHasVideo(true);

      // Force Re-negotiation
      try {
        console.log("Creating offer for re-negotiation...");
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        console.log("Sending offer for re-negotiation...");
        socket.emit("offer", offer);
        console.log("Offer sent.");
      } catch (error) {
        console.error("Error re-negotiating:", error);
      }
    }
  };

  return (
    <div className="min-h-screen  bg-gray-900 flex flex-col">
      {/* Main Video Area */}
      <div className=" relative">
        <div className="flex-1 flex flex-col md:flex-row gap-4 p-4">
          {/* Local Video - Picture-in-Picture style */}
          <div className="relative md:absolute md:bottom-10 md:right-7 md:w-1/5 w-full h-48 md:h-40 z-10">
            {renderLocalVideo(
              permissionDenied,
              localStream,
              localVideoRef,
              hasVideo,
              currentFacingMode,
              setLocalStream,
              setPermissionDenied,
              pcRef,
              setCurrentFacingMode,
              isCallActive,
              isScreenSharing
            )}
          </div>

          {/* Remote Video - Full screen */}
          <div className="flex-1 w-full">
            <RenderRemoteComponent
              remoteStream={remoteStream}
              remoteVideoRef={remoteVideoRef}
              remoteAudioRef={remoteAudioRef}
              isMuted={isMuted}
              isVideoEnabled={isVideoEnabled}
              isCallActive={isCallActive}
              pcRef={pcRef}
              setIsVideoEnabled={setIsVideoEnabled}
              localStream={localStream}
              setIsMuted={setIsMuted}
              hasVideo={hasVideo}
            />
          </div>
        </div>
        {/* Control Bar */}
        <div className=" p-4 flex justify-center absolute bottom-4 mx-auto w-full items-center gap-4 ">
          {/* Start Call Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={startCall}
              disabled={callStatus !== "idle" || permissionDenied}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-all 
              ${
                callStatus === "calling"
                  ? "bg-yellow-500 animate-pulse"
                  : callStatus === "in-progress"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"
              } 
              text-white disabled:bg-gray-500`}
            >
              <FaPhone className="text-xl" />
            </button>
            <span className="text-white text-sm mt-1">
              {callStatus === "calling"
                ? "Calling..."
                : callStatus === "in-progress"
                ? "Active"
                : "Start"}
            </span>
          </div>

          {/* End Call Button */}
          {callStatus === "in-progress" && (
            <div className="flex flex-col items-center">
              <button
                onClick={endCall}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white"
              >
                <FaPhoneSlash className="text-xl" />
              </button>
              <span className="text-white text-sm mt-1">End</span>
            </div>
          )}

          {/* Screen Share Button */}
          {callStatus === "in-progress" && (
            <div className="flex flex-col items-center">
              <button
                onClick={toggleScreenSharing}
                className={`flex items-center justify-center w-12 h-12 rounded-full 
                ${
                  isScreenSharing
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "bg-gray-600 hover:bg-gray-700"
                } text-white`}
              >
                {isScreenSharing ? (
                  <LuScreenShareOff className="text-xl" />
                ) : (
                  <LuScreenShare className="text-xl" />
                )}
              </button>
              <span className="text-white text-sm mt-1">
                {isScreenSharing ? "Stop Share" : "Share"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Incoming Call Popup */}
      {incomingCall && callStatus === "incoming" && (
        <AcceptOrRejectPopup
          stopRingtone={stopRingtone}
          setIncomingCall={setIncomingCall}
          socket={socket}
          setCallStatus={setCallStatus}
        />
      )}
    </div>
  );
}

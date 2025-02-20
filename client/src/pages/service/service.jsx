import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { SOCKET_URL } from "../../utils/constant";
import {
  FaCamera,
  FaCameraRetro,
  FaMicrophone,
  FaMicrophoneSlash,
  FaPhone,
  FaPhoneSlash,
  FaVideo, // Import Video Icon
  FaVideoSlash, // Import Video Slash Icon
} from "react-icons/fa";
import RenderRemoteComponent, {
  AcceptOrRejectPopup,
  renderLocalVideo,
} from "./etraComponent";
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center sm:p-4 p-3">
      <h1 className="sm:text-3xl text-lg font-bold mb-4 text-center">
        Audio/Video Call App
      </h1>

      <div className="bg-white rounded-lg shadow-lg sm:p-6 p-2 w-full max-w-md">
        <div className="flex  items-center justify-center pt-3 ">
          {/* Start Call Button */}
          <div className=" flex flex-col items-center justify-center gap-2">
            <button
              onClick={startCall}
              disabled={callStatus !== "idle" || permissionDenied}
              className={`relative flex items-center justify-center md:w-16 w-12 md:h-16 h-12 rounded-full transition-all 
          ${
            callStatus === "calling"
              ? "bg-yellow-500 animate-pulse"
              : callStatus === "in-progress"
              ? "bg-green-500 hover:bg-green-700"
              : "bg-blue-500 hover:bg-blue-700"
          } 
          text-white font-bold shadow-lg disabled:bg-gray-400`}
            >
              {callStatus === "calling" || callStatus === "in-progress" ? (
                <FaPhone className="md:text-2xl text-xl animate-spin-slow" />
              ) : (
                <FaPhone className="md:text-2xl text-xl" />
              )}
            </button>

            {/* Call Status Text */}
            <p className="md:text-lg text-sm font-semibold text-center px-4 ">
              {callStatus === "calling"
                ? "Calling..."
                : callStatus === "in-progress"
                ? "Call in Progress"
                : "Start Call"}
            </p>
          </div>
          {/* End Call Button (Only when in-progress) */}
          {callStatus === "in-progress" && (
            <div className=" flex flex-col items-center justify-center gap-2">
              <button
                onClick={endCall}
                className="relative flex items-center justify-center  md:w-16 w-12 md:h-16 h-12  rounded-full bg-red-500 hover:bg-red-700 text-white font-bold shadow-lg transition-all"
              >
                <FaPhoneSlash className="md:text-2xl text-xl" />
              </button>
              <p className="md:text-lg text-sm font-semibold text-center px-4 ">
                End Call
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-center relative">
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
            isCallActive
          )}
        </div>

        {/* Remote Video & Audio */}
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

      {/* Incoming Call Popup */}
      {incomingCall &&
        callStatus === "incoming" && ( // Show popup only if incoming and status is correct
          <AcceptOrRejectPopup
            stopRingtone={stopRingtone}
            setIncomingCall={setIncomingCall}
            socket={socket}
            setCallStatus={setCallStatus} // Pass setCallStatus to the popup
          />
        )}
    </div>
  );
}

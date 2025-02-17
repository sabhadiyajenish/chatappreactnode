import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { SOCKET_URL } from "../../utils/constant";

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
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          stream.getTracks().forEach((track) => {
            pcRef.current.addTrack(track, stream);
          });
        }
      } catch (error) {
        console.error("Error accessing media:", error);
        setLocalVideoError(error.message); // Store the error message

        if (
          error.name === "NotAllowedError" ||
          error.name === "NotFoundError" ||
          error.name === "OverconstrainedError"
        ) {
          console.log(
            "Video access denied or not available. Trying audio only."
          );
          setHasVideo(false);

          try {
            const audioConstraints = {
              audio: selectedAudioDevice
                ? { deviceId: { exact: selectedAudioDevice } }
                : true,
            };
            const audioStream = await navigator.mediaDevices.getUserMedia(
              audioConstraints
            );

            if (isMounted) {
              setLocalStream(audioStream);
              audioStream.getTracks().forEach((track) => {
                pcRef.current.addTrack(track, audioStream);
              });

              if (localVideoRef.current) {
                const blackCanvas = document.createElement("canvas");
                blackCanvas.width = 640;
                blackCanvas.height = 480;
                const blackCtx = blackCanvas.getContext("2d");
                blackCtx.fillStyle = "black";
                blackCtx.fillRect(0, 0, blackCanvas.width, blackCanvas.height);
                localVideoRef.current.srcObject = blackCanvas.captureStream();
              }
            }
          } catch (audioError) {
            console.error("Error getting only audio:", audioError);
            if (isMounted) {
              setLocalStream(null);
              if (localVideoRef.current) {
                const blackCanvas = document.createElement("canvas");
                blackCanvas.width = 640;
                blackCanvas.height = 480;
                const blackCtx = blackCanvas.getContext("2d");
                blackCtx.fillStyle = "black";
                blackCtx.fillRect(0, 0, blackCanvas.width, blackCanvas.height);
                localVideoRef.current.srcObject = blackCanvas.captureStream();
              }
            }
          }
        } else {
          console.error("Other media access error:", error);
          setHasVideo(false);
          try {
            const audioConstraints = {
              audio: selectedAudioDevice
                ? { deviceId: { exact: selectedAudioDevice } }
                : true,
            };
            const audioStream = await navigator.mediaDevices.getUserMedia(
              audioConstraints
            );

            if (isMounted) {
              setLocalStream(audioStream);
              audioStream.getTracks().forEach((track) => {
                pcRef.current.addTrack(track, audioStream);
              });

              if (localVideoRef.current) {
                const blackCanvas = document.createElement("canvas");
                blackCanvas.width = 640;
                blackCanvas.height = 480;
                const blackCtx = blackCanvas.getContext("2d");
                blackCtx.fillStyle = "black";
                blackCtx.fillRect(0, 0, blackCanvas.width, blackCanvas.height);
                localVideoRef.current.srcObject = blackCanvas.captureStream();
              }
            }
          } catch (audioError) {
            console.error("Error getting only audio:", audioError);
            if (isMounted) {
              setLocalStream(null);
              if (localVideoRef.current) {
                const blackCanvas = document.createElement("canvas");
                blackCanvas.width = 640;
                blackCanvas.height = 480;
                const blackCtx = blackCanvas.getContext("2d");
                blackCtx.fillStyle = "black";
                blackCtx.fillRect(0, 0, blackCanvas.width, blackCanvas.height);
                localVideoRef.current.srcObject = blackCanvas.captureStream();
              }
            }
          }
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
    });

    socket.on("call-accepted", async () => {
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
      setCallInProgress(false);
      setIsCallActive(false);
      alert("Call was rejected");
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

      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      setCallInProgress(false);
      setIsCallActive(false);
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
        setCallInProgress(false);
        pc.close();
        pcRef.current = initializePeerConnection();
        startCall();
      }
    };

    return pc;
  };

  const startCall = async () => {
    if (callInProgress) return;
    setCallInProgress(true);
    socket.emit("call-request");
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach((track) => (track.enabled = !isMuted));
      setIsMuted(!isMuted);
    }
  };
  return (
    <div className="h-screen bg-gray-100 flex flex-col items-center justify-center">
      {" "}
      {/* Full screen, centered */}
      <h1 className="text-3xl font-bold mb-4">Audio/Video Call App</h1>
      <div className="bg-white rounded-lg shadow-md p-6 w-96">
        {" "}
        {/* Card-like container */}
        <button
          onClick={startCall}
          disabled={callInProgress}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {callInProgress ? "Call in Progress" : "Start Call"}
        </button>
        <div className="mt-4 flex justify-center">
          {localStream && (
            <div>
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-64 h-48 border-2 border-red-500 rounded"
              />
              {!hasVideo && (
                <div>
                  <p>Video not available.</p>
                  {localVideoError && <p>Error: {localVideoError}</p>}
                  {/* Display error message */}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-center">
          {" "}
          {/* Video container */}
          {remoteStream && (
            <div>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-64 h-48 border-2 border-blue-500 rounded" // Fixed size, border
              />
              <audio
                ref={remoteAudioRef}
                autoPlay
                controls
                className="mt-2"
              ></audio>{" "}
              <button
                onClick={toggleMute}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4"
              >
                {isMuted ? "Unmute" : "Mute"}
              </button>
              {/* Audio controls below video */}
            </div>
          )}
        </div>
      </div>
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg text-center">
            <h2 className="text-xl font-bold mb-4">Incoming Call!</h2>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  socket.emit("call-accepted");
                  setIncomingCall(false);
                }}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Accept
              </button>
              <button
                onClick={() => {
                  socket.emit("call-denied");
                  setIncomingCall(false);
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

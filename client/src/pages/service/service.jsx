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
  const [callInProgress, setCallInProgress] = useState(false); // Track call state

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates after unmount

    const initializeMediaAndConnection = async () => {
      pcRef.current = initializePeerConnection();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        if (isMounted) {
          // Check if component is still mounted
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }

        stream.getTracks().forEach((track) => {
          pcRef.current.addTrack(track, stream);
        });
      } catch (error) {
        console.error("Error accessing media:", error);
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          if (isMounted) {
            setLocalStream(audioStream);
            audioStream.getTracks().forEach((track) => {
              pcRef.current.addTrack(track, audioStream);
            });
          }
        } catch (audioError) {
          console.error("Error getting only audio:", audioError);
          if (isMounted) {
            setLocalStream(null); // No local stream at all
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
      isMounted = false; // Set flag to false on unmount
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
        setCallInProgress(true); // Update call state
      } else if (
        pc.iceConnectionState === "failed" ||
        pc.iceConnectionState === "disconnected"
      ) {
        console.error("ICE connection failed or disconnected. Restarting...");
        setCallInProgress(false); // Update call state
        pc.close();
        pcRef.current = initializePeerConnection(); // Re-initialize
        startCall(); // Automatically restart the call
      }
    };

    return pc;
  };

  const startCall = async () => {
    if (callInProgress) return; // Prevent multiple calls

    setCallInProgress(true); // Update call state
    const pc = pcRef.current;
    if (!pc || pc.signalingState === "closed") {
      console.warn("Reinitializing peer connection...");
      pcRef.current = initializePeerConnection();
    }
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", offer);
      setIsCallActive(true); // Update call state
    } catch (error) {
      console.error("Error creating or setting offer:", error);
      setCallInProgress(false); // Reset call state on error
      setIsCallActive(false);
    }
  };

  return (
    <div>
      <h1>Audio/Video Call App</h1>
      <button onClick={startCall} disabled={callInProgress}>
        {callInProgress ? "Call in Progress" : "Start Call"}
      </button>

      {localStream && (
        <video
          // className="bg-black"
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
        ></video>
      )}

      {remoteStream && (
        <div>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            // className="bg-black"
          ></video>
          <audio ref={remoteAudioRef} autoPlay controls></audio>
        </div>
      )}
    </div>
  );
}

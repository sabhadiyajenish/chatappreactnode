import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { SOCKET_URL } from "../../utils/constant";

const socket = io(SOCKET_URL); // Replace with your backend URL

export default function Home() {
  const pcRef = useRef(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const remoteAudioRef = useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);

  useEffect(() => {
    pcRef.current = initializePeerConnection();

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => {
          pcRef.current.addTrack(track, stream);
        });
      })
      .catch((error) => console.error("Error accessing microphone:", error));

    socket.on("offer", async (offer) => {
      const pc = pcRef.current;
      if (!pc || pc.signalingState === "closed") {
        console.warn("Peer connection was closed, reinitializing...");
        pcRef.current = initializePeerConnection();
      }
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", answer);
    });

    socket.on("answer", async (answer) => {
      const pc = pcRef.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
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
      if (pcRef.current) {
        pcRef.current.close();
      }
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, []);

  useEffect(() => {
    if (remoteStream && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
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
      } else if (pc.iceConnectionState === "failed") {
        console.error("ICE connection failed. Restarting...");
        pc.restartIce();
      } else if (pc.iceConnectionState === "disconnected") {
        console.warn("ICE connection disconnected. Retrying...");
        pc.restartIce();
      }
    };

    return pc;
  };

  const startCall = async () => {
    const pc = pcRef.current;
    if (!pc || pc.signalingState === "closed") {
      console.warn("Reinitializing peer connection...");
      pcRef.current = initializePeerConnection();
    }
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("offer", offer);
    setIsCallActive(true);
  };

  return (
    <div>
      <h1>Audio Call App</h1>
      <button onClick={startCall} disabled={isCallActive}>
        {isCallActive ? "Call in Progress" : "Start Call"}
      </button>
      {remoteStream && <audio ref={remoteAudioRef} autoPlay controls></audio>}
    </div>
  );
}

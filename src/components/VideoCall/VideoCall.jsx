"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";

const VideoChatUser = ({ socket, user }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  const [inCall, setInCall] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [connectionState, setConnectionState] = useState("new");

  const createPeerConnection = useCallback(() => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", {
          to: "admin",
          candidate: e.candidate,
        });
      }
    };

    peer.ontrack = (event) => {
      console.log("Received remote stream");
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peer.onconnectionstatechange = () => {
      setConnectionState(peer.connectionState);
      console.log("Connection state:", peer.connectionState);
    };

    return peer;
  }, [socket]);

  const startCall = async () => {
    try {
      setIsConnecting(true);

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      peerRef.current = createPeerConnection();

      // Add tracks to peer connection
      stream.getTracks().forEach((track) => {
        if (peerRef.current && streamRef.current) {
          peerRef.current.addTrack(track, streamRef.current);
        }
      });

      // Create and send offer
      const offer = await peerRef.current.createOffer();
      await peerRef.current.setLocalDescription(offer);

      socket.emit("call-user", {
        to: "admin",
        from: user._id,
        offer,
      });

      setInCall(true);
      setIsConnecting(false);
    } catch (error) {
      console.error("Error starting call:", error);
      setIsConnecting(false);
    }
  };

  const endCall = useCallback(() => {
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Close peer connection
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    // Clear video elements
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setInCall(false);
    setConnectionState("new");

    // Notify server
    socket.emit("end-call", { to: "admin" });
  }, [socket]);

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  useEffect(() => {
    socket.on("answer-call", async ({ answer }) => {
      if (peerRef.current) {
        try {
          await peerRef.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
          console.log("Remote description set successfully");
        } catch (error) {
          console.error("Error setting remote description:", error);
        }
      }
    });

    socket.on("ice-candidate", ({ candidate }) => {
      if (peerRef.current && candidate) {
        try {
          peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      }
    });

    socket.on("call-ended", () => {
      endCall();
    });

    return () => {
      socket.off("answer-call");
      socket.off("ice-candidate");
      socket.off("call-ended");
      endCall();
    };
  }, [socket, endCall]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">User Video Chat</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div
            className={`w-2 h-2 rounded-full ${
              connectionState === "connected"
                ? "bg-green-500"
                : connectionState === "connecting"
                ? "bg-yellow-500"
                : "bg-gray-400"
            }`}
          />
          Connection: {connectionState}
        </div>
      </div>

      {!inCall && !isConnecting && (
        <Button onClick={startCall} className="mb-4">
          <Phone className="w-4 h-4 mr-2" />
          Call Admin
        </Button>
      )}

      {isConnecting && <div className="mb-4 text-blue-600">Connecting...</div>}

      {inCall && (
        <div className="mb-4 flex gap-2">
          <Button
            onClick={toggleAudio}
            variant={audioEnabled ? "default" : "destructive"}
          >
            {audioEnabled ? (
              <Mic className="w-4 h-4" />
            ) : (
              <MicOff className="w-4 h-4" />
            )}
          </Button>
          <Button
            onClick={toggleVideo}
            variant={videoEnabled ? "default" : "destructive"}
          >
            {videoEnabled ? (
              <Video className="w-4 h-4" />
            ) : (
              <VideoOff className="w-4 h-4" />
            )}
          </Button>
          <Button onClick={endCall} variant="destructive">
            <PhoneOff className="w-4 h-4 mr-2" />
            End Call
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="font-semibold">Your Video</h3>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-64 bg-gray-900 rounded-lg object-cover"
          />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Admin Video</h3>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-64 bg-gray-900 rounded-lg object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default VideoChatUser;

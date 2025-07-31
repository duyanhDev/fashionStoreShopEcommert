"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";

const VideoChatAdmin = ({ socket, user }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const callerIdRef = useRef(null);

  const [incomingCall, setIncomingCall] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [callerInfo, setCallerInfo] = useState("");
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
      if (e.candidate && callerIdRef.current) {
        socket.emit("ice-candidate", {
          to: callerIdRef.current,
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

  const initStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  }, []);

  const acceptCall = async (offer) => {
    try {
      if (!streamRef.current) {
        await initStream();
      }

      const peer = createPeerConnection();
      peerRef.current = peer;

      // Add local stream tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          if (peerRef.current && streamRef.current) {
            peerRef.current.addTrack(track, streamRef.current);
          }
        });
      }

      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("answer-call", {
        to: callerIdRef.current,
        answer,
      });

      setIncomingCall(false);
      setInCall(true);
    } catch (error) {
      console.error("Error accepting call:", error);
    }
  };

  const rejectCall = () => {
    socket.emit("reject-call", { to: callerIdRef.current });
    setIncomingCall(false);
    callerIdRef.current = null;
  };

  const endCall = useCallback(() => {
    // Close peer connection
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    // Clear remote video
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setInCall(false);
    setConnectionState("new");

    // Notify caller
    if (callerIdRef.current) {
      socket.emit("call-ended", { to: callerIdRef.current });
      callerIdRef.current = null;
    }
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
    initStream();

    socket.on("incoming-call", ({ from, offer }) => {
      callerIdRef.current = from;
      setCallerInfo(from);
      setIncomingCall(true);

      // Store offer for when user accepts
      window.pendingOffer = offer;
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

    socket.on("end-call", () => {
      endCall();
    });

    return () => {
      socket.off("incoming-call");
      socket.off("ice-candidate");
      socket.off("end-call");

      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      endCall();
    };
  }, [socket, initStream, endCall]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Admin Video Chat</h2>
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
          <h3 className="font-semibold">User Video</h3>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-64 bg-gray-900 rounded-lg object-cover"
          />
        </div>
      </div>

      {/* Incoming Call Dialog */}
      <Dialog open={incomingCall} onOpenChange={setIncomingCall}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Incoming Call
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>User {callerInfo} is calling you. Do you want to answer?</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={rejectCall}>
                Decline
              </Button>
              <Button onClick={() => acceptCall(window.pendingOffer)}>
                Accept
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoChatAdmin;

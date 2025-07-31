import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button, message } from "antd";
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

  // Register user with socket
  useEffect(() => {
    if (user?._id) {
      socket.emit("register", { userId: user._id, role: "user" });
    }
  }, [user, socket]);

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

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      peerRef.current = createPeerConnection();

      stream.getTracks().forEach((track) => {
        if (peerRef.current && streamRef.current) {
          peerRef.current.addTrack(track, streamRef.current);
        }
      });

      const offer = await peerRef.current.createOffer();
      await peerRef.current.setLocalDescription(offer);

      socket.emit("call-user", {
        to: "admin",
        from: user._id,
        offer,
      });

      setInCall(true);
      setIsConnecting(false);
      message.success("Đang kết nối với admin...");
    } catch (error) {
      console.error("Error starting call:", error);
      message.error("Không thể truy cập camera/microphone");
      setIsConnecting(false);
    }
  };

  const endCall = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setInCall(false);
    setConnectionState("new");

    socket.emit("end-call", { to: "admin" });
    message.info("Cuộc gọi đã kết thúc");
  }, [socket]);

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
        message.info(
          audioTrack.enabled ? "Đã bật microphone" : "Đã tắt microphone"
        );
      }
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
        message.info(videoTrack.enabled ? "Đã bật camera" : "Đã tắt camera");
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
          message.success("Kết nối thành công!");
        } catch (error) {
          console.error("Error setting remote description:", error);
          message.error("Lỗi kết nối");
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

    socket.on("call-rejected", () => {
      message.warning("Admin đã từ chối cuộc gọi");
      endCall();
    });

    return () => {
      socket.off("answer-call");
      socket.off("ice-candidate");
      socket.off("call-ended");
      socket.off("call-rejected");
      endCall();
    };
  }, [socket, endCall]);

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case "connected":
        return "#52c41a";
      case "connecting":
        return "#faad14";
      case "disconnected":
        return "#ff4d4f";
      default:
        return "#d9d9d9";
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <h2
          style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}
        >
          User Video Chat
        </h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            color: "#666",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: getConnectionStatusColor(),
            }}
          />
          Connection: {connectionState}
        </div>
      </div>

      {!inCall && !isConnecting && (
        <Button
          type="primary"
          icon={<Phone size={16} />}
          onClick={startCall}
          style={{ marginBottom: "16px" }}
        >
          Gọi Admin
        </Button>
      )}

      {isConnecting && (
        <div style={{ marginBottom: "16px", color: "#1890ff" }}>
          Đang kết nối...
        </div>
      )}

      {inCall && (
        <div style={{ marginBottom: "16px", display: "flex", gap: "8px" }}>
          <Button
            type={audioEnabled ? "default" : "primary"}
            danger={!audioEnabled}
            icon={audioEnabled ? <Mic size={16} /> : <MicOff size={16} />}
            onClick={toggleAudio}
          />
          <Button
            type={videoEnabled ? "default" : "primary"}
            danger={!videoEnabled}
            icon={videoEnabled ? <Video size={16} /> : <VideoOff size={16} />}
            onClick={toggleVideo}
          />
          <Button
            type="primary"
            danger
            icon={<PhoneOff size={16} />}
            onClick={endCall}
          >
            Kết thúc
          </Button>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "16px",
        }}
      >
        <div>
          <h3 style={{ fontWeight: "600", marginBottom: "8px" }}>
            Video của bạn
          </h3>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "100%",
              height: "240px",
              backgroundColor: "#000",
              borderRadius: "8px",
              objectFit: "cover",
            }}
          />
        </div>
        <div>
          <h3 style={{ fontWeight: "600", marginBottom: "8px" }}>
            Video Admin
          </h3>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              width: "100%",
              height: "240px",
              backgroundColor: "#000",
              borderRadius: "8px",
              objectFit: "cover",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoChatUser;

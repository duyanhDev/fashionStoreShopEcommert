import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button, Modal, message } from "antd";
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

  // Register admin with socket
  useEffect(() => {
    if (user?._id) {
      socket.emit("register", { userId: user._id, role: "admin" });
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
      message.error("Không thể truy cập camera/microphone");
    }
  }, []);

  const acceptCall = async (offer) => {
    try {
      if (!streamRef.current) {
        await initStream();
      }

      const peer = createPeerConnection();
      peerRef.current = peer;

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
      message.success("Đã chấp nhận cuộc gọi");
    } catch (error) {
      console.error("Error accepting call:", error);
      message.error("Lỗi khi chấp nhận cuộc gọi");
    }
  };

  const rejectCall = () => {
    socket.emit("reject-call", { to: callerIdRef.current });
    setIncomingCall(false);
    callerIdRef.current = null;
    message.info("Đã từ chối cuộc gọi");
  };

  const endCall = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setInCall(false);
    setConnectionState("new");

    if (callerIdRef.current) {
      socket.emit("call-ended", { to: callerIdRef.current });
      callerIdRef.current = null;
    }
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
    initStream();

    socket.on("incoming-call", ({ from, offer }) => {
      callerIdRef.current = from;
      setCallerInfo(from);
      setIncomingCall(true);
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

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      endCall();
    };
  }, [socket, initStream, endCall]);

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
          Admin Video Chat
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
          <h3 style={{ fontWeight: "600", marginBottom: "8px" }}>Video User</h3>
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

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Phone size={20} />
            Cuộc gọi đến
          </div>
        }
        open={incomingCall}
        onCancel={rejectCall}
        footer={[
          <Button key="reject" onClick={rejectCall}>
            Từ chối
          </Button>,
          <Button
            key="accept"
            type="primary"
            onClick={() => acceptCall(window.pendingOffer)}
          >
            Chấp nhận
          </Button>,
        ]}
      >
        <p>
          Người dùng <strong>{callerInfo}</strong> đang gọi cho bạn. Bạn có muốn
          trả lời không?
        </p>
      </Modal>
    </div>
  );
};

export default VideoChatAdmin;

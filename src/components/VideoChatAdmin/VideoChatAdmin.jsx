"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Modal, Button, message, Card, Badge } from "antd";
import {
  PhoneOutlined,
  VideoCameraOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { io } from "socket.io-client";

// Tạo socket connection singleton để tránh multiple connections
let socketInstance = null;
const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io("https://fashionstoreshopecommertbe.onrender.com", {
      autoConnect: false, // Không tự động connect
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
};

const adminId = "673017dde4526bd79cc61fa6";

const VideoChatAdmin = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const iceBufferRef = useRef([]);
  const isAnsweringRef = useRef(false);
  const isInitializedRef = useRef(false); // Prevent multiple initializations
  const socketRef = useRef(null);

  const [incomingCall, setIncomingCall] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [connectionState, setConnectionState] = useState("new");
  const [mediaEnabled, setMediaEnabled] = useState({
    video: false,
    audio: false,
  });
  const [socketConnected, setSocketConnected] = useState(false);

  // ICE servers configuration
  const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ];

  const cleanupPeerConnection = useCallback(() => {
    console.log("🧹 Cleaning up peer connection...");

    if (peerRef.current) {
      // Remove all event listeners
      peerRef.current.onicecandidate = null;
      peerRef.current.ontrack = null;
      peerRef.current.onconnectionstatechange = null;
      peerRef.current.oniceconnectionstatechange = null;

      // Close the connection
      if (peerRef.current.signalingState !== "closed") {
        peerRef.current.close();
      }
      peerRef.current = null;
    }

    // Clear ICE buffer
    iceBufferRef.current = [];
    isAnsweringRef.current = false;
  }, []);

  const createPeerConnection = useCallback(() => {
    console.log("🔗 Creating new peer connection...");

    // Cleanup existing connection first
    cleanupPeerConnection();

    const peer = new RTCPeerConnection({ iceServers });

    peer.onicecandidate = (event) => {
      if (
        event.candidate &&
        incomingCall &&
        peer.signalingState !== "closed" &&
        socketRef.current?.connected
      ) {
        console.log("🧊 Sending ICE candidate to:", incomingCall.from);
        socketRef.current.emit("ice-candidate", {
          to: incomingCall.from,
          candidate: event.candidate,
        });
      }
    };

    peer.ontrack = (event) => {
      console.log("📺 Received remote stream");
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peer.onconnectionstatechange = () => {
      console.log("🔗 Connection state:", peer.connectionState);
      setConnectionState(peer.connectionState);

      if (peer.connectionState === "connected") {
        message.success("✅ Kết nối thành công!");
      } else if (
        peer.connectionState === "failed" ||
        peer.connectionState === "disconnected"
      ) {
        message.error("❌ Kết nối thất bại");
        setTimeout(() => endCall(), 1000);
      }
    };

    peer.oniceconnectionstatechange = () => {
      console.log("🧊 ICE connection state:", peer.iceConnectionState);
      if (peer.iceConnectionState === "failed") {
        console.log("🔄 ICE connection failed, attempting restart...");
        peer.restartIce();
      }
    };

    return peer;
  }, [incomingCall, cleanupPeerConnection]);

  const enableMedia = async () => {
    try {
      // Dừng stream cũ nếu có
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
          console.log("🛑 Stopped old track:", track.kind);
        });
        localStreamRef.current = null;
      }

      console.log("🎥 Requesting media access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: { echoCancellation: true, noiseSuppression: true },
      });

      localStreamRef.current = stream;
      setMediaEnabled({ video: true, audio: true });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log("✅ Media enabled successfully");
      return stream;
    } catch (err) {
      console.error("❌ Không thể bật media:", err);
      message.error(`Không thể truy cập camera/microphone: ${err.message}`);
      return null;
    }
  };

  const addTracksToConnection = (peer, stream) => {
    if (!peer || peer.signalingState === "closed") {
      console.error("❌ Cannot add tracks: peer connection is closed");
      return false;
    }

    try {
      // Remove existing senders
      const senders = peer.getSenders();
      senders.forEach((sender) => {
        if (sender.track) {
          console.log("🗑️ Removing existing sender:", sender.track.kind);
          peer.removeTrack(sender);
        }
      });

      // Add new tracks
      stream.getTracks().forEach((track) => {
        console.log("➕ Adding track:", track.kind);
        peer.addTrack(track, stream);
      });

      return true;
    } catch (err) {
      console.error("❌ Error adding tracks:", err);
      return false;
    }
  };

  const answerCall = async () => {
    if (
      !incomingCall ||
      isAnsweringRef.current ||
      !socketRef.current?.connected
    ) {
      console.log(
        "⚠️ Cannot answer call - already answering, no incoming call, or socket disconnected"
      );
      return;
    }

    isAnsweringRef.current = true;

    try {
      console.log("📞 Answering call from:", incomingCall.from);

      // Create new peer connection
      const peer = createPeerConnection();
      if (!peer) {
        throw new Error("Failed to create peer connection");
      }

      peerRef.current = peer;

      // Enable media first
      const stream = await enableMedia();
      if (!stream) {
        throw new Error("Failed to enable media");
      }

      // Add tracks to connection
      const tracksAdded = addTracksToConnection(peer, stream);
      if (!tracksAdded) {
        throw new Error("Failed to add tracks to connection");
      }

      // Set remote description
      console.log("📝 Setting remote description...");
      await peer.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer)
      );

      // Process buffered ICE candidates
      console.log(
        "🧊 Processing buffered ICE candidates:",
        iceBufferRef.current.length
      );
      for (const candidate of iceBufferRef.current) {
        try {
          if (peer.signalingState !== "closed") {
            await peer.addIceCandidate(new RTCIceCandidate(candidate));
          }
        } catch (err) {
          console.error("❌ Error adding buffered ICE candidate:", err);
        }
      }
      iceBufferRef.current = [];

      // Create and send answer
      console.log("📤 Creating answer...");
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socketRef.current.emit("answer-call", {
        to: incomingCall.from,
        answer,
      });

      setInCall(true);
      setIncomingCall(null);
      console.log("✅ Call answered successfully");
    } catch (err) {
      console.error("❌ Lỗi khi trả lời cuộc gọi:", err);
      message.error(`Lỗi khi thiết lập cuộc gọi: ${err.message}`);
      cleanupPeerConnection();
      setIncomingCall(null);
    } finally {
      isAnsweringRef.current = false;
    }
  };

  const endCall = useCallback(() => {
    console.log("📞 Ending call...");

    // Stop all media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("🛑 Stopped track:", track.kind);
      });
      localStreamRef.current = null;
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Cleanup peer connection
    cleanupPeerConnection();

    // Reset states
    setInCall(false);
    setIncomingCall(null);
    setMediaEnabled({ video: false, audio: false });
    setConnectionState("new");

    message.info("Cuộc gọi đã kết thúc");
  }, [cleanupPeerConnection]);

  const rejectCall = () => {
    console.log("📞 Rejecting call from:", incomingCall?.from);
    if (incomingCall && socketRef.current?.connected) {
      socketRef.current.emit("reject-call", { to: incomingCall.from });
    }
    setIncomingCall(null);
    message.info("Đã từ chối cuộc gọi");
  };

  // Initialize socket connection
  useEffect(() => {
    if (isInitializedRef.current) {
      console.log("⚠️ Already initialized, skipping...");
      return;
    }

    console.log("🔌 Initializing Admin socket connection...");
    isInitializedRef.current = true;

    const socket = getSocket();
    socketRef.current = socket;

    // Socket event handlers
    const handleConnect = () => {
      console.log("✅ Socket connected");
      setSocketConnected(true);
      socket.emit("register", { userId: adminId });
    };

    const handleDisconnect = () => {
      console.log("❌ Socket disconnected");
      setSocketConnected(false);
    };

    const handleIncomingCall = ({ from, offer }) => {
      console.log("📞 Incoming call from:", from);

      // If already in a call or answering, reject
      if (inCall || isAnsweringRef.current) {
        console.log("⚠️ Already in call, rejecting new call");
        socket.emit("reject-call", { to: from });
        return;
      }

      // If there's already an incoming call, reject the old one
      if (incomingCall) {
        console.log("⚠️ Replacing existing incoming call");
        socket.emit("reject-call", { to: incomingCall.from });
      }

      setIncomingCall({ from, offer });
    };

    const handleIceCandidate = async ({ candidate }) => {
      console.log("🧊 Received ICE candidate");
      try {
        if (
          peerRef.current &&
          peerRef.current.remoteDescription &&
          peerRef.current.signalingState !== "closed"
        ) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          console.log("📥 Buffering ICE candidate");
          iceBufferRef.current.push(candidate);
        }
      } catch (err) {
        console.error("❌ Failed to add ICE candidate:", err);
      }
    };

    const handleCallEnded = () => {
      console.log("📞 Call ended by user");
      endCall();
    };

    const handleCallRejected = () => {
      console.log("📞 Call was rejected");
      message.info("Cuộc gọi đã bị từ chối");
    };

    // Add event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("call-ended", handleCallEnded);
    socket.on("call-rejected", handleCallRejected);

    // Connect socket
    if (!socket.connected) {
      socket.connect();
    } else {
      handleConnect();
    }

    // Cleanup function
    return () => {
      console.log("🧹 Component unmounting, cleaning up...");

      // Remove event listeners
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("call-ended", handleCallEnded);
      socket.off("call-rejected", handleCallRejected);

      // End call and cleanup
      endCall();

      // Reset initialization flag
      isInitializedRef.current = false;

      // Don't disconnect socket here to allow reuse
      // socket.disconnect()
    };
  }, []); // Empty dependency array to run only once

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Card title="📡 Admin Video Chat" style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <Badge
            status={socketConnected ? "success" : "error"}
            text={`Socket: ${socketConnected ? "Connected" : "Disconnected"}`}
          />
          <Badge
            status={
              connectionState === "connected"
                ? "success"
                : connectionState === "connecting"
                ? "processing"
                : connectionState === "failed"
                ? "error"
                : "default"
            }
            text={`WebRTC: ${connectionState}`}
          />
          {mediaEnabled.video && <Badge status="success" text="Camera" />}
          {mediaEnabled.audio && <Badge status="success" text="Microphone" />}
        </div>

        {!inCall && !incomingCall && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <PhoneOutlined
              style={{
                fontSize: "48px",
                color: "#d9d9d9",
                marginBottom: "16px",
              }}
            />
            <p style={{ color: "#666" }}>Đang chờ cuộc gọi từ người dùng...</p>
            <p style={{ color: "#999", fontSize: "12px" }}>
              Admin ID: {adminId}
            </p>
            <p
              style={{
                color: socketConnected ? "#52c41a" : "#ff4d4f",
                fontSize: "12px",
              }}
            >
              Socket: {socketConnected ? "Đã kết nối" : "Chưa kết nối"}
            </p>
          </div>
        )}

        {inCall && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "16px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <h3 style={{ marginBottom: "8px", fontWeight: "500" }}>
                  Camera của bạn (Admin)
                </h3>
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{
                    width: "100%",
                    maxWidth: "400px",
                    height: "300px",
                    border: "1px solid #d9d9d9",
                    borderRadius: "8px",
                    backgroundColor: "black",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div style={{ textAlign: "center" }}>
                <h3 style={{ marginBottom: "8px", fontWeight: "500" }}>
                  Camera người dùng
                </h3>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: "100%",
                    maxWidth: "400px",
                    height: "300px",
                    border: "1px solid #d9d9d9",
                    borderRadius: "8px",
                    backgroundColor: "black",
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <Button
                type="primary"
                danger
                icon={<CloseOutlined />}
                onClick={endCall}
                size="large"
                style={{ backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" }}
              >
                Kết thúc cuộc gọi
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        open={!!incomingCall}
        onCancel={rejectCall}
        onOk={answerCall}
        okText="Trả lời"
        cancelText="Từ chối"
        title="📲 Có cuộc gọi đến"
        centered
        closable={false}
        maskClosable={false}
        okButtonProps={{
          icon: <PhoneOutlined />,
          size: "large",
          style: { backgroundColor: "#52c41a", borderColor: "#52c41a" },
          loading: isAnsweringRef.current,
          disabled: !socketConnected,
        }}
        cancelButtonProps={{ size: "large" }}
      >
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <VideoCameraOutlined
            style={{ fontSize: "48px", color: "#1890ff", marginBottom: "16px" }}
          />
          <p style={{ fontSize: "16px" }}>
            Người gọi: <strong>{incomingCall?.from}</strong>
          </p>
          <p style={{ color: "#666" }}>
            Bạn có muốn trả lời cuộc gọi video không?
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default VideoChatAdmin;

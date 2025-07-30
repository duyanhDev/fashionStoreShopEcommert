"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button, message, Card, Space, Badge } from "antd";
import {
  PhoneOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { io } from "socket.io-client";

const adminId = "673017dde4526bd79cc61fa6";

const VideoChatUser = ({ userId }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const isCallingRef = useRef(false);
  const socketRef = useRef(null);
  const isInitializedRef = useRef(false);
  const cleanupRef = useRef(false);
  const heartbeatRef = useRef(null);

  const [inCall, setInCall] = useState(false);
  const [calling, setCalling] = useState(false);
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

  // Heartbeat to maintain connection
  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);

    heartbeatRef.current = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("ping");
      }
    }, 30000); // Every 30 seconds
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  const cleanupPeerConnection = useCallback(() => {
    if (cleanupRef.current) return;

    console.log("🧹 Cleaning up peer connection...");

    if (peerRef.current) {
      peerRef.current.onicecandidate = null;
      peerRef.current.ontrack = null;
      peerRef.current.onconnectionstatechange = null;
      peerRef.current.oniceconnectionstatechange = null;

      if (peerRef.current.signalingState !== "closed") {
        peerRef.current.close();
      }
      peerRef.current = null;
    }

    isCallingRef.current = false;
  }, []);

  const createPeerConnection = useCallback(() => {
    console.log("🔗 Creating new peer connection...");
    cleanupPeerConnection();

    const peer = new RTCPeerConnection({ iceServers });

    peer.onicecandidate = (event) => {
      if (
        event.candidate &&
        peer.signalingState !== "closed" &&
        socketRef.current?.connected
      ) {
        console.log("🧊 Sending ICE candidate to admin");
        socketRef.current.emit("ice-candidate", {
          to: adminId,
          candidate: event.candidate,
        });
      }
    };

    peer.ontrack = (event) => {
      console.log(
        "📺 Received remote stream from admin - Tracks:",
        event.streams[0]?.getTracks().map((t) => t.kind)
      );
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current
          .play()
          .then(() => console.log("✅ Remote video playing"))
          .catch((playError) => {
            console.error("❌ Error playing remote video:", playError);
            remoteVideoRef.current.muted = true;
            remoteVideoRef.current
              .play()
              .catch((e) => console.error("❌ Still can't play:", e));
          });
      }
    };

    peer.onconnectionstatechange = () => {
      console.log("🔗 Connection state:", peer.connectionState);
      setConnectionState(peer.connectionState);

      if (peer.connectionState === "connected") {
        setCalling(false);
        setInCall(true);
        message.success("✅ Đã kết nối với admin");
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
  }, [cleanupPeerConnection]);

  const enableMedia = async (options = { video: false, audio: false }) => {
    try {
      const constraints = {};
      if (options.video)
        constraints.video = {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        };
      if (options.audio)
        constraints.audio = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        };

      console.log("🎥 Requesting media access:", constraints);
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);

      if (localStreamRef.current) {
        newStream.getTracks().forEach((newTrack) => {
          const existingTrack = localStreamRef.current
            .getTracks()
            .find((t) => t.kind === newTrack.kind);
          if (existingTrack) {
            existingTrack.stop();
            localStreamRef.current.removeTrack(existingTrack);
          }
          localStreamRef.current.addTrack(newTrack);
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
          try {
            await localVideoRef.current.play();
            console.log("✅ Local video playing");
          } catch (playError) {
            console.error("❌ Error playing local video:", playError);
          }
        }
      } else {
        localStreamRef.current = newStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = newStream;
          try {
            await localVideoRef.current.play();
            console.log("✅ Local video playing");
          } catch (playError) {
            console.error("❌ Error playing local video:", playError);
          }
        }
      }

      setMediaEnabled((prev) => ({
        video: prev.video || options.video,
        audio: prev.audio || options.audio,
      }));

      const mediaType = [];
      if (options.video) mediaType.push("camera");
      if (options.audio) mediaType.push("microphone");

      message.success(`🎥 Đã bật ${mediaType.join(" và ")}`);
      console.log(
        "✅ Media enabled - Tracks:",
        localStreamRef.current.getTracks().map((t) => t.kind)
      );
      return localStreamRef.current;
    } catch (err) {
      console.error("❌ Không thể bật media:", err);
      const mediaType = [];
      if (options.video) mediaType.push("camera");
      if (options.audio) mediaType.push("microphone");
      message.error(
        `Không thể truy cập ${mediaType.join(" và ")}: ${err.message}`
      );
      return null;
    }
  };

  const addTracksToConnection = (peer, stream) => {
    if (!peer || peer.signalingState === "closed") {
      console.error("❌ Cannot add tracks: peer connection is closed");
      return false;
    }

    try {
      const senders = peer.getSenders();
      senders.forEach((sender) => {
        if (sender.track) {
          console.log("🗑️ Removing existing sender:", sender.track.kind);
          peer.removeTrack(sender);
        }
      });

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

  const startCall = async () => {
    if (
      !localStreamRef.current ||
      (!mediaEnabled.video && !mediaEnabled.audio)
    ) {
      message.warning("⚠️ Bạn cần bật camera hoặc microphone trước khi gọi.");
      return;
    }

    if (isCallingRef.current || !socketRef.current?.connected) {
      console.log("⚠️ Already calling or socket not connected");
      return;
    }

    isCallingRef.current = true;

    try {
      console.log("📞 Starting call to admin...");
      setCalling(true);

      const peer = createPeerConnection();
      if (!peer) {
        throw new Error("Failed to create peer connection");
      }

      peerRef.current = peer;

      const tracksAdded = addTracksToConnection(peer, localStreamRef.current);
      if (!tracksAdded) {
        throw new Error("Failed to add tracks to connection");
      }

      console.log("📤 Creating offer...");
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socketRef.current.emit("call-user", {
        to: adminId,
        offer,
      });

      message.info("📞 Đang gọi đến admin...");
      console.log("✅ Call initiated successfully");
    } catch (err) {
      console.error("❌ Lỗi khi bắt đầu cuộc gọi:", err);
      message.error(`Không thể bắt đầu cuộc gọi: ${err.message}`);
      setCalling(false);
      cleanupPeerConnection();
    } finally {
      isCallingRef.current = false;
    }
  };

  const endCall = useCallback(() => {
    if (cleanupRef.current) return;

    console.log("📞 Ending call...");

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("🛑 Stopped track:", track.kind);
      });
      localStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    if ((inCall || calling) && socketRef.current?.connected) {
      socketRef.current.emit("end-call", { to: adminId });
    }

    cleanupPeerConnection();

    setInCall(false);
    setCalling(false);
    setMediaEnabled({ video: false, audio: false });
    setConnectionState("new");

    message.info("Cuộc gọi đã kết thúc");
  }, [inCall, calling, cleanupPeerConnection]);

  // Main useEffect - chỉ chạy một lần
  useEffect(() => {
    if (!userId || isInitializedRef.current) {
      console.log("⚠️ Already initialized or no userId, skipping...");
      return;
    }

    console.log("🔌 User connecting to socket with ID:", userId);
    isInitializedRef.current = true;
    cleanupRef.current = false;

    // Tạo socket connection mới
    const socket = io("https://fashionstoreshopecommertbe.onrender.com", {
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    socketRef.current = socket;

    const handleConnect = () => {
      console.log("✅ User Socket connected:", socket.id);
      setSocketConnected(true);
      socket.emit("register", { userId });
      startHeartbeat();
    };

    const handleDisconnect = (reason) => {
      console.log("❌ User Socket disconnected:", reason);
      setSocketConnected(false);
      stopHeartbeat();
    };

    const handleConnectError = (error) => {
      console.error("❌ Socket connection error:", error);
      setSocketConnected(false);
    };

    const handleRegistered = ({ userId: registeredUserId, socketId }) => {
      console.log("✅ Registration confirmed:", registeredUserId, socketId);
    };

    const handleUserOffline = ({ userId: offlineUserId }) => {
      if (offlineUserId === adminId) {
        message.warning("Admin đã offline");
      }
    };

    const handleUserBusy = ({ userId: busyUserId }) => {
      if (busyUserId === adminId) {
        message.warning("Admin đang bận");
        setCalling(false);
        cleanupPeerConnection();
      }
    };

    const handleCallAnswered = async ({ answer }) => {
      console.log("✅ Call answered by admin");
      if (peerRef.current && peerRef.current.signalingState !== "closed") {
        try {
          await peerRef.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
        } catch (err) {
          console.error("❌ Error setting remote description:", err);
        }
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      console.log("🧊 Received ICE candidate from admin");
      try {
        if (
          peerRef.current &&
          candidate &&
          peerRef.current.signalingState !== "closed"
        ) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error("❌ Failed to add ICE candidate:", err);
      }
    };

    const handleCallEnded = ({ reason }) => {
      console.log("📞 Call ended by admin, reason:", reason);
      if (reason === "disconnect") {
        message.info("Admin đã ngắt kết nối");
      } else if (reason === "timeout") {
        message.info("Cuộc gọi đã hết thời gian");
      }
      endCall();
    };

    const handleCallRejected = () => {
      console.log("📞 Call was rejected by admin");
      setCalling(false);
      cleanupPeerConnection();
      message.error("Admin đã từ chối cuộc gọi");
    };

    const handlePong = () => {
      // Heartbeat response
      console.log("💓 Heartbeat response received");
    };

    // Add event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("registered", handleRegistered);
    socket.on("user-offline", handleUserOffline);
    socket.on("user-busy", handleUserBusy);
    socket.on("call-answered", handleCallAnswered);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("call-ended", handleCallEnded);
    socket.on("call-rejected", handleCallRejected);
    socket.on("pong", handlePong);

    // Cleanup function
    return () => {
      if (cleanupRef.current) return;

      console.log("🧹 User component unmounting, cleaning up...");
      cleanupRef.current = true;

      // Stop heartbeat
      stopHeartbeat();

      // Remove event listeners
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("registered", handleRegistered);
      socket.off("user-offline", handleUserOffline);
      socket.off("user-busy", handleUserBusy);
      socket.off("call-answered", handleCallAnswered);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("call-ended", handleCallEnded);
      socket.off("call-rejected", handleCallRejected);
      socket.off("pong", handlePong);

      // End call and cleanup
      endCall();

      // Disconnect socket
      if (socket.connected) {
        socket.disconnect();
      }

      socketRef.current = null;
      setSocketConnected(false);
      isInitializedRef.current = false;
    };
  }, []); // Empty dependency array - chỉ chạy một lần

  // Separate useEffect để handle userId changes
  useEffect(() => {
    if (socketRef.current?.connected && userId) {
      console.log("🔄 Updating user registration with new userId:", userId);
      socketRef.current.emit("register", { userId });
    }
  }, [userId]);

  if (!userId) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Card title="⚠️ Lỗi">
          <p>Không tìm thấy User ID. Vui lòng đăng nhập lại.</p>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Card
        title={`📱 User Video Chat - ID: ${userId}`}
        style={{ marginBottom: "16px" }}
      >
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

        {!socketConnected && (
          <div
            style={{
              textAlign: "center",
              padding: "16px",
              backgroundColor: "#fff2f0",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            <p style={{ color: "#ff4d4f", margin: 0 }}>
              ⚠️ Mất kết nối với server. Đang thử kết nối lại...
            </p>
          </div>
        )}

        {!inCall && !calling && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div style={{ textAlign: "center" }}>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "500",
                  marginBottom: "16px",
                }}
              >
                Chuẩn bị cuộc gọi
              </h3>
              <Space size="large">
                <Button
                  icon={<VideoCameraOutlined />}
                  onClick={() => enableMedia({ video: true })}
                  type={mediaEnabled.video ? "primary" : "default"}
                  size="large"
                  style={
                    mediaEnabled.video
                      ? { backgroundColor: "#1890ff", borderColor: "#1890ff" }
                      : {}
                  }
                >
                  {mediaEnabled.video ? "Camera đã bật" : "Bật Camera"}
                </Button>
                <Button
                  icon={<AudioOutlined />}
                  onClick={() => enableMedia({ audio: true })}
                  type={mediaEnabled.audio ? "primary" : "default"}
                  size="large"
                  style={
                    mediaEnabled.audio
                      ? { backgroundColor: "#1890ff", borderColor: "#1890ff" }
                      : {}
                  }
                >
                  {mediaEnabled.audio ? "Mic đã bật" : "Bật Microphone"}
                </Button>
              </Space>
            </div>

            <div style={{ textAlign: "center" }}>
              <Button
                type="primary"
                size="large"
                icon={<PhoneOutlined />}
                onClick={startCall}
                disabled={
                  (!mediaEnabled.video && !mediaEnabled.audio) ||
                  !socketConnected
                }
                loading={isCallingRef.current}
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
              >
                Gọi Admin
              </Button>
            </div>
          </div>
        )}

        {calling && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div>
              <PhoneOutlined
                style={{
                  fontSize: "48px",
                  color: "#1890ff",
                  marginBottom: "16px",
                }}
              />
              <p style={{ fontSize: "18px" }}>Đang gọi admin...</p>
              <Button
                type="primary"
                danger
                onClick={endCall}
                style={{
                  marginTop: "16px",
                  backgroundColor: "#ff4d4f",
                  borderColor: "#ff4d4f",
                }}
              >
                Hủy cuộc gọi
              </Button>
            </div>
          </div>
        )}

        {(inCall || calling || mediaEnabled.video || mediaEnabled.audio) && (
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
                  Camera của bạn
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
                  Camera Admin
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

            {inCall && (
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
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default VideoChatUser;

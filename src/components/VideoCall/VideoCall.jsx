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

const socket = io("https://fashionstoreshopecommertbe.onrender.com");
const adminId = "673017dde4526bd79cc61fa6";

const VideoChatUser = ({ userId }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const isCallingRef = useRef(false); // Prevent multiple call attempts

  const [inCall, setInCall] = useState(false);
  const [calling, setCalling] = useState(false);
  const [connectionState, setConnectionState] = useState("new");
  const [mediaEnabled, setMediaEnabled] = useState({
    video: false,
    audio: false,
  });

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

    isCallingRef.current = false;
  }, []);

  const createPeerConnection = useCallback(() => {
    console.log("🔗 Creating new peer connection...");

    // Cleanup existing connection first
    cleanupPeerConnection();

    const peer = new RTCPeerConnection({ iceServers });

    peer.onicecandidate = (event) => {
      if (event.candidate && peer.signalingState !== "closed") {
        console.log("🧊 Sending ICE candidate to admin");
        socket.emit("ice-candidate", {
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

        // Force play remote video
        remoteVideoRef.current
          .play()
          .then(() => {
            console.log("✅ Remote video playing");
          })
          .catch((playError) => {
            console.error("❌ Error playing remote video:", playError);
            // Try to play with muted
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

      // Handle existing stream
      if (localStreamRef.current) {
        // Stop old tracks of the same type
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

        // Update video element
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
        // Create new stream
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

  const startCall = async () => {
    if (
      !localStreamRef.current ||
      (!mediaEnabled.video && !mediaEnabled.audio)
    ) {
      message.warning("⚠️ Bạn cần bật camera hoặc microphone trước khi gọi.");
      return;
    }

    if (isCallingRef.current) {
      console.log("⚠️ Already calling");
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

      // Add tracks to connection
      const tracksAdded = addTracksToConnection(peer, localStreamRef.current);
      if (!tracksAdded) {
        throw new Error("Failed to add tracks to connection");
      }

      // Create offer
      console.log("📤 Creating offer...");
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      // Send call request
      socket.emit("call-user", {
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

    // Emit end call if we were in a call
    if (inCall || calling) {
      socket.emit("end-call", { to: adminId });
    }

    // Cleanup peer connection
    cleanupPeerConnection();

    // Reset states
    setInCall(false);
    setCalling(false);
    setMediaEnabled({ video: false, audio: false });
    setConnectionState("new");

    message.info("Cuộc gọi đã kết thúc");
  }, [inCall, calling, cleanupPeerConnection]);

  useEffect(() => {
    if (!userId) return;

    console.log("🔌 User connecting to socket with ID:", userId);
    socket.emit("register", { userId });

    socket.on("call-answered", async ({ answer }) => {
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
    });

    socket.on("ice-candidate", async ({ candidate }) => {
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
    });

    socket.on("call-ended", () => {
      console.log("📞 Call ended by admin");
      endCall();
    });

    socket.on("call-rejected", () => {
      console.log("📞 Call was rejected by admin");
      setCalling(false);
      cleanupPeerConnection();
      message.error("Admin đã từ chối cuộc gọi");
    });

    return () => {
      console.log("🧹 Component unmounting, cleaning up...");
      socket.off("call-answered");
      socket.off("ice-candidate");
      socket.off("call-ended");
      socket.off("call-rejected");
      endCall();
    };
  }, [userId, endCall]);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.style.width = "100%";
      localVideoRef.current.style.maxWidth = "400px";
      localVideoRef.current.style.height = "300px";
      localVideoRef.current.style.border = "1px solid #d9d9d9";
      localVideoRef.current.style.borderRadius = "8px";
      localVideoRef.current.style.backgroundColor = "black";
      localVideoRef.current.style.objectFit = "cover";
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.style.width = "100%";
      remoteVideoRef.current.style.maxWidth = "400px";
      remoteVideoRef.current.style.height = "300px";
      remoteVideoRef.current.style.border = "1px solid #d9d9d9";
      remoteVideoRef.current.style.borderRadius = "8px";
      remoteVideoRef.current.style.backgroundColor = "black";
      remoteVideoRef.current.style.objectFit = "cover";
    }
  }, []);

  // Nếu không có userId, hiển thị thông báo
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
            status={
              connectionState === "connected"
                ? "success"
                : connectionState === "connecting"
                ? "processing"
                : connectionState === "failed"
                ? "error"
                : "default"
            }
            text={`Trạng thái: ${connectionState}`}
          />
          {mediaEnabled.video && <Badge status="success" text="Camera" />}
          {mediaEnabled.audio && <Badge status="success" text="Microphone" />}
        </div>

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
                disabled={!mediaEnabled.video && !mediaEnabled.audio}
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

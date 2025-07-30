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
  ];

  const createPeerConnection = useCallback(() => {
    const peer = new RTCPeerConnection({ iceServers });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("🧊 Sending ICE candidate to admin");
        socket.emit("ice-candidate", {
          to: adminId,
          candidate: event.candidate,
        });
      }
    };

    peer.ontrack = (event) => {
      console.log("📺 Received remote stream from admin");
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peer.onconnectionstatechange = () => {
      console.log("🔗 Connection state:", peer.connectionState);
      setConnectionState(peer.connectionState);

      if (peer.connectionState === "connected") {
        setCalling(false);
        setInCall(true);
        message.success("✅ Đã kết nối với admin");
      } else if (peer.connectionState === "failed") {
        message.error("Kết nối thất bại");
        endCall();
      }
    };

    peer.oniceconnectionstatechange = () => {
      console.log("🧊 ICE connection state:", peer.iceConnectionState);
    };

    return peer;
  }, []);

  const enableMedia = async (options = { video: false, audio: false }) => {
    try {
      const constraints = {};
      if (options.video) constraints.video = true;
      if (options.audio) constraints.audio = true;

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Merge with existing stream or create new one
      if (localStreamRef.current) {
        stream.getTracks().forEach((track) => {
          localStreamRef.current?.addTrack(track);
        });
      } else {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
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
      return stream;
    } catch (err) {
      console.error("❌ Không thể bật media:", err);
      const mediaType = [];
      if (options.video) mediaType.push("camera");
      if (options.audio) mediaType.push("microphone");
      message.error(`Không thể truy cập ${mediaType.join(" và ")}`);
      return null;
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

    try {
      console.log("📞 Starting call to admin...");
      setCalling(true);

      const peer = createPeerConnection();
      peerRef.current = peer;

      // Add local stream tracks
      localStreamRef.current.getTracks().forEach((track) => {
        peer.addTrack(track, localStreamRef.current);
      });

      // Create offer
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      // Send call request
      socket.emit("call-user", {
        to: adminId,
        offer,
      });

      message.info("📞 Đang gọi đến admin...");
    } catch (err) {
      console.error("❌ Lỗi khi bắt đầu cuộc gọi:", err);
      message.error("Không thể bắt đầu cuộc gọi.");
      setCalling(false);
    }
  };

  const endCall = () => {
    console.log("📞 Ending call...");

    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    socket.emit("end-call", { to: adminId });

    setInCall(false);
    setCalling(false);
    setMediaEnabled({ video: false, audio: false });
    setConnectionState("new");
    message.info("Cuộc gọi đã kết thúc");
  };

  useEffect(() => {
    console.log("🔌 User connecting to socket...");
    socket.emit("register", { userId });

    socket.on("call-answered", async ({ answer }) => {
      console.log("✅ Call answered by admin");
      if (peerRef.current) {
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
        if (peerRef.current && candidate) {
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

    return () => {
      socket.off("call-answered");
      socket.off("ice-candidate");
      socket.off("call-ended");
      endCall();
    };
  }, [userId]);

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Card title="📱 User Video Chat" style={{ marginBottom: "16px" }}>
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
                >
                  {mediaEnabled.video ? "Camera đã bật" : "Bật Camera"}
                </Button>
                <Button
                  icon={<AudioOutlined />}
                  onClick={() => enableMedia({ audio: true })}
                  type={mediaEnabled.audio ? "primary" : "default"}
                  size="large"
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
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
              >
                Gọi Admin
              </Button>
            </div>
          </div>
        )}

        {calling && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ animation: "pulse 2s infinite" }}>
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
                style={{ marginTop: "16px" }}
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
                    border: "1px solid #d9d9d9",
                    borderRadius: "8px",
                    backgroundColor: "black",
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
                    border: "1px solid #d9d9d9",
                    borderRadius: "8px",
                    backgroundColor: "black",
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

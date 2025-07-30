import { useEffect, useRef, useState, useCallback } from "react";
import { Modal, Button, message, Card, Badge } from "antd";
import {
  PhoneOutlined,
  VideoCameraOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { io } from "socket.io-client";

const socket = io("https://fashionstoreshopecommertbe.onrender.com");
const adminId = "673017dde4526bd79cc61fa6";

const VideoChatAdmin = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const iceBufferRef = useRef([]);

  const [incomingCall, setIncomingCall] = useState(null);
  const [inCall, setInCall] = useState(false);
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
      if (event.candidate && incomingCall) {
        console.log("🧊 Sending ICE candidate to:", incomingCall.from);
        socket.emit("ice-candidate", {
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

      if (peer.connectionState === "failed") {
        message.error("Kết nối thất bại");
        endCall();
      }
    };

    return peer;
  }, [incomingCall]);

  const enableMedia = async () => {
    try {
      // Dừng stream cũ nếu có
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      setMediaEnabled({ video: true, audio: true });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      message.success("🎥 Đã bật camera và microphone");
      return stream;
    } catch (err) {
      console.error("❌ Không thể bật media:", err);
      message.error("Không thể truy cập camera/microphone");
      return null;
    }
  };

  const addTracksToConnection = (peer, stream) => {
    // Xóa tất cả senders cũ trước
    const senders = peer.getSenders();
    senders.forEach((sender) => {
      if (sender.track) {
        peer.removeTrack(sender);
      }
    });

    // Thêm tracks mới
    stream.getTracks().forEach((track) => {
      console.log("➕ Adding track:", track.kind);
      peer.addTrack(track, stream);
    });
  };

  const answerCall = async () => {
    if (!incomingCall) return;

    try {
      console.log("📞 Answering call from:", incomingCall.from);

      // Tạo peer connection mới
      const peer = createPeerConnection();
      peerRef.current = peer;

      // Bật media trước khi answer
      const stream = await enableMedia();
      if (!stream) {
        message.error("Không thể bật camera/mic để trả lời cuộc gọi");
        return;
      }

      // Thêm local stream tracks một cách an toàn
      addTracksToConnection(peer, stream);

      // Set remote description
      await peer.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer)
      );

      // Process buffered ICE candidates
      for (const candidate of iceBufferRef.current) {
        try {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("❌ Error adding buffered ICE candidate:", err);
        }
      }
      iceBufferRef.current = [];

      // Create and send answer
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("answer-call", {
        to: incomingCall.from,
        answer,
      });

      setInCall(true);
      setIncomingCall(null);
      message.success("✅ Đã kết nối với người dùng");
    } catch (err) {
      console.error("❌ Lỗi khi trả lời cuộc gọi:", err);
      message.error("Lỗi khi thiết lập cuộc gọi");
    }
  };

  const endCall = () => {
    console.log("📞 Ending call...");

    // Đóng peer connection
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    // Dừng tất cả media tracks
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

    // Reset states
    setInCall(false);
    setMediaEnabled({ video: false, audio: false });
    setConnectionState("new");
    iceBufferRef.current = [];

    message.info("Cuộc gọi đã kết thúc");
  };

  const rejectCall = () => {
    console.log("📞 Rejecting call from:", incomingCall?.from);
    if (incomingCall) {
      socket.emit("reject-call", { to: incomingCall.from });
    }
    setIncomingCall(null);
    message.info("Đã từ chối cuộc gọi");
  };

  useEffect(() => {
    console.log("🔌 Admin connecting to socket...");
    socket.emit("register", { userId: adminId });

    socket.on("incoming-call", ({ from, offer }) => {
      console.log("📞 Incoming call from:", from);
      // Nếu đang trong cuộc gọi khác, từ chối
      if (inCall) {
        socket.emit("reject-call", { to: from });
        return;
      }
      setIncomingCall({ from, offer });
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      console.log("🧊 Received ICE candidate");
      try {
        if (peerRef.current && peerRef.current.remoteDescription) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          console.log("📥 Buffering ICE candidate");
          iceBufferRef.current.push(candidate);
        }
      } catch (err) {
        console.error("❌ Failed to add ICE candidate:", err);
      }
    });

    socket.on("call-ended", () => {
      console.log("📞 Call ended by user");
      endCall();
    });

    socket.on("call-rejected", () => {
      console.log("📞 Call was rejected");
      message.info("Cuộc gọi đã bị từ chối");
    });

    return () => {
      socket.off("incoming-call");
      socket.off("ice-candidate");
      socket.off("call-ended");
      socket.off("call-rejected");
      endCall();
    };
  }, [inCall, createPeerConnection]);

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
        okButtonProps={{
          icon: <PhoneOutlined />,
          size: "large",
          style: { backgroundColor: "#52c41a", borderColor: "#52c41a" },
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

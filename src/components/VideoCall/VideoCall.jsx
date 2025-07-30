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

  const cleanupPeerConnection = useCallback(() => {
    if (cleanupRef.current) return;

    console.log("🧹 User: Cleaning up peer connection...");

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
    console.log("🔗 User: Creating new peer connection...");
    cleanupPeerConnection();

    const peer = new RTCPeerConnection({ iceServers });

    peer.onicecandidate = (event) => {
      if (
        event.candidate &&
        peer.signalingState !== "closed" &&
        socketRef.current?.connected
      ) {
        console.log("🧊 User: Sending ICE candidate to admin");
        socketRef.current.emit("ice-candidate", {
          to: adminId,
          candidate: event.candidate,
        });
      }
    };

    peer.ontrack = (event) => {
      console.log(
        "📺 User: Received remote stream from admin - Tracks:",
        event.streams[0]?.getTracks().map((t) => `${t.kind}:${t.enabled}`)
      );
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];

        // Đảm bảo video không bị mute để nghe được tiếng
        remoteVideoRef.current.muted = false;
        remoteVideoRef.current.volume = 1.0;

        remoteVideoRef.current
          .play()
          .then(() => {
            console.log("✅ User: Remote video playing successfully");
            // Check audio tracks
            const audioTracks = event.streams[0].getAudioTracks();
            audioTracks.forEach((track) => {
              console.log(
                `🔊 User: Audio track: ${track.kind}, enabled: ${track.enabled}, muted: ${track.muted}`
              );
            });
          })
          .catch((playError) => {
            console.error("❌ User: Error playing remote video:", playError);
            // Try to play with muted first, then unmute
            remoteVideoRef.current.muted = true;
            remoteVideoRef.current
              .play()
              .then(() => {
                console.log("✅ User: Remote video playing (muted)");
                // Try to unmute after a delay
                setTimeout(() => {
                  remoteVideoRef.current.muted = false;
                  console.log("🔊 User: Unmuted remote video");
                }, 1000);
              })
              .catch((e) => console.error("❌ User: Still can't play:", e));
          });
      }
    };

    peer.onconnectionstatechange = () => {
      console.log("🔗 User: Connection state:", peer.connectionState);
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
      console.log("🧊 User: ICE connection state:", peer.iceConnectionState);
      if (peer.iceConnectionState === "failed") {
        console.log("🔄 User: ICE connection failed, attempting restart...");
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

      console.log("🎥 User: Requesting media access:", constraints);
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
          localVideoRef.current.muted = true; // Local video should be muted
          try {
            await localVideoRef.current.play();
            console.log("✅ User: Local video playing");
          } catch (playError) {
            console.error("❌ User: Error playing local video:", playError);
          }
        }
      } else {
        localStreamRef.current = newStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = newStream;
          localVideoRef.current.muted = true; // Local video should be muted
          try {
            await localVideoRef.current.play();
            console.log("✅ User: Local video playing");
          } catch (playError) {
            console.error("❌ User: Error playing local video:", playError);
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
        "✅ User: Media enabled - Tracks:",
        localStreamRef.current.getTracks().map((t) => `${t.kind}:${t.enabled}`)
      );
      return localStreamRef.current;
    } catch (err) {
      console.error("❌ User: Không thể bật media:", err);
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
      console.error("❌ User: Cannot add tracks: peer connection is closed");
      return false;
    }

    try {
      const senders = peer.getSenders();
      senders.forEach((sender) => {
        if (sender.track) {
          console.log("🗑️ User: Removing existing sender:", sender.track.kind);
          peer.removeTrack(sender);
        }
      });

      stream.getTracks().forEach((track) => {
        console.log(
          "➕ User: Adding track:",
          track.kind,
          "enabled:",
          track.enabled
        );
        peer.addTrack(track, stream);
      });

      return true;
    } catch (err) {
      console.error("❌ User: Error adding tracks:", err);
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
      console.log("⚠️ User: Already calling or socket not connected");
      return;
    }

    isCallingRef.current = true;

    try {
      console.log("📞 User: Starting call to admin...");
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

      console.log("📤 User: Creating offer...");
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socketRef.current.emit("call-user", {
        to: adminId,
        offer,
      });

      message.info("📞 Đang gọi đến admin...");
      console.log("✅ User: Call initiated successfully");
    } catch (err) {
      console.error("❌ User: Lỗi khi bắt đầu cuộc gọi:", err);
      message.error(`Không thể bắt đầu cuộc gọi: ${err.message}`);
      setCalling(false);
      cleanupPeerConnection();
    } finally {
      isCallingRef.current = false;
    }
  };

  const endCall = useCallback(() => {
    if (cleanupRef.current) return;

    console.log("📞 User: Ending call...");

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("🛑 User: Stopped track:", track.kind);
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

  // Main useEffect
  useEffect(() => {
    if (!userId || isInitializedRef.current) {
      console.log("⚠️ User: Already initialized or no userId, skipping...");
      return;
    }

    console.log("🔌 User: Connecting to socket with ID:", userId);
    isInitializedRef.current = true;
    cleanupRef.current = false;

    const socket = io("https://fashionstoreshopecommertbe.onrender.com", {
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    socketRef.current = socket;

    const handleConnect = () => {
      console.log("✅ User: Socket connected:", socket.id);
      setSocketConnected(true);
      socket.emit("register", { userId });
    };

    const handleDisconnect = (reason) => {
      console.log("❌ User: Socket disconnected:", reason);
      setSocketConnected(false);
    };

    const handleConnectError = (error) => {
      console.error("❌ User: Socket connection error:", error);
      setSocketConnected(false);
    };

    const handleCallAnswered = async ({ answer }) => {
      console.log("✅ User: Call answered by admin");
      if (peerRef.current && peerRef.current.signalingState !== "closed") {
        try {
          await peerRef.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
          console.log("✅ User: Set remote description successfully");
        } catch (err) {
          console.error("❌ User: Error setting remote description:", err);
        }
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      console.log("🧊 User: Received ICE candidate from admin");
      try {
        if (
          peerRef.current &&
          candidate &&
          peerRef.current.signalingState !== "closed"
        ) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("✅ User: Added ICE candidate");
        }
      } catch (err) {
        console.error("❌ User: Failed to add ICE candidate:", err);
      }
    };

    const handleCallEnded = () => {
      console.log("📞 User: Call ended by admin");
      endCall();
    };

    const handleCallRejected = () => {
      console.log("📞 User: Call was rejected by admin");
      setCalling(false);
      cleanupPeerConnection();
      message.error("Admin đã từ chối cuộc gọi");
    };

    // Add event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("call-answered", handleCallAnswered);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("call-ended", handleCallEnded);
    socket.on("call-rejected", handleCallRejected);

    // Cleanup function
    return () => {
      if (cleanupRef.current) return;

      console.log("🧹 User: Component unmounting, cleaning up...");
      cleanupRef.current = true;

      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("call-answered", handleCallAnswered);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("call-ended", handleCallEnded);
      socket.off("call-rejected", handleCallRejected);

      endCall();

      if (socket.connected) {
        socket.disconnect();
      }

      socketRef.current = null;
      setSocketConnected(false);
      isInitializedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (socketRef.current?.connected && userId) {
      console.log(
        "🔄 User: Updating user registration with new userId:",
        userId
      );
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
                  muted={true} // Local video should always be muted
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
                  muted={false} // Remote video should NOT be muted to hear audio
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
                  onLoadedMetadata={() => {
                    console.log("🎬 User: Remote video metadata loaded");
                    if (remoteVideoRef.current) {
                      remoteVideoRef.current.volume = 1.0;
                      console.log("🔊 User: Set remote video volume to 1.0");
                    }
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

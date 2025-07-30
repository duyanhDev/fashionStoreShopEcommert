"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Modal, Button, message, Card, Space, Badge } from "antd";
import {
  PhoneOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { io } from "socket.io-client";

const adminId = "673017dde4526bd79cc61fa6";

const VideoChatAdmin = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const isAnsweringRef = useRef(false);
  const socketRef = useRef(null);
  const isInitializedRef = useRef(false);
  const cleanupRef = useRef(false);

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
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ];

  const cleanupPeerConnection = useCallback(() => {
    if (cleanupRef.current) return;

    console.log("🧹 Admin: Cleaning up peer connection...");

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

    isAnsweringRef.current = false;
  }, []);

  // Define endCall first to avoid hoisting issues
  const endCall = useCallback(() => {
    if (cleanupRef.current) return;

    console.log("📞 Admin: Ending call...");

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("🛑 Admin: Stopped track:", track.kind);
      });
      localStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    if (
      (inCall || incomingCall) &&
      socketRef.current?.connected &&
      incomingCall
    ) {
      socketRef.current.emit("end-call", { to: incomingCall.from });
    }

    cleanupPeerConnection();

    setInCall(false);
    setIncomingCall(null);
    setMediaEnabled({ video: false, audio: false });
    setConnectionState("new");

    message.info("Cuộc gọi đã kết thúc");
  }, [inCall, incomingCall, cleanupPeerConnection]);

  const enableMedia = useCallback(
    async (options = { video: false, audio: false }) => {
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
            sampleRate: 44100,
          };

        console.log("🎥 Admin: Requesting media access:", constraints);
        const newStream = await navigator.mediaDevices.getUserMedia(
          constraints
        );

        if (localStreamRef.current) {
          // Replace existing tracks
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
            localVideoRef.current.muted = true;
            try {
              await localVideoRef.current.play();
              console.log("✅ Admin: Local video playing");
            } catch (playError) {
              console.error("❌ Admin: Error playing local video:", playError);
            }
          }
        } else {
          localStreamRef.current = newStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = newStream;
            localVideoRef.current.muted = true;
            try {
              await localVideoRef.current.play();
              console.log("✅ Admin: Local video playing");
            } catch (playError) {
              console.error("❌ Admin: Error playing local video:", playError);
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
          "✅ Admin: Media enabled - Tracks:",
          localStreamRef.current
            .getTracks()
            .map((t) => `${t.kind}:${t.enabled}:${t.readyState}`)
        );
        return localStreamRef.current;
      } catch (err) {
        console.error("❌ Admin: Không thể bật media:", err);
        const mediaType = [];
        if (options.video) mediaType.push("camera");
        if (options.audio) mediaType.push("microphone");
        message.error(
          `Không thể truy cập ${mediaType.join(" và ")}: ${err.message}`
        );
        return null;
      }
    },
    []
  );

  // Sửa lại logic createPeerConnection để phù hợp với vai trò Admin (callee)
  const createPeerConnection = useCallback(() => {
    console.log("🔗 Admin: Creating new peer connection...");
    cleanupPeerConnection();

    const peer = new RTCPeerConnection({
      iceServers,
      iceCandidatePoolSize: 10,
      iceTransportPolicy: "all",
    });

    peer.onicecandidate = (event) => {
      if (
        event.candidate &&
        peer.signalingState !== "closed" &&
        socketRef.current?.connected &&
        incomingCall
      ) {
        console.log("🧊 Admin: Sending ICE candidate to user");
        socketRef.current.emit("ice-candidate", {
          to: incomingCall.from,
          candidate: event.candidate,
        });
      }
    };

    peer.ontrack = (event) => {
      console.log("📺 Admin: Received remote stream from user");
      console.log("📺 Admin: Stream details:", {
        streamId: event.streams[0]?.id,
        tracks: event.streams[0]?.getTracks().map((t) => ({
          kind: t.kind,
          enabled: t.enabled,
          readyState: t.readyState,
          muted: t.muted,
        })),
      });

      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.muted = false;
        remoteVideoRef.current.volume = 1.0;

        remoteVideoRef.current
          .play()
          .then(() => {
            console.log("✅ Admin: Remote video playing successfully");
            const audioTracks = event.streams[0].getAudioTracks();
            audioTracks.forEach((track) => {
              console.log(
                `🔊 Admin: Audio track: ${track.kind}, enabled: ${track.enabled}, muted: ${track.muted}`
              );
            });
          })
          .catch((playError) => {
            console.error("❌ Admin: Error playing remote video:", playError);
            remoteVideoRef.current.muted = true;
            remoteVideoRef.current
              .play()
              .then(() => {
                console.log("✅ Admin: Remote video playing (muted)");
                setTimeout(() => {
                  if (remoteVideoRef.current) {
                    remoteVideoRef.current.muted = false;
                    console.log("🔊 Admin: Unmuted remote video");
                  }
                }, 1000);
              })
              .catch((e) => console.error("❌ Admin: Still can't play:", e));
          });
      }
    };

    peer.onconnectionstatechange = () => {
      console.log("🔗 Admin: Connection state:", peer.connectionState);
      setConnectionState(peer.connectionState);

      if (peer.connectionState === "connected") {
        setInCall(true);
        message.success("✅ Đã kết nối với user");
      } else if (peer.connectionState === "failed") {
        message.error("❌ Kết nối thất bại");
        setTimeout(() => endCall(), 2000);
      } else if (peer.connectionState === "disconnected") {
        console.log(
          "⚠️ Admin: Connection disconnected, attempting reconnection..."
        );
        message.warning("Mất kết nối, đang thử kết nối lại...");
        setTimeout(() => {
          if (peer.connectionState === "disconnected") {
            peer.restartIce();
          }
        }, 1000);
      }
    };

    peer.oniceconnectionstatechange = () => {
      console.log("🧊 Admin: ICE connection state:", peer.iceConnectionState);

      if (peer.iceConnectionState === "failed") {
        console.log("🔄 Admin: ICE connection failed, attempting restart...");
        peer.restartIce();
      } else if (peer.iceConnectionState === "disconnected") {
        console.log("⚠️ Admin: ICE disconnected, will attempt restart...");
        setTimeout(() => {
          if (peer.iceConnectionState === "disconnected") {
            console.log("🔄 Admin: ICE still disconnected, restarting...");
            peer.restartIce();
          }
        }, 2000);
      }
    };

    return peer;
  }, [cleanupPeerConnection, endCall, incomingCall]);

  const addTracksToConnection = useCallback((peer, stream) => {
    if (!peer || peer.signalingState === "closed") {
      console.error("❌ Admin: Cannot add tracks: peer connection is closed");
      return false;
    }

    try {
      // Remove existing senders
      const senders = peer.getSenders();
      senders.forEach((sender) => {
        if (sender.track) {
          console.log("🗑️ Admin: Removing existing sender:", sender.track.kind);
          peer.removeTrack(sender);
        }
      });

      // Add all tracks from stream
      stream.getTracks().forEach((track) => {
        console.log(
          "➕ Admin: Adding track:",
          track.kind,
          "enabled:",
          track.enabled,
          "readyState:",
          track.readyState
        );
        peer.addTrack(track, stream);
      });

      console.log("✅ Admin: All tracks added successfully");
      return true;
    } catch (err) {
      console.error("❌ Admin: Error adding tracks:", err);
      return false;
    }
  }, []);

  // Sửa lại answerCall để đúng logic của callee
  const answerCall = useCallback(async () => {
    if (
      !incomingCall ||
      isAnsweringRef.current ||
      !socketRef.current?.connected
    ) {
      console.log("⚠️ Admin: Cannot answer call - conditions not met");
      return;
    }

    if (
      !localStreamRef.current ||
      (!mediaEnabled.video && !mediaEnabled.audio)
    ) {
      message.warning(
        "⚠️ Bạn cần bật camera hoặc microphone trước khi trả lời cuộc gọi."
      );
      return;
    }

    isAnsweringRef.current = true;

    try {
      console.log("📞 Admin: Answering call from:", incomingCall.from);

      const peer = createPeerConnection();
      if (!peer) {
        throw new Error("Failed to create peer connection");
      }

      peerRef.current = peer;

      // QUAN TRỌNG: Set remote description TRƯỚC (offer từ user)
      console.log("📝 Admin: Setting remote description (offer from user)...");
      await peer.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer)
      );

      // Add local tracks AFTER setting remote description
      const tracksAdded = addTracksToConnection(peer, localStreamRef.current);
      if (!tracksAdded) {
        throw new Error("Failed to add tracks to connection");
      }

      // Create answer (không phải offer)
      console.log("📤 Admin: Creating answer...");
      const answer = await peer.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await peer.setLocalDescription(answer);

      // Wait for ICE gathering
      console.log("⏳ Admin: Waiting for ICE gathering...");
      await new Promise((resolve) => {
        if (peer.iceGatheringState === "complete") {
          resolve();
        } else {
          const checkState = () => {
            if (peer.iceGatheringState === "complete") {
              peer.removeEventListener("icegatheringstatechange", checkState);
              resolve();
            }
          };
          peer.addEventListener("icegatheringstatechange", checkState);
          setTimeout(resolve, 5000);
        }
      });

      // Send answer back to user
      console.log("📤 Admin: Sending answer to user...");
      socketRef.current.emit("answer-call", {
        to: incomingCall.from,
        answer: peer.localDescription,
      });

      setIncomingCall(null);
      console.log("✅ Admin: Call answered successfully");
      message.success("✅ Đã trả lời cuộc gọi");
    } catch (err) {
      console.error("❌ Admin: Lỗi khi trả lời cuộc gọi:", err);
      message.error(`Lỗi khi thiết lập cuộc gọi: ${err.message}`);
      cleanupPeerConnection();
      setIncomingCall(null);
    } finally {
      isAnsweringRef.current = false;
    }
  }, [
    incomingCall,
    mediaEnabled.video,
    mediaEnabled.audio,
    createPeerConnection,
    addTracksToConnection,
    cleanupPeerConnection,
  ]);

  const rejectCall = useCallback(() => {
    console.log("📞 Admin: Rejecting call from:", incomingCall?.from);
    if (incomingCall && socketRef.current?.connected) {
      socketRef.current.emit("reject-call", { to: incomingCall.from });
    }
    setIncomingCall(null);
    message.info("Đã từ chối cuộc gọi");
  }, [incomingCall]);

  // Main useEffect
  useEffect(() => {
    if (isInitializedRef.current) {
      console.log("⚠️ Admin: Already initialized, skipping...");
      return;
    }

    console.log("🔌 Admin: Connecting to socket...");
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
      console.log("✅ Admin: Socket connected:", socket.id);
      setSocketConnected(true);
      socket.emit("register", { userId: adminId });
    };

    const handleDisconnect = (reason) => {
      console.log("❌ Admin: Socket disconnected:", reason);
      setSocketConnected(false);
    };

    const handleConnectError = (error) => {
      console.error("❌ Admin: Socket connection error:", error);
      setSocketConnected(false);
    };

    // Sửa lại handleIncomingCall trong useEffect
    const handleIncomingCall = ({ from, offer }) => {
      console.log("📞 Admin: Incoming call from:", from);
      console.log("📞 Admin: Offer details:", {
        type: offer.type,
        sdpLength: offer.sdp?.length,
      });

      if (!socket.connected) {
        console.log("⚠️ Admin: Socket not connected, cannot receive call");
        return;
      }

      if (inCall || isAnsweringRef.current) {
        console.log("⚠️ Admin: Already in call, rejecting new call");
        socket.emit("reject-call", { to: from });
        return;
      }

      if (incomingCall) {
        console.log("⚠️ Admin: Replacing existing incoming call");
        socket.emit("reject-call", { to: incomingCall.from });
      }

      setIncomingCall({ from, offer });
    };

    const handleIceCandidate = async ({ candidate }) => {
      console.log("🧊 Admin: Received ICE candidate from user");
      try {
        if (
          peerRef.current &&
          candidate &&
          peerRef.current.signalingState !== "closed"
        ) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("✅ Admin: Added ICE candidate");
        }
      } catch (err) {
        console.error("❌ Admin: Failed to add ICE candidate:", err);
      }
    };

    const handleCallEnded = () => {
      console.log("📞 Admin: Call ended by user");
      endCall();
    };

    const handleCallRejected = () => {
      console.log("📞 Admin: Call was rejected");
      message.info("Cuộc gọi đã bị từ chối");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("call-ended", handleCallEnded);
    socket.on("call-rejected", handleCallRejected);

    return () => {
      if (cleanupRef.current) return;

      console.log("🧹 Admin: Component unmounting, cleaning up...");
      cleanupRef.current = true;

      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("incoming-call", handleIncomingCall);
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
  }, [endCall, inCall, incomingCall, cleanupPeerConnection]);

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Card
        title={`📡 Admin Video Chat - ID: ${adminId}`}
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

        {!inCall && !incomingCall && (
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
                Chuẩn bị nhận cuộc gọi
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

            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <PhoneOutlined
                style={{
                  fontSize: "48px",
                  color: "#d9d9d9",
                  marginBottom: "16px",
                }}
              />
              <p style={{ color: "#666" }}>
                Đang chờ cuộc gọi từ người dùng...
              </p>
              <p
                style={{
                  color: socketConnected ? "#52c41a" : "#ff4d4f",
                  fontSize: "12px",
                }}
              >
                Socket: {socketConnected ? "Đã kết nối" : "Chưa kết nối"}
              </p>
              {(mediaEnabled.video || mediaEnabled.audio) && (
                <p
                  style={{
                    color: "#52c41a",
                    fontSize: "14px",
                    marginTop: "8px",
                  }}
                >
                  ✅ Đã sẵn sàng nhận cuộc gọi
                </p>
              )}
            </div>
          </div>
        )}

        {(inCall || mediaEnabled.video || mediaEnabled.audio) && (
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
                  muted={true}
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
                  muted={false}
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
                    console.log("🎬 Admin: Remote video metadata loaded");
                    if (remoteVideoRef.current) {
                      remoteVideoRef.current.volume = 1.0;
                      console.log("🔊 Admin: Set remote video volume to 1.0");
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
          disabled:
            !socketConnected || (!mediaEnabled.video && !mediaEnabled.audio),
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
          {!mediaEnabled.video && !mediaEnabled.audio && (
            <p style={{ color: "#ff4d4f", fontSize: "12px", marginTop: "8px" }}>
              ⚠️ Bạn cần bật camera hoặc microphone trước khi trả lời
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default VideoChatAdmin;

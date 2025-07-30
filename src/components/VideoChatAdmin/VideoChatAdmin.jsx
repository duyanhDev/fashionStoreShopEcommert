"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Modal, Button, message, Card, Badge } from "antd";
import {
  PhoneOutlined,
  VideoCameraOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { io } from "socket.io-client";

const adminId = "673017dde4526bd79cc61fa6";

const VideoChatAdmin = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const iceBufferRef = useRef([]);
  const isAnsweringRef = useRef(false);
  const socketRef = useRef(null);
  const isInitializedRef = useRef(false);
  const cleanupRef = useRef(false);
  const networkQualityRef = useRef({ uplink: 10, downlink: 10 });

  const [incomingCall, setIncomingCall] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [connectionState, setConnectionState] = useState("new");
  const [mediaEnabled, setMediaEnabled] = useState({
    video: false,
    audio: false,
  });
  const [socketConnected, setSocketConnected] = useState(false);
  const [networkQuality, setNetworkQuality] = useState({
    uplink: 10,
    downlink: 10,
  });

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

    iceBufferRef.current = [];
    isAnsweringRef.current = false;
  }, []);

  const createPeerConnection = useCallback(
    (callerUserId) => {
      console.log(
        "🔗 Admin: Creating new peer connection for caller:",
        callerUserId
      );
      cleanupPeerConnection();

      const peer = new RTCPeerConnection({
        iceServers,
        iceCandidatePoolSize: 10,
      });

      peer.onicecandidate = (event) => {
        if (
          event.candidate &&
          peer.signalingState !== "closed" &&
          socketRef.current?.connected
        ) {
          console.log("🧊 Admin: Sending ICE candidate to:", callerUserId);
          socketRef.current.emit("ice-candidate", {
            to: callerUserId,
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

          // Đảm bảo remote video KHÔNG bị mute để nghe audio
          remoteVideoRef.current.muted = false;
          remoteVideoRef.current.volume = 1.0;

          // Set autoplay attributes
          remoteVideoRef.current.autoplay = true;
          remoteVideoRef.current.playsInline = true;

          // Force play
          const playPromise = remoteVideoRef.current.play();

          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("✅ Admin: Remote video playing successfully");

                // Verify audio tracks
                const audioTracks = event.streams[0].getAudioTracks();
                const videoTracks = event.streams[0].getVideoTracks();

                console.log("🔊 Admin: Audio tracks:", audioTracks.length);
                console.log("📹 Admin: Video tracks:", videoTracks.length);

                audioTracks.forEach((track, index) => {
                  console.log(`🔊 Admin: Audio track ${index}:`, {
                    enabled: track.enabled,
                    muted: track.muted,
                    readyState: track.readyState,
                  });
                });

                videoTracks.forEach((track, index) => {
                  console.log(`📹 Admin: Video track ${index}:`, {
                    enabled: track.enabled,
                    muted: track.muted,
                    readyState: track.readyState,
                  });
                });
              })
              .catch((playError) => {
                console.error(
                  "❌ Admin: Error playing remote video:",
                  playError
                );

                // Try with user interaction
                const playWithInteraction = () => {
                  remoteVideoRef.current.muted = true;
                  remoteVideoRef.current
                    .play()
                    .then(() => {
                      console.log(
                        "✅ Admin: Remote video playing (initially muted)"
                      );
                      setTimeout(() => {
                        if (remoteVideoRef.current) {
                          remoteVideoRef.current.muted = false;
                          console.log("🔊 Admin: Unmuted remote video");
                        }
                      }, 1000);
                    })
                    .catch((e) =>
                      console.error("❌ Admin: Still can't play:", e)
                    );
                };

                // Try to play muted first
                playWithInteraction();
              });
          }
        }
      };

      peer.onconnectionstatechange = () => {
        console.log("🔗 Admin: Connection state:", peer.connectionState);
        setConnectionState(peer.connectionState);

        if (peer.connectionState === "connected") {
          message.success("✅ Đã kết nối với user thành công!");
          setInCall(true);
        } else if (
          peer.connectionState === "failed" ||
          peer.connectionState === "disconnected"
        ) {
          message.error("❌ Kết nối thất bại");
          setTimeout(() => endCall(), 1000);
        }
      };

      peer.oniceconnectionstatechange = () => {
        console.log("🧊 Admin: ICE connection state:", peer.iceConnectionState);
        if (peer.iceConnectionState === "failed") {
          console.log("🔄 Admin: ICE connection failed, attempting restart...");
          peer.restartIce();
        } else if (peer.iceConnectionState === "disconnected") {
          console.log("⚠️ Admin: ICE disconnected, attempting restart...");
          setTimeout(() => {
            if (peer.iceConnectionState === "disconnected") {
              peer.restartIce();
            }
          }, 2000);
        }
      };

      peer.onicegatheringstatechange = () => {
        console.log("🧊 Admin: ICE gathering state:", peer.iceGatheringState);
      };

      peer.onsignalingstatechange = () => {
        console.log("📡 Admin: Signaling state:", peer.signalingState);
      };

      return peer;
    },
    [cleanupPeerConnection, endCall]
  );

  const enableMedia = useCallback(async () => {
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
          console.log("🛑 Admin: Stopped old track:", track.kind);
        });
        localStreamRef.current = null;
      }

      console.log("🎥 Admin: Requesting media access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      localStreamRef.current = stream;
      setMediaEnabled({ video: true, audio: true });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true; // Local video should always be muted
        try {
          await localVideoRef.current.play();
          console.log("✅ Admin: Local video playing");
        } catch (playError) {
          console.error("❌ Admin: Error playing local video:", playError);
        }
      }

      console.log(
        "✅ Admin: Media enabled successfully - Tracks:",
        stream.getTracks().map((t) => `${t.kind}:${t.enabled}:${t.readyState}`)
      );
      return stream;
    } catch (err) {
      console.error("❌ Admin: Không thể bật media:", err);
      message.error(`Không thể truy cập camera/microphone: ${err.message}`);
      return null;
    }
  }, []);

  const addTracksToConnection = useCallback((peer, stream) => {
    if (!peer || peer.signalingState === "closed") {
      console.error("❌ Admin: Cannot add tracks: peer connection is closed");
      return false;
    }

    try {
      // Remove existing senders first
      const senders = peer.getSenders();
      senders.forEach((sender) => {
        if (sender.track) {
          console.log("🗑️ Admin: Removing existing sender:", sender.track.kind);
          peer.removeTrack(sender);
        }
      });

      // Add new tracks
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

  const answerCall = useCallback(async () => {
    if (
      !incomingCall ||
      isAnsweringRef.current ||
      !socketRef.current?.connected
    ) {
      console.log("⚠️ Admin: Cannot answer call - conditions not met");
      return;
    }

    isAnsweringRef.current = true;

    try {
      console.log("📞 Admin: Answering call from:", incomingCall.from);

      // 1. Enable media FIRST
      const stream = await enableMedia();
      if (!stream) {
        throw new Error("Failed to enable media");
      }

      // 2. Create peer connection
      const peer = createPeerConnection(incomingCall.from);
      if (!peer) {
        throw new Error("Failed to create peer connection");
      }

      peerRef.current = peer;

      // 3. Add local tracks to peer connection
      const tracksAdded = addTracksToConnection(peer, stream);
      if (!tracksAdded) {
        throw new Error("Failed to add tracks to connection");
      }

      // 4. Set remote description (the offer from user)
      console.log("📝 Admin: Setting remote description...");
      await peer.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer)
      );

      // 5. Process any buffered ICE candidates
      console.log(
        "🧊 Admin: Processing buffered ICE candidates:",
        iceBufferRef.current.length
      );
      for (const candidate of iceBufferRef.current) {
        try {
          if (peer.signalingState !== "closed") {
            await peer.addIceCandidate(new RTCIceCandidate(candidate));
            console.log("✅ Admin: Added buffered ICE candidate");
          }
        } catch (err) {
          console.error("❌ Admin: Error adding buffered ICE candidate:", err);
        }
      }
      iceBufferRef.current = [];

      // 6. Create and send answer
      console.log("📤 Admin: Creating answer...");
      const answer = await peer.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await peer.setLocalDescription(answer);

      // 7. Send answer to user
      socketRef.current.emit("answer-call", {
        to: incomingCall.from,
        answer: peer.localDescription, // Use the complete local description
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
    enableMedia,
    createPeerConnection,
    addTracksToConnection,
    cleanupPeerConnection,
  ]);

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

    cleanupPeerConnection();

    setInCall(false);
    setIncomingCall(null);
    setMediaEnabled({ video: false, audio: false });
    setConnectionState("new");

    message.info("Cuộc gọi đã kết thúc");
  }, [cleanupPeerConnection]);

  const rejectCall = useCallback(() => {
    console.log("📞 Admin: Rejecting call from:", incomingCall?.from);
    if (incomingCall && socketRef.current?.connected) {
      socketRef.current.emit("reject-call", { to: incomingCall.from });
    }
    setIncomingCall(null);
    message.info("Đã từ chối cuộc gọi");
  }, [incomingCall]);

  // Initialize socket connection
  useEffect(() => {
    if (isInitializedRef.current) {
      console.log("⚠️ Admin: Already initialized, skipping...");
      return;
    }

    console.log("🔌 Admin: Initializing socket connection...");
    isInitializedRef.current = true;
    cleanupRef.current = false;

    const socket = io("https://fashionstoreshopecommertbe.onrender.com", {
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
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
      console.log("🧊 Admin: Received ICE candidate");
      try {
        if (
          peerRef.current &&
          peerRef.current.remoteDescription &&
          peerRef.current.signalingState !== "closed"
        ) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("✅ Admin: Added ICE candidate");
        } else {
          console.log("📥 Admin: Buffering ICE candidate");
          iceBufferRef.current.push(candidate);
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

    // Add event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("call-ended", handleCallEnded);
    socket.on("call-rejected", handleCallRejected);

    // Cleanup function
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
  }, [endCall]);

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
          <Badge
            status={
              networkQuality.uplink > 7
                ? "success"
                : networkQuality.uplink > 4
                ? "warning"
                : "error"
            }
            text={`Uplink: ${networkQuality.uplink}/10`}
          />
          <Badge
            status={
              networkQuality.downlink > 7
                ? "success"
                : networkQuality.downlink > 4
                ? "warning"
                : "error"
            }
            text={`Downlink: ${networkQuality.downlink}/10`}
          />
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
                  muted={true}
                  playsInline
                  controls={false}
                  style={{
                    width: "100%",
                    maxWidth: "400px",
                    height: "300px",
                    border: "1px solid #d9d9d9",
                    borderRadius: "8px",
                    backgroundColor: "#000",
                    objectFit: "cover",
                    display: "block",
                  }}
                  onError={(e) => console.error("Admin: Local video error:", e)}
                />
              </div>
              <div style={{ textAlign: "center" }}>
                <h3 style={{ marginBottom: "8px", fontWeight: "500" }}>
                  Camera người dùng
                </h3>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  muted={false} // QUAN TRỌNG: Không mute để nghe audio
                  playsInline
                  controls={false}
                  style={{
                    width: "100%",
                    maxWidth: "400px",
                    height: "300px",
                    border: "1px solid #d9d9d9",
                    borderRadius: "8px",
                    backgroundColor: "#000",
                    objectFit: "cover",
                    display: "block",
                  }}
                  onError={(e) =>
                    console.error("Admin: Remote video error:", e)
                  }
                  onLoadedMetadata={() => {
                    console.log("🎬 Admin: Remote video metadata loaded");
                    if (remoteVideoRef.current) {
                      remoteVideoRef.current.volume = 1.0;
                      console.log("🔊 Admin: Set remote video volume to 1.0");
                    }
                  }}
                  onCanPlay={() => {
                    console.log("🎬 Admin: Remote video can play");
                  }}
                  onPlaying={() => {
                    console.log("🎬 Admin: Remote video is playing");
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

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

  // ICE servers configuration - Updated with better STUN/TURN servers
  const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
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
    if (cleanupRef.current || !peerRef.current) return;

    console.log("🧹 User: Cleaning up peer connection...");

    try {
      peerRef.current.onicecandidate = null;
      peerRef.current.ontrack = null;
      peerRef.current.onconnectionstatechange = null;
      peerRef.current.oniceconnectionstatechange = null;
      peerRef.current.onsignalingstatechange = null;

      if (peerRef.current.signalingState !== "closed") {
        peerRef.current.close();
      }
      peerRef.current = null;
    } catch (error) {
      console.error("❌ User: Error cleaning up peer connection:", error);
    }

    isCallingRef.current = false;
  }, []);

  const cleanupMediaStreams = useCallback(() => {
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
  }, []);

  const endCall = useCallback(() => {
    if (cleanupRef.current) return;

    console.log("📞 User: Ending call...");

    cleanupMediaStreams();

    if ((inCall || calling) && socketRef.current?.connected) {
      socketRef.current.emit("end-call", { to: adminId });
    }

    cleanupPeerConnection();

    setInCall(false);
    setCalling(false);
    setMediaEnabled({ video: false, audio: false });
    setConnectionState("new");

    message.info("Cuộc gọi đã kết thúc");
  }, [inCall, calling, cleanupPeerConnection, cleanupMediaStreams]);

  const enableMedia = useCallback(
    async (options = { video: false, audio: false }) => {
      try {
        // Consistent media constraints matching admin
        const constraints = {
          video: options.video
            ? {
                width: { ideal: 1280, max: 1920 },
                height: { ideal: 720, max: 1080 },
                frameRate: { ideal: 30, max: 60 },
                facingMode: "user",
              }
            : false,
          audio: options.audio
            ? {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 48000,
                channelCount: 2,
              }
            : false,
        };

        console.log("🎥 User: Requesting media access:", constraints);
        const newStream = await navigator.mediaDevices.getUserMedia(
          constraints
        );

        // Stop previous tracks if they exist
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => {
            track.stop();
          });
        }

        localStreamRef.current = newStream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = newStream;
          localVideoRef.current.muted = true;
          localVideoRef.current.playsInline = true;

          try {
            await localVideoRef.current.play();
            console.log("✅ User: Local video playing");
          } catch (playError) {
            console.error("❌ User: Error playing local video:", playError);
          }
        }

        setMediaEnabled({
          video: options.video,
          audio: options.audio,
        });

        const mediaType = [];
        if (options.video) mediaType.push("camera");
        if (options.audio) mediaType.push("microphone");

        message.success(`🎥 Đã bật ${mediaType.join(" và ")}`);
        console.log(
          "✅ User: Media enabled - Tracks:",
          newStream
            .getTracks()
            .map((t) => `${t.kind}:${t.enabled}:${t.readyState}`)
        );
        return newStream;
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
    },
    []
  );

  const createPeerConnection = useCallback(() => {
    console.log("🔗 User: Creating new peer connection...");
    cleanupPeerConnection();

    const peer = new RTCPeerConnection({
      iceServers,
      iceCandidatePoolSize: 10,
      iceTransportPolicy: "all",
      bundlePolicy: "max-bundle",
      rtcpMuxPolicy: "require",
    });

    // Enhanced ICE candidate handling
    peer.onicecandidate = (event) => {
      if (event.candidate && socketRef.current?.connected) {
        console.log("🧊 User: Sending ICE candidate:", event.candidate.type);
        socketRef.current.emit("ice-candidate", {
          to: adminId,
          candidate: event.candidate,
        });
      } else if (!event.candidate) {
        console.log("🧊 User: All ICE candidates have been sent");
      }
    };

    // Enhanced track handling
    peer.ontrack = (event) => {
      console.log("📺 User: Received remote stream from admin");
      const [remoteStream] = event.streams;

      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.muted = false;
        remoteVideoRef.current.volume = 1.0;
        remoteVideoRef.current.playsInline = true;

        // Handle autoplay policy
        const playRemote = async () => {
          try {
            await remoteVideoRef.current.play();
            console.log("✅ User: Remote video playing successfully");
          } catch (playError) {
            console.warn(
              "⚠️ User: Autoplay blocked, trying muted first:",
              playError
            );
            remoteVideoRef.current.muted = true;
            try {
              await remoteVideoRef.current.play();
              console.log("✅ User: Remote video playing (muted)");
              // Try to unmute after a delay
              setTimeout(() => {
                if (remoteVideoRef.current) {
                  remoteVideoRef.current.muted = false;
                  console.log("🔊 User: Unmuted remote video");
                }
              }, 1000);
            } catch (mutedError) {
              console.error("❌ User: Cannot play remote video:", mutedError);
            }
          }
        };

        playRemote();

        // Log track information
        remoteStream.getTracks().forEach((track) => {
          console.log(`📊 User: Remote ${track.kind} track:`, {
            enabled: track.enabled,
            muted: track.muted,
            readyState: track.readyState,
          });
        });
      }
    };

    peer.onconnectionstatechange = () => {
      console.log("🔗 User: Connection state:", peer.connectionState);
      setConnectionState(peer.connectionState);

      switch (peer.connectionState) {
        case "connected":
          setCalling(false);
          setInCall(true);
          message.success("✅ Đã kết nối với admin");
          break;
        case "failed":
          message.error("❌ Kết nối thất bại");
          setTimeout(() => endCall(), 2000);
          break;
        case "disconnected":
          console.log(
            "⚠️ User: Connection disconnected, attempting reconnection..."
          );
          message.warning("Mất kết nối, đang thử kết nối lại...");
          setTimeout(() => {
            if (peer.connectionState === "disconnected") {
              peer.restartIce();
            }
          }, 1000);
          break;
        case "closed":
          console.log("🔒 User: Connection closed");
          break;
      }
    };

    peer.oniceconnectionstatechange = () => {
      console.log("🧊 User: ICE connection state:", peer.iceConnectionState);

      switch (peer.iceConnectionState) {
        case "failed":
          console.log("🔄 User: ICE connection failed, attempting restart...");
          peer.restartIce();
          break;
        case "disconnected":
          console.log("⚠️ User: ICE disconnected, will attempt restart...");
          setTimeout(() => {
            if (peer.iceConnectionState === "disconnected") {
              console.log("🔄 User: ICE still disconnected, restarting...");
              peer.restartIce();
            }
          }, 2000);
          break;
      }
    };

    // Monitor signaling state
    peer.onsignalingstatechange = () => {
      console.log("📡 User: Signaling state:", peer.signalingState);
    };

    return peer;
  }, [cleanupPeerConnection, endCall]);

  const addTracksToConnection = useCallback((peer, stream) => {
    if (!peer || peer.signalingState === "closed") {
      console.error("❌ User: Cannot add tracks: peer connection is closed");
      return false;
    }

    try {
      // Clear existing senders
      const existingSenders = peer.getSenders();
      existingSenders.forEach((sender) => {
        if (sender.track) {
          console.log("🗑️ User: Removing existing sender:", sender.track.kind);
          peer.removeTrack(sender);
        }
      });

      // Add new tracks
      stream.getTracks().forEach((track) => {
        console.log("➕ User: Adding track:", {
          kind: track.kind,
          enabled: track.enabled,
          readyState: track.readyState,
          id: track.id,
        });
        peer.addTrack(track, stream);
      });

      console.log("✅ User: All tracks added successfully");
      return true;
    } catch (err) {
      console.error("❌ User: Error adding tracks:", err);
      return false;
    }
  }, []);

  const startCall = useCallback(async () => {
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

      // CRITICAL: Add tracks BEFORE creating offer
      const tracksAdded = addTracksToConnection(peer, localStreamRef.current);
      if (!tracksAdded) {
        throw new Error("Failed to add tracks to connection");
      }

      console.log("📤 User: Creating offer...");
      const offer = await peer.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await peer.setLocalDescription(offer);

      // Wait for ICE gathering to complete with timeout
      console.log("⏳ User: Waiting for ICE gathering...");
      await new Promise((resolve) => {
        if (peer.iceGatheringState === "complete") {
          resolve();
        } else {
          const handleIceGatheringStateChange = () => {
            if (peer.iceGatheringState === "complete") {
              peer.removeEventListener(
                "icegatheringstatechange",
                handleIceGatheringStateChange
              );
              resolve();
            }
          };
          peer.addEventListener(
            "icegatheringstatechange",
            handleIceGatheringStateChange
          );
          // Timeout after 5 seconds
          setTimeout(() => {
            peer.removeEventListener(
              "icegatheringstatechange",
              handleIceGatheringStateChange
            );
            resolve();
          }, 5000);
        }
      });

      console.log("📤 User: Sending offer to admin...");
      console.log("📤 User: Offer details:", {
        type: peer.localDescription.type,
        sdpLength: peer.localDescription.sdp?.length,
        hasAudio: peer.localDescription.sdp?.includes("m=audio"),
        hasVideo: peer.localDescription.sdp?.includes("m=video"),
      });

      socketRef.current.emit("call-user", {
        to: adminId,
        offer: peer.localDescription,
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
  }, [
    mediaEnabled.video,
    mediaEnabled.audio,
    createPeerConnection,
    addTracksToConnection,
    cleanupPeerConnection,
  ]);

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
      transports: ["websocket", "polling"],
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
      console.log("✅ User: Answer details:", {
        type: answer.type,
        sdpLength: answer.sdp?.length,
      });

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

    // Socket event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("call-answered", handleCallAnswered);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("call-ended", handleCallEnded);
    socket.on("call-rejected", handleCallRejected);

    return () => {
      if (cleanupRef.current) return;

      console.log("🧹 User: Component unmounting, cleaning up...");
      cleanupRef.current = true;

      // Remove event listeners
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
  }, [userId, endCall, cleanupPeerConnection]);

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
                  onClick={() =>
                    enableMedia({ video: true, audio: mediaEnabled.audio })
                  }
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
                  onClick={() =>
                    enableMedia({ video: mediaEnabled.video, audio: true })
                  }
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
                  Camera Admin
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

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
} from "lucide-react";
import { io } from "socket.io-client";
import { Button, Modal, Space, message } from "antd";
import { PhoneOutlined } from "@ant-design/icons";

const VideoChatAdmin = () => {
  const adminId = "673017dde4526bd79cc61fa6";
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const isAnsweringRef = useRef(false);
  const isCallingRef = useRef(false);
  const socketRef = useRef(null);
  const isInitializedRef = useRef(false);
  const cleanupRef = useRef(false);

  const [incomingCall, setIncomingCall] = useState(null);
  const [outgoingCall, setOutgoingCall] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [connectionState, setConnectionState] = useState("new");
  const [mediaEnabled, setMediaEnabled] = useState({
    video: false,
    audio: false,
  });
  const [socketConnected, setSocketConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");

  // ICE servers configuration
  const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
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

  // Call duration timer
  useEffect(() => {
    let interval;
    if (inCall && callStartTime) {
      interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [inCall, callStartTime]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

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

    if ((inCall || outgoingCall) && socketRef.current?.connected) {
      const targetUserId = incomingCall?.from || outgoingCall?.to;
      if (targetUserId) {
        socketRef.current.emit("end-call", { to: targetUserId });
      }
    }

    // Cleanup peer connection
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
    isAnsweringRef.current = false;
    setInCall(false);
    setIncomingCall(null);
    setOutgoingCall(null);
    setMediaEnabled({ video: false, audio: false });
    setConnectionState("new");
    setCallStartTime(null);
    setCallDuration(0);
    setIsFullscreen(false);
  }, [inCall, outgoingCall, incomingCall]);

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
    isCallingRef.current = false;
    isAnsweringRef.current = false;
  }, []);

  const enableMedia = useCallback(
    async (options = { video: false, audio: false }) => {
      try {
        const constraints = {};
        if (options.video)
          constraints.video = {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          };
        if (options.audio)
          constraints.audio = {
            echoCancellation: true,
            noiseSuppression: true,
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
        } else {
          localStreamRef.current = newStream;
        }

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

        setMediaEnabled((prev) => ({
          video: prev.video || options.video,
          audio: prev.audio || options.audio,
        }));

        console.log("✅ Admin: Media enabled successfully");
        return localStreamRef.current;
      } catch (err) {
        console.error("❌ Admin: Không thể bật media:", err);
        let errorMessage = "Không thể truy cập thiết bị.";
        if (err.name === "NotAllowedError") {
          errorMessage = "Bạn đã từ chối quyền truy cập camera/microphone.";
        } else if (err.name === "NotFoundError") {
          errorMessage = "Không tìm thấy camera hoặc microphone.";
        }
        message.error(errorMessage);
        return null;
      }
    },
    []
  );

  const toggleVideo = useCallback(async () => {
    if (mediaEnabled.video) {
      // Turn off video
      if (localStreamRef.current) {
        const videoTracks = localStreamRef.current.getVideoTracks();
        videoTracks.forEach((track) => {
          track.stop();
          localStreamRef.current.removeTrack(track);
        });
      }
      setMediaEnabled((prev) => ({ ...prev, video: false }));
    } else {
      // Turn on video
      await enableMedia({ video: true });
    }
  }, [mediaEnabled.video, enableMedia]);

  const toggleAudio = useCallback(async () => {
    if (mediaEnabled.audio) {
      // Turn off audio
      if (localStreamRef.current) {
        const audioTracks = localStreamRef.current.getAudioTracks();
        audioTracks.forEach((track) => {
          track.stop();
          localStreamRef.current.removeTrack(track);
        });
      }
      setMediaEnabled((prev) => ({ ...prev, audio: false }));
    } else {
      // Turn on audio
      await enableMedia({ audio: true });
    }
  }, [mediaEnabled.audio, enableMedia]);

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
        socketRef.current?.connected
      ) {
        console.log("🧊 Admin: Sending ICE candidate");
        const targetUserId = incomingCall?.from || outgoingCall?.to;
        if (targetUserId) {
          socketRef.current.emit("ice-candidate", {
            to: targetUserId,
            candidate: event.candidate,
          });
        }
      }
    };

    peer.ontrack = (event) => {
      console.log("📺 Admin: Received remote stream");
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.muted = false;
        remoteVideoRef.current.volume = 1.0;
        remoteVideoRef.current
          .play()
          .then(() => {
            console.log("✅ Admin: Remote video playing successfully");
          })
          .catch((playError) => {
            console.error("❌ Admin: Error playing remote video:", playError);
          });
      }
    };

    peer.onconnectionstatechange = () => {
      console.log("🔗 Admin: Connection state:", peer.connectionState);
      setConnectionState(peer.connectionState);
      if (peer.connectionState === "connected") {
        setOutgoingCall(null);
        setInCall(true);
        if (!callStartTime) {
          setCallStartTime(Date.now());
        }
      } else if (peer.connectionState === "failed") {
        setTimeout(() => endCall(), 2000);
      } else if (peer.connectionState === "disconnected") {
        console.log(
          "⚠️ Admin: Connection disconnected, attempting reconnection..."
        );
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
      }
    };

    return peer;
  }, [
    cleanupPeerConnection,
    endCall,
    incomingCall,
    outgoingCall,
    callStartTime,
  ]);

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

  const startCall = useCallback(
    async (userId) => {
      // Enable admin's camera and audio if not already enabled
      if (!mediaEnabled.video || !mediaEnabled.audio) {
        const stream = await enableMedia({ video: true, audio: true });
        if (!stream) {
          message.error("Không thể bắt đầu cuộc gọi do lỗi truy cập media.");
          return;
        }
      }

      if (isCallingRef.current || !socketRef.current?.connected) {
        console.log("⚠️ Admin: Already calling or socket not connected");
        return;
      }

      isCallingRef.current = true;
      try {
        console.log("📞 Admin: Starting call to user:", userId);
        setOutgoingCall({ to: userId, status: "calling" });

        const peer = createPeerConnection();
        if (!peer) {
          throw new Error("Failed to create peer connection");
        }
        peerRef.current = peer;

        // Add tracks BEFORE creating offer
        const tracksAdded = addTracksToConnection(peer, localStreamRef.current);
        if (!tracksAdded) {
          throw new Error("Failed to add tracks to connection");
        }

        console.log("📤 Admin: Creating offer...");
        const offer = await peer.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await peer.setLocalDescription(offer);

        // Wait for ICE gathering
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

        console.log("📤 Admin: Sending offer to user...");
        socketRef.current.emit("call-user", {
          to: userId,
          offer: peer.localDescription,
        });

        console.log("✅ Admin: Call initiated successfully");
      } catch (err) {
        console.error("❌ Admin: Lỗi khi bắt đầu cuộc gọi:", err);
        message.error(`Không thể bắt đầu cuộc gọi: ${err.message}`);
        setOutgoingCall(null);
        cleanupPeerConnection();
      } finally {
        isCallingRef.current = false;
      }
    },
    [
      mediaEnabled.video,
      mediaEnabled.audio,
      createPeerConnection,
      addTracksToConnection,
      cleanupPeerConnection,
      enableMedia,
    ]
  );

  const answerCall = useCallback(async () => {
    // Enable admin's camera and audio if not already enabled
    if (!mediaEnabled.video || !mediaEnabled.audio) {
      const stream = await enableMedia({ video: true, audio: true });
      if (!stream) {
        message.error("Không thể trả lời cuộc gọi do lỗi truy cập media.");
        return;
      }
    }

    if (!incomingCall || !peerRef.current || isAnsweringRef.current) return;

    isAnsweringRef.current = true;
    try {
      console.log("✅ Admin: Answering call from:", incomingCall.from);

      // Add tracks to peer connection
      if (localStreamRef.current) {
        addTracksToConnection(peerRef.current, localStreamRef.current);
      }

      // Create answer
      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);

      // Send answer to caller
      socketRef.current.emit("answer-call", {
        to: incomingCall.from,
        answer: peerRef.current.localDescription,
      });

      setIncomingCall(null);
      setInCall(true);
      setCallStartTime(Date.now());
    } catch (err) {
      console.error("❌ Admin: Error answering call:", err);
      message.error(`Không thể trả lời cuộc gọi: ${err.message}`);
    } finally {
      isAnsweringRef.current = false;
    }
  }, [mediaEnabled, incomingCall, addTracksToConnection, enableMedia]);

  const rejectCall = useCallback(() => {
    if (incomingCall && socketRef.current?.connected) {
      socketRef.current.emit("reject-call", { to: incomingCall.from });
    }
    setIncomingCall(null);
    cleanupPeerConnection();
  }, [incomingCall, cleanupPeerConnection]);

  // Mock users for display (you can replace this with real user data from your backend)
  const mockUsers = [
    {
      id: "user1",
      name: "Nguyễn Văn A",
      avatar: "👤",
      status: "online",
      lastSeen: new Date(),
    },
    {
      id: "user2",
      name: "Trần Thị B",
      avatar: "👩",
      status: "online",
      lastSeen: new Date(),
    },
    {
      id: "user3",
      name: "Lê Văn C",
      avatar: "👨",
      status: "offline",
      lastSeen: new Date(Date.now() - 300000),
    },
  ];

  // Initialize mock users
  useEffect(() => {
    setOnlineUsers(mockUsers);
  }, []);

  // Main useEffect for Socket.IO connection
  useEffect(() => {
    if (!adminId || isInitializedRef.current) {
      console.log("⚠️ Admin: Already initialized or no adminId, skipping...");
      return;
    }

    console.log("🔌 Admin: Connecting to socket with ID:", adminId);
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
      message.error("Không thể kết nối đến server. Vui lòng thử lại sau.");
    };

    const handleIncomingCall = async ({ from, offer }) => {
      console.log("📞 Admin: Incoming call from:", from);

      // Create peer connection for incoming call
      const peer = createPeerConnection();
      if (!peer) return;

      peerRef.current = peer;

      try {
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        setIncomingCall({ from, fromName: `User ${from}` });
      } catch (err) {
        console.error("❌ Admin: Error handling incoming call:", err);
        message.error("Lỗi khi xử lý cuộc gọi đến.");
      }
    };

    const handleCallAnswered = async ({ answer }) => {
      console.log("✅ Admin: Call answered by user");
      if (peerRef.current && peerRef.current.signalingState !== "closed") {
        try {
          await peerRef.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
          console.log("✅ Admin: Set remote description successfully");
          setOutgoingCall(null);
          setInCall(true);
        } catch (err) {
          console.error("❌ Admin: Error setting remote description:", err);
          message.error("Lỗi khi thiết lập kết nối.");
        }
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      console.log("🧊 Admin: Received ICE candidate");
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
      message.info("Cuộc gọi đã kết thúc bởi người dùng.");
    };

    const handleCallRejected = () => {
      console.log("📞 Admin: Call was rejected by user");
      setOutgoingCall(null);
      cleanupPeerConnection();
      message.warning("Người dùng đã từ chối cuộc gọi.");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-answered", handleCallAnswered);
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
  }, [adminId, endCall, cleanupPeerConnection, createPeerConnection]);

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "busy":
        return "bg-red-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "online":
        return "Trực tuyến";
      case "busy":
        return "Bận";
      case "offline":
        return "Offline";
      default:
        return "Không xác định";
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4">Danh sách người dùng</h2>
        <ul>
          {onlineUsers.map((user) => (
            <li
              key={user.id}
              className={`flex items-center justify-between py-2 px-3 rounded hover:bg-gray-300 cursor-pointer ${
                selectedUser?.id === user.id ? "bg-gray-300" : ""
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <div className="flex items-center">
                <span className="mr-2">{user.avatar}</span>
                <span>{user.name}</span>
              </div>
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${getStatusColor(
                  user.status
                )}`}
                title={getStatusText(user.status)}
              ></span>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white p-4 shadow-md">
          <h1 className="text-xl font-semibold">Quản lý cuộc gọi video</h1>
        </div>

        {/* Video Area */}
        <div className="flex-1 flex p-4">
          {/* Remote Video */}
          <div className="relative w-2/3 rounded-lg overflow-hidden shadow-lg">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            ></video>
            <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white p-2 flex justify-between items-center">
              <span>Đang kết nối: {connectionState}</span>
              {inCall && (
                <span>Thời gian gọi: {formatDuration(callDuration)}</span>
              )}
            </div>
          </div>

          {/* Local Video & Controls */}
          <div className="w-1/3 flex flex-col pl-4">
            <div className="relative rounded-lg overflow-hidden shadow-lg mb-4">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-48 object-cover"
              ></video>
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded">
                {mediaEnabled.video ? <Video /> : <VideoOff />}
                {mediaEnabled.audio ? <Mic /> : <MicOff />}
              </div>
            </div>

            {/* Call Controls */}
            <div className="flex justify-around mt-4">
              {/* Enable/Disable Media */}
              <button
                onClick={toggleVideo}
                className="p-3 rounded-full shadow-lg hover:bg-gray-200"
              >
                {mediaEnabled.video ? (
                  <Video className="w-6 h-6" />
                ) : (
                  <VideoOff className="w-6 h-6" />
                )}
              </button>
              <button
                onClick={toggleAudio}
                className="p-3 rounded-full shadow-lg hover:bg-gray-200"
              >
                {mediaEnabled.audio ? (
                  <Mic className="w-6 h-6" />
                ) : (
                  <MicOff className="w-6 h-6" />
                )}
              </button>

              {/* Call Actions */}
              {inCall ? (
                <button
                  onClick={endCall}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full shadow-lg"
                >
                  <PhoneOff className="w-6 h-6 inline-block mr-2" />
                  Kết thúc
                </button>
              ) : (
                <button
                  onClick={() => selectedUser && startCall(selectedUser.id)}
                  disabled={!selectedUser}
                  className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg ${
                    !selectedUser ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Phone className="w-6 h-6 inline-block mr-2" />
                  Gọi
                </button>
              )}
            </div>
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <Space direction="vertical" size="middle">
                <div>
                  <label style={{ marginRight: "8px" }}>User ID để gọi:</label>
                  <input
                    type="text"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    placeholder="Nhập User ID"
                    style={{
                      padding: "4px 8px",
                      border: "1px solid #d9d9d9",
                      borderRadius: "4px",
                      marginRight: "8px",
                    }}
                  />
                  <Button
                    type="primary"
                    icon={<PhoneOutlined />}
                    onClick={() => selectedUserId && startCall(selectedUserId)}
                    disabled={
                      !selectedUserId ||
                      !socketConnected ||
                      (!mediaEnabled.video && !mediaEnabled.audio)
                    }
                    style={{
                      backgroundColor: "#52c41a",
                      borderColor: "#52c41a",
                    }}
                  >
                    Gọi User
                  </Button>
                </div>
              </Space>
            </div>
          </div>
        </div>
      </div>

      {/* Incoming Call Modal */}
      {incomingCall && (
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
          }}
          cancelButtonProps={{ size: "large", danger: true }}
        >
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <PhoneOutlined
              style={{
                fontSize: "48px",
                color: "#1890ff",
                marginBottom: "16px",
              }}
            />
            <p style={{ fontSize: "16px" }}>
              Người gọi: <strong>{incomingCall?.fromName}</strong>
            </p>
            <p style={{ color: "#666" }}>
              Bạn có muốn trả lời cuộc gọi video không?
            </p>
          </div>
        </Modal>
      )}

      {/* Outgoing Call Modal */}
      {outgoingCall && (
        <Modal
          open={!!outgoingCall}
          onCancel={() => setOutgoingCall(null)}
          footer={[
            <Button key="cancel" onClick={() => setOutgoingCall(null)} danger>
              Hủy cuộc gọi
            </Button>,
          ]}
          title="📞 Đang gọi..."
          centered
          closable={false}
          maskClosable={false}
        >
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <PhoneOutlined
              style={{
                fontSize: "48px",
                color: "#1890ff",
                marginBottom: "16px",
              }}
            />
            <p style={{ fontSize: "16px" }}>
              Đang gọi đến: <strong>{outgoingCall?.to}</strong>
            </p>
            <p style={{ color: "#666" }}>Vui lòng chờ người dùng trả lời...</p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default VideoChatAdmin;

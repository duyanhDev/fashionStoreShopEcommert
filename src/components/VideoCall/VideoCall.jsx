import { useEffect, useRef, useState, useCallback } from "react";
import {
  PhoneCall,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  MessageCircle,
  Settings,
  Maximize,
  Minimize,
  Wifi,
  WifiOff,
  User,
  AlertCircle,
} from "lucide-react";
import { io } from "socket.io-client";
import { message, Modal } from "antd";
import { PhoneOutlined, VideoCameraOutlined } from "@ant-design/icons";

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
  const [incomingCall, setIncomingCall] = useState(null);
  const [connectionState, setConnectionState] = useState("new");
  const [mediaEnabled, setMediaEnabled] = useState({
    video: false,
    audio: false,
  });
  const [socketConnected, setSocketConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);
  const [adminStatus, setAdminStatus] = useState("offline");

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
    setInCall(false);
    setCalling(false);
    setIncomingCall(null);
    setMediaEnabled({ video: false, audio: false });
    setConnectionState("new");
    setCallStartTime(null);
    setCallDuration(0);
    setIsFullscreen(false);
  }, [inCall, calling]);

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

  const enableMedia = useCallback(
    async (options = { video: false, audio: false }) => {
      try {
        const constraints = {};
        if (options.video)
          constraints.video = {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          };
        if (options.audio)
          constraints.audio = {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          };

        console.log("🎥 User: Requesting media access:", constraints);
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
            console.log("✅ User: Local video playing");
          } catch (playError) {
            console.error("❌ User: Error playing local video:", playError);
          }
        }

        setMediaEnabled((prev) => ({
          video: prev.video || options.video,
          audio: prev.audio || options.audio,
        }));

        console.log("✅ User: Media enabled successfully");
        return localStreamRef.current;
      } catch (err) {
        console.error("❌ User: Không thể bật media:", err);
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
    console.log("🔗 User: Creating new peer connection...");
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
        console.log("🧊 User: Sending ICE candidate to admin");
        socketRef.current.emit("ice-candidate", {
          to: adminId,
          candidate: event.candidate,
        });
      }
    };

    peer.ontrack = (event) => {
      console.log("📺 User: Received remote stream from admin");
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.muted = false;
        remoteVideoRef.current.volume = 1.0;
        remoteVideoRef.current
          .play()
          .then(() => {
            console.log("✅ User: Remote video playing successfully");
          })
          .catch((playError) => {
            console.error("❌ User: Error playing remote video:", playError);
          });
      }
    };

    peer.onconnectionstatechange = () => {
      console.log("🔗 User: Connection state:", peer.connectionState);
      setConnectionState(peer.connectionState);
      if (peer.connectionState === "connected") {
        setCalling(false);
        setInCall(true);
        setCallStartTime(Date.now());
      } else if (peer.connectionState === "failed") {
        setTimeout(() => endCall(), 2000);
      } else if (peer.connectionState === "disconnected") {
        console.log(
          "⚠️ User: Connection disconnected, attempting reconnection..."
        );
        setTimeout(() => {
          if (peer.connectionState === "disconnected") {
            peer.restartIce();
          }
        }, 1000);
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
  }, [cleanupPeerConnection, endCall]);

  const addTracksToConnection = useCallback((peer, stream) => {
    if (!peer || peer.signalingState === "closed") {
      console.error("❌ User: Cannot add tracks: peer connection is closed");
      return false;
    }

    try {
      // Remove existing senders
      const senders = peer.getSenders();
      senders.forEach((sender) => {
        if (sender.track) {
          console.log("🗑️ User: Removing existing sender:", sender.track.kind);
          peer.removeTrack(sender);
        }
      });

      // Add all tracks from stream
      stream.getTracks().forEach((track) => {
        console.log(
          "➕ User: Adding track:",
          track.kind,
          "enabled:",
          track.enabled,
          "readyState:",
          track.readyState
        );
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
    // Enable user's camera and audio if not already enabled
    if (!mediaEnabled.video || !mediaEnabled.audio) {
      const stream = await enableMedia({ video: true, audio: true });
      if (!stream) {
        message.error("Không thể bắt đầu cuộc gọi do lỗi truy cập media.");
        return;
      }
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

      // Add tracks BEFORE creating offer
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

      // Wait for ICE gathering to complete or timeout
      console.log("⏳ User: Waiting for ICE gathering...");
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
          setTimeout(resolve, 5000); // Timeout after 5 seconds
        }
      });

      console.log("📤 User: Sending offer to admin...");
      socketRef.current.emit("call-user", {
        to: adminId,
        offer: peer.localDescription,
      });

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
    enableMedia,
  ]);

  const answerCall = useCallback(async () => {
    // Enable user's camera and audio if not already enabled
    if (!mediaEnabled.video || !mediaEnabled.audio) {
      const stream = await enableMedia({ video: true, audio: true });
      if (!stream) {
        message.error("Không thể trả lời cuộc gọi do lỗi truy cập media.");
        return;
      }
    }

    if (!incomingCall || !peerRef.current) return;

    try {
      console.log("✅ User: Answering call...");

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
      console.error("❌ User: Error answering call:", err);
      message.error(`Không thể trả lời cuộc gọi: ${err.message}`);
    }
  }, [mediaEnabled, incomingCall, addTracksToConnection, enableMedia]);

  const rejectCall = useCallback(() => {
    if (incomingCall && socketRef.current?.connected) {
      socketRef.current.emit("reject-call", { to: incomingCall.from });
    }
    setIncomingCall(null);
    cleanupPeerConnection();
  }, [incomingCall, cleanupPeerConnection]);

  // Main useEffect for Socket.IO connection
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
      message.error("Mất kết nối với server. Đang thử kết nối lại...");
    };

    const handleConnectError = (error) => {
      console.error("❌ User: Socket connection error:", error);
      setSocketConnected(false);
      message.error("Không thể kết nối đến server. Vui lòng thử lại sau.");
    };

    const handleIncomingCall = async ({ from, offer }) => {
      console.log("📞 User: Incoming call from:", from);

      // Create peer connection for incoming call
      const peer = createPeerConnection();
      if (!peer) return;

      peerRef.current = peer;

      try {
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        setIncomingCall({ from, fromName: "Admin" });
      } catch (err) {
        console.error("❌ User: Error handling incoming call:", err);
        message.error("Lỗi khi xử lý cuộc gọi đến.");
      }
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
          message.error("Lỗi khi thiết lập kết nối.");
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
      message.info("Cuộc gọi đã kết thúc bởi Admin.");
    };

    const handleCallRejected = () => {
      console.log("📞 User: Call was rejected by admin");
      setCalling(false);
      cleanupPeerConnection();
      message.warning("Admin đã từ chối cuộc gọi.");
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
      console.log("🧹 User: Component unmounting, cleaning up...");
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
  }, [userId, endCall, cleanupPeerConnection, createPeerConnection]);

  // Update user registration when userId changes
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Lỗi xác thực
            </h2>
            <p className="text-gray-600">
              Không tìm thấy User ID. Vui lòng đăng nhập lại.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // In-call interface
  if (inCall) {
    return (
      <div
        className={`${
          isFullscreen ? "fixed inset-0 z-50" : "relative"
        } bg-gray-900 text-white min-h-screen`}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Đang gọi với Admin</span>
              </div>
              <span className="text-lg font-semibold">
                {formatDuration(callDuration)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {socketConnected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className="text-xs">{connectionState}</span>
              </div>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative w-full h-full flex">
          {/* Remote Video (Main) */}
          <div className="flex-1 relative bg-black">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-3 py-1 rounded-full">
              <span className="text-sm">Admin</span>
            </div>
          </div>

          {/* Local Video (Picture in Picture) */}
          <div className="absolute top-20 right-4 w-64 h-48 bg-black rounded-lg overflow-hidden shadow-2xl border-2 border-white border-opacity-20">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-xs">
              Bạn
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-6">
          <div className="flex justify-center items-center space-x-6">
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-all ${
                mediaEnabled.video
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              {mediaEnabled.video ? (
                <Video className="w-6 h-6" />
              ) : (
                <VideoOff className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full transition-all ${
                mediaEnabled.audio
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              {mediaEnabled.audio ? (
                <Mic className="w-6 h-6" />
              ) : (
                <MicOff className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={endCall}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>

            <button className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all">
              <MessageCircle className="w-6 h-6 text-white" />
            </button>

            <button className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all">
              <Settings className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Hỗ trợ khách hàng
                </h1>
                <p className="text-sm text-gray-500">ID: {userId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                  socketConnected
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {socketConnected ? (
                  <Wifi className="w-4 h-4" />
                ) : (
                  <WifiOff className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {socketConnected ? "Đã kết nối" : "Mất kết nối"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Admin Status */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Trạng thái Admin
              </h2>
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Admin Support
                </h3>
                <div
                  className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                    socketConnected
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      socketConnected ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></div>
                  <span>
                    {socketConnected ? "Sẵn sàng hỗ trợ" : "Không trực tuyến"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              {!socketConnected && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <p className="text-red-800 font-medium">
                      Mất kết nối với server. Đang thử kết nối lại...
                    </p>
                  </div>
                </div>
              )}

              {/* Media Controls */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Chuẩn bị cuộc gọi
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => enableMedia({ video: true })}
                    className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      mediaEnabled.video
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 hover:border-gray-400 text-gray-700"
                    }`}
                  >
                    <Video className="w-5 h-5" />
                    <span>
                      {mediaEnabled.video ? "Camera đã bật" : "Bật Camera"}
                    </span>
                  </button>
                  <button
                    onClick={() => enableMedia({ audio: true })}
                    className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      mediaEnabled.audio
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 hover:border-gray-400 text-gray-700"
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                    <span>
                      {mediaEnabled.audio ? "Mic đã bật" : "Bật Microphone"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Video Preview */}
              <div
                className="bg-gray-900 rounded-lg overflow-hidden relative mb-6"
                style={{ aspectRatio: "16/9" }}
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!mediaEnabled.video && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center text-white">
                      <VideoOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Camera chưa được bật</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-3 py-1 rounded-full text-white text-sm">
                  Xem trước camera của bạn
                </div>
              </div>

              {/* Call Actions */}
              {!calling && (
                <div className="text-center">
                  <button
                    onClick={startCall}
                    disabled={!socketConnected}
                    className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg transition-all font-medium text-lg"
                  >
                    <PhoneCall className="w-6 h-6" />
                    <span>Gọi Admin</span>
                  </button>
                </div>
              )}

              {calling && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PhoneCall className="w-10 h-10 text-blue-600 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Đang gọi Admin...
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Vui lòng chờ Admin trả lời
                  </p>
                  <button
                    onClick={endCall}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-all font-medium"
                  >
                    Hủy cuộc gọi
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
            <VideoCameraOutlined
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
    </div>
  );
};

export default VideoChatUser;
